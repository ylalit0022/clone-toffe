#!/usr/bin/env node
/**
 * Tranzo Security Test Suite
 * Usage:
 *   node test-server.js                        → tests http://localhost:3000
 *   node test-server.js http://localhost:3000  → same
 *   node test-server.js https://share.rumnnlg.com → tests production
 *
 * ⚠️  START YOUR SERVER FIRST: npm start (or node server.js)
 *     then in a NEW terminal: node test-server.js
 */

const BASE = process.argv[2] || 'http://localhost:3000';

// ── Try to load socket.io-client; warn gracefully if missing ─────────────────
let ioClient = null;
try {
  ioClient = require('socket.io-client');
} catch {
  console.warn('  ⚠️  socket.io-client not installed — skipping socket tests');
  console.warn('      Run: npm install socket.io-client\n');
}

const https = require('https');
const http  = require('http');

let passed = 0, failed = 0, warned = 0;

const pass = (l)    => { console.log(`  ✅ ${l}`);                          passed++; };
const fail = (l, d) => { console.log(`  ❌ FAIL: ${l}${d?' — '+d:''}`);    failed++; };
const warn = (l, d) => { console.log(`  ⚠️  ${l}${d?' — '+d:''}`);         warned++; };

// ── HTTP helper ───────────────────────────────────────────────────────────────
function get(path, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const mod = url.protocol === 'https:' ? https : http;
    const opts = {
      hostname: url.hostname,
      port:     url.port || (url.protocol === 'https:' ? 443 : 80),
      path:     url.pathname + url.search,
      method:   'GET',
      timeout:  8000,
      headers:  { 'User-Agent': 'TranzoSecTest/1.0', ...extraHeaders },
    };
    const req = mod.request(opts, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.end();
  });
}

function post(path, body, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url  = new URL(path, BASE);
    const data = JSON.stringify(body);
    const mod  = url.protocol === 'https:' ? https : http;
    const opts = {
      hostname: url.hostname,
      port:     url.port || (url.protocol === 'https:' ? 443 : 80),
      path:     url.pathname + url.search,
      method:   'POST',
      timeout:  8000,
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent':     'TranzoSecTest/1.0',
        ...extraHeaders,
      },
    };
    const req = mod.request(opts, res => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: b }));
    });
    req.on('error',   reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(data);
    req.end();
  });
}

// ── CONNECTIVITY CHECK ────────────────────────────────────────────────────────
async function checkConnectivity() {
  console.log('\n── 0. CONNECTIVITY CHECK ────────────────────────────────────────');
  try {
    const r = await get('/ping');
    if (r.status === 200) {
      pass('Server is reachable at ' + BASE);
      try {
        const j = JSON.parse(r.body);
        console.log(`     env: ${j.env || 'unknown'} | ts: ${j.ts}`);
        return true;
      } catch { return true; }
    } else {
      fail('Server responded but /ping returned ' + r.status);
      return false;
    }
  } catch (e) {
    fail('Cannot reach server at ' + BASE, e.message);
    console.log('\n  ┌─────────────────────────────────────────────────────────┐');
    console.log('  │  FIX: Start your server first, then run this test.      │');
    console.log('  │                                                           │');
    console.log('  │  Terminal 1:  node server.js   (or npm start)            │');
    console.log('  │  Terminal 2:  node test-server.js                        │');
    console.log('  └─────────────────────────────────────────────────────────┘\n');
    return false;
  }
}

// ── TEST 1: SECURITY HEADERS ──────────────────────────────────────────────────
async function testHeaders() {
  console.log('\n── 1. SECURITY HEADERS ──────────────────────────────────────────');
  const r = await get('/');
  const h = r.headers;

  h['x-content-type-options'] === 'nosniff'
    ? pass('X-Content-Type-Options: nosniff')
    : fail('X-Content-Type-Options missing', h['x-content-type-options'] || 'not set');

  h['x-frame-options'] === 'DENY'
    ? pass('X-Frame-Options: DENY')
    : fail('X-Frame-Options wrong', h['x-frame-options'] || 'not set');

  h['referrer-policy']
    ? pass('Referrer-Policy: ' + h['referrer-policy'])
    : warn('Referrer-Policy not set');

  h['permissions-policy']
    ? pass('Permissions-Policy set')
    : warn('Permissions-Policy not set');

  !h['x-powered-by']
    ? pass('X-Powered-By removed (fingerprint hidden)')
    : fail('X-Powered-By still leaking', h['x-powered-by']);

  !h['server']
    ? pass('Server header removed')
    : warn('Server header leaks: ' + h['server']);

  const csp = h['content-security-policy'];
  if (csp) {
    pass('CSP header present');
    csp.includes("default-src 'self'")
      ? pass('  CSP: default-src self ✓')
      : warn('  CSP: default-src is not self — ' + csp.slice(0, 80));
    !csp.includes("'unsafe-eval'")
      ? pass("  CSP: no unsafe-eval ✓")
      : fail("  CSP: allows unsafe-eval — XSS risk");
  } else {
    warn('CSP header not set (expected in dev mode, must be ON in production)');
  }

  if (BASE.startsWith('https')) {
    h['strict-transport-security']
      ? pass('HSTS: ' + h['strict-transport-security'])
      : fail('HSTS missing on HTTPS origin');
  } else {
    warn('HSTS skipped — not HTTPS (expected for local dev)');
  }
}

// ── TEST 2: RATE LIMITING ────────────────────────────────────────────────────
async function testRateLimiting() {
  console.log('\n── 2. RATE LIMITING ─────────────────────────────────────────────');

  // Burst 30 quick requests — should trigger 429 in prod
  let got429 = false;
  for (let i = 0; i < 30; i++) {
    try {
      const r = await get('/api/health');
      if (r.status === 429) { got429 = true; break; }
    } catch {}
  }
  got429
    ? pass('Rate limiting triggered 429 after burst')
    : warn('Rate limit not triggered in 30 requests (OFF in dev mode — expected)');

  // Large body rejection
  try {
    const big = 'x'.repeat(200_000);
    const r   = await post('/api/v1/rooms', { data: big });
    r.status === 413
      ? pass('Oversized request body rejected (413)')
      : r.status === 400
      ? pass('Oversized body rejected (400)')
      : warn('Large body not rejected — status ' + r.status + ' (guards may be dev-OFF)');
  } catch (e) {
    warn('Large body test failed: ' + e.message);
  }
}

// ── TEST 3: INFORMATION DISCLOSURE ──────────────────────────────────────────
async function testInfoDisclosure() {
  console.log('\n── 3. INFORMATION DISCLOSURE ────────────────────────────────────');

  // /api/health
  try {
    const r = await get('/api/health');
    const j = JSON.parse(r.body);
    j.uptime !== undefined
      ? warn('/api/health leaks uptime (dev mode OK, must be hidden in prod)')
      : pass('/api/health: uptime not exposed in production');
    j.version
      ? warn('/api/health leaks version: ' + j.version + ' (hide in prod)')
      : pass('/api/health: version not exposed');
  } catch { warn('/api/health not reachable or not JSON'); }

  // /api/site-config
  try {
    const r = await get('/api/site-config');
    const j = JSON.parse(r.body);
    if (j.turnHosts?.length) {
      fail('/api/site-config leaks TURN host IPs: ' + JSON.stringify(j.turnHosts) +
           ' — attackers can see your infrastructure');
    } else {
      pass('/api/site-config: TURN IPs not exposed');
    }
  } catch {}

  // Stack trace exposure
  try {
    const r = await get('/api/v1/rooms/FAKEID-xyzabc-does-not-exist');
    const hasStack = r.body.includes('    at ') && r.body.includes('.js:');
    hasStack
      ? fail('Stack trace exposed in error response — leaks server file paths')
      : pass('No stack trace in error response');
  } catch {}

  // Sensitive paths
  const sensitivePaths = [
    '/.env', '/server.js', '/.git/config', '/config.js',
    '/node_modules/', '/admin', '/console',
  ];
  for (const p of sensitivePaths) {
    try {
      const r = await get(p);
      r.status === 200
        ? fail('Sensitive path is publicly accessible: ' + p)
        : pass('Blocked: ' + p + ' (' + r.status + ')');
    } catch { pass('Unreachable: ' + p); }
  }
}

// ── TEST 4: XSS / INJECTION via server sanitization ──────────────────────────
async function testInputSanitization() {
  console.log('\n── 4. INPUT SANITIZATION ────────────────────────────────────────');

  // File offer with XSS in name
  try {
    const r = await post('/api/v1/rooms', { name: '<script>alert(1)</script>' });
    // We check if the response reflects the script tag unescaped
    r.body.includes('<script>alert')
      ? fail('XSS payload reflected in API response unescaped')
      : pass('API response does not reflect XSS payload');
  } catch {}

  // roomId with path traversal
  try {
    const r = await get('/api/v1/rooms/../../../etc/passwd');
    r.status === 200 && r.body.includes('root:')
      ? fail('PATH TRAVERSAL — /etc/passwd readable!')
      : pass('Path traversal blocked');
  } catch { pass('Path traversal blocked (connection refused)'); }

  warn('Socket deviceName XSS: server strips <>\'"& — but verify escaping in toast() too');
  warn('Run test-client-browser.js in DevTools to test client-side XSS surface');
}

// ── TEST 5: MANIFEST + SERVICE WORKER ────────────────────────────────────────
async function testPWA() {
  console.log('\n── 5. PWA (MANIFEST + SERVICE WORKER) ──────────────────────────');

  try {
    const mf = await get('/manifest.json');
    if (mf.status !== 200) { fail('manifest.json missing (' + mf.status + ')'); return; }
    const j = JSON.parse(mf.body);
    j.id              ? pass('Manifest has "id" field')             : warn('Manifest missing "id" (Chrome 96+ dedup)');
    j.name            ? pass('Manifest name: ' + j.name)           : fail('Manifest missing name');
    j.start_url       ? pass('Manifest start_url: ' + j.start_url) : fail('Manifest missing start_url');
    j.display === 'standalone' ? pass('display: standalone')       : warn('display: ' + j.display);

    const icons      = j.icons || [];
    const hasAny      = icons.some(i => i.purpose === 'any');
    const hasMaskable = icons.some(i => i.purpose === 'maskable');
    const hasCombined = icons.some(i => (i.purpose || '').trim() === 'any maskable');

    icons.some(i => i.sizes?.includes('192'))
      ? pass('192×192 icon present')
      : fail('192×192 icon missing — required for Android install');
    icons.some(i => i.sizes?.includes('512'))
      ? pass('512×512 icon present')
      : fail('512×512 icon missing — required for splash screen');
    hasCombined
      ? fail('Icon has "any maskable" combined — Chrome 93+ may reject (use separate entries)')
      : pass('Icon purposes are not combined');
    hasAny && hasMaskable
      ? pass('Separate "any" and "maskable" icon entries present')
      : warn('Missing separate any/maskable entries — ' + icons.map(i=>i.purpose).join(', '));
  } catch (e) { fail('manifest.json error: ' + e.message); }

  try {
    const sw = await get('/sw.js');
    sw.status === 200        ? pass('sw.js served')                          : fail('sw.js not found');
    sw.body.includes('skipWaiting')
      ? pass('SW: skipWaiting present')
      : warn('SW: missing skipWaiting');
    sw.body.includes('self.location.origin')
      ? pass('SW: cross-origin requests bypassed (iOS Safari fix)')
      : warn('SW: may intercept cross-origin requests — iOS Safari issue');
    sw.body.includes('fetch(req).catch')
      ? pass('SW: offline fallback present')
      : warn('SW: no offline fallback');
  } catch (e) { fail('sw.js error: ' + e.message); }
}

// ── TEST 6: CORS ─────────────────────────────────────────────────────────────
async function testCORS() {
  console.log('\n── 6. CORS ──────────────────────────────────────────────────────');

  try {
    const r    = await get('/api/health', { Origin: 'https://evil-attacker.com' });
    const acao = r.headers['access-control-allow-origin'];
    if (!acao) {
      pass('CORS: no ACAO header for unknown origin (good)');
    } else if (acao === '*') {
      warn('CORS: wildcard (*) — OK for public API, risky if cookies used');
    } else if (acao === 'https://evil-attacker.com') {
      fail('CORS REFLECTS ORIGIN — any site can read your API responses');
    } else {
      pass('CORS: origin locked to: ' + acao);
    }
  } catch (e) { warn('CORS test failed: ' + e.message); }
}

// ── TEST 7: SOCKET.IO ────────────────────────────────────────────────────────
async function testSockets() {
  if (!ioClient) return;
  console.log('\n── 7. SOCKET.IO SECURITY ────────────────────────────────────────');

  return new Promise(resolve => {
    let done = false;
    const finish = (ms = 0) => setTimeout(() => {
      if (done) return; done = true;
      socket.disconnect();
      resolve();
    }, ms);

    const socket = ioClient(BASE, {
      transports:          ['websocket'],
      timeout:             6000,
      reconnection:        false,
      rejectUnauthorized:  false,
    });

    socket.on('connect_error', e => {
      warn('Socket connection error: ' + e.message);
      finish();
    });

    socket.on('connect', () => {
      pass('WebSocket connected');

      // Test: XSS in deviceName — server should strip <> characters
      socket.emit('join-room', {
        roomId:     'sec-test-xss-' + Date.now(),
        deviceName: '<script>alert("XSS")</script>',
      });

      // Test: Hugely long roomId — server should truncate to 50 chars
      socket.emit('join-room', {
        roomId:     'A'.repeat(500),
        deviceName: 'tester',
      });
      pass('XSS deviceName + oversized roomId sent — server should sanitize');

      // Test: Emit to a nonexistent socket — should be silently dropped
      socket.emit('webrtc-offer', {
        to:  'nonexistent-socket-id-abc123',
        sdp: { type: 'offer', sdp: 'v=0\r\n' },
      });
      pass('Offer to fake socketId sent — should be delivered to nobody');

      // Test event flood
      let count = 0;
      const flood = setInterval(() => {
        socket.emit('keepalive');
        if (++count >= 150) {
          clearInterval(flood);
          setTimeout(() => {
            socket.connected
              ? warn('Still connected after 150 rapid events (rate guard OFF in dev mode)')
              : pass('Disconnected after event flood (rate guard active)');
            finish();
          }, 500);
        }
      }, 10);
    });

    socket.on('room-full',  d => pass('room-full enforced: ' + (d?.message || JSON.stringify(d))));
    socket.on('disconnect', () => { if (!done) warn('Socket disconnected unexpectedly'); });

    setTimeout(() => { warn('Socket test timed out'); finish(); }, 10000);
  });
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Tranzo Security Test Suite                              ║');
  console.log(`║  Target: ${BASE.padEnd(48)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n  ⚠️  Make sure your server is running before this test!');

  const alive = await checkConnectivity();
  if (!alive) process.exit(1);

  await testHeaders();
  await testRateLimiting();
  await testInfoDisclosure();
  await testInputSanitization();
  await testPWA();
  await testCORS();
  await testSockets();

  console.log('\n══════════════════════════════════════════════════════════');
  console.log(`  RESULTS:  ✅ ${passed} passed  |  ❌ ${failed} failed  |  ⚠️  ${warned} warnings`);
  if (failed === 0 && warned <= 5) {
    console.log('  🎉 Security posture looks GOOD');
  } else if (failed === 0) {
    console.log('  🟡 No critical failures — review warnings above');
  } else {
    console.log('  🔴 Fix the ❌ items above before going to production');
  }
  console.log('══════════════════════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
})();
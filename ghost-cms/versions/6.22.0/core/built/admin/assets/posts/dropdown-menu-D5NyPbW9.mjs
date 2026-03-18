import { d as Xe, P as ne, c as Qe, b as de, f as et, i as He, e as E, n as Jn, g as Qn, h as Dt, u as eo, a as vt } from "./heading-BU5ZMUV_.mjs";
import { u as z, q as X, p as N, a3 as to, W as no, b as re, a as Ne, o as C, j as m, K as oo, S as Ot, n as ae } from "./index-DHZtUctP.mjs";
import { c as ro, b as Nt, u as io, I as so, R as co } from "./skeleton-BY5P5NDt.mjs";
import { a as Ke, P as ao, h as lo, u as uo, R as fo, F as po, D as mo, C as ho } from "./dialog-B8MooVkm.mjs";
function go(e) {
  const [t, n] = z(void 0);
  return Xe(() => {
    if (e) {
      n({ width: e.offsetWidth, height: e.offsetHeight });
      const o = new ResizeObserver((r) => {
        if (!Array.isArray(r) || !r.length)
          return;
        const i = r[0];
        let s, a;
        if ("borderBoxSize" in i) {
          const c = i.borderBoxSize, u = Array.isArray(c) ? c[0] : c;
          s = u.inlineSize, a = u.blockSize;
        } else
          s = e.offsetWidth, a = e.offsetHeight;
        n({ width: s, height: a });
      });
      return o.observe(e, { box: "border-box" }), () => o.unobserve(e);
    } else
      n(void 0);
  }, [e]), t;
}
const xo = ["top", "right", "bottom", "left"], ie = Math.min, K = Math.max, je = Math.round, Ie = Math.floor, se = (e) => ({
  x: e,
  y: e
}), wo = {
  left: "right",
  right: "left",
  bottom: "top",
  top: "bottom"
}, vo = {
  start: "end",
  end: "start"
};
function qe(e, t, n) {
  return K(e, ie(t, n));
}
function Q(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function ee(e) {
  return e.split("-")[0];
}
function ge(e) {
  return e.split("-")[1];
}
function tt(e) {
  return e === "x" ? "y" : "x";
}
function nt(e) {
  return e === "y" ? "height" : "width";
}
function xe(e) {
  return ["top", "bottom"].includes(ee(e)) ? "y" : "x";
}
function ot(e) {
  return tt(xe(e));
}
function yo(e, t, n) {
  n === void 0 && (n = !1);
  const o = ge(e), r = ot(e), i = nt(r);
  let s = r === "x" ? o === (n ? "end" : "start") ? "right" : "left" : o === "start" ? "bottom" : "top";
  return t.reference[i] > t.floating[i] && (s = ke(s)), [s, ke(s)];
}
function bo(e) {
  const t = ke(e);
  return [Ze(e), t, Ze(t)];
}
function Ze(e) {
  return e.replace(/start|end/g, (t) => vo[t]);
}
function Mo(e, t, n) {
  const o = ["left", "right"], r = ["right", "left"], i = ["top", "bottom"], s = ["bottom", "top"];
  switch (e) {
    case "top":
    case "bottom":
      return n ? t ? r : o : t ? o : r;
    case "left":
    case "right":
      return t ? i : s;
    default:
      return [];
  }
}
function Co(e, t, n, o) {
  const r = ge(e);
  let i = Mo(ee(e), n === "start", o);
  return r && (i = i.map((s) => s + "-" + r), t && (i = i.concat(i.map(Ze)))), i;
}
function ke(e) {
  return e.replace(/left|right|bottom|top/g, (t) => wo[t]);
}
function Ao(e) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...e
  };
}
function It(e) {
  return typeof e != "number" ? Ao(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function Le(e) {
  return {
    ...e,
    top: e.y,
    left: e.x,
    right: e.x + e.width,
    bottom: e.y + e.height
  };
}
function yt(e, t, n) {
  let {
    reference: o,
    floating: r
  } = e;
  const i = xe(t), s = ot(t), a = nt(s), c = ee(t), u = i === "y", d = o.x + o.width / 2 - r.width / 2, l = o.y + o.height / 2 - r.height / 2, f = o[a] / 2 - r[a] / 2;
  let p;
  switch (c) {
    case "top":
      p = {
        x: d,
        y: o.y - r.height
      };
      break;
    case "bottom":
      p = {
        x: d,
        y: o.y + o.height
      };
      break;
    case "right":
      p = {
        x: o.x + o.width,
        y: l
      };
      break;
    case "left":
      p = {
        x: o.x - r.width,
        y: l
      };
      break;
    default:
      p = {
        x: o.x,
        y: o.y
      };
  }
  switch (ge(t)) {
    case "start":
      p[s] -= f * (n && u ? -1 : 1);
      break;
    case "end":
      p[s] += f * (n && u ? -1 : 1);
      break;
  }
  return p;
}
const Po = async (e, t, n) => {
  const {
    placement: o = "bottom",
    strategy: r = "absolute",
    middleware: i = [],
    platform: s
  } = n, a = i.filter(Boolean), c = await (s.isRTL == null ? void 0 : s.isRTL(t));
  let u = await s.getElementRects({
    reference: e,
    floating: t,
    strategy: r
  }), {
    x: d,
    y: l
  } = yt(u, o, c), f = o, p = {}, h = 0;
  for (let g = 0; g < a.length; g++) {
    const {
      name: w,
      fn: x
    } = a[g], {
      x: v,
      y: A,
      data: P,
      reset: y
    } = await x({
      x: d,
      y: l,
      initialPlacement: o,
      placement: f,
      strategy: r,
      middlewareData: p,
      rects: u,
      platform: s,
      elements: {
        reference: e,
        floating: t
      }
    });
    if (d = v ?? d, l = A ?? l, p = {
      ...p,
      [w]: {
        ...p[w],
        ...P
      }
    }, y && h <= 50) {
      h++, typeof y == "object" && (y.placement && (f = y.placement), y.rects && (u = y.rects === !0 ? await s.getElementRects({
        reference: e,
        floating: t,
        strategy: r
      }) : y.rects), {
        x: d,
        y: l
      } = yt(u, f, c)), g = -1;
      continue;
    }
  }
  return {
    x: d,
    y: l,
    placement: f,
    strategy: r,
    middlewareData: p
  };
};
async function Ae(e, t) {
  var n;
  t === void 0 && (t = {});
  const {
    x: o,
    y: r,
    platform: i,
    rects: s,
    elements: a,
    strategy: c
  } = e, {
    boundary: u = "clippingAncestors",
    rootBoundary: d = "viewport",
    elementContext: l = "floating",
    altBoundary: f = !1,
    padding: p = 0
  } = Q(t, e), h = It(p), w = a[f ? l === "floating" ? "reference" : "floating" : l], x = Le(await i.getClippingRect({
    element: (n = await (i.isElement == null ? void 0 : i.isElement(w))) == null || n ? w : w.contextElement || await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(a.floating)),
    boundary: u,
    rootBoundary: d,
    strategy: c
  })), v = l === "floating" ? {
    ...s.floating,
    x: o,
    y: r
  } : s.reference, A = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(a.floating)), P = await (i.isElement == null ? void 0 : i.isElement(A)) ? await (i.getScale == null ? void 0 : i.getScale(A)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  }, y = Le(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
    rect: v,
    offsetParent: A,
    strategy: c
  }) : v);
  return {
    top: (x.top - y.top + h.top) / P.y,
    bottom: (y.bottom - x.bottom + h.bottom) / P.y,
    left: (x.left - y.left + h.left) / P.x,
    right: (y.right - x.right + h.right) / P.x
  };
}
const bt = (e) => ({
  name: "arrow",
  options: e,
  async fn(t) {
    const {
      x: n,
      y: o,
      placement: r,
      rects: i,
      platform: s,
      elements: a
    } = t, {
      element: c,
      padding: u = 0
    } = Q(e, t) || {};
    if (c == null)
      return {};
    const d = It(u), l = {
      x: n,
      y: o
    }, f = ot(r), p = nt(f), h = await s.getDimensions(c), g = f === "y", w = g ? "top" : "left", x = g ? "bottom" : "right", v = g ? "clientHeight" : "clientWidth", A = i.reference[p] + i.reference[f] - l[f] - i.floating[p], P = l[f] - i.reference[f], y = await (s.getOffsetParent == null ? void 0 : s.getOffsetParent(c));
    let b = y ? y[v] : 0;
    (!b || !await (s.isElement == null ? void 0 : s.isElement(y))) && (b = a.floating[v] || i.floating[p]);
    const R = A / 2 - P / 2, j = b / 2 - h[p] / 2 - 1, T = ie(d[w], j), k = ie(d[x], j), O = T, L = b - h[p] - k, S = b / 2 - h[p] / 2 + R, D = qe(O, S, L), _ = ge(r) != null && S != D && i.reference[p] / 2 - (S < O ? T : k) - h[p] / 2 < 0 ? S < O ? O - S : L - S : 0;
    return {
      [f]: l[f] - _,
      data: {
        [f]: D,
        centerOffset: S - D + _
      }
    };
  }
}), _o = function(e) {
  return e === void 0 && (e = {}), {
    name: "flip",
    options: e,
    async fn(t) {
      var n;
      const {
        placement: o,
        middlewareData: r,
        rects: i,
        initialPlacement: s,
        platform: a,
        elements: c
      } = t, {
        mainAxis: u = !0,
        crossAxis: d = !0,
        fallbackPlacements: l,
        fallbackStrategy: f = "bestFit",
        fallbackAxisSideDirection: p = "none",
        flipAlignment: h = !0,
        ...g
      } = Q(e, t), w = ee(o), x = ee(s) === s, v = await (a.isRTL == null ? void 0 : a.isRTL(c.floating)), A = l || (x || !h ? [ke(s)] : bo(s));
      !l && p !== "none" && A.push(...Co(s, h, p, v));
      const P = [s, ...A], y = await Ae(t, g), b = [];
      let R = ((n = r.flip) == null ? void 0 : n.overflows) || [];
      if (u && b.push(y[w]), d) {
        const O = yo(o, i, v);
        b.push(y[O[0]], y[O[1]]);
      }
      if (R = [...R, {
        placement: o,
        overflows: b
      }], !b.every((O) => O <= 0)) {
        var j, T;
        const O = (((j = r.flip) == null ? void 0 : j.index) || 0) + 1, L = P[O];
        if (L)
          return {
            data: {
              index: O,
              overflows: R
            },
            reset: {
              placement: L
            }
          };
        let S = (T = R.filter((D) => D.overflows[0] <= 0).sort((D, F) => D.overflows[1] - F.overflows[1])[0]) == null ? void 0 : T.placement;
        if (!S)
          switch (f) {
            case "bestFit": {
              var k;
              const D = (k = R.map((F) => [F.placement, F.overflows.filter((_) => _ > 0).reduce((_, H) => _ + H, 0)]).sort((F, _) => F[1] - _[1])[0]) == null ? void 0 : k[0];
              D && (S = D);
              break;
            }
            case "initialPlacement":
              S = s;
              break;
          }
        if (o !== S)
          return {
            reset: {
              placement: S
            }
          };
      }
      return {};
    }
  };
};
function Mt(e, t) {
  return {
    top: e.top - t.height,
    right: e.right - t.width,
    bottom: e.bottom - t.height,
    left: e.left - t.width
  };
}
function Ct(e) {
  return xo.some((t) => e[t] >= 0);
}
const Eo = function(e) {
  return e === void 0 && (e = {}), {
    name: "hide",
    options: e,
    async fn(t) {
      const {
        rects: n
      } = t, {
        strategy: o = "referenceHidden",
        ...r
      } = Q(e, t);
      switch (o) {
        case "referenceHidden": {
          const i = await Ae(t, {
            ...r,
            elementContext: "reference"
          }), s = Mt(i, n.reference);
          return {
            data: {
              referenceHiddenOffsets: s,
              referenceHidden: Ct(s)
            }
          };
        }
        case "escaped": {
          const i = await Ae(t, {
            ...r,
            altBoundary: !0
          }), s = Mt(i, n.floating);
          return {
            data: {
              escapedOffsets: s,
              escaped: Ct(s)
            }
          };
        }
        default:
          return {};
      }
    }
  };
};
async function Ro(e, t) {
  const {
    placement: n,
    platform: o,
    elements: r
  } = e, i = await (o.isRTL == null ? void 0 : o.isRTL(r.floating)), s = ee(n), a = ge(n), c = xe(n) === "y", u = ["left", "top"].includes(s) ? -1 : 1, d = i && c ? -1 : 1, l = Q(t, e);
  let {
    mainAxis: f,
    crossAxis: p,
    alignmentAxis: h
  } = typeof l == "number" ? {
    mainAxis: l,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: 0,
    crossAxis: 0,
    alignmentAxis: null,
    ...l
  };
  return a && typeof h == "number" && (p = a === "end" ? h * -1 : h), c ? {
    x: p * d,
    y: f * u
  } : {
    x: f * u,
    y: p * d
  };
}
const So = function(e) {
  return e === void 0 && (e = 0), {
    name: "offset",
    options: e,
    async fn(t) {
      const {
        x: n,
        y: o
      } = t, r = await Ro(t, e);
      return {
        x: n + r.x,
        y: o + r.y,
        data: r
      };
    }
  };
}, Do = function(e) {
  return e === void 0 && (e = {}), {
    name: "shift",
    options: e,
    async fn(t) {
      const {
        x: n,
        y: o,
        placement: r
      } = t, {
        mainAxis: i = !0,
        crossAxis: s = !1,
        limiter: a = {
          fn: (w) => {
            let {
              x,
              y: v
            } = w;
            return {
              x,
              y: v
            };
          }
        },
        ...c
      } = Q(e, t), u = {
        x: n,
        y: o
      }, d = await Ae(t, c), l = xe(ee(r)), f = tt(l);
      let p = u[f], h = u[l];
      if (i) {
        const w = f === "y" ? "top" : "left", x = f === "y" ? "bottom" : "right", v = p + d[w], A = p - d[x];
        p = qe(v, p, A);
      }
      if (s) {
        const w = l === "y" ? "top" : "left", x = l === "y" ? "bottom" : "right", v = h + d[w], A = h - d[x];
        h = qe(v, h, A);
      }
      const g = a.fn({
        ...t,
        [f]: p,
        [l]: h
      });
      return {
        ...g,
        data: {
          x: g.x - n,
          y: g.y - o
        }
      };
    }
  };
}, Oo = function(e) {
  return e === void 0 && (e = {}), {
    options: e,
    fn(t) {
      const {
        x: n,
        y: o,
        placement: r,
        rects: i,
        middlewareData: s
      } = t, {
        offset: a = 0,
        mainAxis: c = !0,
        crossAxis: u = !0
      } = Q(e, t), d = {
        x: n,
        y: o
      }, l = xe(r), f = tt(l);
      let p = d[f], h = d[l];
      const g = Q(a, t), w = typeof g == "number" ? {
        mainAxis: g,
        crossAxis: 0
      } : {
        mainAxis: 0,
        crossAxis: 0,
        ...g
      };
      if (c) {
        const A = f === "y" ? "height" : "width", P = i.reference[f] - i.floating[A] + w.mainAxis, y = i.reference[f] + i.reference[A] - w.mainAxis;
        p < P ? p = P : p > y && (p = y);
      }
      if (u) {
        var x, v;
        const A = f === "y" ? "width" : "height", P = ["top", "left"].includes(ee(r)), y = i.reference[l] - i.floating[A] + (P && ((x = s.offset) == null ? void 0 : x[l]) || 0) + (P ? 0 : w.crossAxis), b = i.reference[l] + i.reference[A] + (P ? 0 : ((v = s.offset) == null ? void 0 : v[l]) || 0) - (P ? w.crossAxis : 0);
        h < y ? h = y : h > b && (h = b);
      }
      return {
        [f]: p,
        [l]: h
      };
    }
  };
}, No = function(e) {
  return e === void 0 && (e = {}), {
    name: "size",
    options: e,
    async fn(t) {
      const {
        placement: n,
        rects: o,
        platform: r,
        elements: i
      } = t, {
        apply: s = () => {
        },
        ...a
      } = Q(e, t), c = await Ae(t, a), u = ee(n), d = ge(n), l = xe(n) === "y", {
        width: f,
        height: p
      } = o.floating;
      let h, g;
      u === "top" || u === "bottom" ? (h = u, g = d === (await (r.isRTL == null ? void 0 : r.isRTL(i.floating)) ? "start" : "end") ? "left" : "right") : (g = u, h = d === "end" ? "top" : "bottom");
      const w = p - c[h], x = f - c[g], v = !t.middlewareData.shift;
      let A = w, P = x;
      if (l) {
        const b = f - c.left - c.right;
        P = d || v ? ie(x, b) : b;
      } else {
        const b = p - c.top - c.bottom;
        A = d || v ? ie(w, b) : b;
      }
      if (v && !d) {
        const b = K(c.left, 0), R = K(c.right, 0), j = K(c.top, 0), T = K(c.bottom, 0);
        l ? P = f - 2 * (b !== 0 || R !== 0 ? b + R : K(c.left, c.right)) : A = p - 2 * (j !== 0 || T !== 0 ? j + T : K(c.top, c.bottom));
      }
      await s({
        ...t,
        availableWidth: P,
        availableHeight: A
      });
      const y = await r.getDimensions(i.floating);
      return f !== y.width || p !== y.height ? {
        reset: {
          rects: !0
        }
      } : {};
    }
  };
};
function ce(e) {
  return Tt(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function W(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function oe(e) {
  var t;
  return (t = (Tt(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function Tt(e) {
  return e instanceof Node || e instanceof W(e).Node;
}
function te(e) {
  return e instanceof Element || e instanceof W(e).Element;
}
function Z(e) {
  return e instanceof HTMLElement || e instanceof W(e).HTMLElement;
}
function At(e) {
  return typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof W(e).ShadowRoot;
}
function Ee(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: o,
    display: r
  } = Y(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + o + n) && !["inline", "contents"].includes(r);
}
function Io(e) {
  return ["table", "td", "th"].includes(ce(e));
}
function rt(e) {
  const t = it(), n = Y(e);
  return n.transform !== "none" || n.perspective !== "none" || (n.containerType ? n.containerType !== "normal" : !1) || !t && (n.backdropFilter ? n.backdropFilter !== "none" : !1) || !t && (n.filter ? n.filter !== "none" : !1) || ["transform", "perspective", "filter"].some((o) => (n.willChange || "").includes(o)) || ["paint", "layout", "strict", "content"].some((o) => (n.contain || "").includes(o));
}
function To(e) {
  let t = he(e);
  for (; Z(t) && !ze(t); ) {
    if (rt(t))
      return t;
    t = he(t);
  }
  return null;
}
function it() {
  return typeof CSS > "u" || !CSS.supports ? !1 : CSS.supports("-webkit-backdrop-filter", "none");
}
function ze(e) {
  return ["html", "body", "#document"].includes(ce(e));
}
function Y(e) {
  return W(e).getComputedStyle(e);
}
function We(e) {
  return te(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.pageXOffset,
    scrollTop: e.pageYOffset
  };
}
function he(e) {
  if (ce(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    At(e) && e.host || // Fallback.
    oe(e)
  );
  return At(t) ? t.host : t;
}
function jt(e) {
  const t = he(e);
  return ze(t) ? e.ownerDocument ? e.ownerDocument.body : e.body : Z(t) && Ee(t) ? t : jt(t);
}
function Fe(e, t) {
  var n;
  t === void 0 && (t = []);
  const o = jt(e), r = o === ((n = e.ownerDocument) == null ? void 0 : n.body), i = W(o);
  return r ? t.concat(i, i.visualViewport || [], Ee(o) ? o : []) : t.concat(o, Fe(o));
}
function kt(e) {
  const t = Y(e);
  let n = parseFloat(t.width) || 0, o = parseFloat(t.height) || 0;
  const r = Z(e), i = r ? e.offsetWidth : n, s = r ? e.offsetHeight : o, a = je(n) !== i || je(o) !== s;
  return a && (n = i, o = s), {
    width: n,
    height: o,
    $: a
  };
}
function st(e) {
  return te(e) ? e : e.contextElement;
}
function me(e) {
  const t = st(e);
  if (!Z(t))
    return se(1);
  const n = t.getBoundingClientRect(), {
    width: o,
    height: r,
    $: i
  } = kt(t);
  let s = (i ? je(n.width) : n.width) / o, a = (i ? je(n.height) : n.height) / r;
  return (!s || !Number.isFinite(s)) && (s = 1), (!a || !Number.isFinite(a)) && (a = 1), {
    x: s,
    y: a
  };
}
const jo = /* @__PURE__ */ se(0);
function Lt(e) {
  const t = W(e);
  return !it() || !t.visualViewport ? jo : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function ko(e, t, n) {
  return t === void 0 && (t = !1), !n || t && n !== W(e) ? !1 : t;
}
function ue(e, t, n, o) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const r = e.getBoundingClientRect(), i = st(e);
  let s = se(1);
  t && (o ? te(o) && (s = me(o)) : s = me(e));
  const a = ko(i, n, o) ? Lt(i) : se(0);
  let c = (r.left + a.x) / s.x, u = (r.top + a.y) / s.y, d = r.width / s.x, l = r.height / s.y;
  if (i) {
    const f = W(i), p = o && te(o) ? W(o) : o;
    let h = f.frameElement;
    for (; h && o && p !== f; ) {
      const g = me(h), w = h.getBoundingClientRect(), x = Y(h), v = w.left + (h.clientLeft + parseFloat(x.paddingLeft)) * g.x, A = w.top + (h.clientTop + parseFloat(x.paddingTop)) * g.y;
      c *= g.x, u *= g.y, d *= g.x, l *= g.y, c += v, u += A, h = W(h).frameElement;
    }
  }
  return Le({
    width: d,
    height: l,
    x: c,
    y: u
  });
}
function Lo(e) {
  let {
    rect: t,
    offsetParent: n,
    strategy: o
  } = e;
  const r = Z(n), i = oe(n);
  if (n === i)
    return t;
  let s = {
    scrollLeft: 0,
    scrollTop: 0
  }, a = se(1);
  const c = se(0);
  if ((r || !r && o !== "fixed") && ((ce(n) !== "body" || Ee(i)) && (s = We(n)), Z(n))) {
    const u = ue(n);
    a = me(n), c.x = u.x + n.clientLeft, c.y = u.y + n.clientTop;
  }
  return {
    width: t.width * a.x,
    height: t.height * a.y,
    x: t.x * a.x - s.scrollLeft * a.x + c.x,
    y: t.y * a.y - s.scrollTop * a.y + c.y
  };
}
function Fo(e) {
  return Array.from(e.getClientRects());
}
function Ft(e) {
  return ue(oe(e)).left + We(e).scrollLeft;
}
function $o(e) {
  const t = oe(e), n = We(e), o = e.ownerDocument.body, r = K(t.scrollWidth, t.clientWidth, o.scrollWidth, o.clientWidth), i = K(t.scrollHeight, t.clientHeight, o.scrollHeight, o.clientHeight);
  let s = -n.scrollLeft + Ft(e);
  const a = -n.scrollTop;
  return Y(o).direction === "rtl" && (s += K(t.clientWidth, o.clientWidth) - r), {
    width: r,
    height: i,
    x: s,
    y: a
  };
}
function Bo(e, t) {
  const n = W(e), o = oe(e), r = n.visualViewport;
  let i = o.clientWidth, s = o.clientHeight, a = 0, c = 0;
  if (r) {
    i = r.width, s = r.height;
    const u = it();
    (!u || u && t === "fixed") && (a = r.offsetLeft, c = r.offsetTop);
  }
  return {
    width: i,
    height: s,
    x: a,
    y: c
  };
}
function Go(e, t) {
  const n = ue(e, !0, t === "fixed"), o = n.top + e.clientTop, r = n.left + e.clientLeft, i = Z(e) ? me(e) : se(1), s = e.clientWidth * i.x, a = e.clientHeight * i.y, c = r * i.x, u = o * i.y;
  return {
    width: s,
    height: a,
    x: c,
    y: u
  };
}
function Pt(e, t, n) {
  let o;
  if (t === "viewport")
    o = Bo(e, n);
  else if (t === "document")
    o = $o(oe(e));
  else if (te(t))
    o = Go(t, n);
  else {
    const r = Lt(e);
    o = {
      ...t,
      x: t.x - r.x,
      y: t.y - r.y
    };
  }
  return Le(o);
}
function $t(e, t) {
  const n = he(e);
  return n === t || !te(n) || ze(n) ? !1 : Y(n).position === "fixed" || $t(n, t);
}
function Ho(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let o = Fe(e).filter((a) => te(a) && ce(a) !== "body"), r = null;
  const i = Y(e).position === "fixed";
  let s = i ? he(e) : e;
  for (; te(s) && !ze(s); ) {
    const a = Y(s), c = rt(s);
    !c && a.position === "fixed" && (r = null), (i ? !c && !r : !c && a.position === "static" && !!r && ["absolute", "fixed"].includes(r.position) || Ee(s) && !c && $t(e, s)) ? o = o.filter((d) => d !== s) : r = a, s = he(s);
  }
  return t.set(e, o), o;
}
function Ko(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: o,
    strategy: r
  } = e;
  const s = [...n === "clippingAncestors" ? Ho(t, this._c) : [].concat(n), o], a = s[0], c = s.reduce((u, d) => {
    const l = Pt(t, d, r);
    return u.top = K(l.top, u.top), u.right = ie(l.right, u.right), u.bottom = ie(l.bottom, u.bottom), u.left = K(l.left, u.left), u;
  }, Pt(t, a, r));
  return {
    width: c.right - c.left,
    height: c.bottom - c.top,
    x: c.left,
    y: c.top
  };
}
function zo(e) {
  return kt(e);
}
function Wo(e, t, n) {
  const o = Z(t), r = oe(t), i = n === "fixed", s = ue(e, !0, i, t);
  let a = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const c = se(0);
  if (o || !o && !i)
    if ((ce(t) !== "body" || Ee(r)) && (a = We(t)), o) {
      const u = ue(t, !0, i, t);
      c.x = u.x + t.clientLeft, c.y = u.y + t.clientTop;
    } else r && (c.x = Ft(r));
  return {
    x: s.left + a.scrollLeft - c.x,
    y: s.top + a.scrollTop - c.y,
    width: s.width,
    height: s.height
  };
}
function _t(e, t) {
  return !Z(e) || Y(e).position === "fixed" ? null : t ? t(e) : e.offsetParent;
}
function Bt(e, t) {
  const n = W(e);
  if (!Z(e))
    return n;
  let o = _t(e, t);
  for (; o && Io(o) && Y(o).position === "static"; )
    o = _t(o, t);
  return o && (ce(o) === "html" || ce(o) === "body" && Y(o).position === "static" && !rt(o)) ? n : o || To(e) || n;
}
const Vo = async function(e) {
  let {
    reference: t,
    floating: n,
    strategy: o
  } = e;
  const r = this.getOffsetParent || Bt, i = this.getDimensions;
  return {
    reference: Wo(t, await r(n), o),
    floating: {
      x: 0,
      y: 0,
      ...await i(n)
    }
  };
};
function Uo(e) {
  return Y(e).direction === "rtl";
}
const Yo = {
  convertOffsetParentRelativeRectToViewportRelativeRect: Lo,
  getDocumentElement: oe,
  getClippingRect: Ko,
  getOffsetParent: Bt,
  getElementRects: Vo,
  getClientRects: Fo,
  getDimensions: zo,
  getScale: me,
  isElement: te,
  isRTL: Uo
};
function Xo(e, t) {
  let n = null, o;
  const r = oe(e);
  function i() {
    clearTimeout(o), n && n.disconnect(), n = null;
  }
  function s(a, c) {
    a === void 0 && (a = !1), c === void 0 && (c = 1), i();
    const {
      left: u,
      top: d,
      width: l,
      height: f
    } = e.getBoundingClientRect();
    if (a || t(), !l || !f)
      return;
    const p = Ie(d), h = Ie(r.clientWidth - (u + l)), g = Ie(r.clientHeight - (d + f)), w = Ie(u), v = {
      rootMargin: -p + "px " + -h + "px " + -g + "px " + -w + "px",
      threshold: K(0, ie(1, c)) || 1
    };
    let A = !0;
    function P(y) {
      const b = y[0].intersectionRatio;
      if (b !== c) {
        if (!A)
          return s();
        b ? s(!1, b) : o = setTimeout(() => {
          s(!1, 1e-7);
        }, 100);
      }
      A = !1;
    }
    try {
      n = new IntersectionObserver(P, {
        ...v,
        // Handle <iframe>s
        root: r.ownerDocument
      });
    } catch {
      n = new IntersectionObserver(P, v);
    }
    n.observe(e);
  }
  return s(!0), i;
}
function qo(e, t, n, o) {
  o === void 0 && (o = {});
  const {
    ancestorScroll: r = !0,
    ancestorResize: i = !0,
    elementResize: s = typeof ResizeObserver == "function",
    layoutShift: a = typeof IntersectionObserver == "function",
    animationFrame: c = !1
  } = o, u = st(e), d = r || i ? [...u ? Fe(u) : [], ...Fe(t)] : [];
  d.forEach((x) => {
    r && x.addEventListener("scroll", n, {
      passive: !0
    }), i && x.addEventListener("resize", n);
  });
  const l = u && a ? Xo(u, n) : null;
  let f = -1, p = null;
  s && (p = new ResizeObserver((x) => {
    let [v] = x;
    v && v.target === u && p && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
      p && p.observe(t);
    })), n();
  }), u && !c && p.observe(u), p.observe(t));
  let h, g = c ? ue(e) : null;
  c && w();
  function w() {
    const x = ue(e);
    g && (x.x !== g.x || x.y !== g.y || x.width !== g.width || x.height !== g.height) && n(), g = x, h = requestAnimationFrame(w);
  }
  return n(), () => {
    d.forEach((x) => {
      r && x.removeEventListener("scroll", n), i && x.removeEventListener("resize", n);
    }), l && l(), p && p.disconnect(), p = null, c && cancelAnimationFrame(h);
  };
}
const Zo = (e, t, n) => {
  const o = /* @__PURE__ */ new Map(), r = {
    platform: Yo,
    ...n
  }, i = {
    ...r.platform,
    _c: o
  };
  return Po(e, t, {
    ...r,
    platform: i
  });
}, Jo = (e) => {
  function t(n) {
    return {}.hasOwnProperty.call(n, "current");
  }
  return {
    name: "arrow",
    options: e,
    fn(n) {
      const {
        element: o,
        padding: r
      } = typeof e == "function" ? e(n) : e;
      return o && t(o) ? o.current != null ? bt({
        element: o.current,
        padding: r
      }).fn(n) : {} : o ? bt({
        element: o,
        padding: r
      }).fn(n) : {};
    }
  };
};
var Te = typeof document < "u" ? no : re;
function $e(e, t) {
  if (e === t)
    return !0;
  if (typeof e != typeof t)
    return !1;
  if (typeof e == "function" && e.toString() === t.toString())
    return !0;
  let n, o, r;
  if (e && t && typeof e == "object") {
    if (Array.isArray(e)) {
      if (n = e.length, n != t.length) return !1;
      for (o = n; o-- !== 0; )
        if (!$e(e[o], t[o]))
          return !1;
      return !0;
    }
    if (r = Object.keys(e), n = r.length, n !== Object.keys(t).length)
      return !1;
    for (o = n; o-- !== 0; )
      if (!{}.hasOwnProperty.call(t, r[o]))
        return !1;
    for (o = n; o-- !== 0; ) {
      const i = r[o];
      if (!(i === "_owner" && e.$$typeof) && !$e(e[i], t[i]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Gt(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Et(e, t) {
  const n = Gt(e);
  return Math.round(t * n) / n;
}
function Rt(e) {
  const t = N(e);
  return Te(() => {
    t.current = e;
  }), t;
}
function Qo(e) {
  e === void 0 && (e = {});
  const {
    placement: t = "bottom",
    strategy: n = "absolute",
    middleware: o = [],
    platform: r,
    elements: {
      reference: i,
      floating: s
    } = {},
    transform: a = !0,
    whileElementsMounted: c,
    open: u
  } = e, [d, l] = z({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [f, p] = z(o);
  $e(f, o) || p(o);
  const [h, g] = z(null), [w, x] = z(null), v = X((_) => {
    _ != b.current && (b.current = _, g(_));
  }, [g]), A = X((_) => {
    _ !== R.current && (R.current = _, x(_));
  }, [x]), P = i || h, y = s || w, b = N(null), R = N(null), j = N(d), T = Rt(c), k = Rt(r), O = X(() => {
    if (!b.current || !R.current)
      return;
    const _ = {
      placement: t,
      strategy: n,
      middleware: f
    };
    k.current && (_.platform = k.current), Zo(b.current, R.current, _).then((H) => {
      const I = {
        ...H,
        isPositioned: !0
      };
      L.current && !$e(j.current, I) && (j.current = I, to(() => {
        l(I);
      }));
    });
  }, [f, t, n, k]);
  Te(() => {
    u === !1 && j.current.isPositioned && (j.current.isPositioned = !1, l((_) => ({
      ..._,
      isPositioned: !1
    })));
  }, [u]);
  const L = N(!1);
  Te(() => (L.current = !0, () => {
    L.current = !1;
  }), []), Te(() => {
    if (P && (b.current = P), y && (R.current = y), P && y) {
      if (T.current)
        return T.current(P, y, O);
      O();
    }
  }, [P, y, O, T]);
  const S = Ne(() => ({
    reference: b,
    floating: R,
    setReference: v,
    setFloating: A
  }), [v, A]), D = Ne(() => ({
    reference: P,
    floating: y
  }), [P, y]), F = Ne(() => {
    const _ = {
      position: n,
      left: 0,
      top: 0
    };
    if (!D.floating)
      return _;
    const H = Et(D.floating, d.x), I = Et(D.floating, d.y);
    return a ? {
      ..._,
      transform: "translate(" + H + "px, " + I + "px)",
      ...Gt(D.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: H,
      top: I
    };
  }, [n, a, D.floating, d.x, d.y]);
  return Ne(() => ({
    ...d,
    update: O,
    refs: S,
    elements: D,
    floatingStyles: F
  }), [d, O, S, D, F]);
}
var er = "Arrow", Ht = C((e, t) => {
  const { children: n, width: o = 10, height: r = 5, ...i } = e;
  return /* @__PURE__ */ m.jsx(
    ne.svg,
    {
      ...i,
      ref: t,
      width: o,
      height: r,
      viewBox: "0 0 30 10",
      preserveAspectRatio: "none",
      children: e.asChild ? n : /* @__PURE__ */ m.jsx("polygon", { points: "0,0 30,0 15,10" })
    }
  );
});
Ht.displayName = er;
var tr = Ht, ct = "Popper", [Kt, zt] = Qe(ct), [nr, Wt] = Kt(ct), Vt = (e) => {
  const { __scopePopper: t, children: n } = e, [o, r] = z(null);
  return /* @__PURE__ */ m.jsx(nr, { scope: t, anchor: o, onAnchorChange: r, children: n });
};
Vt.displayName = ct;
var Ut = "PopperAnchor", Yt = C(
  (e, t) => {
    const { __scopePopper: n, virtualRef: o, ...r } = e, i = Wt(Ut, n), s = N(null), a = de(t, s), c = N(null);
    return re(() => {
      const u = c.current;
      c.current = (o == null ? void 0 : o.current) || s.current, u !== c.current && i.onAnchorChange(c.current);
    }), o ? null : /* @__PURE__ */ m.jsx(ne.div, { ...r, ref: a });
  }
);
Yt.displayName = Ut;
var at = "PopperContent", [or, rr] = Kt(at), Xt = C(
  (e, t) => {
    var J, ye, V, be, gt, xt;
    const {
      __scopePopper: n,
      side: o = "bottom",
      sideOffset: r = 0,
      align: i = "center",
      alignOffset: s = 0,
      arrowPadding: a = 0,
      avoidCollisions: c = !0,
      collisionBoundary: u = [],
      collisionPadding: d = 0,
      sticky: l = "partial",
      hideWhenDetached: f = !1,
      updatePositionStrategy: p = "optimized",
      onPlaced: h,
      ...g
    } = e, w = Wt(at, n), [x, v] = z(null), A = de(t, (Me) => v(Me)), [P, y] = z(null), b = go(P), R = (b == null ? void 0 : b.width) ?? 0, j = (b == null ? void 0 : b.height) ?? 0, T = o + (i !== "center" ? "-" + i : ""), k = typeof d == "number" ? d : { top: 0, right: 0, bottom: 0, left: 0, ...d }, O = Array.isArray(u) ? u : [u], L = O.length > 0, S = {
      padding: k,
      boundary: O.filter(sr),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: L
    }, { refs: D, floatingStyles: F, placement: _, isPositioned: H, middlewareData: I } = Qo({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: "fixed",
      placement: T,
      whileElementsMounted: (...Me) => qo(...Me, {
        animationFrame: p === "always"
      }),
      elements: {
        reference: w.anchor
      },
      middleware: [
        So({ mainAxis: r + j, alignmentAxis: s }),
        c && Do({
          mainAxis: !0,
          crossAxis: !1,
          limiter: l === "partial" ? Oo() : void 0,
          ...S
        }),
        c && _o({ ...S }),
        No({
          ...S,
          apply: ({ elements: Me, rects: wt, availableWidth: Yn, availableHeight: Xn }) => {
            const { width: qn, height: Zn } = wt.reference, Oe = Me.floating.style;
            Oe.setProperty("--radix-popper-available-width", `${Yn}px`), Oe.setProperty("--radix-popper-available-height", `${Xn}px`), Oe.setProperty("--radix-popper-anchor-width", `${qn}px`), Oe.setProperty("--radix-popper-anchor-height", `${Zn}px`);
          }
        }),
        P && Jo({ element: P, padding: a }),
        cr({ arrowWidth: R, arrowHeight: j }),
        f && Eo({ strategy: "referenceHidden", ...S })
      ]
    }), [M, G] = Jt(_), $ = et(h);
    Xe(() => {
      H && ($ == null || $());
    }, [H, $]);
    const q = (J = I.arrow) == null ? void 0 : J.x, we = (ye = I.arrow) == null ? void 0 : ye.y, ve = ((V = I.arrow) == null ? void 0 : V.centerOffset) !== 0, [De, le] = z();
    return Xe(() => {
      x && le(window.getComputedStyle(x).zIndex);
    }, [x]), /* @__PURE__ */ m.jsx(
      "div",
      {
        ref: D.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...F,
          transform: H ? F.transform : "translate(0, -200%)",
          // keep off the page when measuring
          minWidth: "max-content",
          zIndex: De,
          "--radix-popper-transform-origin": [
            (be = I.transformOrigin) == null ? void 0 : be.x,
            (gt = I.transformOrigin) == null ? void 0 : gt.y
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          ...((xt = I.hide) == null ? void 0 : xt.referenceHidden) && {
            visibility: "hidden",
            pointerEvents: "none"
          }
        },
        dir: e.dir,
        children: /* @__PURE__ */ m.jsx(
          or,
          {
            scope: n,
            placedSide: M,
            onArrowChange: y,
            arrowX: q,
            arrowY: we,
            shouldHideArrow: ve,
            children: /* @__PURE__ */ m.jsx(
              ne.div,
              {
                "data-side": M,
                "data-align": G,
                ...g,
                ref: A,
                style: {
                  ...g.style,
                  // if the PopperContent hasn't been placed yet (not all measurements done)
                  // we prevent animations so that users's animation don't kick in too early referring wrong sides
                  animation: H ? void 0 : "none"
                }
              }
            )
          }
        )
      }
    );
  }
);
Xt.displayName = at;
var qt = "PopperArrow", ir = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
}, Zt = C(function(t, n) {
  const { __scopePopper: o, ...r } = t, i = rr(qt, o), s = ir[i.placedSide];
  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as we'd expect on SVG elements.
    // it reports their bounding box which is effectively the largest path inside the SVG.
    /* @__PURE__ */ m.jsx(
      "span",
      {
        ref: i.onArrowChange,
        style: {
          position: "absolute",
          left: i.arrowX,
          top: i.arrowY,
          [s]: 0,
          transformOrigin: {
            top: "",
            right: "0 0",
            bottom: "center 0",
            left: "100% 0"
          }[i.placedSide],
          transform: {
            top: "translateY(100%)",
            right: "translateY(50%) rotate(90deg) translateX(-50%)",
            bottom: "rotate(180deg)",
            left: "translateY(50%) rotate(-90deg) translateX(50%)"
          }[i.placedSide],
          visibility: i.shouldHideArrow ? "hidden" : void 0
        },
        children: /* @__PURE__ */ m.jsx(
          tr,
          {
            ...r,
            ref: n,
            style: {
              ...r.style,
              // ensures the element can be measured correctly (mostly for if SVG)
              display: "block"
            }
          }
        )
      }
    )
  );
});
Zt.displayName = qt;
function sr(e) {
  return e !== null;
}
var cr = (e) => ({
  name: "transformOrigin",
  options: e,
  fn(t) {
    var w, x, v;
    const { placement: n, rects: o, middlewareData: r } = t, s = ((w = r.arrow) == null ? void 0 : w.centerOffset) !== 0, a = s ? 0 : e.arrowWidth, c = s ? 0 : e.arrowHeight, [u, d] = Jt(n), l = { start: "0%", center: "50%", end: "100%" }[d], f = (((x = r.arrow) == null ? void 0 : x.x) ?? 0) + a / 2, p = (((v = r.arrow) == null ? void 0 : v.y) ?? 0) + c / 2;
    let h = "", g = "";
    return u === "bottom" ? (h = s ? l : `${f}px`, g = `${-c}px`) : u === "top" ? (h = s ? l : `${f}px`, g = `${o.floating.height + c}px`) : u === "right" ? (h = `${-c}px`, g = s ? l : `${p}px`) : u === "left" && (h = `${o.floating.width + c}px`, g = s ? l : `${p}px`), { data: { x: h, y: g } };
  }
});
function Jt(e) {
  const [t, n = "center"] = e.split("-");
  return [t, n];
}
var ar = Vt, lr = Yt, ur = Xt, dr = Zt;
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const fr = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]], pr = He("chevron-right", fr);
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const mr = [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]], hr = He("circle", mr);
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gr = [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
  ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }]
], $i = He("ellipsis", gr);
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xr = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
], Bi = He("user", xr);
var Je = ["Enter", " "], wr = ["ArrowDown", "PageUp", "Home"], Qt = ["ArrowUp", "PageDown", "End"], vr = [...wr, ...Qt], yr = {
  ltr: [...Je, "ArrowRight"],
  rtl: [...Je, "ArrowLeft"]
}, br = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"]
}, Re = "Menu", [Pe, Mr, Cr] = ro(Re), [fe, en] = Qe(Re, [
  Cr,
  zt,
  Nt
]), Ve = zt(), tn = Nt(), [Ar, pe] = fe(Re), [Pr, Se] = fe(Re), nn = (e) => {
  const { __scopeMenu: t, open: n = !1, children: o, dir: r, onOpenChange: i, modal: s = !0 } = e, a = Ve(t), [c, u] = z(null), d = N(!1), l = et(i), f = io(r);
  return re(() => {
    const p = () => {
      d.current = !0, document.addEventListener("pointerdown", h, { capture: !0, once: !0 }), document.addEventListener("pointermove", h, { capture: !0, once: !0 });
    }, h = () => d.current = !1;
    return document.addEventListener("keydown", p, { capture: !0 }), () => {
      document.removeEventListener("keydown", p, { capture: !0 }), document.removeEventListener("pointerdown", h, { capture: !0 }), document.removeEventListener("pointermove", h, { capture: !0 });
    };
  }, []), /* @__PURE__ */ m.jsx(ar, { ...a, children: /* @__PURE__ */ m.jsx(
    Ar,
    {
      scope: t,
      open: n,
      onOpenChange: l,
      content: c,
      onContentChange: u,
      children: /* @__PURE__ */ m.jsx(
        Pr,
        {
          scope: t,
          onClose: X(() => l(!1), [l]),
          isUsingKeyboardRef: d,
          dir: f,
          modal: s,
          children: o
        }
      )
    }
  ) });
};
nn.displayName = Re;
var _r = "MenuAnchor", lt = C(
  (e, t) => {
    const { __scopeMenu: n, ...o } = e, r = Ve(n);
    return /* @__PURE__ */ m.jsx(lr, { ...r, ...o, ref: t });
  }
);
lt.displayName = _r;
var ut = "MenuPortal", [Er, on] = fe(ut, {
  forceMount: void 0
}), rn = (e) => {
  const { __scopeMenu: t, forceMount: n, children: o, container: r } = e, i = pe(ut, t);
  return /* @__PURE__ */ m.jsx(Er, { scope: t, forceMount: n, children: /* @__PURE__ */ m.jsx(Ke, { present: n || i.open, children: /* @__PURE__ */ m.jsx(ao, { asChild: !0, container: r, children: o }) }) });
};
rn.displayName = ut;
var U = "MenuContent", [Rr, dt] = fe(U), sn = C(
  (e, t) => {
    const n = on(U, e.__scopeMenu), { forceMount: o = n.forceMount, ...r } = e, i = pe(U, e.__scopeMenu), s = Se(U, e.__scopeMenu);
    return /* @__PURE__ */ m.jsx(Pe.Provider, { scope: e.__scopeMenu, children: /* @__PURE__ */ m.jsx(Ke, { present: o || i.open, children: /* @__PURE__ */ m.jsx(Pe.Slot, { scope: e.__scopeMenu, children: s.modal ? /* @__PURE__ */ m.jsx(Sr, { ...r, ref: t }) : /* @__PURE__ */ m.jsx(Dr, { ...r, ref: t }) }) }) });
  }
), Sr = C(
  (e, t) => {
    const n = pe(U, e.__scopeMenu), o = N(null), r = de(t, o);
    return re(() => {
      const i = o.current;
      if (i) return lo(i);
    }, []), /* @__PURE__ */ m.jsx(
      ft,
      {
        ...e,
        ref: r,
        trapFocus: n.open,
        disableOutsidePointerEvents: n.open,
        disableOutsideScroll: !0,
        onFocusOutside: E(
          e.onFocusOutside,
          (i) => i.preventDefault(),
          { checkForDefaultPrevented: !1 }
        ),
        onDismiss: () => n.onOpenChange(!1)
      }
    );
  }
), Dr = C((e, t) => {
  const n = pe(U, e.__scopeMenu);
  return /* @__PURE__ */ m.jsx(
    ft,
    {
      ...e,
      ref: t,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      disableOutsideScroll: !1,
      onDismiss: () => n.onOpenChange(!1)
    }
  );
}), Or = Qn("MenuContent.ScrollLock"), ft = C(
  (e, t) => {
    const {
      __scopeMenu: n,
      loop: o = !1,
      trapFocus: r,
      onOpenAutoFocus: i,
      onCloseAutoFocus: s,
      disableOutsidePointerEvents: a,
      onEntryFocus: c,
      onEscapeKeyDown: u,
      onPointerDownOutside: d,
      onFocusOutside: l,
      onInteractOutside: f,
      onDismiss: p,
      disableOutsideScroll: h,
      ...g
    } = e, w = pe(U, n), x = Se(U, n), v = Ve(n), A = tn(n), P = Mr(n), [y, b] = z(null), R = N(null), j = de(t, R, w.onContentChange), T = N(0), k = N(""), O = N(0), L = N(null), S = N("right"), D = N(0), F = h ? fo : oo, _ = h ? { as: Or, allowPinchZoom: !0 } : void 0, H = (M) => {
      var J, ye;
      const G = k.current + M, $ = P().filter((V) => !V.disabled), q = document.activeElement, we = (J = $.find((V) => V.ref.current === q)) == null ? void 0 : J.textValue, ve = $.map((V) => V.textValue), De = Kr(ve, G, we), le = (ye = $.find((V) => V.textValue === De)) == null ? void 0 : ye.ref.current;
      (function V(be) {
        k.current = be, window.clearTimeout(T.current), be !== "" && (T.current = window.setTimeout(() => V(""), 1e3));
      })(G), le && setTimeout(() => le.focus());
    };
    re(() => () => window.clearTimeout(T.current), []), uo();
    const I = X((M) => {
      var $, q;
      return S.current === (($ = L.current) == null ? void 0 : $.side) && Wr(M, (q = L.current) == null ? void 0 : q.area);
    }, []);
    return /* @__PURE__ */ m.jsx(
      Rr,
      {
        scope: n,
        searchRef: k,
        onItemEnter: X(
          (M) => {
            I(M) && M.preventDefault();
          },
          [I]
        ),
        onItemLeave: X(
          (M) => {
            var G;
            I(M) || ((G = R.current) == null || G.focus(), b(null));
          },
          [I]
        ),
        onTriggerLeave: X(
          (M) => {
            I(M) && M.preventDefault();
          },
          [I]
        ),
        pointerGraceTimerRef: O,
        onPointerGraceIntentChange: X((M) => {
          L.current = M;
        }, []),
        children: /* @__PURE__ */ m.jsx(F, { ..._, children: /* @__PURE__ */ m.jsx(
          po,
          {
            asChild: !0,
            trapped: r,
            onMountAutoFocus: E(i, (M) => {
              var G;
              M.preventDefault(), (G = R.current) == null || G.focus({ preventScroll: !0 });
            }),
            onUnmountAutoFocus: s,
            children: /* @__PURE__ */ m.jsx(
              mo,
              {
                asChild: !0,
                disableOutsidePointerEvents: a,
                onEscapeKeyDown: u,
                onPointerDownOutside: d,
                onFocusOutside: l,
                onInteractOutside: f,
                onDismiss: p,
                children: /* @__PURE__ */ m.jsx(
                  co,
                  {
                    asChild: !0,
                    ...A,
                    dir: x.dir,
                    orientation: "vertical",
                    loop: o,
                    currentTabStopId: y,
                    onCurrentTabStopIdChange: b,
                    onEntryFocus: E(c, (M) => {
                      x.isUsingKeyboardRef.current || M.preventDefault();
                    }),
                    preventScrollOnEntryFocus: !0,
                    children: /* @__PURE__ */ m.jsx(
                      ur,
                      {
                        role: "menu",
                        "aria-orientation": "vertical",
                        "data-state": Mn(w.open),
                        "data-radix-menu-content": "",
                        dir: x.dir,
                        ...v,
                        ...g,
                        ref: j,
                        style: { outline: "none", ...g.style },
                        onKeyDown: E(g.onKeyDown, (M) => {
                          const $ = M.target.closest("[data-radix-menu-content]") === M.currentTarget, q = M.ctrlKey || M.altKey || M.metaKey, we = M.key.length === 1;
                          $ && (M.key === "Tab" && M.preventDefault(), !q && we && H(M.key));
                          const ve = R.current;
                          if (M.target !== ve || !vr.includes(M.key)) return;
                          M.preventDefault();
                          const le = P().filter((J) => !J.disabled).map((J) => J.ref.current);
                          Qt.includes(M.key) && le.reverse(), Gr(le);
                        }),
                        onBlur: E(e.onBlur, (M) => {
                          M.currentTarget.contains(M.target) || (window.clearTimeout(T.current), k.current = "");
                        }),
                        onPointerMove: E(
                          e.onPointerMove,
                          _e((M) => {
                            const G = M.target, $ = D.current !== M.clientX;
                            if (M.currentTarget.contains(G) && $) {
                              const q = M.clientX > D.current ? "right" : "left";
                              S.current = q, D.current = M.clientX;
                            }
                          })
                        )
                      }
                    )
                  }
                )
              }
            )
          }
        ) })
      }
    );
  }
);
sn.displayName = U;
var Nr = "MenuGroup", pt = C(
  (e, t) => {
    const { __scopeMenu: n, ...o } = e;
    return /* @__PURE__ */ m.jsx(ne.div, { role: "group", ...o, ref: t });
  }
);
pt.displayName = Nr;
var Ir = "MenuLabel", cn = C(
  (e, t) => {
    const { __scopeMenu: n, ...o } = e;
    return /* @__PURE__ */ m.jsx(ne.div, { ...o, ref: t });
  }
);
cn.displayName = Ir;
var Be = "MenuItem", St = "menu.itemSelect", Ue = C(
  (e, t) => {
    const { disabled: n = !1, onSelect: o, ...r } = e, i = N(null), s = Se(Be, e.__scopeMenu), a = dt(Be, e.__scopeMenu), c = de(t, i), u = N(!1), d = () => {
      const l = i.current;
      if (!n && l) {
        const f = new CustomEvent(St, { bubbles: !0, cancelable: !0 });
        l.addEventListener(St, (p) => o == null ? void 0 : o(p), { once: !0 }), Jn(l, f), f.defaultPrevented ? u.current = !1 : s.onClose();
      }
    };
    return /* @__PURE__ */ m.jsx(
      an,
      {
        ...r,
        ref: c,
        disabled: n,
        onClick: E(e.onClick, d),
        onPointerDown: (l) => {
          var f;
          (f = e.onPointerDown) == null || f.call(e, l), u.current = !0;
        },
        onPointerUp: E(e.onPointerUp, (l) => {
          var f;
          u.current || (f = l.currentTarget) == null || f.click();
        }),
        onKeyDown: E(e.onKeyDown, (l) => {
          const f = a.searchRef.current !== "";
          n || f && l.key === " " || Je.includes(l.key) && (l.currentTarget.click(), l.preventDefault());
        })
      }
    );
  }
);
Ue.displayName = Be;
var an = C(
  (e, t) => {
    const { __scopeMenu: n, disabled: o = !1, textValue: r, ...i } = e, s = dt(Be, n), a = tn(n), c = N(null), u = de(t, c), [d, l] = z(!1), [f, p] = z("");
    return re(() => {
      const h = c.current;
      h && p((h.textContent ?? "").trim());
    }, [i.children]), /* @__PURE__ */ m.jsx(
      Pe.ItemSlot,
      {
        scope: n,
        disabled: o,
        textValue: r ?? f,
        children: /* @__PURE__ */ m.jsx(so, { asChild: !0, ...a, focusable: !o, children: /* @__PURE__ */ m.jsx(
          ne.div,
          {
            role: "menuitem",
            "data-highlighted": d ? "" : void 0,
            "aria-disabled": o || void 0,
            "data-disabled": o ? "" : void 0,
            ...i,
            ref: u,
            onPointerMove: E(
              e.onPointerMove,
              _e((h) => {
                o ? s.onItemLeave(h) : (s.onItemEnter(h), h.defaultPrevented || h.currentTarget.focus({ preventScroll: !0 }));
              })
            ),
            onPointerLeave: E(
              e.onPointerLeave,
              _e((h) => s.onItemLeave(h))
            ),
            onFocus: E(e.onFocus, () => l(!0)),
            onBlur: E(e.onBlur, () => l(!1))
          }
        ) })
      }
    );
  }
), Tr = "MenuCheckboxItem", ln = C(
  (e, t) => {
    const { checked: n = !1, onCheckedChange: o, ...r } = e;
    return /* @__PURE__ */ m.jsx(mn, { scope: e.__scopeMenu, checked: n, children: /* @__PURE__ */ m.jsx(
      Ue,
      {
        role: "menuitemcheckbox",
        "aria-checked": Ge(n) ? "mixed" : n,
        ...r,
        ref: t,
        "data-state": ht(n),
        onSelect: E(
          r.onSelect,
          () => o == null ? void 0 : o(Ge(n) ? !0 : !n),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
);
ln.displayName = Tr;
var un = "MenuRadioGroup", [jr, kr] = fe(
  un,
  { value: void 0, onValueChange: () => {
  } }
), dn = C(
  (e, t) => {
    const { value: n, onValueChange: o, ...r } = e, i = et(o);
    return /* @__PURE__ */ m.jsx(jr, { scope: e.__scopeMenu, value: n, onValueChange: i, children: /* @__PURE__ */ m.jsx(pt, { ...r, ref: t }) });
  }
);
dn.displayName = un;
var fn = "MenuRadioItem", pn = C(
  (e, t) => {
    const { value: n, ...o } = e, r = kr(fn, e.__scopeMenu), i = n === r.value;
    return /* @__PURE__ */ m.jsx(mn, { scope: e.__scopeMenu, checked: i, children: /* @__PURE__ */ m.jsx(
      Ue,
      {
        role: "menuitemradio",
        "aria-checked": i,
        ...o,
        ref: t,
        "data-state": ht(i),
        onSelect: E(
          o.onSelect,
          () => {
            var s;
            return (s = r.onValueChange) == null ? void 0 : s.call(r, n);
          },
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
);
pn.displayName = fn;
var mt = "MenuItemIndicator", [mn, Lr] = fe(
  mt,
  { checked: !1 }
), hn = C(
  (e, t) => {
    const { __scopeMenu: n, forceMount: o, ...r } = e, i = Lr(mt, n);
    return /* @__PURE__ */ m.jsx(
      Ke,
      {
        present: o || Ge(i.checked) || i.checked === !0,
        children: /* @__PURE__ */ m.jsx(
          ne.span,
          {
            ...r,
            ref: t,
            "data-state": ht(i.checked)
          }
        )
      }
    );
  }
);
hn.displayName = mt;
var Fr = "MenuSeparator", gn = C(
  (e, t) => {
    const { __scopeMenu: n, ...o } = e;
    return /* @__PURE__ */ m.jsx(
      ne.div,
      {
        role: "separator",
        "aria-orientation": "horizontal",
        ...o,
        ref: t
      }
    );
  }
);
gn.displayName = Fr;
var $r = "MenuArrow", xn = C(
  (e, t) => {
    const { __scopeMenu: n, ...o } = e, r = Ve(n);
    return /* @__PURE__ */ m.jsx(dr, { ...r, ...o, ref: t });
  }
);
xn.displayName = $r;
var Br = "MenuSub", [Gi, wn] = fe(Br), Ce = "MenuSubTrigger", vn = C(
  (e, t) => {
    const n = pe(Ce, e.__scopeMenu), o = Se(Ce, e.__scopeMenu), r = wn(Ce, e.__scopeMenu), i = dt(Ce, e.__scopeMenu), s = N(null), { pointerGraceTimerRef: a, onPointerGraceIntentChange: c } = i, u = { __scopeMenu: e.__scopeMenu }, d = X(() => {
      s.current && window.clearTimeout(s.current), s.current = null;
    }, []);
    return re(() => d, [d]), re(() => {
      const l = a.current;
      return () => {
        window.clearTimeout(l), c(null);
      };
    }, [a, c]), /* @__PURE__ */ m.jsx(lt, { asChild: !0, ...u, children: /* @__PURE__ */ m.jsx(
      an,
      {
        id: r.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": n.open,
        "aria-controls": r.contentId,
        "data-state": Mn(n.open),
        ...e,
        ref: Dt(t, r.onTriggerChange),
        onClick: (l) => {
          var f;
          (f = e.onClick) == null || f.call(e, l), !(e.disabled || l.defaultPrevented) && (l.currentTarget.focus(), n.open || n.onOpenChange(!0));
        },
        onPointerMove: E(
          e.onPointerMove,
          _e((l) => {
            i.onItemEnter(l), !l.defaultPrevented && !e.disabled && !n.open && !s.current && (i.onPointerGraceIntentChange(null), s.current = window.setTimeout(() => {
              n.onOpenChange(!0), d();
            }, 100));
          })
        ),
        onPointerLeave: E(
          e.onPointerLeave,
          _e((l) => {
            var p, h;
            d();
            const f = (p = n.content) == null ? void 0 : p.getBoundingClientRect();
            if (f) {
              const g = (h = n.content) == null ? void 0 : h.dataset.side, w = g === "right", x = w ? -5 : 5, v = f[w ? "left" : "right"], A = f[w ? "right" : "left"];
              i.onPointerGraceIntentChange({
                area: [
                  // Apply a bleed on clientX to ensure that our exit point is
                  // consistently within polygon bounds
                  { x: l.clientX + x, y: l.clientY },
                  { x: v, y: f.top },
                  { x: A, y: f.top },
                  { x: A, y: f.bottom },
                  { x: v, y: f.bottom }
                ],
                side: g
              }), window.clearTimeout(a.current), a.current = window.setTimeout(
                () => i.onPointerGraceIntentChange(null),
                300
              );
            } else {
              if (i.onTriggerLeave(l), l.defaultPrevented) return;
              i.onPointerGraceIntentChange(null);
            }
          })
        ),
        onKeyDown: E(e.onKeyDown, (l) => {
          var p;
          const f = i.searchRef.current !== "";
          e.disabled || f && l.key === " " || yr[o.dir].includes(l.key) && (n.onOpenChange(!0), (p = n.content) == null || p.focus(), l.preventDefault());
        })
      }
    ) });
  }
);
vn.displayName = Ce;
var yn = "MenuSubContent", bn = C(
  (e, t) => {
    const n = on(U, e.__scopeMenu), { forceMount: o = n.forceMount, ...r } = e, i = pe(U, e.__scopeMenu), s = Se(U, e.__scopeMenu), a = wn(yn, e.__scopeMenu), c = N(null), u = de(t, c);
    return /* @__PURE__ */ m.jsx(Pe.Provider, { scope: e.__scopeMenu, children: /* @__PURE__ */ m.jsx(Ke, { present: o || i.open, children: /* @__PURE__ */ m.jsx(Pe.Slot, { scope: e.__scopeMenu, children: /* @__PURE__ */ m.jsx(
      ft,
      {
        id: a.contentId,
        "aria-labelledby": a.triggerId,
        ...r,
        ref: u,
        align: "start",
        side: s.dir === "rtl" ? "left" : "right",
        disableOutsidePointerEvents: !1,
        disableOutsideScroll: !1,
        trapFocus: !1,
        onOpenAutoFocus: (d) => {
          var l;
          s.isUsingKeyboardRef.current && ((l = c.current) == null || l.focus()), d.preventDefault();
        },
        onCloseAutoFocus: (d) => d.preventDefault(),
        onFocusOutside: E(e.onFocusOutside, (d) => {
          d.target !== a.trigger && i.onOpenChange(!1);
        }),
        onEscapeKeyDown: E(e.onEscapeKeyDown, (d) => {
          s.onClose(), d.preventDefault();
        }),
        onKeyDown: E(e.onKeyDown, (d) => {
          var p;
          const l = d.currentTarget.contains(d.target), f = br[s.dir].includes(d.key);
          l && f && (i.onOpenChange(!1), (p = a.trigger) == null || p.focus(), d.preventDefault());
        })
      }
    ) }) }) });
  }
);
bn.displayName = yn;
function Mn(e) {
  return e ? "open" : "closed";
}
function Ge(e) {
  return e === "indeterminate";
}
function ht(e) {
  return Ge(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
function Gr(e) {
  const t = document.activeElement;
  for (const n of e)
    if (n === t || (n.focus(), document.activeElement !== t)) return;
}
function Hr(e, t) {
  return e.map((n, o) => e[(t + o) % e.length]);
}
function Kr(e, t, n) {
  const r = t.length > 1 && Array.from(t).every((u) => u === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1;
  let s = Hr(e, Math.max(i, 0));
  r.length === 1 && (s = s.filter((u) => u !== n));
  const c = s.find(
    (u) => u.toLowerCase().startsWith(r.toLowerCase())
  );
  return c !== n ? c : void 0;
}
function zr(e, t) {
  const { x: n, y: o } = e;
  let r = !1;
  for (let i = 0, s = t.length - 1; i < t.length; s = i++) {
    const a = t[i], c = t[s], u = a.x, d = a.y, l = c.x, f = c.y;
    d > o != f > o && n < (l - u) * (o - d) / (f - d) + u && (r = !r);
  }
  return r;
}
function Wr(e, t) {
  if (!t) return !1;
  const n = { x: e.clientX, y: e.clientY };
  return zr(n, t);
}
function _e(e) {
  return (t) => t.pointerType === "mouse" ? e(t) : void 0;
}
var Vr = nn, Ur = lt, Yr = rn, Xr = sn, qr = pt, Zr = cn, Jr = Ue, Qr = ln, ei = dn, ti = pn, ni = hn, oi = gn, ri = xn, ii = vn, si = bn, Ye = "DropdownMenu", [ci] = Qe(
  Ye,
  [en]
), B = en(), [ai, Cn] = ci(Ye), An = (e) => {
  const {
    __scopeDropdownMenu: t,
    children: n,
    dir: o,
    open: r,
    defaultOpen: i,
    onOpenChange: s,
    modal: a = !0
  } = e, c = B(t), u = N(null), [d, l] = eo({
    prop: r,
    defaultProp: i ?? !1,
    onChange: s,
    caller: Ye
  });
  return /* @__PURE__ */ m.jsx(
    ai,
    {
      scope: t,
      triggerId: vt(),
      triggerRef: u,
      contentId: vt(),
      open: d,
      onOpenChange: l,
      onOpenToggle: X(() => l((f) => !f), [l]),
      modal: a,
      children: /* @__PURE__ */ m.jsx(Vr, { ...c, open: d, onOpenChange: l, dir: o, modal: a, children: n })
    }
  );
};
An.displayName = Ye;
var Pn = "DropdownMenuTrigger", _n = C(
  (e, t) => {
    const { __scopeDropdownMenu: n, disabled: o = !1, ...r } = e, i = Cn(Pn, n), s = B(n);
    return /* @__PURE__ */ m.jsx(Ur, { asChild: !0, ...s, children: /* @__PURE__ */ m.jsx(
      ne.button,
      {
        type: "button",
        id: i.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": i.open,
        "aria-controls": i.open ? i.contentId : void 0,
        "data-state": i.open ? "open" : "closed",
        "data-disabled": o ? "" : void 0,
        disabled: o,
        ...r,
        ref: Dt(t, i.triggerRef),
        onPointerDown: E(e.onPointerDown, (a) => {
          !o && a.button === 0 && a.ctrlKey === !1 && (i.onOpenToggle(), i.open || a.preventDefault());
        }),
        onKeyDown: E(e.onKeyDown, (a) => {
          o || (["Enter", " "].includes(a.key) && i.onOpenToggle(), a.key === "ArrowDown" && i.onOpenChange(!0), ["Enter", " ", "ArrowDown"].includes(a.key) && a.preventDefault());
        })
      }
    ) });
  }
);
_n.displayName = Pn;
var li = "DropdownMenuPortal", En = (e) => {
  const { __scopeDropdownMenu: t, ...n } = e, o = B(t);
  return /* @__PURE__ */ m.jsx(Yr, { ...o, ...n });
};
En.displayName = li;
var Rn = "DropdownMenuContent", Sn = C(
  (e, t) => {
    const { __scopeDropdownMenu: n, ...o } = e, r = Cn(Rn, n), i = B(n), s = N(!1);
    return /* @__PURE__ */ m.jsx(
      Xr,
      {
        id: r.contentId,
        "aria-labelledby": r.triggerId,
        ...i,
        ...o,
        ref: t,
        onCloseAutoFocus: E(e.onCloseAutoFocus, (a) => {
          var c;
          s.current || (c = r.triggerRef.current) == null || c.focus(), s.current = !1, a.preventDefault();
        }),
        onInteractOutside: E(e.onInteractOutside, (a) => {
          const c = a.detail.originalEvent, u = c.button === 0 && c.ctrlKey === !0, d = c.button === 2 || u;
          (!r.modal || d) && (s.current = !0);
        }),
        style: {
          ...e.style,
          "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
          "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
          "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
        }
      }
    );
  }
);
Sn.displayName = Rn;
var ui = "DropdownMenuGroup", Dn = C(
  (e, t) => {
    const { __scopeDropdownMenu: n, ...o } = e, r = B(n);
    return /* @__PURE__ */ m.jsx(qr, { ...r, ...o, ref: t });
  }
);
Dn.displayName = ui;
var di = "DropdownMenuLabel", On = C(
  (e, t) => {
    const { __scopeDropdownMenu: n, ...o } = e, r = B(n);
    return /* @__PURE__ */ m.jsx(Zr, { ...r, ...o, ref: t });
  }
);
On.displayName = di;
var fi = "DropdownMenuItem", Nn = C(
  (e, t) => {
    const { __scopeDropdownMenu: n, ...o } = e, r = B(n);
    return /* @__PURE__ */ m.jsx(Jr, { ...r, ...o, ref: t });
  }
);
Nn.displayName = fi;
var pi = "DropdownMenuCheckboxItem", In = C((e, t) => {
  const { __scopeDropdownMenu: n, ...o } = e, r = B(n);
  return /* @__PURE__ */ m.jsx(Qr, { ...r, ...o, ref: t });
});
In.displayName = pi;
var mi = "DropdownMenuRadioGroup", hi = C((e, t) => {
  const { __scopeDropdownMenu: n, ...o } = e, r = B(n);
  return /* @__PURE__ */ m.jsx(ei, { ...r, ...o, ref: t });
});
hi.displayName = mi;
var gi = "DropdownMenuRadioItem", Tn = C((e, t) => {
  const { __scopeDropdownMenu: n, ...o } = e, r = B(n);
  return /* @__PURE__ */ m.jsx(ti, { ...r, ...o, ref: t });
});
Tn.displayName = gi;
var xi = "DropdownMenuItemIndicator", jn = C((e, t) => {
  const { __scopeDropdownMenu: n, ...o } = e, r = B(n);
  return /* @__PURE__ */ m.jsx(ni, { ...r, ...o, ref: t });
});
jn.displayName = xi;
var wi = "DropdownMenuSeparator", kn = C((e, t) => {
  const { __scopeDropdownMenu: n, ...o } = e, r = B(n);
  return /* @__PURE__ */ m.jsx(oi, { ...r, ...o, ref: t });
});
kn.displayName = wi;
var vi = "DropdownMenuArrow", yi = C(
  (e, t) => {
    const { __scopeDropdownMenu: n, ...o } = e, r = B(n);
    return /* @__PURE__ */ m.jsx(ri, { ...r, ...o, ref: t });
  }
);
yi.displayName = vi;
var bi = "DropdownMenuSubTrigger", Ln = C((e, t) => {
  const { __scopeDropdownMenu: n, ...o } = e, r = B(n);
  return /* @__PURE__ */ m.jsx(ii, { ...r, ...o, ref: t });
});
Ln.displayName = bi;
var Mi = "DropdownMenuSubContent", Fn = C((e, t) => {
  const { __scopeDropdownMenu: n, ...o } = e, r = B(n);
  return /* @__PURE__ */ m.jsx(
    si,
    {
      ...r,
      ...o,
      ref: t,
      style: {
        ...e.style,
        "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
        "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
        "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
      }
    }
  );
});
Fn.displayName = Mi;
var Ci = An, Ai = _n, Pi = En, $n = Sn, _i = Dn, Bn = On, Gn = Nn, Hn = In, Kn = Tn, zn = jn, Wn = kn, Vn = Ln, Un = Fn;
const Hi = Ci, Ki = Ai, zi = _i, Ei = C(({ className: e, inset: t, children: n, ...o }, r) => /* @__PURE__ */ m.jsxs(
  Vn,
  {
    ref: r,
    className: ae(
      "flex cursor-default gap-2 select-none hover:bg-accent items-center rounded-xs px-2 py-1.5 text-sm outline-hidden focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      t && "pl-8",
      e
    ),
    ...o,
    children: [
      n,
      /* @__PURE__ */ m.jsx(pr, { className: "ml-auto" })
    ]
  }
));
Ei.displayName = Vn.displayName;
const Ri = C(({ className: e, ...t }, n) => /* @__PURE__ */ m.jsx("div", { className: Ot, children: /* @__PURE__ */ m.jsx(
  Un,
  {
    ref: n,
    className: ae(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      e
    ),
    ...t
  }
) }));
Ri.displayName = Un.displayName;
const Si = C(({ className: e, sideOffset: t = 4, ...n }, o) => /* @__PURE__ */ m.jsx(Pi, { children: /* @__PURE__ */ m.jsx("div", { className: Ot, children: /* @__PURE__ */ m.jsx(
  $n,
  {
    ref: o,
    className: ae(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      e
    ),
    sideOffset: t,
    ...n
  }
) }) }));
Si.displayName = $n.displayName;
const Di = C(({ className: e, inset: t, ...n }, o) => /* @__PURE__ */ m.jsx(
  Gn,
  {
    ref: o,
    className: ae(
      "relative flex cursor-default select-none cursor-pointer items-center gap-2 rounded-xs px-2 py-1.5 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      t && "pl-8",
      e
    ),
    ...n
  }
));
Di.displayName = Gn.displayName;
const Oi = C(({ className: e, children: t, checked: n, ...o }, r) => /* @__PURE__ */ m.jsxs(
  Hn,
  {
    ref: r,
    checked: n,
    className: ae(
      "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      e
    ),
    ...o,
    children: [
      /* @__PURE__ */ m.jsx("span", { className: "absolute left-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ m.jsx(zn, { children: /* @__PURE__ */ m.jsx(ho, { className: "size-4" }) }) }),
      t
    ]
  }
));
Oi.displayName = Hn.displayName;
const Ni = C(({ className: e, children: t, ...n }, o) => /* @__PURE__ */ m.jsxs(
  Kn,
  {
    ref: o,
    className: ae(
      "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      e
    ),
    ...n,
    children: [
      /* @__PURE__ */ m.jsx("span", { className: "absolute left-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ m.jsx(zn, { children: /* @__PURE__ */ m.jsx(hr, { className: "size-2 fill-current" }) }) }),
      t
    ]
  }
));
Ni.displayName = Kn.displayName;
const Ii = C(({ className: e, inset: t, ...n }, o) => /* @__PURE__ */ m.jsx(
  Bn,
  {
    ref: o,
    className: ae(
      "px-2 py-1.5 text-sm font-semibold",
      t && "pl-8",
      e
    ),
    ...n
  }
));
Ii.displayName = Bn.displayName;
const Ti = C(({ className: e, ...t }, n) => /* @__PURE__ */ m.jsx(
  Wn,
  {
    ref: n,
    className: ae("-mx-1 my-1 h-px bg-muted", e),
    ...t
  }
));
Ti.displayName = Wn.displayName;
export {
  lr as A,
  ur as C,
  Hi as D,
  $i as E,
  ar as R,
  Bi as U,
  dr as a,
  Ki as b,
  zt as c,
  Si as d,
  Di as e,
  pr as f,
  hr as g,
  zi as h,
  Ti as i,
  go as u
};
//# sourceMappingURL=dropdown-menu-D5NyPbW9.mjs.map

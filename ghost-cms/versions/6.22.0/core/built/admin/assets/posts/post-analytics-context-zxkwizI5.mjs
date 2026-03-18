import { E as N, D as w, c as B, u as O, j as U } from "./index-DHZtUctP.mjs";
import { u as R, a as Y } from "./settings-CZrxkyYB.mjs";
import { u as x } from "./posts-9lhi5U2u.mjs";
import { a as S } from "./hooks-BQt0oM3N.mjs";
const G = "TinybirdTokenResponseType", j = {
  refetchInterval: 120 * 60 * 1e3,
  // 2 hours — tokens expire after 3 hours
  refetchIntervalInBackground: !0,
  staleTime: 110 * 60 * 1e3
  // 110 minutes - shorter than refetch interval so automatic refresh works
}, Q = S({
  dataType: G,
  path: "/tinybird/token/"
}), F = (t = {}) => Q({
  ...j,
  ...t
});
let L = !1;
const M = (t = {}) => {
  var a, s;
  const { enabled: e = !0 } = t, o = F({ enabled: e }), n = (s = (a = o.data) == null ? void 0 : a.tinybird) == null ? void 0 : s.token, r = o.error;
  return !o.isLoading && e && o.data && !n && !L && (console.warn("Tinybird analytics: No valid token received. Check your Tinybird configuration (workspaceId and adminToken must be non-empty strings)."), L = !0), {
    token: n && typeof n == "string" ? n : void 0,
    isLoading: o.isLoading,
    error: r,
    refetch: o.refetch
  };
}, W = {
  TODAY: { name: "Today", value: 1 },
  LAST_7_DAYS: { name: "Last 7 days", value: 7 },
  LAST_30_DAYS: { name: "Last 30 days", value: 31 },
  LAST_90_DAYS: { name: "Last 90 days", value: 91 },
  YEAR_TO_DATE: { name: "Year to date", value: 366 },
  LAST_12_MONTHS: { name: "Last 12 months", value: 12 * 31 },
  ALL_TIME: { name: "All time", value: 1e3 }
}, Z = {
  // Countries
  US: "United States",
  TWN: "Taiwan",
  TW: "Taiwan",
  CN: "China",
  // Technical
  "mobile-ios": "iOS",
  "mobile-android": "Android",
  macos: "macOS",
  // Sources
  "google.com": "Google",
  "ghost.org": "Ghost",
  "bing.com": "Bing",
  "bsky.app": "Bluesky",
  "yahoo.com": "Yahoo",
  "duckduckgo.com": "DuckDuckGo"
}, tt = ["NULL", "ᴺᵁᴸᴸ", "", "Others", "Other"], i = {
  PUBLIC: 1,
  // 1
  FREE: 2,
  // 2
  PAID: 4
  // 4
}, et = i.PUBLIC | i.FREE | i.PAID, ot = [
  { name: "Public visitors", value: "undefined", bit: i.PUBLIC },
  { name: "Free members", value: "free", bit: i.FREE },
  { name: "Paid members", value: "paid", bit: i.PAID }
], q = "SiteResponseType", $ = S({
  dataType: q,
  path: "/site/"
}), _ = w(void 0), z = () => {
  const t = N(_);
  if (!t)
    throw new Error("useGlobalData must be used within a PostAnalyticsProvider");
  return t;
}, H = ({ children: t }) => {
  var T, m, y, b, A, f, p;
  const { postId: a } = B();
  if (!a)
    throw new Error("Post ID is required for PostAnalyticsProvider");
  const s = R(), e = $(), [o, n] = O(W.LAST_30_DAYS.value), r = Y(), c = !!((m = (T = s.data) == null ? void 0 : T.config) != null && m.stats), d = M({ enabled: c }), { data: { posts: [v] } = { posts: [] }, isLoading: h } = x({
    searchParams: {
      filter: `id:${a}`,
      include: "email,authors,tags,tiers,count.clicks,count.signups,count.paid_conversions,count.positive_feedback,count.negative_feedback,newsletter"
    }
  }), l = [s, e, r], E = l.map((u) => u.error).find(Boolean), P = c ? d.error : null, g = E || P, k = l.some((u) => u.isLoading), I = c ? d.isLoading : !1, D = k || I;
  if (g)
    throw g;
  const C = (y = e.data) != null && y.site ? {
    url: e.data.site.url,
    icon: e.data.site.icon,
    title: e.data.site.title
  } : void 0;
  return /* @__PURE__ */ U.jsx(_.Provider, { value: {
    data: (b = s.data) == null ? void 0 : b.config,
    site: C,
    statsConfig: (f = (A = s.data) == null ? void 0 : A.config) == null ? void 0 : f.stats,
    tinybirdToken: d.token,
    isLoading: D,
    range: o,
    setRange: n,
    settings: ((p = r.data) == null ? void 0 : p.settings) || [],
    postId: a,
    post: v,
    isPostLoading: h
  }, children: t });
}, st = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: H,
  useGlobalData: z
}, Symbol.toStringTag, { value: "Module" }));
export {
  et as A,
  W as S,
  tt as U,
  Z as a,
  ot as b,
  i as c,
  M as d,
  st as p,
  z as u
};
//# sourceMappingURL=post-analytics-context-zxkwizI5.mjs.map

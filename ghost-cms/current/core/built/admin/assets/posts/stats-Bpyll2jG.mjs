import { j as a, n as r } from "./index-DHZtUctP.mjs";
import { B as c } from "./heading-BU5ZMUV_.mjs";
import { c as n, a as o } from "./hooks-BQt0oM3N.mjs";
const m = ({ children: t, className: s, ...e }) => /* @__PURE__ */ a.jsx("div", { className: r("flex flex-col", s), ...e, children: t }), y = ({ children: t, className: s, ...e }) => /* @__PURE__ */ a.jsx("div", { className: r(
  "[&_svg]:size-4 flex items-center gap-1.5 text-base h-[22px] font-medium transition-all",
  s,
  e.onClick && "hover:cursor-pointer hover:text-black dark:hover:text-white"
), ...e, children: t }), f = ({ children: t, className: s, ...e }) => /* @__PURE__ */ a.jsx("div", { className: r("text-[26px] mt-0.5 tracking-tighter leading-none text-foreground font-semibold", s), ...e, children: t }), g = ({ children: t, className: s, ...e }) => /* @__PURE__ */ a.jsx(c, { className: r("absolute right-4 top-4 z-50 hidden translate-x-10 text-black dark:text-white/80 dark:hover:text-white opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 md:visible! md:block!", s), size: "sm", variant: "outline", ...e, children: t }), v = ({ children: t, className: s, ...e }) => /* @__PURE__ */ a.jsx(
  "div",
  {
    className: r(
      "group relative isolate flex flex-col border-r border-border last:border-none items-start gap-2 px-6 py-5 transition-all text-muted-foreground",
      e.onClick ? "hover:bg-accent/50 hover:text-foreground cursor-pointer" : "cursor-auto",
      s
    ),
    ...e,
    children: t
  }
), p = "PostReferrersResponseType", i = "NewsletterStatsResponseType", l = "PostGrowthStatsResponseType", d = "MrrHistoryResponseType", b = n({
  dataType: p,
  path: (t) => `/stats/posts/${t}/top-referrers`
}), w = n({
  dataType: l,
  path: (t) => `/stats/posts/${t}/growth`
}), T = o({
  dataType: d,
  path: "/stats/mrr/"
}), k = o({
  dataType: i,
  path: "/stats/newsletter-basic-stats/",
  defaultSearchParams: {
    // Empty default params, will be filled by the hook
  }
}), C = o({
  dataType: i,
  path: "/stats/newsletter-click-stats/",
  defaultSearchParams: {
    // Empty default params, will be filled by the hook
  }
});
export {
  v as K,
  y as a,
  m as b,
  f as c,
  w as d,
  T as e,
  g as f,
  k as g,
  C as h,
  b as u
};
//# sourceMappingURL=stats-Bpyll2jG.mjs.map

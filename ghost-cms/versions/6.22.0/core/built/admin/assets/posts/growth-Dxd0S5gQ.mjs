import { d as O, j as s, g as A, R as E, n as G, e as b, a as g, c as V } from "./index-DHZtUctP.mjs";
import { B as H } from "./heading-BU5ZMUV_.mjs";
import { E as K } from "./empty-indicator-1_BranMm.mjs";
import { A as q, C, a as v, b as S, g as $, c as w, j as J, T as Q, P as X, f as Y, W as Z, m as ss } from "./post-analytics-header-C0v3cpGl.mjs";
import { p as es, e as rs, S as L } from "./source-icon-Df7ozSAj.mjs";
import { S as as, a as ts, b as cs, c as ns, d as os, e as is } from "./sheet-DXD_Hy36.mjs";
import { T as ls, a as ds, b as R, c as N, d as ms, e as y } from "./table-DlD5Z96j.mjs";
import { U as hs } from "./get-site-timezone-DocCBOxG.mjs";
import { u as xs, d as us, e as js, K as k, f as W, a as M, b as T, c as P } from "./stats-Bpyll2jG.mjs";
import { S as D } from "./separator-B97phMDm.mjs";
import { S as F, a as ps } from "./skeleton-BY5P5NDt.mjs";
import { u as bs } from "./post-analytics-context-zxkwizI5.mjs";
import { U as fs } from "./dropdown-menu-D5NyPbW9.mjs";
function _(a) {
  return a ? Intl.NumberFormat("en", { currency: a, style: "currency" }).format(0).replace(/[\d\s.]/g, "") : "";
}
const gs = ({ className: a }) => {
  const c = O();
  return /* @__PURE__ */ s.jsx(
    K,
    {
      actions: /* @__PURE__ */ s.jsx(H, { variant: "outline", onClick: () => c("/settings/analytics", { crossApp: !0 }), children: "Open settings" }),
      className: a,
      description: "Enable member source tracking in settings to see which content drives member growth.",
      title: "Member sources have been disabled",
      children: /* @__PURE__ */ s.jsx(q, {})
    }
  );
}, I = "https://www.google.com/s2/favicons?domain=ghost.org&sz=64", U = ({ headerStyle: a = "table", children: c = "Source", data: l, mode: e, defaultSourceIconUrl: n = I }) => {
  const { appSettings: t } = A();
  if (e === "growth")
    return /* @__PURE__ */ s.jsxs(ls, { children: [
      /* @__PURE__ */ s.jsx(ds, { children: /* @__PURE__ */ s.jsxs(R, { children: [
        /* @__PURE__ */ s.jsx(N, { className: "min-w-[320px]", variant: a === "table" ? "default" : "cardhead", children: c }),
        /* @__PURE__ */ s.jsx(N, { className: "w-[110px] text-right", children: "Free members" }),
        (t == null ? void 0 : t.paidMembersEnabled) && /* @__PURE__ */ s.jsxs(s.Fragment, { children: [
          /* @__PURE__ */ s.jsx(N, { className: "w-[110px] text-right", children: "Paid members" }),
          /* @__PURE__ */ s.jsx(N, { className: "w-[100px] text-right", children: "MRR impact" })
        ] })
      ] }) }),
      /* @__PURE__ */ s.jsx(ms, { children: l == null ? void 0 : l.map((r) => {
        const d = (m) => Math.round(m / 100);
        return /* @__PURE__ */ s.jsxs(R, { className: "last:border-none", children: [
          /* @__PURE__ */ s.jsx(y, { children: r.linkUrl ? /* @__PURE__ */ s.jsxs("a", { className: "group flex items-center gap-2", href: r.linkUrl, rel: "noreferrer", target: "_blank", children: [
            /* @__PURE__ */ s.jsx(
              L,
              {
                defaultSourceIconUrl: n,
                displayName: r.displayName,
                iconSrc: r.iconSrc
              }
            ),
            /* @__PURE__ */ s.jsx("span", { className: "group-hover:underline", children: r.displayName })
          ] }) : /* @__PURE__ */ s.jsxs("span", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ s.jsx(
              L,
              {
                defaultSourceIconUrl: n,
                displayName: r.displayName,
                iconSrc: r.iconSrc
              }
            ),
            /* @__PURE__ */ s.jsx("span", { children: r.displayName })
          ] }) }),
          /* @__PURE__ */ s.jsxs(y, { className: "text-right font-mono text-sm", children: [
            "+",
            b(r.free_members || 0)
          ] }),
          (t == null ? void 0 : t.paidMembersEnabled) && /* @__PURE__ */ s.jsxs(s.Fragment, { children: [
            /* @__PURE__ */ s.jsxs(y, { className: "text-right font-mono text-sm", children: [
              "+",
              b(r.paid_members || 0)
            ] }),
            /* @__PURE__ */ s.jsxs(y, { className: "text-right font-mono text-sm", children: [
              "+$",
              b(d(r.mrr || 0))
            ] })
          ] })
        ] }, r.source);
      }) })
    ] });
}, Ns = ({
  title: a = "Top sources",
  description: c,
  data: l,
  mode: e = "visits",
  range: n = 30,
  totalVisitors: t = 0,
  siteUrl: r,
  siteIcon: d,
  defaultSourceIconUrl: m = I,
  getPeriodText: i,
  className: j
}) => {
  const { appSettings: h } = A(), o = E.useMemo(() => es({
    data: l,
    mode: e,
    siteUrl: r,
    siteIcon: d,
    defaultSourceIconUrl: m
  }), [l, r, d, e, m]), x = E.useMemo(() => rs({
    processedData: o,
    totalVisitors: t,
    mode: e
  }), [o, t, e]), u = x.slice(0, 10), p = c || (e === "growth" ? "Where did your growth come from?" : `How readers found your ${n ? "site" : "post"}${n && i ? ` ${i(n)}` : ""}`), f = e === "growth" ? "Sources" : "Top sources", z = e === "growth" ? "Where did your growth come from?" : `How readers found your ${n ? "site" : "post"}${n && i ? ` ${i(n)}` : ""}`;
  return /* @__PURE__ */ s.jsxs(C, { className: G("group/datalist w-full max-w-[calc(100vw-64px)] overflow-x-auto sidebar:max-w-[calc(100vw-64px-280px)]", j), "data-testid": "top-sources-card", children: [
    u.length <= 0 && /* @__PURE__ */ s.jsxs(v, { children: [
      /* @__PURE__ */ s.jsx(S, { children: a }),
      /* @__PURE__ */ s.jsx($, { children: p })
    ] }),
    /* @__PURE__ */ s.jsx(w, { children: e === "growth" && !(h != null && h.analytics.membersTrackSources) ? /* @__PURE__ */ s.jsx(gs, { className: "py-10" }) : u.length > 0 ? /* @__PURE__ */ s.jsx(
      U,
      {
        data: u,
        defaultSourceIconUrl: m,
        getPeriodText: i,
        headerStyle: "card",
        mode: e,
        range: n,
        children: /* @__PURE__ */ s.jsxs(v, { children: [
          /* @__PURE__ */ s.jsx(S, { children: a }),
          /* @__PURE__ */ s.jsx($, { children: p })
        ] })
      }
    ) : /* @__PURE__ */ s.jsx("div", { className: "py-20 text-center text-sm text-gray-700", children: /* @__PURE__ */ s.jsx(
      K,
      {
        className: "h-full",
        description: e === "growth" && "Once someone signs up on this post, sources will show here",
        title: `No sources data available ${i ? i(n) : ""}`,
        children: /* @__PURE__ */ s.jsx(hs, { strokeWidth: 1.5 })
      }
    ) }) }),
    x.length > 10 && /* @__PURE__ */ s.jsx(J, { children: /* @__PURE__ */ s.jsxs(as, { children: [
      /* @__PURE__ */ s.jsx(ts, { asChild: !0, children: /* @__PURE__ */ s.jsxs(H, { variant: "outline", children: [
        "View all ",
        /* @__PURE__ */ s.jsx(Q, {})
      ] }) }),
      /* @__PURE__ */ s.jsxs(cs, { className: "overflow-y-auto pt-0 sm:max-w-[600px]", children: [
        /* @__PURE__ */ s.jsxs(ns, { className: "bg-background/60 sticky top-0 z-40 -mx-6 p-6 backdrop-blur", children: [
          /* @__PURE__ */ s.jsx(os, { children: f }),
          /* @__PURE__ */ s.jsx(is, { children: z })
        ] }),
        /* @__PURE__ */ s.jsx("div", { className: "group/datalist", children: /* @__PURE__ */ s.jsx(
          U,
          {
            data: x,
            defaultSourceIconUrl: m,
            getPeriodText: i,
            mode: e,
            range: n
          }
        ) })
      ] })
    ] }) })
  ] });
}, ys = (a) => {
  const { data: c, isLoading: l } = xs(a), { data: e, isLoading: n } = us(a), { data: t, isLoading: r } = js(), d = g(() => (c == null ? void 0 : c.stats) || [], [c]), m = g(() => (e == null ? void 0 : e.stats.length) === 0 ? {
    free_members: 0,
    paid_members: 0,
    mrr: 0
  } : e == null ? void 0 : e.stats[0], [e]), { selectedCurrency: i, currencySymbol: j } = g(() => {
    var o;
    if (t != null && t.stats && ((o = t == null ? void 0 : t.meta) != null && o.totals)) {
      const x = t.meta.totals;
      let u = x[0];
      if (!u)
        return { selectedCurrency: "usd", currencySymbol: _("usd") };
      for (const f of x)
        f.mrr > u.mrr && (u = f);
      const p = u.currency;
      return {
        selectedCurrency: p,
        currencySymbol: _(p)
      };
    }
    return { selectedCurrency: "usd", currencySymbol: _("usd") };
  }, [t]);
  return {
    isLoading: g(() => l || n || r, [l, n, r]),
    stats: d,
    totals: m,
    selectedCurrency: i,
    currencySymbol: j
  };
}, B = (a) => Math.round(a / 100), Cs = () => {
  const { data: a } = bs(), { postId: c } = V(), { stats: l, totals: e, isLoading: n, currencySymbol: t } = ys(c || ""), { appSettings: r } = A(), d = O(), m = a == null ? void 0 : a.url, i = a == null ? void 0 : a.icon;
  let j = "flex flex-col items-stretch gap-6", h = "";
  return r != null && r.paidMembersEnabled || (j = "grid grid-cols-1 border rounded-md", h = "border-none hover:shadow-none"), /* @__PURE__ */ s.jsxs(s.Fragment, { children: [
    /* @__PURE__ */ s.jsx(X, { currentTab: "Growth" }),
    /* @__PURE__ */ s.jsx(Y, { children: n ? /* @__PURE__ */ s.jsxs("div", { className: j, children: [
      /* @__PURE__ */ s.jsx(C, { className: h, children: /* @__PURE__ */ s.jsx(w, { className: "grid grid-cols-3 p-0", children: Array.from({ length: 3 }, (o, x) => /* @__PURE__ */ s.jsxs("div", { className: "h-[98px] gap-1 border-r px-6 py-5 last:border-r-0", children: [
        /* @__PURE__ */ s.jsx(F, { className: "w-2/3" }),
        /* @__PURE__ */ s.jsx(F, { className: "h-7 w-12" })
      ] }, x)) }) }),
      /* @__PURE__ */ s.jsxs(C, { className: h, children: [
        /* @__PURE__ */ s.jsxs(v, { children: [
          /* @__PURE__ */ s.jsx(S, { children: "Top sources" }),
          /* @__PURE__ */ s.jsx($, { children: "Where did your growth come from?" })
        ] }),
        /* @__PURE__ */ s.jsxs(w, { children: [
          /* @__PURE__ */ s.jsx(D, {}),
          /* @__PURE__ */ s.jsx(ps, { className: "pt-6" })
        ] })
      ] })
    ] }) : /* @__PURE__ */ s.jsxs("div", { className: j, children: [
      /* @__PURE__ */ s.jsxs(C, { className: h, "data-testid": "members-card", children: [
        /* @__PURE__ */ s.jsxs(v, { className: "hidden", children: [
          /* @__PURE__ */ s.jsx(S, { children: "Newsletters" }),
          /* @__PURE__ */ s.jsx($, { children: "How did this post perform" })
        ] }),
        /* @__PURE__ */ s.jsx(w, { className: "p-0", children: /* @__PURE__ */ s.jsxs("div", { className: `flex flex-col md:grid md:items-stretch ${r != null && r.paidMembersEnabled ? "md:grid-cols-3" : "md:grid-cols-1"}`, children: [
          /* @__PURE__ */ s.jsxs(k, { className: "grow", children: [
            /* @__PURE__ */ s.jsx(W, { onClick: () => {
              const o = encodeURIComponent(`signup:'${c}'+conversion:-'${c}'`);
              d(`/members?filterParam=${o}`, { crossApp: !0 });
            }, children: "View members →" }),
            /* @__PURE__ */ s.jsxs(M, { onClick: () => {
              const o = encodeURIComponent(`signup:'${c}'+conversion:-'${c}'`);
              d(`/members?filterParam=${o}`, { crossApp: !0 });
            }, children: [
              /* @__PURE__ */ s.jsx(fs, { strokeWidth: 1.5 }),
              "Free members"
            ] }),
            /* @__PURE__ */ s.jsx(T, { children: /* @__PURE__ */ s.jsx(P, { children: b((e == null ? void 0 : e.free_members) || 0) }) })
          ] }),
          (r == null ? void 0 : r.paidMembersEnabled) && /* @__PURE__ */ s.jsxs(s.Fragment, { children: [
            /* @__PURE__ */ s.jsxs(k, { className: "grow", children: [
              /* @__PURE__ */ s.jsx(W, { onClick: () => {
                const o = encodeURIComponent(`conversion:'${c}'`);
                d(`/members?filterParam=${o}`, { crossApp: !0 });
              }, children: "View members →" }),
              /* @__PURE__ */ s.jsxs(M, { onClick: () => {
                const o = encodeURIComponent(`conversion:'${c}'`);
                d(`/members?filterParam=${o}`, { crossApp: !0 });
              }, children: [
                /* @__PURE__ */ s.jsx(Z, { strokeWidth: 1.5 }),
                "Paid members"
              ] }),
              /* @__PURE__ */ s.jsx(T, { children: /* @__PURE__ */ s.jsx(P, { children: b((e == null ? void 0 : e.paid_members) || 0) }) })
            ] }),
            /* @__PURE__ */ s.jsxs(k, { className: "grow", children: [
              /* @__PURE__ */ s.jsxs(M, { children: [
                /* @__PURE__ */ s.jsx(ss, { strokeWidth: 1.5 }),
                "MRR"
              ] }),
              /* @__PURE__ */ s.jsx(T, { children: /* @__PURE__ */ s.jsxs(P, { children: [
                "+",
                t,
                B((e == null ? void 0 : e.mrr) || 0)
              ] }) })
            ] })
          ] })
        ] }) })
      ] }),
      !(r != null && r.paidMembersEnabled) && /* @__PURE__ */ s.jsx(D, {}),
      /* @__PURE__ */ s.jsx(
        Ns,
        {
          className: h,
          data: l,
          mode: "growth",
          siteIcon: i,
          siteUrl: m
        }
      )
    ] }) })
  ] });
}, Ws = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  centsToDollars: B,
  default: Cs
}, Symbol.toStringTag, { value: "Module" }));
export {
  gs as D,
  B as c,
  Ws as g,
  ys as u
};
//# sourceMappingURL=growth-Dxd0S5gQ.mjs.map

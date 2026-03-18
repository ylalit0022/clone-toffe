import { j as i, n as h, V as E, $ as P, u as S, p as j, b as u } from "./index-DHZtUctP.mjs";
import { d as k, b as l, c as B, a as Q } from "./hooks-BQt0oM3N.mjs";
import { U as C } from "./dropdown-menu-D5NyPbW9.mjs";
import { g as R } from "./use-infinite-virtual-scroll-Co4ZdYYP.mjs";
const z = E(
  "focus:outline-hidden inline-flex items-center rounded-xs border px-1.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "text-secondary-foreground/70 border-transparent bg-secondary",
        destructive: "bg-destructive/20 border-transparent text-destructive",
        success: "border-transparent bg-green/20 text-green",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function I({ className: e, variant: t, ...r }) {
  return /* @__PURE__ */ i.jsx("div", { className: h(z({ variant: t }), e), ...r });
}
const c = "MembersResponseType", L = Q({
  dataType: c,
  path: "/members/"
}), U = B({
  dataType: c,
  path: (e) => `/members/${e}/`
}), V = l({
  method: "POST",
  path: ({ id: e }) => `/members/${e}/commenting/disable`,
  body: ({ reason: e, hideComments: t }) => ({
    reason: e,
    hide_comments: t
  }),
  invalidateQueries: {
    dataType: "CommentsResponseType"
  }
}), _ = l({
  method: "POST",
  path: ({ id: e }) => `/members/${e}/commenting/enable`,
  body: () => ({}),
  invalidateQueries: {
    dataType: "CommentsResponseType"
  }
}), q = k({
  dataType: c,
  path: "/members/",
  defaultSearchParams: {
    include: "labels,tiers",
    limit: "50",
    order: "created_at desc"
  },
  defaultNextPageParams: (e, t) => {
    var r;
    if ((r = e.meta) != null && r.pagination.next)
      return {
        ...t,
        page: e.meta.pagination.next.toString()
      };
  },
  returnData: (e) => {
    const { pages: t } = e, r = t.flatMap((a) => a.members), s = t[t.length - 1].meta;
    return {
      members: r,
      meta: s,
      isEnd: s ? s.pagination.pages === s.pagination.page : !0
    };
  }
}), A = l({
  method: "PUT",
  path: () => "/members/bulk/",
  body: ({ action: e }) => ({
    bulk: {
      action: e.type,
      meta: e.meta || {},
      newsletter: e.newsletter
    }
  }),
  searchParams: ({ filter: e, all: t }) => {
    if (!t && !e)
      throw new Error("Bulk edit requires either a filter or all flag");
    const r = {};
    return t ? r.all = "true" : r.filter = e, r;
  },
  invalidateQueries: { dataType: c }
}), O = l({
  method: "DELETE",
  path: () => "/members/",
  searchParams: ({ filter: e, all: t }) => {
    if (!t && !e)
      throw new Error("Bulk delete requires either a filter or all flag");
    const r = {};
    return t ? r.all = "true" : r.filter = e, r;
  },
  invalidateQueries: { dataType: c }
});
function W({ avatarImage: e, memberId: t, isHidden: r, className: s }) {
  return /* @__PURE__ */ i.jsxs("div", { className: h(
    "relative flex size-6 min-w-6 items-center justify-center overflow-hidden rounded-full bg-accent md:size-8 md:min-w-8",
    r && "opacity-50",
    s
  ), children: [
    t && e && /* @__PURE__ */ i.jsx("div", { className: "absolute inset-0", children: /* @__PURE__ */ i.jsx("img", { alt: "Member avatar", src: e }) }),
    /* @__PURE__ */ i.jsx("div", { children: /* @__PURE__ */ i.jsx(C, { className: "size-3! md:size-4! text-muted-foreground", size: 12 }) })
  ] });
}
const g = /* @__PURE__ */ new Map();
function F({ parentRef: e, enabled: t = !0, isLoading: r = !1 }) {
  const s = P(), [a, b] = S(null), d = j(null);
  u(() => {
    if (!t || !e.current)
      return;
    const n = R(e.current);
    b(n);
  }, [t, e]), u(() => {
    if (!t || !a)
      return;
    const n = s.pathname + s.search, o = () => {
      const m = a.scrollTop;
      g.set(n, m);
    };
    return a.addEventListener("scroll", o), () => a.removeEventListener("scroll", o);
  }, [t, s.pathname, s.search, a]), u(() => {
    const n = s.pathname + s.search, o = g.get(n);
    if (!(!t || !a || r)) {
      if (o !== void 0 && d.current !== n) {
        let m = 0;
        const v = 3, p = () => {
          if (m += 1, !a)
            return;
          const y = a.scrollTop, M = a.scrollHeight, T = a.clientHeight, f = M - T;
          if (o > f && m < v) {
            setTimeout(p, 100);
            return;
          }
          if (Math.abs(o - y) > 5) {
            const w = Math.min(o, f);
            a.scrollTop = w;
          }
        }, x = setTimeout(p, 150);
        return () => clearTimeout(x);
      }
      d.current = n;
    }
  }, [t, s.pathname, s.search, a, r]);
}
export {
  I as B,
  W as M,
  V as a,
  _ as b,
  F as c,
  A as d,
  O as e,
  q as f,
  U as g,
  L as u
};
//# sourceMappingURL=use-scroll-restoration-665Qr_-H.mjs.map

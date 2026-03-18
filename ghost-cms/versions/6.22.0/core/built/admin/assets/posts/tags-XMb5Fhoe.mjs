import { o as h, j as e, R as g, V as K, n as w, D as W, E as X, _ as S, p as Y, e as Z, $ as ee } from "./index-DHZtUctP.mjs";
import { u as G, P as T, e as se, c as ae, B as b } from "./heading-BU5ZMUV_.mjs";
import { b as $, I as te, u as re, R as le } from "./skeleton-BY5P5NDt.mjs";
import { H as m, u as oe } from "./use-infinite-virtual-scroll-Co4ZdYYP.mjs";
import { M as ne } from "./main-layout-DaXG66qS.mjs";
import { T as ie, a as ce, b as P, c as j, d as de, e as f } from "./table-DlD5Z96j.mjs";
import { P as ue, T as ge } from "./tags-BZrlkC68.mjs";
import { E as pe } from "./empty-indicator-1_BranMm.mjs";
import { L as xe } from "./loading-indicator-CadEpdNK.mjs";
import { d as me } from "./hooks-BQt0oM3N.mjs";
var A = "Toggle", C = h((s, t) => {
  const { pressed: r, defaultPressed: a, onPressedChange: l, ...o } = s, [n, i] = G({
    prop: r,
    onChange: l,
    defaultProp: a ?? !1,
    caller: A
  });
  return /* @__PURE__ */ e.jsx(
    T.button,
    {
      type: "button",
      "aria-pressed": n,
      "data-state": n ? "on" : "off",
      "data-disabled": s.disabled ? "" : void 0,
      ...o,
      ref: t,
      onClick: se(s.onClick, () => {
        s.disabled || i(!n);
      })
    }
  );
});
C.displayName = A;
var V = C, x = "ToggleGroup", [M] = ae(x, [
  $
]), L = $(), _ = g.forwardRef((s, t) => {
  const { type: r, ...a } = s;
  if (r === "single") {
    const l = a;
    return /* @__PURE__ */ e.jsx(fe, { ...l, ref: t });
  }
  if (r === "multiple") {
    const l = a;
    return /* @__PURE__ */ e.jsx(he, { ...l, ref: t });
  }
  throw new Error(`Missing prop \`type\` expected on \`${x}\``);
});
_.displayName = x;
var [B, D] = M(x), fe = g.forwardRef((s, t) => {
  const {
    value: r,
    defaultValue: a,
    onValueChange: l = () => {
    },
    ...o
  } = s, [n, i] = G({
    prop: r,
    defaultProp: a ?? "",
    onChange: l,
    caller: x
  });
  return /* @__PURE__ */ e.jsx(
    B,
    {
      scope: s.__scopeToggleGroup,
      type: "single",
      value: g.useMemo(() => n ? [n] : [], [n]),
      onItemActivate: i,
      onItemDeactivate: g.useCallback(() => i(""), [i]),
      children: /* @__PURE__ */ e.jsx(F, { ...o, ref: t })
    }
  );
}), he = g.forwardRef((s, t) => {
  const {
    value: r,
    defaultValue: a,
    onValueChange: l = () => {
    },
    ...o
  } = s, [n, i] = G({
    prop: r,
    defaultProp: a ?? [],
    onChange: l,
    caller: x
  }), d = g.useCallback(
    (u) => i((c = []) => [...c, u]),
    [i]
  ), p = g.useCallback(
    (u) => i((c = []) => c.filter((v) => v !== u)),
    [i]
  );
  return /* @__PURE__ */ e.jsx(
    B,
    {
      scope: s.__scopeToggleGroup,
      type: "multiple",
      value: n,
      onItemActivate: d,
      onItemDeactivate: p,
      children: /* @__PURE__ */ e.jsx(F, { ...o, ref: t })
    }
  );
});
_.displayName = x;
var [ve, je] = M(x), F = g.forwardRef(
  (s, t) => {
    const {
      __scopeToggleGroup: r,
      disabled: a = !1,
      rovingFocus: l = !0,
      orientation: o,
      dir: n,
      loop: i = !0,
      ...d
    } = s, p = L(r), u = re(n), c = { role: "group", dir: u, ...d };
    return /* @__PURE__ */ e.jsx(ve, { scope: r, rovingFocus: l, disabled: a, children: l ? /* @__PURE__ */ e.jsx(
      le,
      {
        asChild: !0,
        ...p,
        orientation: o,
        dir: u,
        loop: i,
        children: /* @__PURE__ */ e.jsx(T.div, { ...c, ref: t })
      }
    ) : /* @__PURE__ */ e.jsx(T.div, { ...c, ref: t }) });
  }
), N = "ToggleGroupItem", H = g.forwardRef(
  (s, t) => {
    const r = D(N, s.__scopeToggleGroup), a = je(N, s.__scopeToggleGroup), l = L(s.__scopeToggleGroup), o = r.value.includes(s.value), n = a.disabled || s.disabled, i = { ...s, pressed: o, disabled: n }, d = g.useRef(null);
    return a.rovingFocus ? /* @__PURE__ */ e.jsx(
      te,
      {
        asChild: !0,
        ...l,
        focusable: !n,
        active: o,
        ref: d,
        children: /* @__PURE__ */ e.jsx(z, { ...i, ref: t })
      }
    ) : /* @__PURE__ */ e.jsx(z, { ...i, ref: t });
  }
);
H.displayName = N;
var z = g.forwardRef(
  (s, t) => {
    const { __scopeToggleGroup: r, value: a, ...l } = s, o = D(N, r), n = { role: "radio", "aria-checked": s.pressed, "aria-pressed": void 0 }, i = o.type === "single" ? n : void 0;
    return /* @__PURE__ */ e.jsx(
      C,
      {
        ...i,
        ...l,
        ref: t,
        onPressedChange: (d) => {
          d ? o.onItemActivate(a) : o.onItemDeactivate(a);
        }
      }
    );
  }
), O = _, q = H;
const Q = K(
  "focus-visible:outline-hidden inline-flex items-center justify-center gap-2 rounded-xs text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm dark:hover:bg-background [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5px]",
  {
    variants: {
      variant: {
        default: "bg-transparent"
      },
      size: {
        default: "h-[26px] min-w-[26px] px-2",
        button: "h-[32px] min-w-[32px] px-3"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
), be = h(({ className: s, variant: t, size: r, ...a }, l) => /* @__PURE__ */ e.jsx(
  V,
  {
    ref: l,
    className: w(Q({ variant: t, size: r, className: s })),
    ...a
  }
));
be.displayName = V.displayName;
const U = W({
  size: "default",
  variant: "default"
}), J = h(({ className: s, variant: t, size: r, children: a, ...l }, o) => /* @__PURE__ */ e.jsx(
  O,
  {
    ref: o,
    className: w("inline-flex items-center justify-center gap-0.5 bg-gray-100 p-0.5 rounded-md dark:bg-gray-925/70", s),
    ...l,
    children: /* @__PURE__ */ e.jsx(U.Provider, { value: { variant: t, size: r }, children: a })
  }
));
J.displayName = O.displayName;
const y = h(({ className: s, children: t, variant: r, size: a, ...l }, o) => {
  const n = X(U);
  return /* @__PURE__ */ e.jsx(
    q,
    {
      ref: o,
      className: w(
        Q({
          variant: n.variant || r,
          size: n.size || a
        }),
        s
      ),
      ...l,
      children: t
    }
  );
});
y.displayName = q.displayName;
const Ne = ({ children: s, className: t, ...r }) => /* @__PURE__ */ e.jsx("section", { className: w("flex gap-6 flex-col p-4 lg:p-8 size-full grow", t), ...r, children: s }), we = ({ currentTab: s }) => /* @__PURE__ */ e.jsxs(m, { variant: "inline-nav", children: [
  /* @__PURE__ */ e.jsx(m.Title, { children: "Tags" }),
  /* @__PURE__ */ e.jsxs(m.Actions, { children: [
    /* @__PURE__ */ e.jsx(m.ActionGroup, { children: /* @__PURE__ */ e.jsxs(J, { "data-testid": "tags-header-tabs", size: "button", type: "single", value: s, children: [
      /* @__PURE__ */ e.jsx(y, { "aria-label": "Public tags", value: "public", asChild: !0, children: /* @__PURE__ */ e.jsx(S, { to: "/tags", children: "Public tags" }) }),
      /* @__PURE__ */ e.jsx(y, { "aria-label": "Internal tags", value: "internal", asChild: !0, children: /* @__PURE__ */ e.jsx(S, { to: "/tags?type=internal", children: "Internal tags" }) })
    ] }) }),
    /* @__PURE__ */ e.jsx(m.ActionGroup, { children: /* @__PURE__ */ e.jsx(b, { asChild: !0, children: /* @__PURE__ */ e.jsx("a", { className: "font-bold", href: "#/tags/new", children: "New tag" }) }) })
  ] })
] }), Te = ({ children: s }) => /* @__PURE__ */ e.jsx(ne, { children: /* @__PURE__ */ e.jsx("div", { className: "grid w-full grow", children: /* @__PURE__ */ e.jsx("div", { className: "flex h-full flex-col", "data-testid": "tags-page", children: s }) }) }), E = ({ height: s }) => /* @__PURE__ */ e.jsx("tr", { "aria-hidden": "true", className: "flex lg:table-row", children: /* @__PURE__ */ e.jsx("td", { className: "flex lg:table-cell", style: { height: s } }) }), Pe = h(function(t, r) {
  return /* @__PURE__ */ e.jsx(
    P,
    {
      ref: r,
      ...t,
      "aria-hidden": "true",
      className: "relative flex flex-col lg:table-row",
      children: /* @__PURE__ */ e.jsx(f, { className: "relative z-10 h-24 animate-pulse", children: /* @__PURE__ */ e.jsx("div", { className: "h-full rounded-md bg-muted", "data-testid": "loading-placeholder" }) })
    }
  );
});
function ye({
  items: s,
  totalItems: t,
  hasNextPage: r,
  isFetchingNextPage: a,
  fetchNextPage: l
}) {
  const o = Y(null), { visibleItems: n, spaceBefore: i, spaceAfter: d } = oe({
    items: s,
    totalItems: t,
    hasNextPage: r,
    isFetchingNextPage: a,
    fetchNextPage: l,
    parentRef: o
  });
  return /* @__PURE__ */ e.jsx("div", { ref: o, className: "overflow-hidden", children: /* @__PURE__ */ e.jsxs(
    ie,
    {
      className: "flex table-fixed flex-col lg:table",
      "data-testid": "tags-list",
      children: [
        /* @__PURE__ */ e.jsx(ce, { className: "lg:visible! lg:table-header-group! hidden", children: /* @__PURE__ */ e.jsxs(P, { children: [
          /* @__PURE__ */ e.jsx(j, { className: "w-auto px-4", children: "Tag" }),
          /* @__PURE__ */ e.jsx(j, { className: "w-1/5 px-4", children: "Slug" }),
          /* @__PURE__ */ e.jsx(j, { className: "w-1/5 px-4", children: "No. of posts" }),
          /* @__PURE__ */ e.jsx(j, { className: "w-20 px-4" })
        ] }) }),
        /* @__PURE__ */ e.jsxs(de, { className: "flex flex-col lg:table-row-group", children: [
          /* @__PURE__ */ e.jsx(E, { height: i }),
          n.map(({ key: p, virtualItem: u, item: c, props: v }) => {
            var I, R, k;
            return u.index > s.length - 1 ? /* @__PURE__ */ e.jsx(Pe, { ...v }, p) : /* @__PURE__ */ e.jsxs(
              P,
              {
                ...v,
                className: "hover:bg-muted/50 grid w-full grid-cols-[1fr_5rem] items-center gap-x-4 p-2 md:grid-cols-[1fr_auto_5rem] lg:table-row lg:p-0 [&.group:hover_td]:bg-transparent",
                "data-testid": "tag-list-row",
                children: [
                  /* @__PURE__ */ e.jsxs(f, { className: "static col-start-1 col-end-1 row-start-1 row-end-1 flex min-w-0 flex-col p-0 md:relative lg:table-cell lg:w-1/2 lg:p-4 xl:w-3/5", children: [
                    /* @__PURE__ */ e.jsx(
                      "a",
                      {
                        className: "before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-[100vw]",
                        href: `#/tags/${c.slug}`,
                        children: /* @__PURE__ */ e.jsx("span", { className: "block truncate pb-1 text-lg font-medium", children: c.name })
                      }
                    ),
                    /* @__PURE__ */ e.jsx("span", { className: "block truncate text-muted-foreground", children: c.description })
                  ] }),
                  /* @__PURE__ */ e.jsx(f, { className: "col-start-1 col-end-1 row-start-2 row-end-2 flex p-0 lg:table-cell lg:p-4", children: /* @__PURE__ */ e.jsx("span", { className: "block truncate", children: c.slug }) }),
                  /* @__PURE__ */ e.jsx(f, { className: "col-start-1 col-end-1 row-start-3 row-end-3 flex p-0 md:col-start-2 md:col-end-2 md:row-start-1 md:row-end-3 lg:table-cell lg:p-4", children: (I = c.count) != null && I.posts ? /* @__PURE__ */ e.jsx(
                    "a",
                    {
                      className: "relative z-10 -m-4 inline-block p-4 hover:underline",
                      href: `#/posts?tag=${c.slug}`,
                      children: `${Z((R = c.count) == null ? void 0 : R.posts)}  ${((k = c.count) == null ? void 0 : k.posts) === 1 ? "post" : "posts"}`
                    }
                  ) : /* @__PURE__ */ e.jsx("span", { className: "text-muted-foreground", children: "0 posts" }) }),
                  /* @__PURE__ */ e.jsx(f, { className: "col-start-2 col-end-2 row-start-1 row-end-3 p-0 md:col-start-3 md:col-end-3 lg:table-cell lg:p-4", children: /* @__PURE__ */ e.jsx(
                    b,
                    {
                      "aria-hidden": "true",
                      className: "w-12",
                      size: "icon",
                      tabIndex: -1,
                      variant: "outline",
                      children: /* @__PURE__ */ e.jsx(ue, {})
                    }
                  ) })
                ]
              },
              p
            );
          }),
          /* @__PURE__ */ e.jsx(E, { height: d })
        ] })
      ]
    }
  ) });
}
const Ge = "TagsResponseType", Ce = me({
  dataType: Ge,
  path: "/tags/",
  defaultNextPageParams: (s, t) => {
    var r, a;
    return (r = s.meta) != null && r.pagination.next ? {
      ...t,
      page: (((a = s.meta) == null ? void 0 : a.pagination.next) || 1).toString()
    } : void 0;
  },
  returnData: (s) => {
    const { pages: t } = s, r = t.flatMap((l) => l.tags), a = t[t.length - 1].meta;
    return {
      tags: r,
      meta: a,
      isEnd: a ? a.pagination.pages === a.pagination.page : !0
    };
  }
}), _e = ({
  filter: s,
  ...t
}) => {
  const r = Object.entries(s).map(([a, l]) => `${a}:${l}`).join(",");
  return Ce({
    ...t,
    searchParams: {
      limit: "100",
      order: "name asc",
      include: "count.posts",
      filter: r,
      ...t.searchParams
    }
  });
}, Be = () => {
  var p, u;
  const { search: s } = ee(), r = new URLSearchParams(s).get("type") ?? "public", {
    data: a,
    isError: l,
    isLoading: o,
    isFetchingNextPage: n,
    fetchNextPage: i,
    hasNextPage: d
  } = _e({
    filter: {
      visibility: r
    }
  });
  return /* @__PURE__ */ e.jsxs(Te, { children: [
    /* @__PURE__ */ e.jsx(we, { currentTab: r }),
    /* @__PURE__ */ e.jsx(Ne, { children: o ? /* @__PURE__ */ e.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ e.jsx(xe, { size: "lg" }) }) : l ? /* @__PURE__ */ e.jsxs("div", { className: "mb-16 flex h-full flex-col items-center justify-center", children: [
      /* @__PURE__ */ e.jsx("h2", { className: "mb-2 text-xl font-medium", children: "Error loading tags" }),
      /* @__PURE__ */ e.jsx("p", { className: "mb-4 text-muted-foreground", children: "Please reload the page to try again" }),
      /* @__PURE__ */ e.jsx(b, { onClick: () => window.location.reload(), children: "Reload page" })
    ] }) : a != null && a.tags.length ? /* @__PURE__ */ e.jsx(
      ye,
      {
        fetchNextPage: i,
        hasNextPage: d,
        isFetchingNextPage: n,
        items: (a == null ? void 0 : a.tags) ?? [],
        totalItems: ((u = (p = a == null ? void 0 : a.meta) == null ? void 0 : p.pagination) == null ? void 0 : u.total) ?? 0
      }
    ) : /* @__PURE__ */ e.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ e.jsx(
      pe,
      {
        actions: /* @__PURE__ */ e.jsx(b, { asChild: !0, children: /* @__PURE__ */ e.jsx("a", { href: "#/tags/new", children: "Create a new tag" }) }),
        title: "Start organizing your content",
        children: /* @__PURE__ */ e.jsx(ge, {})
      }
    ) }) })
  ] });
};
export {
  Be as default
};
//# sourceMappingURL=tags-XMb5Fhoe.mjs.map

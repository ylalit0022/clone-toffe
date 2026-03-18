import { f as u, j as t, q as G, r as K, D as B, B as v, a as p, G as T } from "./index-CQS5C8lQ.mjs";
import { bD as L, Q as W, R as q, _ as H, T as f, bE as C, bF as O, bG as Q, V as y, a1 as U, o as J, bH as X, bI as Y, B as Z, ah as ee } from "./stats-Df8kpPQA.mjs";
var h = "Tabs", [te] = q(h, [
  C
]), w = C(), [ae, N] = te(h), k = u(
  (e, a) => {
    const {
      __scopeTabs: r,
      value: s,
      onValueChange: n,
      defaultValue: i,
      orientation: o = "horizontal",
      dir: d,
      activationMode: g = "automatic",
      ...m
    } = e, c = L(d), [l, b] = W({
      prop: s,
      onChange: n,
      defaultProp: i ?? "",
      caller: h
    });
    return /* @__PURE__ */ t.jsx(
      ae,
      {
        scope: r,
        baseId: H(),
        value: l,
        onValueChange: b,
        orientation: o,
        dir: c,
        activationMode: g,
        children: /* @__PURE__ */ t.jsx(
          f.div,
          {
            dir: c,
            "data-orientation": o,
            ...m,
            ref: a
          }
        )
      }
    );
  }
);
k.displayName = h;
var I = "TabsList", _ = u(
  (e, a) => {
    const { __scopeTabs: r, loop: s = !0, ...n } = e, i = N(I, r), o = w(r);
    return /* @__PURE__ */ t.jsx(
      O,
      {
        asChild: !0,
        ...o,
        orientation: i.orientation,
        dir: i.dir,
        loop: s,
        children: /* @__PURE__ */ t.jsx(
          f.div,
          {
            role: "tablist",
            "aria-orientation": i.orientation,
            ...n,
            ref: a
          }
        )
      }
    );
  }
);
_.displayName = I;
var V = "TabsTrigger", A = u(
  (e, a) => {
    const { __scopeTabs: r, value: s, disabled: n = !1, ...i } = e, o = N(V, r), d = w(r), g = M(o.baseId, s), m = P(o.baseId, s), c = s === o.value;
    return /* @__PURE__ */ t.jsx(
      Q,
      {
        asChild: !0,
        ...d,
        focusable: !n,
        active: c,
        children: /* @__PURE__ */ t.jsx(
          f.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": c,
            "aria-controls": m,
            "data-state": c ? "active" : "inactive",
            "data-disabled": n ? "" : void 0,
            disabled: n,
            id: g,
            ...i,
            ref: a,
            onMouseDown: y(e.onMouseDown, (l) => {
              !n && l.button === 0 && l.ctrlKey === !1 ? o.onValueChange(s) : l.preventDefault();
            }),
            onKeyDown: y(e.onKeyDown, (l) => {
              [" ", "Enter"].includes(l.key) && o.onValueChange(s);
            }),
            onFocus: y(e.onFocus, () => {
              const l = o.activationMode !== "manual";
              !c && !n && l && o.onValueChange(s);
            })
          }
        )
      }
    );
  }
);
A.displayName = V;
var E = "TabsContent", F = u(
  (e, a) => {
    const { __scopeTabs: r, value: s, forceMount: n, children: i, ...o } = e, d = N(E, r), g = M(d.baseId, s), m = P(d.baseId, s), c = s === d.value, l = G(c);
    return K(() => {
      const b = requestAnimationFrame(() => l.current = !1);
      return () => cancelAnimationFrame(b);
    }, []), /* @__PURE__ */ t.jsx(U, { present: n || c, children: ({ present: b }) => /* @__PURE__ */ t.jsx(
      f.div,
      {
        "data-state": c ? "active" : "inactive",
        "data-orientation": d.orientation,
        role: "tabpanel",
        "aria-labelledby": g,
        hidden: !b,
        id: m,
        tabIndex: 0,
        ...o,
        ref: a,
        style: {
          ...e.style,
          animationDuration: l.current ? "0s" : void 0
        },
        children: b && i
      }
    ) });
  }
);
F.displayName = E;
function M(e, a) {
  return `${e}-trigger-${a}`;
}
function P(e, a) {
  return `${e}-content-${a}`;
}
var R = k, D = _, j = A, S = F;
const x = B("segmented"), se = u(({ variant: e = "segmented", ...a }, r) => /* @__PURE__ */ t.jsx(x.Provider, { value: e, children: /* @__PURE__ */ t.jsx(R, { ref: r, ...a }) }));
se.displayName = R.displayName;
const re = T(
  "inline-flex items-center text-muted-foreground",
  {
    variants: {
      variant: {
        segmented: "h-[34px] rounded-lg bg-muted px-[3px]",
        "segmented-sm": "h-8 rounded-lg bg-muted px-[3px]",
        button: "gap-2",
        "button-sm": "gap-1",
        underline: "w-full gap-5 border-b border-b-gray-200 dark:border-gray-950",
        navbar: "h-[52px] items-end gap-6",
        pill: "-ml-0.5 h-[30px] gap-px",
        kpis: "border-b ring-0"
      }
    },
    defaultVariants: {
      variant: "segmented"
    }
  }
), ne = u(({ className: e, ...a }, r) => {
  const s = v(x);
  return /* @__PURE__ */ t.jsx(
    D,
    {
      ref: r,
      className: p(re({ variant: s, className: e })),
      ...a
    }
  );
});
ne.displayName = D.displayName;
const z = T(
  "focus-visible:outline-hidden inline-flex items-center justify-center whitespace-nowrap px-3 py-1 ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        segmented: "h-7 rounded-md text-sm font-medium data-[state=active]:shadow-md",
        "segmented-sm": "h-[26px] rounded-md text-xs font-medium data-[state=active]:shadow-md",
        button: "data-[state=active]:bg-muted-foreground/10 h-[34px] gap-1.5 rounded-md py-2 text-sm font-normal hover:bg-muted data-[state=active]:font-medium",
        "button-sm": "data-[state=active]:bg-muted-foreground/10 h-6 gap-1.5 rounded-md p-2 text-xs font-normal text-gray-800 hover:bg-muted data-[state=active]:font-medium data-[state=active]:text-foreground",
        underline: 'data-[state=active]:after:opacity-100! relative h-[36px] px-0 text-md font-semibold text-gray-700 after:absolute after:inset-x-0 after:bottom-[-1px] after:h-0.5 after:bg-foreground after:opacity-0 after:content-[""] hover:after:opacity-10 data-[state=active]:bg-transparent data-[state=active]:text-foreground',
        navbar: 'data-[state=active]:after:opacity-100! relative h-[52px] px-px text-md font-semibold text-muted-foreground after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-foreground after:opacity-0 after:content-[""] hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground',
        pill: "data-[state=active]:bg-muted-foreground/10 relative h-[30px] rounded-md px-3 text-md font-medium text-gray-800 hover:text-foreground data-[state=active]:font-semibold data-[state=active]:text-foreground dark:text-gray-500 dark:data-[state=active]:text-foreground",
        kpis: 'h-full! items-start! hover:bg-accent/50 relative rounded-none border-border bg-transparent px-6 py-5 text-foreground ring-0 transition-all after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-foreground after:opacity-0 after:content-[""] first:rounded-tl-md last:rounded-tr-md data-[state=active]:bg-transparent data-[state=active]:after:opacity-100 [&:not(:last-child)]:border-r [&[data-state=active]_[data-type="value"]]:text-foreground'
      }
    },
    defaultVariants: {
      variant: "segmented"
    }
  }
), $ = u(({ className: e, ...a }, r) => {
  const s = v(x);
  return /* @__PURE__ */ t.jsx(
    j,
    {
      ref: r,
      className: p(z({ variant: s, className: e })),
      ...a
    }
  );
});
$.displayName = j.displayName;
const oe = T(
  "focus-visible:outline-hidden ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        segmented: "",
        "segmented-sm": "",
        button: "",
        "button-sm": "",
        underline: "",
        navbar: "",
        pill: "",
        kpis: "ring-0"
      }
    },
    defaultVariants: {
      variant: "segmented"
    }
  }
), ie = u(({ className: e, ...a }, r) => {
  const s = v(x);
  return /* @__PURE__ */ t.jsx(
    S,
    {
      ref: r,
      className: p(oe({ variant: s, className: e })),
      ...a
    }
  );
});
ie.displayName = S.displayName;
const ge = ({ children: e, ...a }) => /* @__PURE__ */ t.jsx($, { className: "h-auto", ...a, children: e }), me = ({
  color: e,
  icon: a,
  label: r,
  value: s,
  diffDirection: n,
  diffValue: i,
  className: o,
  "data-testid": d
}) => {
  const g = a ? J[a] : null, m = p(
    "flex items-center gap-1 text-xs h-[22px] px-1.5 rounded-xs group/diff cursor-default mt-0.5",
    n === "up" && "text-green-600 bg-green/10",
    n === "down" && "text-red-600 bg-red/10",
    n === "same" && "text-gray-700 bg-muted"
  );
  return /* @__PURE__ */ t.jsxs("div", { className: p("group flex w-full flex-col items-start gap-2", o), children: [
    /* @__PURE__ */ t.jsxs("div", { className: "flex h-[22px] items-center gap-1.5 text-base font-medium text-muted-foreground transition-all group-hover:text-foreground", "data-type": "value", children: [
      e && /* @__PURE__ */ t.jsx("div", { className: "ml-1 size-2 rounded-full opacity-50", style: { backgroundColor: e } }),
      g && /* @__PURE__ */ t.jsx(g, { size: 16, strokeWidth: 1.5 }),
      r
    ] }),
    /* @__PURE__ */ t.jsxs("div", { className: "flex flex-col items-start gap-2 lg:flex-row xl:gap-3", children: [
      /* @__PURE__ */ t.jsx("div", { className: "text-[2.3rem] font-semibold leading-none tracking-tighter xl:text-[2.6rem]", "data-testid": d, children: s }),
      n && n !== "hidden" && /* @__PURE__ */ t.jsx(t.Fragment, { children: /* @__PURE__ */ t.jsxs("div", { className: m, "data-testid": d ? `${d}-diff` : void 0, children: [
        /* @__PURE__ */ t.jsx("span", { className: "font-medium leading-none", children: i }),
        n === "up" && /* @__PURE__ */ t.jsx(X, { className: "size-[12px]!", size: 14, strokeWidth: 2 }),
        n === "down" && /* @__PURE__ */ t.jsx(Y, { className: "size-[12px]!", size: 14, strokeWidth: 2 })
      ] }) })
    ] })
  ] });
}, de = u(
  ({ variant: e = "dropdown", className: a, ...r }, s) => /* @__PURE__ */ t.jsx(
    Z,
    {
      ref: s,
      className: p(
        "h-auto w-full rounded-none border-x-0 border-t-0 focus-visible:ring-0 bg-transparent py-5",
        a
      ),
      variant: e,
      ...r
    }
  )
);
de.displayName = "KpiDropdownButton";
const le = u(({
  children: e,
  className: a,
  ...r
}, s) => {
  const n = v(x);
  return /* @__PURE__ */ t.jsxs("div", { className: "relative rounded-md hover:bg-muted", children: [
    /* @__PURE__ */ t.jsx(
      j,
      {
        ref: s,
        className: p(z({ variant: n, className: a })),
        ...r,
        children: /* @__PURE__ */ t.jsx("div", { className: "flex items-center gap-2", children: e })
      }
    ),
    /* @__PURE__ */ t.jsx(
      ee,
      {
        className: "absolute inset-0 size-full cursor-pointer",
        onClick: (i) => {
          i.preventDefault();
        }
      }
    )
  ] });
});
le.displayName = "TabsDropdownTrigger";
export {
  ge as K,
  se as T,
  ne as a,
  $ as b,
  me as c,
  de as d
};
//# sourceMappingURL=tabs-BVCBnMU6.mjs.map

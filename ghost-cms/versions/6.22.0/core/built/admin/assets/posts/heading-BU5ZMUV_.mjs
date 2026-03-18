import { q as A, D as _, a as b, j as l, E as L, W as z, p as C, b as P, u as O, F as N, o as p, G as y, H as g, J as j, K as W, a3 as F, x as $, n as x, V as Z } from "./index-DHZtUctP.mjs";
function I(t, e) {
  if (typeof t == "function")
    return t(e);
  t != null && (t.current = e);
}
function k(...t) {
  return (e) => {
    let n = !1;
    const o = t.map((r) => {
      const s = I(r, e);
      return !n && typeof s == "function" && (n = !0), s;
    });
    if (n)
      return () => {
        for (let r = 0; r < o.length; r++) {
          const s = o[r];
          typeof s == "function" ? s() : I(t[r], null);
        }
      };
  };
}
function Nt(...t) {
  return A(k(...t), t);
}
function kt(t, e) {
  const n = _(e), o = (s) => {
    const { children: c, ...i } = s, a = b(() => i, Object.values(i));
    return /* @__PURE__ */ l.jsx(n.Provider, { value: a, children: c });
  };
  o.displayName = t + "Provider";
  function r(s) {
    const c = L(n);
    if (c) return c;
    if (e !== void 0) return e;
    throw new Error(`\`${s}\` must be used within \`${t}\``);
  }
  return [o, r];
}
function Et(t, e = []) {
  let n = [];
  function o(s, c) {
    const i = _(c), a = n.length;
    n = [...n, c];
    const u = (f) => {
      var E;
      const { scope: m, children: h, ...v } = f, S = ((E = m == null ? void 0 : m[t]) == null ? void 0 : E[a]) || i, V = b(() => v, Object.values(v));
      return /* @__PURE__ */ l.jsx(S.Provider, { value: V, children: h });
    };
    u.displayName = s + "Provider";
    function d(f, m) {
      var S;
      const h = ((S = m == null ? void 0 : m[t]) == null ? void 0 : S[a]) || i, v = L(h);
      if (v) return v;
      if (c !== void 0) return c;
      throw new Error(`\`${f}\` must be used within \`${s}\``);
    }
    return [u, d];
  }
  const r = () => {
    const s = n.map((c) => _(c));
    return function(i) {
      const a = (i == null ? void 0 : i[t]) || s;
      return b(
        () => ({ [`__scope${t}`]: { ...i, [t]: a } }),
        [i, a]
      );
    };
  };
  return r.scopeName = t, [o, U(r, ...e)];
}
function U(...t) {
  const e = t[0];
  if (t.length === 1) return e;
  const n = () => {
    const o = t.map((r) => ({
      useScope: r(),
      scopeName: r.scopeName
    }));
    return function(s) {
      const c = o.reduce((i, { useScope: a, scopeName: u }) => {
        const f = a(s)[`__scope${u}`];
        return { ...i, ...f };
      }, {});
      return b(() => ({ [`__scope${e.scopeName}`]: c }), [c]);
    };
  };
  return n.scopeName = e.scopeName, n;
}
function It(t, e, { checkForDefaultPrevented: n = !0 } = {}) {
  return function(r) {
    if (t == null || t(r), n === !1 || !r.defaultPrevented)
      return e == null ? void 0 : e(r);
  };
}
var D = globalThis != null && globalThis.document ? z : () => {
}, q = N[" useInsertionEffect ".trim().toString()] || D;
function Rt({
  prop: t,
  defaultProp: e,
  onChange: n = () => {
  },
  caller: o
}) {
  const [r, s, c] = K({
    defaultProp: e,
    onChange: n
  }), i = t !== void 0, a = i ? t : r;
  {
    const d = C(t !== void 0);
    P(() => {
      const f = d.current;
      f !== i && console.warn(
        `${o} is changing from ${f ? "controlled" : "uncontrolled"} to ${i ? "controlled" : "uncontrolled"}. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled value for the lifetime of the component.`
      ), d.current = i;
    }, [i, o]);
  }
  const u = A(
    (d) => {
      var f;
      if (i) {
        const m = Y(d) ? d(t) : d;
        m !== t && ((f = c.current) == null || f.call(c, m));
      } else
        s(d);
    },
    [i, t, s, c]
  );
  return [a, u];
}
function K({
  defaultProp: t,
  onChange: e
}) {
  const [n, o] = O(t), r = C(n), s = C(e);
  return q(() => {
    s.current = e;
  }, [e]), P(() => {
    var c;
    r.current !== n && ((c = s.current) == null || c.call(s, n), r.current = n);
  }, [n, r]), [n, o, s];
}
function Y(t) {
  return typeof t == "function";
}
// @__NO_SIDE_EFFECTS__
function G(t) {
  const e = /* @__PURE__ */ J(t), n = p((o, r) => {
    const { children: s, ...c } = o, i = y.toArray(s), a = i.find(M);
    if (a) {
      const u = a.props.children, d = i.map((f) => f === a ? y.count(u) > 1 ? y.only(null) : g(u) ? u.props.children : null : f);
      return /* @__PURE__ */ l.jsx(e, { ...c, ref: r, children: g(u) ? j(u, void 0, d) : null });
    }
    return /* @__PURE__ */ l.jsx(e, { ...c, ref: r, children: s });
  });
  return n.displayName = `${t}.Slot`, n;
}
// @__NO_SIDE_EFFECTS__
function J(t) {
  const e = p((n, o) => {
    const { children: r, ...s } = n;
    if (g(r)) {
      const c = X(r), i = Q(s, r.props);
      return r.type !== W && (i.ref = o ? k(o, c) : c), j(r, i);
    }
    return y.count(r) > 1 ? y.only(null) : null;
  });
  return e.displayName = `${t}.SlotClone`, e;
}
var T = Symbol("radix.slottable");
// @__NO_SIDE_EFFECTS__
function At(t) {
  const e = ({ children: n }) => /* @__PURE__ */ l.jsx(l.Fragment, { children: n });
  return e.displayName = `${t}.Slottable`, e.__radixId = T, e;
}
function M(t) {
  return g(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === T;
}
function Q(t, e) {
  const n = { ...e };
  for (const o in e) {
    const r = t[o], s = e[o];
    /^on[A-Z]/.test(o) ? r && s ? n[o] = (...i) => {
      const a = s(...i);
      return r(...i), a;
    } : r && (n[o] = r) : o === "style" ? n[o] = { ...r, ...s } : o === "className" && (n[o] = [r, s].filter(Boolean).join(" "));
  }
  return { ...t, ...n };
}
function X(t) {
  var o, r;
  let e = (o = Object.getOwnPropertyDescriptor(t.props, "ref")) == null ? void 0 : o.get, n = e && "isReactWarning" in e && e.isReactWarning;
  return n ? t.ref : (e = (r = Object.getOwnPropertyDescriptor(t, "ref")) == null ? void 0 : r.get, n = e && "isReactWarning" in e && e.isReactWarning, n ? t.props.ref : t.props.ref || t.ref);
}
var tt = [
  "a",
  "button",
  "div",
  "form",
  "h2",
  "h3",
  "img",
  "input",
  "label",
  "li",
  "nav",
  "ol",
  "p",
  "select",
  "span",
  "svg",
  "ul"
], Lt = tt.reduce((t, e) => {
  const n = /* @__PURE__ */ G(`Primitive.${e}`), o = p((r, s) => {
    const { asChild: c, ...i } = r, a = c ? n : e;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ l.jsx(a, { ...i, ref: s });
  });
  return o.displayName = `Primitive.${e}`, { ...t, [e]: o };
}, {});
function Ot(t, e) {
  t && F(() => t.dispatchEvent(e));
}
var et = N[" useId ".trim().toString()] || (() => {
}), nt = 0;
function Wt(t) {
  const [e, n] = O(et());
  return D(() => {
    n((o) => o ?? String(nt++));
  }, [t]), t || (e ? `radix-${e}` : "");
}
function Dt(t) {
  const e = C(t);
  return P(() => {
    e.current = t;
  }), b(() => (...n) => {
    var o;
    return (o = e.current) == null ? void 0 : o.call(e, ...n);
  }, []);
}
var rt = Symbol.for("react.lazy"), w = N[" use ".trim().toString()];
function ot(t) {
  return typeof t == "object" && t !== null && "then" in t;
}
function B(t) {
  return t != null && typeof t == "object" && "$$typeof" in t && t.$$typeof === rt && "_payload" in t && ot(t._payload);
}
// @__NO_SIDE_EFFECTS__
function st(t) {
  const e = /* @__PURE__ */ ct(t), n = p((o, r) => {
    let { children: s, ...c } = o;
    B(s) && typeof w == "function" && (s = w(s._payload));
    const i = y.toArray(s), a = i.find(ut);
    if (a) {
      const u = a.props.children, d = i.map((f) => f === a ? y.count(u) > 1 ? y.only(null) : g(u) ? u.props.children : null : f);
      return /* @__PURE__ */ l.jsx(e, { ...c, ref: r, children: g(u) ? j(u, void 0, d) : null });
    }
    return /* @__PURE__ */ l.jsx(e, { ...c, ref: r, children: s });
  });
  return n.displayName = `${t}.Slot`, n;
}
var it = /* @__PURE__ */ st("Slot");
// @__NO_SIDE_EFFECTS__
function ct(t) {
  const e = p((n, o) => {
    let { children: r, ...s } = n;
    if (B(r) && typeof w == "function" && (r = w(r._payload)), g(r)) {
      const c = ft(r), i = lt(s, r.props);
      return r.type !== W && (i.ref = o ? k(o, c) : c), j(r, i);
    }
    return y.count(r) > 1 ? y.only(null) : null;
  });
  return e.displayName = `${t}.SlotClone`, e;
}
var at = Symbol("radix.slottable");
function ut(t) {
  return g(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === at;
}
function lt(t, e) {
  const n = { ...e };
  for (const o in e) {
    const r = t[o], s = e[o];
    /^on[A-Z]/.test(o) ? r && s ? n[o] = (...i) => {
      const a = s(...i);
      return r(...i), a;
    } : r && (n[o] = r) : o === "style" ? n[o] = { ...r, ...s } : o === "className" && (n[o] = [r, s].filter(Boolean).join(" "));
  }
  return { ...t, ...n };
}
function ft(t) {
  var o, r;
  let e = (o = Object.getOwnPropertyDescriptor(t.props, "ref")) == null ? void 0 : o.get, n = e && "isReactWarning" in e && e.isReactWarning;
  return n ? t.ref : (e = (r = Object.getOwnPropertyDescriptor(t, "ref")) == null ? void 0 : r.get, n = e && "isReactWarning" in e && e.isReactWarning, n ? t.props.ref : t.props.ref || t.ref);
}
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const dt = (t) => t.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), pt = (t) => t.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (e, n, o) => o ? o.toUpperCase() : n.toLowerCase()
), R = (t) => {
  const e = pt(t);
  return e.charAt(0).toUpperCase() + e.slice(1);
}, H = (...t) => t.filter((e, n, o) => !!e && e.trim() !== "" && o.indexOf(e) === n).join(" ").trim(), mt = (t) => {
  for (const e in t)
    if (e.startsWith("aria-") || e === "role" || e === "title")
      return !0;
};
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var yt = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const gt = p(
  ({
    color: t = "currentColor",
    size: e = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: o,
    className: r = "",
    children: s,
    iconNode: c,
    ...i
  }, a) => $(
    "svg",
    {
      ref: a,
      ...yt,
      width: e,
      height: e,
      stroke: t,
      strokeWidth: o ? Number(n) * 24 / Number(e) : n,
      className: H("lucide", r),
      ...!s && !mt(i) && { "aria-hidden": "true" },
      ...i
    },
    [
      ...c.map(([u, d]) => $(u, d)),
      ...Array.isArray(s) ? s : [s]
    ]
  )
);
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const xt = (t, e) => {
  const n = p(
    ({ className: o, ...r }, s) => $(gt, {
      ref: s,
      iconNode: e,
      className: H(
        `lucide-${dt(R(t))}`,
        `lucide-${t}`,
        o
      ),
      ...r
    })
  );
  return n.displayName = R(t), n;
};
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vt = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]], bt = xt("chevron-down", vt), ht = Z(
  "focus-visible:outline-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5px]",
  {
    variants: {
      variant: {
        default: "hover:bg-primary/90 bg-primary font-medium text-primary-foreground",
        destructive: "hover:bg-destructive/90 bg-destructive font-medium text-destructive-foreground",
        outline: "border border-input bg-background font-medium hover:bg-accent hover:text-accent-foreground",
        secondary: "hover:bg-secondary/80 bg-secondary font-medium text-secondary-foreground dark:bg-gray-925/70 dark:hover:bg-gray-900",
        ghost: "font-medium hover:bg-accent hover:text-accent-foreground",
        link: "font-medium text-primary underline-offset-4 hover:underline",
        dropdown: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      },
      size: {
        default: "h-[34px] px-3 py-2",
        sm: "h-7 rounded-md px-3 text-xs [&_svg]:size-3",
        lg: "h-11 rounded-md px-8 text-md font-semibold",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
), St = p(
  ({ className: t, variant: e, size: n, asChild: o = !1, children: r, ...s }, c) => {
    const i = o ? it : "button", a = e === "dropdown" ? /* @__PURE__ */ l.jsxs(l.Fragment, { children: [
      r,
      /* @__PURE__ */ l.jsx(bt, { className: "-ml-1! -mr-0.5! stroke-[2px]! size-4 opacity-50", strokeWidth: 2 })
    ] }) : r;
    return /* @__PURE__ */ l.jsx(
      i,
      {
        ref: c,
        className: x(ht({ variant: e, size: n, className: t })),
        ...s,
        children: a
      }
    );
  }
);
St.displayName = "Button";
const Ct = p(
  ({ className: t, ...e }, n) => /* @__PURE__ */ l.jsx(
    "h1",
    {
      ref: n,
      className: x("scroll-m-20 text-3xl leading-[1.1em] tracking-tighter font-bold", t),
      ...e
    }
  )
);
Ct.displayName = "H1";
const wt = p(
  ({ className: t, ...e }, n) => /* @__PURE__ */ l.jsx(
    "h2",
    {
      ref: n,
      className: x("scroll-m-20 text-2xl font-bold tracking-tighter first:mt-0", t),
      ...e
    }
  )
);
wt.displayName = "H2";
const jt = p(
  ({ className: t, ...e }, n) => /* @__PURE__ */ l.jsx(
    "h3",
    {
      ref: n,
      className: x("scroll-m-20 text-xl font-semibold tracking-tight", t),
      ...e
    }
  )
);
jt.displayName = "H3";
const _t = p(
  ({ className: t, ...e }, n) => /* @__PURE__ */ l.jsx(
    "h4",
    {
      ref: n,
      className: x("scroll-m-20 text-lg font-semibold tracking-tight", t),
      ...e
    }
  )
);
_t.displayName = "H4";
const $t = p(
  ({ className: t, ...e }, n) => /* @__PURE__ */ l.jsx(
    "div",
    {
      ref: n,
      className: x("text-xs text-muted-foreground tracking-wide font-medium uppercase", t),
      ...e
    }
  )
);
$t.displayName = "HTable";
export {
  St as B,
  bt as C,
  $t as H,
  gt as I,
  Lt as P,
  it as S,
  Wt as a,
  Nt as b,
  Et as c,
  D as d,
  It as e,
  Dt as f,
  G as g,
  k as h,
  xt as i,
  At as j,
  ht as k,
  Ct as l,
  jt as m,
  Ot as n,
  kt as o,
  Rt as u
};
//# sourceMappingURL=heading-BU5ZMUV_.mjs.map

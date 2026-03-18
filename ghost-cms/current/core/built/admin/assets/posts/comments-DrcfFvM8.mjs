import { o as I, j as e, u as R, p as _, b as A, n as P, F as ss, G as O, H as Q, J as Ne, K as ts, V as rs, a as T, q as B, Q as H, v as G, e as ns, _ as ne } from "./index-DHZtUctP.mjs";
import { u as as, F as is, T as ee, a as se, b as te, d as re, c as os } from "./filters-Cy4F_SbD.mjs";
import { u as ls, g as cs, B as ds, a as ms, b as us, M as $, c as hs } from "./use-scroll-restoration-665Qr_-H.mjs";
import { u as ps, g as fs } from "./posts-9lhi5U2u.mjs";
import { u as xs, U as ye, g as bs, D as gs, b as js, E as vs, d as Cs, e as W } from "./dropdown-menu-D5NyPbW9.mjs";
import { a as Ns, c as ys, F as ae, C as ks, b as ke, D as ie, M as ws, H as we, R as _s, E as _e } from "./reply-B0cmgrH9.mjs";
import { C as Ss, F as Ps, b as Rs, E as Se, M as Pe } from "./search-hHdC4f3P.mjs";
import { a as Es, C as Is, X as Ts, k as oe, m as le, n as ce, o as de, p as Ls, q as me } from "./dialog-B8MooVkm.mjs";
import { H as ge, u as Ds } from "./use-infinite-virtual-scroll-Co4ZdYYP.mjs";
import { M as Fs } from "./main-layout-DaXG66qS.mjs";
import { c as Ms, P as ue, u as $s, b as Re, e as je, h as zs, B as S, C as Os } from "./heading-BU5ZMUV_.mjs";
import { L as U } from "./loading-indicator-CadEpdNK.mjs";
import { d as Bs, b as Ee, c as he } from "./hooks-BQt0oM3N.mjs";
import { E as Hs, S as As } from "./separator-B97phMDm.mjs";
import { E as Ie } from "./empty-indicator-1_BranMm.mjs";
import { S as Us, b as Vs, c as qs, d as Ws } from "./sheet-DXD_Hy36.mjs";
var Y = "Checkbox", [Qs] = Ms(Y), [Ks, pe] = Qs(Y);
function Gs(s) {
  const {
    __scopeCheckbox: t,
    checked: r,
    children: i,
    defaultChecked: n,
    disabled: a,
    form: o,
    name: l,
    onCheckedChange: c,
    required: d,
    value: u = "on",
    // @ts-expect-error
    internal_do_not_use_render: m
  } = s, [x, p] = $s({
    prop: r,
    defaultProp: n ?? !1,
    onChange: c,
    caller: Y
  }), [f, j] = R(null), [g, v] = R(null), b = _(!1), N = f ? !!o || !!f.closest("form") : (
    // We set this to true by default so that events bubble to forms without JS (SSR)
    !0
  ), C = {
    checked: x,
    disabled: a,
    setChecked: p,
    control: f,
    setControl: j,
    name: l,
    form: o,
    value: u,
    hasConsumerStoppedPropagationRef: b,
    required: d,
    defaultChecked: L(n) ? !1 : n,
    isFormControl: N,
    bubbleInput: g,
    setBubbleInput: v
  };
  return /* @__PURE__ */ e.jsx(
    Ks,
    {
      scope: t,
      ...C,
      children: Ys(m) ? m(C) : i
    }
  );
}
var Te = "CheckboxTrigger", Le = I(
  ({ __scopeCheckbox: s, onKeyDown: t, onClick: r, ...i }, n) => {
    const {
      control: a,
      value: o,
      disabled: l,
      checked: c,
      required: d,
      setControl: u,
      setChecked: m,
      hasConsumerStoppedPropagationRef: x,
      isFormControl: p,
      bubbleInput: f
    } = pe(Te, s), j = Re(n, u), g = _(c);
    return A(() => {
      const v = a == null ? void 0 : a.form;
      if (v) {
        const b = () => m(g.current);
        return v.addEventListener("reset", b), () => v.removeEventListener("reset", b);
      }
    }, [a, m]), /* @__PURE__ */ e.jsx(
      ue.button,
      {
        type: "button",
        role: "checkbox",
        "aria-checked": L(c) ? "mixed" : c,
        "aria-required": d,
        "data-state": ze(c),
        "data-disabled": l ? "" : void 0,
        disabled: l,
        value: o,
        ...i,
        ref: j,
        onKeyDown: je(t, (v) => {
          v.key === "Enter" && v.preventDefault();
        }),
        onClick: je(r, (v) => {
          m((b) => L(b) ? !0 : !b), f && p && (x.current = v.isPropagationStopped(), x.current || v.stopPropagation());
        })
      }
    );
  }
);
Le.displayName = Te;
var fe = I(
  (s, t) => {
    const {
      __scopeCheckbox: r,
      name: i,
      checked: n,
      defaultChecked: a,
      required: o,
      disabled: l,
      value: c,
      onCheckedChange: d,
      form: u,
      ...m
    } = s;
    return /* @__PURE__ */ e.jsx(
      Gs,
      {
        __scopeCheckbox: r,
        checked: n,
        defaultChecked: a,
        disabled: l,
        required: o,
        onCheckedChange: d,
        name: i,
        form: u,
        value: c,
        internal_do_not_use_render: ({ isFormControl: x }) => /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx(
            Le,
            {
              ...m,
              ref: t,
              __scopeCheckbox: r
            }
          ),
          x && /* @__PURE__ */ e.jsx(
            $e,
            {
              __scopeCheckbox: r
            }
          )
        ] })
      }
    );
  }
);
fe.displayName = Y;
var De = "CheckboxIndicator", Fe = I(
  (s, t) => {
    const { __scopeCheckbox: r, forceMount: i, ...n } = s, a = pe(De, r);
    return /* @__PURE__ */ e.jsx(
      Es,
      {
        present: i || L(a.checked) || a.checked === !0,
        children: /* @__PURE__ */ e.jsx(
          ue.span,
          {
            "data-state": ze(a.checked),
            "data-disabled": a.disabled ? "" : void 0,
            ...n,
            ref: t,
            style: { pointerEvents: "none", ...s.style }
          }
        )
      }
    );
  }
);
Fe.displayName = De;
var Me = "CheckboxBubbleInput", $e = I(
  ({ __scopeCheckbox: s, ...t }, r) => {
    const {
      control: i,
      hasConsumerStoppedPropagationRef: n,
      checked: a,
      defaultChecked: o,
      required: l,
      disabled: c,
      name: d,
      value: u,
      form: m,
      bubbleInput: x,
      setBubbleInput: p
    } = pe(Me, s), f = Re(r, p), j = as(a), g = xs(i);
    A(() => {
      const b = x;
      if (!b) return;
      const N = window.HTMLInputElement.prototype, k = Object.getOwnPropertyDescriptor(
        N,
        "checked"
      ).set, h = !n.current;
      if (j !== a && k) {
        const E = new Event("click", { bubbles: h });
        b.indeterminate = L(a), k.call(b, L(a) ? !1 : a), b.dispatchEvent(E);
      }
    }, [x, j, a, n]);
    const v = _(L(a) ? !1 : a);
    return /* @__PURE__ */ e.jsx(
      ue.input,
      {
        type: "checkbox",
        "aria-hidden": !0,
        defaultChecked: o ?? v.current,
        required: l,
        disabled: c,
        name: d,
        value: u,
        form: m,
        ...t,
        tabIndex: -1,
        ref: f,
        style: {
          ...t.style,
          ...g,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0,
          // We transform because the input is absolutely positioned but we have
          // rendered it **after** the button. This pulls it back to sit on top
          // of the button.
          transform: "translateX(-100%)"
        }
      }
    );
  }
);
$e.displayName = Me;
function Ys(s) {
  return typeof s == "function";
}
function L(s) {
  return s === "indeterminate";
}
function ze(s) {
  return L(s) ? "indeterminate" : s ? "checked" : "unchecked";
}
const Oe = I(({ className: s, ...t }, r) => /* @__PURE__ */ e.jsx(
  fe,
  {
    ref: r,
    className: P(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-xs border border-primary shadow focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      s
    ),
    ...t,
    children: /* @__PURE__ */ e.jsx(
      Fe,
      {
        className: P("grid place-content-center text-current"),
        children: /* @__PURE__ */ e.jsx(Is, { className: "size-4" })
      }
    )
  }
));
Oe.displayName = fe.displayName;
var Xs = Symbol.for("react.lazy"), K = ss[" use ".trim().toString()];
function Zs(s) {
  return typeof s == "object" && s !== null && "then" in s;
}
function Be(s) {
  return s != null && typeof s == "object" && "$$typeof" in s && s.$$typeof === Xs && "_payload" in s && Zs(s._payload);
}
// @__NO_SIDE_EFFECTS__
function Js(s) {
  const t = /* @__PURE__ */ et(s), r = I((i, n) => {
    let { children: a, ...o } = i;
    Be(a) && typeof K == "function" && (a = K(a._payload));
    const l = O.toArray(a), c = l.find(tt);
    if (c) {
      const d = c.props.children, u = l.map((m) => m === c ? O.count(d) > 1 ? O.only(null) : Q(d) ? d.props.children : null : m);
      return /* @__PURE__ */ e.jsx(t, { ...o, ref: n, children: Q(d) ? Ne(d, void 0, u) : null });
    }
    return /* @__PURE__ */ e.jsx(t, { ...o, ref: n, children: a });
  });
  return r.displayName = `${s}.Slot`, r;
}
// @__NO_SIDE_EFFECTS__
function et(s) {
  const t = I((r, i) => {
    let { children: n, ...a } = r;
    if (Be(n) && typeof K == "function" && (n = K(n._payload)), Q(n)) {
      const o = nt(n), l = rt(a, n.props);
      return n.type !== ts && (l.ref = i ? zs(i, o) : o), Ne(n, l);
    }
    return O.count(n) > 1 ? O.only(null) : null;
  });
  return t.displayName = `${s}.SlotClone`, t;
}
var st = Symbol("radix.slottable");
function tt(s) {
  return Q(s) && typeof s.type == "function" && "__radixId" in s.type && s.type.__radixId === st;
}
function rt(s, t) {
  const r = { ...t };
  for (const i in t) {
    const n = s[i], a = t[i];
    /^on[A-Z]/.test(i) ? n && a ? r[i] = (...l) => {
      const c = a(...l);
      return n(...l), c;
    } : n && (r[i] = n) : i === "style" ? r[i] = { ...n, ...a } : i === "className" && (r[i] = [n, a].filter(Boolean).join(" "));
  }
  return { ...s, ...r };
}
function nt(s) {
  var i, n;
  let t = (i = Object.getOwnPropertyDescriptor(s.props, "ref")) == null ? void 0 : i.get, r = t && "isReactWarning" in t && t.isReactWarning;
  return r ? s.ref : (t = (n = Object.getOwnPropertyDescriptor(s, "ref")) == null ? void 0 : n.get, r = t && "isReactWarning" in t && t.isReactWarning, r ? s.props.ref : s.props.ref || s.ref);
}
var at = [
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
], it = at.reduce((s, t) => {
  const r = /* @__PURE__ */ Js(`Primitive.${t}`), i = I((n, a) => {
    const { asChild: o, ...l } = n, c = o ? r : t;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ e.jsx(c, { ...l, ref: a });
  });
  return i.displayName = `Primitive.${t}`, { ...s, [t]: i };
}, {}), ot = "Label", He = I((s, t) => /* @__PURE__ */ e.jsx(
  it.label,
  {
    ...s,
    ref: t,
    onMouseDown: (r) => {
      var n;
      r.target.closest("button, input, select, textarea") || ((n = s.onMouseDown) == null || n.call(s, r), !r.defaultPrevented && r.detail > 1 && r.preventDefault());
    }
  }
));
He.displayName = ot;
var Ae = He;
const lt = rs(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
), Ue = I(({ className: s, ...t }, r) => /* @__PURE__ */ e.jsx(
  Ae,
  {
    ref: r,
    className: P(lt(), s),
    ...t
  }
));
Ue.displayName = Ae.displayName;
const ct = ({ children: s, className: t, ...r }) => /* @__PURE__ */ e.jsx("section", { className: P("flex gap-6 flex-col p-4 lg:p-8 size-full grow", t), ...r, children: s });
function ve({
  knownItems: s,
  useSearch: t,
  useGetById: r,
  filters: i,
  filterFieldName: n,
  searchFieldName: a,
  toOption: o
}) {
  const [l, c] = R(""), { data: d, isLoading: u } = t(l), m = T(() => {
    const b = i.find((N) => N.field === n);
    return b != null && b.values[0] ? String(b.values[0]) : "";
  }, [i, n]), x = T(() => !m || s.some((N) => N.id === m) ? !1 : !((d == null ? void 0 : d[a]) ?? []).some((N) => N.id === m), [m, s, d, a]), { data: p, isLoading: f } = r(m || "", {
    enabled: x,
    defaultErrorHandler: !1
  }), j = u || f, g = B((b) => o(b), [o]);
  return {
    options: T(() => {
      var k;
      const b = (d == null ? void 0 : d[a]) ?? [], N = {};
      for (const h of s)
        N[h.id] = g(h);
      for (const h of b)
        N[h.id] = g(h);
      const C = (k = p == null ? void 0 : p[a]) == null ? void 0 : k[0];
      return C != null && C.id && (N[C.id] = g(C)), m && !(m in N) && (N[m] = { value: m, label: `ID: ${m}` }), Object.values(N);
    }, [s, d, a, p, m, g]),
    isLoading: j,
    searchValue: l,
    onSearchChange: c
  };
}
function dt(s, t, r, i) {
  var n = this, a = _(null), o = _(0), l = _(0), c = _(null), d = _([]), u = _(), m = _(), x = _(s), p = _(!0);
  x.current = s;
  var f = typeof window < "u", j = !t && t !== 0 && f;
  if (typeof s != "function") throw new TypeError("Expected a function");
  t = +t || 0;
  var g = !!(r = r || {}).leading, v = !("trailing" in r) || !!r.trailing, b = "maxWait" in r, N = "debounceOnServer" in r && !!r.debounceOnServer, C = b ? Math.max(+r.maxWait || 0, t) : null;
  A(function() {
    return p.current = !0, function() {
      p.current = !1;
    };
  }, []);
  var k = T(function() {
    var h = function(y) {
      var w = d.current, F = u.current;
      return d.current = u.current = null, o.current = y, l.current = l.current || y, m.current = x.current.apply(F, w);
    }, E = function(y, w) {
      j && cancelAnimationFrame(c.current), c.current = j ? requestAnimationFrame(y) : setTimeout(y, w);
    }, Z = function(y) {
      if (!p.current) return !1;
      var w = y - a.current;
      return !a.current || w >= t || w < 0 || b && y - o.current >= C;
    }, z = function(y) {
      return c.current = null, v && d.current ? h(y) : (d.current = u.current = null, m.current);
    }, M = function y() {
      var w = Date.now();
      if (g && l.current === o.current && V(), Z(w)) return z(w);
      if (p.current) {
        var F = t - (w - a.current), q = b ? Math.min(F, C - (w - o.current)) : F;
        E(y, q);
      }
    }, V = function() {
      i && i({});
    }, D = function() {
      if (f || N) {
        var y = Date.now(), w = Z(y);
        if (d.current = [].slice.call(arguments), u.current = n, a.current = y, w) {
          if (!c.current && p.current) return o.current = a.current, E(M, t), g ? h(a.current) : m.current;
          if (b) return E(M, t), h(a.current);
        }
        return c.current || E(M, t), m.current;
      }
    };
    return D.cancel = function() {
      var y = c.current;
      y && (j ? cancelAnimationFrame(c.current) : clearTimeout(c.current)), o.current = 0, d.current = a.current = u.current = c.current = null, y && i && i({});
    }, D.isPending = function() {
      return !!c.current;
    }, D.flush = function() {
      return c.current ? z(Date.now()) : m.current;
    }, D;
  }, [g, b, t, C, v, j, f, N, i]);
  return k;
}
function mt(s, t) {
  return s === t;
}
function Ve(s, t, r) {
  var i = mt, n = _(s), a = R({})[1], o = dt(B(function(c) {
    n.current = c, a({});
  }, [a]), t, r, a), l = _(s);
  return i(l.current, s) || (o(s), l.current = s), [n.current, o];
}
function ut(s) {
  const [t] = Ve(s, 200);
  return ls({
    searchParams: {
      ...t && { search: t },
      limit: "100",
      order: "created_at DESC"
    }
  });
}
function ht(s) {
  const [t] = Ve(s, 200), r = t ? `title:~'${t.replace(/'/g, "\\'")}'` : "";
  return ps({
    searchParams: {
      ...r && { filter: r },
      limit: "100",
      fields: "id,title",
      order: "published_at DESC"
    }
  });
}
const pt = ({
  knownPosts: s,
  knownMembers: t,
  filters: r,
  onFiltersChange: i
}) => {
  const n = ve({
    knownItems: s,
    useSearch: ht,
    useGetById: fs,
    searchFieldName: "posts",
    filters: r,
    filterFieldName: "post",
    toOption: (d) => ({
      value: d.id,
      label: d.title || "(Untitled)"
    })
  }), a = ve({
    knownItems: t,
    useSearch: ut,
    useGetById: cs,
    searchFieldName: "members",
    filters: r,
    filterFieldName: "author",
    toOption: (d) => ({
      value: d.id,
      label: d.name || "Unknown name",
      detail: d.email ?? "(Unknown email)"
    })
  }), o = T(
    () => [
      {
        key: "author",
        label: "Author",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(ye, { className: "size-4" }),
        options: a.options,
        isLoading: a.options.length === 0 && a.isLoading,
        onSearchChange: a.onSearchChange,
        searchValue: a.searchValue,
        searchable: !0,
        className: "w-80",
        popoverContentClassName: "w-80",
        operators: [
          { value: "is", label: "is" },
          { value: "is_not", label: "is not" }
        ]
      },
      {
        key: "post",
        label: "Post",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(Ns, { className: "size-4" }),
        options: n.options,
        isLoading: n.options.length === 0 && n.isLoading,
        onSearchChange: n.onSearchChange,
        searchValue: n.searchValue,
        searchable: !0,
        className: "w-full max-w-80",
        popoverContentClassName: "w-full max-w-[calc(100vw-32px)] max-w-80",
        operators: [
          { value: "is", label: "is" },
          { value: "is_not", label: "is not" }
        ]
      },
      {
        key: "body",
        label: "Text",
        type: "text",
        icon: /* @__PURE__ */ e.jsx(ys, { className: "size-4" }),
        placeholder: "Search comment text...",
        operators: [
          { value: "contains", label: "contains" },
          { value: "not_contains", label: "does not contain" }
        ],
        defaultOperator: "contains",
        className: "w-full max-w-48",
        popoverContentClassName: "w-full max-w-48"
      },
      {
        key: "status",
        label: "Status",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(bs, { className: "size-4" }),
        options: [
          { value: "published", label: "Published" },
          { value: "hidden", label: "Hidden" }
        ],
        operators: [
          { value: "is", label: "is" }
        ],
        searchable: !1,
        hideOperatorSelect: !0
      },
      {
        key: "reported",
        label: "Reported",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(ae, { className: "size-4" }),
        options: [
          { value: "true", label: "Yes" },
          { value: "false", label: "No" }
        ],
        operators: [
          { value: "is", label: "is" }
        ],
        searchable: !1,
        hideOperatorSelect: !0
      },
      {
        key: "created_at",
        label: "Date",
        type: "date",
        className: "w-full max-w-32",
        icon: /* @__PURE__ */ e.jsx(Ss, { className: "size-4" }),
        operators: [
          { value: "is", label: "is" },
          { value: "before", label: "before" },
          { value: "after", label: "after" }
        ]
      }
    ],
    [n, a]
  ), l = r.length > 0, c = P(
    "flex flex-row",
    !l && "[grid-area:actions] pt-5 justify-start sm:justify-end sm:pt-0",
    l && "col-start-1 col-end-4 row-start-3 pt-5"
  );
  return /* @__PURE__ */ e.jsx("div", { className: c, children: /* @__PURE__ */ e.jsx(
    is,
    {
      addButtonIcon: l ? /* @__PURE__ */ e.jsx(Ps, {}) : /* @__PURE__ */ e.jsx(Rs, {}),
      addButtonText: l ? "Add filter" : "Filter",
      allowMultiple: !1,
      className: `[&>button]:order-last ${l ? "[&>button]:border-none" : "w-auto"}`,
      clearButtonClassName: "font-normal text-muted-foreground",
      clearButtonIcon: /* @__PURE__ */ e.jsx(Ts, {}),
      clearButtonText: "Clear",
      fields: o,
      filters: r,
      keyboardShortcut: "f",
      popoverAlign: l ? "start" : "end",
      showClearButton: l,
      showSearchInput: !1,
      onChange: i
    }
  ) });
}, ft = ({ children: s }) => /* @__PURE__ */ e.jsxs(ge, { className: "pb-6! relative md:sticky", variant: "inline-nav", children: [
  /* @__PURE__ */ e.jsx(ge.Title, { children: "Comments" }),
  s
] }), xt = ({ children: s }) => /* @__PURE__ */ e.jsx(Fs, { children: /* @__PURE__ */ e.jsx("div", { className: "grid w-full grow", children: /* @__PURE__ */ e.jsx("div", { className: "flex h-full flex-col", "data-testid": "comments-page", children: s }) }) });
function bt({ onClick: s, expanded: t }) {
  return /* @__PURE__ */ e.jsxs(
    S,
    {
      className: "shrink-0 gap-0.5 self-start p-0 text-base hover:bg-transparent",
      variant: "ghost",
      onClick: s,
      children: [
        t ? "Show less" : "Show more",
        t ? /* @__PURE__ */ e.jsx(ks, {}) : /* @__PURE__ */ e.jsx(Os, {})
      ]
    }
  );
}
function qe({ item: s }) {
  const t = _(null), [r, i] = R(!1), [n, a] = R(!1);
  return A(() => {
    if (n)
      return;
    const o = () => {
      t.current && i(t.current.scrollHeight > t.current.clientHeight);
    };
    return o(), window.addEventListener("resize", o), () => window.removeEventListener("resize", o);
  }, [s.html, n]), /* @__PURE__ */ e.jsx("div", { className: "mt-1 flex flex-col gap-2", children: /* @__PURE__ */ e.jsxs("div", { className: `flex max-w-full flex-col items-start ${s.status === "hidden" && "opacity-50"}`, children: [
    /* @__PURE__ */ e.jsx(
      "div",
      {
        dangerouslySetInnerHTML: { __html: s.html || "" },
        ref: t,
        className: P(
          "prose flex-1 text-base max-w-[80ch] balance leading-[1.5em] [&_*]:leading-[1.5em] [&_*]:text-base [&_*]:font-normal [&_blockquote]:border-l-[3px] [&_blockquote]:border-foreground [&_blockquote]:p-0 [&_blockquote]:pl-3 [&_blockquote_p]:mt-0 [&_a]:underline",
          n ? "-mb-1 [&_p]:mb-[0.85em]" : "line-clamp-2 [&_p]:m-0 [&_blockquote+p]:mt-1 mb-1"
        )
      }
    ),
    r && /* @__PURE__ */ e.jsx(bt, { expanded: n, onClick: () => a(!n) })
  ] }) });
}
const X = "CommentsResponseType", gt = Bs({
  dataType: X,
  path: "/comments/",
  defaultNextPageParams: (s, t) => {
    var r, i;
    return (r = s.meta) != null && r.pagination.next ? {
      ...t,
      page: (((i = s.meta) == null ? void 0 : i.pagination.next) || 1).toString()
    } : void 0;
  },
  returnData: (s) => {
    const { pages: t } = s, r = t.flatMap((n) => n.comments), i = t[t.length - 1].meta;
    return {
      comments: r,
      meta: i,
      isEnd: i ? i.pagination.pages === i.pagination.page : !0
    };
  }
}), We = (s) => gt({
  ...s,
  searchParams: {
    limit: "100",
    order: "created_at desc",
    include: "member,post,parent",
    ...s == null ? void 0 : s.searchParams
  }
}), Qe = Ee({
  method: "PUT",
  path: ({ id: s }) => `/comments/${s}/`,
  body: ({ id: s }) => ({
    comments: [{
      id: s,
      status: "hidden"
    }]
  }),
  invalidateQueries: {
    dataType: X
  }
}), Ke = Ee({
  method: "PUT",
  path: ({ id: s }) => `/comments/${s}/`,
  body: ({ id: s }) => ({
    comments: [{
      id: s,
      status: "published"
    }]
  }),
  invalidateQueries: {
    dataType: X
  }
}), jt = he({
  dataType: X,
  path: (s) => `/comments/${s}/`,
  defaultSearchParams: {
    include: "member,post,count.replies,count.direct_replies,count.likes,count.reports,parent,in_reply_to"
  }
}), vt = he({
  dataType: "CommentReportsResponseType",
  path: (s) => `/comments/${s}/reports/`
}), Ct = (s, t) => vt(s, { ...t }), Nt = he({
  dataType: "CommentLikesResponseType",
  path: (s) => `/comments/${s}/likes/`,
  defaultSearchParams: {
    include: "member",
    limit: "100",
    order: "created_at desc"
  }
}), yt = (s, t) => Nt(s, { ...t }), kt = (s, t) => We({
  ...t,
  searchParams: {
    filter: `(parent_id:${s}+in_reply_to_id:null),in_reply_to_id:${s}`,
    order: "created_at asc",
    include: "member,post,count.direct_replies,count.likes,count.reports,parent,in_reply_to",
    limit: "100"
  }
});
function wt(s) {
  const t = new Date(s);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric"
  }).format(t).replace(/(\d+),(\s+\d{4})/, "$1$2");
}
function Ge({
  memberName: s,
  memberId: t,
  createdAt: r,
  isHidden: i,
  canComment: n,
  onAuthorClick: a,
  postTitle: o,
  onPostClick: l,
  className: c
}) {
  return /* @__PURE__ */ e.jsxs("div", { className: P("flex items-baseline gap-4", c), children: [
    /* @__PURE__ */ e.jsxs("div", { className: P(
      "mb-1 flex min-w-0 items-center gap-x-1 text-sm",
      i && "opacity-50"
    ), children: [
      /* @__PURE__ */ e.jsx("div", { className: "whitespace-nowrap", children: t && a ? /* @__PURE__ */ e.jsx(
        S,
        {
          className: "flex h-auto items-center gap-1.5 truncate p-0 font-semibold text-primary hover:opacity-70",
          variant: "link",
          onClick: a,
          children: s || "Unknown"
        }
      ) : /* @__PURE__ */ e.jsx("span", { className: "block truncate font-semibold", children: s || "Unknown" }) }),
      n === !1 && /* @__PURE__ */ e.jsx(ee, { children: /* @__PURE__ */ e.jsxs(se, { children: [
        /* @__PURE__ */ e.jsx(te, { asChild: !0, children: /* @__PURE__ */ e.jsx("span", { "data-testid": "commenting-disabled-indicator", children: /* @__PURE__ */ e.jsx(
          ke,
          {
            className: "size-3.5 text-muted-foreground"
          }
        ) }) }),
        /* @__PURE__ */ e.jsx(re, { children: "Comments disabled" })
      ] }) }),
      /* @__PURE__ */ e.jsx(ie, { className: "text-muted-foreground/50 shrink-0", size: 16 }),
      /* @__PURE__ */ e.jsx("div", { className: "shrink-0 whitespace-nowrap", children: r && /* @__PURE__ */ e.jsx(ee, { children: /* @__PURE__ */ e.jsxs(se, { children: [
        /* @__PURE__ */ e.jsx(te, { asChild: !0, children: /* @__PURE__ */ e.jsx("span", { className: "cursor-default text-sm text-muted-foreground", children: H(r) }) }),
        /* @__PURE__ */ e.jsx(re, { children: wt(r) })
      ] }) }) }),
      o && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        /* @__PURE__ */ e.jsx("div", { className: "shrink-0 text-muted-foreground", children: "on" }),
        /* @__PURE__ */ e.jsx("div", { className: "min-w-0 truncate", children: l ? /* @__PURE__ */ e.jsx(
          S,
          {
            className: "block h-auto w-full cursor-pointer truncate p-0 text-left font-medium text-gray-800 hover:opacity-70 dark:text-gray-400",
            variant: "link",
            onClick: l,
            children: o
          }
        ) : /* @__PURE__ */ e.jsx("span", { className: "font-medium text-gray-800 dark:text-gray-400", children: o }) })
      ] })
    ] }),
    i && /* @__PURE__ */ e.jsx(ds, { variant: "secondary", children: "Hidden" })
  ] });
}
function _t({
  open: s,
  memberName: t,
  onOpenChange: r,
  onConfirm: i
}) {
  const [n, a] = R(!1), o = (c) => {
    c || a(!1), r(c);
  }, l = () => {
    i(n), a(!1);
  };
  return /* @__PURE__ */ e.jsx(oe, { open: s, onOpenChange: o, children: /* @__PURE__ */ e.jsxs(le, { className: "gap-5", children: [
    /* @__PURE__ */ e.jsxs(ce, { children: [
      /* @__PURE__ */ e.jsx(de, { children: "Disable comments" }),
      /* @__PURE__ */ e.jsxs(Ls, { children: [
        t || "This member",
        " won't be able to comment in the future. You can re-enable commenting anytime."
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ e.jsx(
        Oe,
        {
          checked: n,
          id: "hide-comments",
          onCheckedChange: (c) => a(c === !0)
        }
      ),
      /* @__PURE__ */ e.jsx(Ue, { htmlFor: "hide-comments", children: "Hide all previous comments" })
    ] }),
    /* @__PURE__ */ e.jsxs(me, { children: [
      /* @__PURE__ */ e.jsx(S, { variant: "outline", onClick: () => o(!1), children: "Cancel" }),
      /* @__PURE__ */ e.jsx(S, { onClick: l, children: "Disable comments" })
    ] })
  ] }) });
}
function Ye({
  comment: s
}) {
  const { mutate: t } = ms(), { mutate: r } = us(), [i, n] = R(!1), { id: a, post: o, member: l } = s, c = o == null ? void 0 : o.url, d = l == null ? void 0 : l.id, u = l == null ? void 0 : l.can_comment, m = (p) => {
    d && (t({
      id: d,
      reason: `Disabled from comment ${a}`,
      hideComments: p
    }), n(!1));
  }, x = () => {
    d && r({ id: d });
  };
  return /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    /* @__PURE__ */ e.jsxs(gs, { children: [
      /* @__PURE__ */ e.jsx(js, { asChild: !0, children: /* @__PURE__ */ e.jsx(
        S,
        {
          className: "relative z-10 text-gray-800 hover:bg-secondary [&_svg]:size-4",
          size: "sm",
          variant: "ghost",
          children: /* @__PURE__ */ e.jsx(vs, {})
        }
      ) }),
      /* @__PURE__ */ e.jsxs(Cs, { align: "start", children: [
        c && /* @__PURE__ */ e.jsx(W, { asChild: !0, children: /* @__PURE__ */ e.jsxs("a", { href: `${c}#ghost-comments-${a}`, rel: "noopener noreferrer", target: "_blank", children: [
          /* @__PURE__ */ e.jsx(Hs, { className: "size-4" }),
          "View on post"
        ] }) }),
        d && /* @__PURE__ */ e.jsx(W, { asChild: !0, children: /* @__PURE__ */ e.jsxs("a", { href: `#/members/${d}`, children: [
          /* @__PURE__ */ e.jsx(ye, { className: "size-4" }),
          "View member"
        ] }) }),
        d && (u !== !1 ? /* @__PURE__ */ e.jsxs(W, { onClick: () => n(!0), children: [
          /* @__PURE__ */ e.jsx(ke, { className: "size-4" }),
          "Disable commenting"
        ] }) : /* @__PURE__ */ e.jsxs(W, { onClick: x, children: [
          /* @__PURE__ */ e.jsx(ws, { className: "size-4" }),
          "Enable commenting"
        ] }))
      ] })
    ] }),
    /* @__PURE__ */ e.jsx(
      _t,
      {
        memberName: l == null ? void 0 : l.name,
        open: i,
        onConfirm: m,
        onOpenChange: n
      }
    )
  ] });
}
function St({ comment: s, open: t, onOpenChange: r }) {
  var c, d, u, m, x;
  const { data: i, isLoading: n } = yt(s.id, { enabled: t }), a = (i == null ? void 0 : i.comment_likes) ?? [], o = ((c = s.count) == null ? void 0 : c.likes) ?? 0, l = o - a.length;
  return /* @__PURE__ */ e.jsx(oe, { open: t, onOpenChange: r, children: /* @__PURE__ */ e.jsxs(le, { "aria-describedby": void 0, children: [
    /* @__PURE__ */ e.jsx(ce, { children: /* @__PURE__ */ e.jsxs(de, { children: [
      o,
      " ",
      o === 1 ? "like" : "likes"
    ] }) }),
    /* @__PURE__ */ e.jsx("div", { className: "overflow-hidden rounded-md border p-3", children: /* @__PURE__ */ e.jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
      /* @__PURE__ */ e.jsx(
        $,
        {
          avatarImage: (d = s.member) == null ? void 0 : d.avatar_image,
          className: "shrink-0",
          memberId: (u = s.member) == null ? void 0 : u.id
        }
      ),
      /* @__PURE__ */ e.jsxs("div", { className: "flex min-w-0 flex-col overflow-hidden", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex min-w-0 items-center gap-1 text-sm", children: [
          /* @__PURE__ */ e.jsx("span", { className: "shrink-0 font-semibold", children: ((m = s.member) == null ? void 0 : m.name) || "Unknown" }),
          /* @__PURE__ */ e.jsx(ie, { className: "text-muted-foreground/50 shrink-0", size: 16 }),
          /* @__PURE__ */ e.jsx("span", { className: "shrink-0 text-muted-foreground", children: s.created_at && H(s.created_at) }),
          /* @__PURE__ */ e.jsx("span", { className: "shrink-0 text-muted-foreground", children: "on" }),
          /* @__PURE__ */ e.jsx("span", { className: "min-w-0 truncate font-medium text-gray-800 dark:text-gray-400", children: ((x = s.post) == null ? void 0 : x.title) || "Unknown post" })
        ] }),
        /* @__PURE__ */ e.jsx(
          "div",
          {
            dangerouslySetInnerHTML: { __html: s.html || "" },
            className: "prose mt-2 line-clamp-2 text-sm [&_*]:text-sm [&_*]:leading-[1.5em] [&_p]:m-0"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ e.jsx("div", { className: "-mx-1 max-h-64 overflow-y-auto px-1", children: n ? /* @__PURE__ */ e.jsx("div", { className: "flex justify-center py-4", children: /* @__PURE__ */ e.jsx(U, { size: "md" }) }) : /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-3 pb-1", children: [
      a.map((p) => {
        var f, j, g;
        return /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ e.jsxs("div", { className: "relative shrink-0", children: [
              /* @__PURE__ */ e.jsx(
                $,
                {
                  avatarImage: (f = p.member) == null ? void 0 : f.avatar_image,
                  memberId: (j = p.member) == null ? void 0 : j.id
                }
              ),
              /* @__PURE__ */ e.jsx("div", { className: "absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-pink-500 text-white", children: /* @__PURE__ */ e.jsx(we, { className: "size-2.5", fill: "currentColor" }) })
            ] }),
            /* @__PURE__ */ e.jsx("span", { className: "font-medium", children: ((g = p.member) == null ? void 0 : g.name) || "Deleted member" })
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "shrink-0 text-sm text-muted-foreground", children: H(p.created_at) })
        ] }, p.id);
      }),
      l > 0 && /* @__PURE__ */ e.jsxs("div", { className: "pt-1 text-center text-sm text-muted-foreground", children: [
        "and ",
        l,
        " more"
      ] })
    ] }) }),
    /* @__PURE__ */ e.jsx(me, { children: /* @__PURE__ */ e.jsx(S, { onClick: () => r(!1), children: "OK" }) })
  ] }) });
}
function Pt({ comment: s, open: t, onOpenChange: r }) {
  var l, c, d, u, m;
  const { data: i, isLoading: n } = Ct(s.id, { enabled: t }), a = (i == null ? void 0 : i.comment_reports) ?? [], o = ((l = s.count) == null ? void 0 : l.reports) ?? a.length;
  return /* @__PURE__ */ e.jsx(oe, { open: t, onOpenChange: r, children: /* @__PURE__ */ e.jsxs(le, { "aria-describedby": void 0, children: [
    /* @__PURE__ */ e.jsx(ce, { children: /* @__PURE__ */ e.jsxs(de, { children: [
      o,
      " ",
      o === 1 ? "report" : "reports"
    ] }) }),
    /* @__PURE__ */ e.jsx("div", { className: "overflow-hidden rounded-md border p-3", children: /* @__PURE__ */ e.jsxs("div", { className: "flex min-w-0 items-start gap-3", children: [
      /* @__PURE__ */ e.jsx(
        $,
        {
          avatarImage: (c = s.member) == null ? void 0 : c.avatar_image,
          className: "shrink-0",
          memberId: (d = s.member) == null ? void 0 : d.id
        }
      ),
      /* @__PURE__ */ e.jsxs("div", { className: "flex min-w-0 flex-col overflow-hidden", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex min-w-0 items-center gap-1 text-sm", children: [
          /* @__PURE__ */ e.jsx("span", { className: "shrink-0 font-semibold", children: ((u = s.member) == null ? void 0 : u.name) || "Unknown" }),
          /* @__PURE__ */ e.jsx(ie, { className: "text-muted-foreground/50 shrink-0", size: 16 }),
          /* @__PURE__ */ e.jsx("span", { className: "shrink-0 text-muted-foreground", children: s.created_at && H(s.created_at) }),
          /* @__PURE__ */ e.jsx("span", { className: "shrink-0 text-muted-foreground", children: "on" }),
          /* @__PURE__ */ e.jsx("span", { className: "min-w-0 truncate font-medium text-gray-800 dark:text-gray-400", children: ((m = s.post) == null ? void 0 : m.title) || "Unknown post" })
        ] }),
        /* @__PURE__ */ e.jsx(
          "div",
          {
            dangerouslySetInnerHTML: { __html: s.html || "" },
            className: "prose mt-2 line-clamp-2 text-sm [&_*]:text-sm [&_*]:leading-[1.5em] [&_p]:m-0"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ e.jsx("div", { className: "-mx-1 max-h-64 overflow-y-auto px-1", children: n ? /* @__PURE__ */ e.jsx("div", { className: "flex justify-center py-4", children: /* @__PURE__ */ e.jsx(U, { size: "md" }) }) : /* @__PURE__ */ e.jsx("div", { className: "flex flex-col gap-3 pb-1", children: a.map((x) => {
      var p, f, j;
      return /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "relative shrink-0", children: [
            /* @__PURE__ */ e.jsx(
              $,
              {
                avatarImage: (p = x.member) == null ? void 0 : p.avatar_image,
                memberId: (f = x.member) == null ? void 0 : f.id
              }
            ),
            /* @__PURE__ */ e.jsx("div", { className: "absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-red text-white", children: /* @__PURE__ */ e.jsx(ae, { className: "size-2.5", fill: "currentColor" }) })
          ] }),
          /* @__PURE__ */ e.jsx("span", { className: "font-medium", children: ((j = x.member) == null ? void 0 : j.name) || "Deleted member" })
        ] }),
        /* @__PURE__ */ e.jsx("span", { className: "shrink-0 text-sm text-muted-foreground", children: H(x.created_at) })
      ] }, x.id);
    }) }) }),
    /* @__PURE__ */ e.jsx(me, { children: /* @__PURE__ */ e.jsx(S, { onClick: () => r(!1), children: "OK" }) })
  ] }) });
}
function J({ icon: s, count: t, label: r, to: i, onClick: n, className: a, testId: o }) {
  const l = P("flex items-center gap-1 text-xs text-gray-800", a), c = /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    s,
    /* @__PURE__ */ e.jsx("span", { children: ns(t) })
  ] }), d = i || n;
  return /* @__PURE__ */ e.jsx(ee, { children: /* @__PURE__ */ e.jsxs(se, { children: [
    /* @__PURE__ */ e.jsx(te, { asChild: !0, children: i ? /* @__PURE__ */ e.jsx(
      ne,
      {
        className: P(l, "cursor-pointer hover:opacity-70"),
        "data-testid": o,
        to: i,
        onClick: (u) => {
          u.stopPropagation();
        },
        children: c
      }
    ) : n ? /* @__PURE__ */ e.jsx(
      "button",
      {
        className: P(l, "cursor-pointer hover:opacity-70"),
        "data-testid": o,
        type: "button",
        onClick: (u) => {
          u.stopPropagation(), n();
        },
        children: c
      }
    ) : /* @__PURE__ */ e.jsx("div", { className: l, "data-testid": o, children: c }) }),
    /* @__PURE__ */ e.jsx(re, { children: d ? `View ${r.toLowerCase()}` : r })
  ] }) });
}
function xe(s, t) {
  if (!t)
    return;
  const r = new URLSearchParams(s);
  return r.set("thread", `is:${t}`), `?${r.toString()}`;
}
function Xe({
  comment: s,
  className: t
}) {
  var f, j, g, v, b;
  const [r] = G(), [i, n] = R(!1), [a, o] = R(!1), l = xe(r, s.id), c = ((f = s.count) == null ? void 0 : f.direct_replies) ?? ((j = s.count) == null ? void 0 : j.replies) ?? ((g = s.replies) == null ? void 0 : g.length) ?? 0, d = ((v = s.count) == null ? void 0 : v.likes) ?? 0, u = ((b = s.count) == null ? void 0 : b.reports) ?? 0, m = c > 0, x = d > 0, p = u > 0;
  return /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    /* @__PURE__ */ e.jsxs("div", { className: P("flex items-center gap-6", t), children: [
      /* @__PURE__ */ e.jsx(
        J,
        {
          count: c,
          icon: /* @__PURE__ */ e.jsx(_s, { size: 16, strokeWidth: 1.5 }),
          label: "Replies",
          testId: "replies-metric",
          to: m ? l : void 0
        }
      ),
      /* @__PURE__ */ e.jsx(
        J,
        {
          count: d,
          icon: /* @__PURE__ */ e.jsx(we, { size: 16, strokeWidth: 1.5 }),
          label: "Likes",
          onClick: x ? () => n(!0) : void 0
        }
      ),
      /* @__PURE__ */ e.jsx(
        J,
        {
          className: p ? "font-semibold text-red" : void 0,
          count: u,
          icon: /* @__PURE__ */ e.jsx(ae, { size: 16, strokeWidth: 1.5 }),
          label: "Reports",
          onClick: p ? () => o(!0) : void 0
        }
      )
    ] }),
    /* @__PURE__ */ e.jsx(
      St,
      {
        comment: s,
        open: i,
        onOpenChange: n
      }
    ),
    /* @__PURE__ */ e.jsx(
      Pt,
      {
        comment: s,
        open: a,
        onOpenChange: o
      }
    )
  ] });
}
function Rt({ hasReplies: s }) {
  return s ? /* @__PURE__ */ e.jsx(
    "div",
    {
      className: "from-muted-foreground/20 mb-2 h-full w-px grow rounded bg-gradient-to-b from-70% to-transparent",
      "data-testid": "replies-line"
    }
  ) : null;
}
function Ze({ comment: s, isReply: t = !1, isSelectedComment: r = !1, selectedCommentId: i }) {
  var d, u, m, x, p, f, j, g;
  const [n] = G(), { mutate: a } = Qe(), { mutate: o } = Ke(), l = (((d = s.replies) == null ? void 0 : d.length) ?? 0) > 0 || (((u = s.count) == null ? void 0 : u.direct_replies) ?? ((m = s.count) == null ? void 0 : m.replies) ?? 0) > 0, c = !l || t ? "mb-7" : "mb-0";
  return /* @__PURE__ */ e.jsxs("div", { className: `flex w-full flex-row ${c}`, children: [
    /* @__PURE__ */ e.jsxs("div", { className: "mr-2 flex shrink-0 flex-col items-center justify-start md:mr-3", children: [
      /* @__PURE__ */ e.jsx(
        $,
        {
          avatarImage: (x = s.member) == null ? void 0 : x.avatar_image,
          className: "mb-3 shrink-0 md:mb-4",
          isHidden: s.status === "hidden",
          memberId: (p = s.member) == null ? void 0 : p.id
        }
      ),
      /* @__PURE__ */ e.jsx(Rt, { hasReplies: l && !t })
    ] }),
    /* @__PURE__ */ e.jsx("div", { className: "grow", children: /* @__PURE__ */ e.jsxs(
      "div",
      {
        className: "w-full",
        "data-testid": `comment-thread-row-${s.id}`,
        children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex min-w-0 flex-col", children: [
            /* @__PURE__ */ e.jsx(
              Ge,
              {
                canComment: (f = s.member) == null ? void 0 : f.can_comment,
                createdAt: s.created_at,
                isHidden: s.status === "hidden",
                memberId: (j = s.member) == null ? void 0 : j.id,
                memberName: (g = s.member) == null ? void 0 : g.name
              }
            ),
            s.in_reply_to_snippet && r && /* @__PURE__ */ e.jsxs("div", { className: `mb-1 line-clamp-1 text-sm ${s.status === "hidden" && "opacity-50"}`, children: [
              /* @__PURE__ */ e.jsx("span", { className: "text-muted-foreground", children: "Replied to:" }),
              " ",
              /* @__PURE__ */ e.jsx(
                ne,
                {
                  className: "text-sm font-normal text-muted-foreground hover:text-foreground",
                  "data-testid": "replied-to-link",
                  to: xe(n, s.in_reply_to_id || s.parent_id) || "",
                  onClick: (v) => {
                    v.stopPropagation();
                  },
                  children: s.in_reply_to_snippet
                }
              )
            ] }),
            /* @__PURE__ */ e.jsx(qe, { item: s }),
            /* @__PURE__ */ e.jsxs("div", { className: "mt-4 flex flex-row flex-wrap items-center gap-3", children: [
              s.status === "published" && /* @__PURE__ */ e.jsxs(S, { className: "text-gray-800", size: "sm", variant: "outline", onClick: () => a({ id: s.id }), children: [
                /* @__PURE__ */ e.jsx(_e, {}),
                /* @__PURE__ */ e.jsx("span", { className: "max-md:hidden", children: "Hide" })
              ] }),
              s.status === "hidden" && /* @__PURE__ */ e.jsxs(S, { className: "text-gray-800", size: "sm", variant: "outline", onClick: () => o({ id: s.id }), children: [
                /* @__PURE__ */ e.jsx(Se, {}),
                /* @__PURE__ */ e.jsx("span", { className: "max-md:hidden", children: "Show" })
              ] }),
              /* @__PURE__ */ e.jsx(
                Xe,
                {
                  comment: s
                }
              ),
              /* @__PURE__ */ e.jsx(
                Ye,
                {
                  comment: s
                }
              )
            ] })
          ] }),
          l && s.replies && /* @__PURE__ */ e.jsx("div", { className: "-ml-2 mb-4 mt-7 pl-2 md:-ml-3 md:mb-0 md:mt-8 md:pl-3", children: s.replies.map((v) => /* @__PURE__ */ e.jsx(
            Ze,
            {
              comment: v,
              isReply: !0,
              selectedCommentId: i
            },
            v.id
          )) })
        ]
      }
    ) })
  ] });
}
const Et = ({
  selectedComment: s,
  replies: t,
  selectedCommentId: r,
  fetchNextPage: i,
  hasNextPage: n,
  isFetchingNextPage: a
}) => {
  const o = { ...s, replies: t };
  return /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col", "data-testid": "comment-thread-list", children: [
    /* @__PURE__ */ e.jsx(
      Ze,
      {
        comment: o,
        isSelectedComment: !0,
        selectedCommentId: r
      }
    ),
    n && /* @__PURE__ */ e.jsx("div", { className: "flex justify-center pb-4", children: /* @__PURE__ */ e.jsx(
      S,
      {
        disabled: a,
        variant: "outline",
        onClick: () => i(),
        children: a ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
          /* @__PURE__ */ e.jsx(U, { size: "sm" }),
          "Loading..."
        ] }) : "Load more replies"
      }
    ) })
  ] });
}, It = ({
  commentId: s,
  open: t,
  onOpenChange: r
}) => {
  var g;
  const {
    data: i,
    isLoading: n,
    isError: a,
    fetchNextPage: o,
    hasNextPage: l,
    isFetchingNextPage: c
  } = kt(s ?? "", {
    enabled: t && !!s
  }), { data: d, isLoading: u, isError: m } = jt(s ?? "", {
    enabled: t && !!s
  }), x = n || u, p = m || a && !d, f = (g = d == null ? void 0 : d.comments) == null ? void 0 : g[0], j = (i == null ? void 0 : i.comments) || [];
  return /* @__PURE__ */ e.jsx(Us, { open: t, onOpenChange: r, children: /* @__PURE__ */ e.jsxs(Vs, { className: "overflow-y-auto px-6 pt-0 sm:max-w-[600px]", children: [
    /* @__PURE__ */ e.jsx(qs, { className: "bg-background/60 sticky top-0 z-40 -mx-6 p-6 backdrop-blur", children: /* @__PURE__ */ e.jsx(Ws, { className: "text-md", children: "Thread" }) }),
    (f == null ? void 0 : f.post) && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ e.jsx("h3", { className: "line-clamp-1 text-xl font-semibold text-foreground", children: f.post.title }),
          f.post.excerpt && /* @__PURE__ */ e.jsx("p", { className: "mt-1 line-clamp-2 text-sm text-muted-foreground", children: f.post.excerpt })
        ] }),
        f.post.feature_image && /* @__PURE__ */ e.jsx(
          "img",
          {
            alt: f.post.title || "Post feature image",
            className: "hidden aspect-video h-18 shrink-0 rounded object-cover lg:block",
            src: f.post.feature_image
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx(As, { className: "-mx-6 my-6 w-auto" })
    ] }),
    /* @__PURE__ */ e.jsx("div", { children: x ? /* @__PURE__ */ e.jsx("div", { className: "flex h-full items-center justify-center py-8", children: /* @__PURE__ */ e.jsx(U, { size: "lg" }) }) : p || !f ? /* @__PURE__ */ e.jsx("div", { className: "flex h-full items-center justify-center py-8", children: /* @__PURE__ */ e.jsx(
      Ie,
      {
        actions: /* @__PURE__ */ e.jsx(S, { variant: "outline", onClick: () => r(!1), children: "Back to comments" }),
        description: "This thread may have been deleted or doesn't exist.",
        title: "Thread not found",
        children: /* @__PURE__ */ e.jsx(Pe, {})
      }
    ) }) : /* @__PURE__ */ e.jsx(
      Et,
      {
        fetchNextPage: o,
        hasNextPage: l,
        isFetchingNextPage: c,
        replies: j,
        selectedComment: f,
        selectedCommentId: s ?? ""
      }
    ) })
  ] }) });
}, Ce = ({ height: s }) => /* @__PURE__ */ e.jsx("div", { "aria-hidden": "true", className: "flex", children: /* @__PURE__ */ e.jsx("div", { className: "flex", style: { height: s } }) }), Tt = I(function(t, r) {
  return /* @__PURE__ */ e.jsx(
    "div",
    {
      ref: r,
      ...t,
      "aria-hidden": "true",
      className: "relative flex flex-col",
      children: /* @__PURE__ */ e.jsx("div", { className: "relative z-10 h-24 animate-pulse", children: /* @__PURE__ */ e.jsx("div", { className: "h-full rounded-md bg-muted", "data-testid": "loading-placeholder" }) })
    }
  );
});
function Lt({
  items: s,
  totalItems: t,
  hasNextPage: r,
  isFetchingNextPage: i,
  fetchNextPage: n,
  onAddFilter: a,
  isLoading: o
}) {
  const l = _(null), [c, d] = G(), [u, m] = R(!1), [x, p] = R(null), { mutate: f } = Qe(), { mutate: j } = Ke(), g = (C) => {
    if (m(C), !C) {
      const k = new URLSearchParams(c);
      k.delete("thread"), d(k, { replace: !0 });
    }
  };
  A(() => {
    const C = c.get("thread");
    if (C) {
      const k = C.match(/^is:(.+)$/);
      if (k && k[1]) {
        const h = k[1];
        p(h), m(!0);
      } else
        m(!1), p(null);
    } else
      m(!1), p(null);
  }, [c]), hs({ parentRef: l, isLoading: o });
  const { visibleItems: v, spaceBefore: b, spaceAfter: N } = Ds({
    items: s,
    totalItems: t,
    hasNextPage: r,
    isFetchingNextPage: i,
    fetchNextPage: n,
    parentRef: l
  });
  return /* @__PURE__ */ e.jsxs("div", { ref: l, className: "overflow-hidden", children: [
    /* @__PURE__ */ e.jsx(
      "div",
      {
        className: "flex flex-col",
        "data-testid": "comments-list",
        children: /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ e.jsx(Ce, { height: b }),
          v.map(({ key: C, virtualItem: k, item: h, props: E }) => {
            var z, M, V, D, y, w, F, q, be;
            return k.index > s.length - 1 ? /* @__PURE__ */ e.jsx(Tt, { ...E }, C) : /* @__PURE__ */ e.jsxs(
              "div",
              {
                ...E,
                className: "hover:bg-muted/50 grid w-full grid-cols-1 items-start justify-between gap-4 border-b p-3 md:p-5 lg:grid-cols-[minmax(0,1fr)_144px]",
                "data-testid": "comment-list-row",
                onClick: () => {
                  u && g(!1);
                },
                children: [
                  /* @__PURE__ */ e.jsxs("div", { className: "flex items-start gap-3", children: [
                    /* @__PURE__ */ e.jsx(
                      $,
                      {
                        avatarImage: (z = h.member) == null ? void 0 : z.avatar_image,
                        isHidden: h.status === "hidden",
                        memberId: (M = h.member) == null ? void 0 : M.id
                      }
                    ),
                    /* @__PURE__ */ e.jsxs("div", { className: "flex min-w-0 flex-col", children: [
                      /* @__PURE__ */ e.jsx(
                        Ge,
                        {
                          canComment: (V = h.member) == null ? void 0 : V.can_comment,
                          createdAt: h.created_at,
                          isHidden: h.status === "hidden",
                          memberId: (D = h.member) == null ? void 0 : D.id,
                          memberName: (y = h.member) == null ? void 0 : y.name,
                          postTitle: (w = h.post) == null ? void 0 : w.title,
                          onAuthorClick: (F = h.member) != null && F.id ? () => a("author", h.member.id) : void 0,
                          onPostClick: (q = h.post) != null && q.id ? () => a("post", h.post.id) : void 0
                        }
                      ),
                      h.in_reply_to_snippet && /* @__PURE__ */ e.jsxs("div", { className: `mb-1 line-clamp-1 max-w-3xl text-sm ${h.status === "hidden" && "opacity-50"}`, children: [
                        /* @__PURE__ */ e.jsx("span", { className: "text-muted-foreground", children: "Replied to:" }),
                        " ",
                        /* @__PURE__ */ e.jsx(
                          ne,
                          {
                            className: "text-sm font-normal text-muted-foreground hover:text-foreground",
                            "data-testid": "replied-to-link",
                            to: xe(c, h.in_reply_to_id || h.parent_id) || "",
                            onClick: (es) => {
                              es.stopPropagation();
                            },
                            children: h.in_reply_to_snippet
                          }
                        )
                      ] }),
                      /* @__PURE__ */ e.jsx(qe, { item: h }),
                      /* @__PURE__ */ e.jsxs("div", { className: "mt-4 flex flex-row flex-nowrap items-center gap-3", children: [
                        h.status === "published" && /* @__PURE__ */ e.jsxs(S, { className: "text-foreground", size: "sm", variant: "outline", onClick: () => f({ id: h.id }), children: [
                          /* @__PURE__ */ e.jsx(_e, {}),
                          "Hide"
                        ] }),
                        h.status === "hidden" && /* @__PURE__ */ e.jsxs(S, { className: "text-foreground", size: "sm", variant: "outline", onClick: () => j({ id: h.id }), children: [
                          /* @__PURE__ */ e.jsx(Se, {}),
                          "Show"
                        ] }),
                        /* @__PURE__ */ e.jsx(
                          Xe,
                          {
                            className: "ml-2",
                            comment: h
                          }
                        ),
                        /* @__PURE__ */ e.jsx(
                          Ye,
                          {
                            comment: h
                          }
                        )
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ e.jsx("div", { children: (be = h.post) != null && be.feature_image ? /* @__PURE__ */ e.jsx(
                    "img",
                    {
                      alt: h.post.title || "Post feature image",
                      className: `hidden aspect-video w-36 rounded object-cover lg:block ${h.status === "hidden" && "opacity-50"}`,
                      src: h.post.feature_image
                    }
                  ) : null })
                ]
              },
              C
            );
          }),
          /* @__PURE__ */ e.jsx(Ce, { height: N })
        ] })
      }
    ),
    /* @__PURE__ */ e.jsx(
      It,
      {
        commentId: x,
        open: u,
        onOpenChange: g
      }
    )
  ] });
}
const Je = ["id", "status", "created_at", "body", "post", "author", "reported"];
function Dt(s) {
  const t = [];
  for (const r of s)
    if (r.values[0])
      switch (r.field) {
        case "id":
          t.push(`id:'${r.values[0]}'`);
          break;
        case "status":
          t.push(`status:${r.values[0]}`);
          break;
        case "created_at":
          if (r.operator === "before" && r.values[0])
            t.push(`created_at:<'${r.values[0]}'`);
          else if (r.operator === "after" && r.values[0])
            t.push(`created_at:>'${r.values[0]}'`);
          else if (r.operator === "is" && r.values[0]) {
            const a = String(r.values[0]), o = (/* @__PURE__ */ new Date(a + "T00:00:00")).toISOString(), l = (/* @__PURE__ */ new Date(a + "T23:59:59.999")).toISOString();
            t.push(`created_at:>='${o}'+created_at:<='${l}'`);
          }
          break;
        case "body":
          const n = r.values[0].replace(/'/g, "\\'");
          r.operator === "contains" ? t.push(`html:~'${n}'`) : r.operator === "not_contains" && t.push(`html:-~'${n}'`);
          break;
        case "post":
          r.operator === "is_not" ? t.push(`post_id:-${r.values[0]}`) : t.push(`post_id:${r.values[0]}`);
          break;
        case "author":
          r.operator === "is_not" ? t.push(`member_id:-${r.values[0]}`) : t.push(`member_id:${r.values[0]}`);
          break;
        case "reported":
          r.values[0] === "true" ? t.push("count.reports:>0") : r.values[0] === "false" && t.push("count.reports:0");
          break;
      }
  return t.length ? t.join("+") : void 0;
}
function Ft(s) {
  if (!s)
    return null;
  const t = s.indexOf(":");
  return t <= 0 ? null : {
    operator: s.substring(0, t),
    value: s.substring(t + 1)
  };
}
function Mt(s) {
  const t = [];
  for (const [r, i] of s.entries()) {
    if (!Je.includes(r) || !i)
      continue;
    const n = Ft(i);
    n && t.push({
      id: r,
      field: r,
      operator: n.operator,
      values: [n.value]
    });
  }
  return t;
}
function $t(s) {
  const t = new URLSearchParams();
  for (const r of s)
    if (Je.includes(r.field) && r.values[0] !== void 0) {
      const i = `${r.operator}:${String(r.values[0])}`;
      t.set(r.field, i);
    }
  return t;
}
function zt() {
  const [s, t] = G(), r = T(() => Mt(s), [s]), i = B((l, c = {}) => {
    const d = typeof l == "function" ? l(r) : l, u = $t(d), m = c.replace ?? !0;
    t(u, { replace: m });
  }, [r, t]), n = B(({ replace: l = !0 } = {}) => {
    t(new URLSearchParams(), { replace: l });
  }, [t]), a = T(() => Dt(r), [r]), o = T(() => r.length === 1 && r[0].field === "id", [r]);
  return { filters: r, nql: a, setFilters: i, clearFilters: n, isSingleIdFilter: o };
}
function Ot({ comments: s }) {
  return T(() => {
    var i, n, a;
    const t = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
    for (const o of s)
      (i = o.post) != null && i.id && ((n = o.post) != null && n.title) && t.set(o.post.id, {
        id: o.post.id,
        title: o.post.title
      }), (a = o.member) != null && a.id && r.set(o.member.id, {
        id: o.member.id,
        name: o.member.name,
        email: o.member.email
      });
    return {
      knownPosts: Array.from(t.values()),
      knownMembers: Array.from(r.values())
    };
  }, [s]);
}
const tr = () => {
  var g, v;
  const { filters: s, nql: t, setFilters: r, clearFilters: i, isSingleIdFilter: n } = zt(), a = B((b, N, C = "is") => {
    r((k) => [...k.filter((E) => E.field !== b), os(b, C, [N])], { replace: !1 });
  }, [r]), {
    data: o,
    isError: l,
    isFetching: c,
    isFetchingNextPage: d,
    isRefetching: u,
    fetchNextPage: m,
    hasNextPage: x
  } = We({
    searchParams: t ? { filter: t } : {},
    keepPreviousData: !0
  }), { knownPosts: p, knownMembers: f } = Ot({ comments: (o == null ? void 0 : o.comments) ?? [] }), j = c && !d && !u;
  return /* @__PURE__ */ e.jsxs(xt, { children: [
    /* @__PURE__ */ e.jsx(ft, { children: !n && /* @__PURE__ */ e.jsx(
      pt,
      {
        filters: s,
        knownMembers: f,
        knownPosts: p,
        onFiltersChange: r
      }
    ) }),
    /* @__PURE__ */ e.jsx(ct, { children: j ? /* @__PURE__ */ e.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ e.jsx(U, { size: "lg" }) }) : l ? /* @__PURE__ */ e.jsxs("div", { className: "mb-16 flex h-full flex-col items-center justify-center", children: [
      /* @__PURE__ */ e.jsx("h2", { className: "mb-2 text-xl font-medium", children: "Error loading comments" }),
      /* @__PURE__ */ e.jsx("p", { className: "mb-4 text-muted-foreground", children: "Please reload the page to try again" }),
      /* @__PURE__ */ e.jsx(S, { onClick: () => window.location.reload(), children: "Reload page" })
    ] }) : o != null && o.comments.length ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsx(
        Lt,
        {
          fetchNextPage: m,
          hasNextPage: x,
          isFetchingNextPage: d,
          isLoading: c && !d,
          items: (o == null ? void 0 : o.comments) ?? [],
          totalItems: ((v = (g = o == null ? void 0 : o.meta) == null ? void 0 : g.pagination) == null ? void 0 : v.total) ?? 0,
          onAddFilter: a
        }
      ),
      n && /* @__PURE__ */ e.jsx("div", { className: "flex justify-center py-8", children: /* @__PURE__ */ e.jsx(S, { variant: "outline", onClick: () => i({ replace: !1 }), children: "Show all comments" }) })
    ] }) : /* @__PURE__ */ e.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ e.jsx(
      Ie,
      {
        title: "No comments yet",
        children: /* @__PURE__ */ e.jsx(Pe, {})
      }
    ) }) })
  ] });
};
export {
  tr as default
};
//# sourceMappingURL=comments-DrcfFvM8.mjs.map

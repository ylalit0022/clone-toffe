import { aj as ce, ay as Pn, az as Te, aA as et, j as v, aB as Nr, aC as Cn, aD as On, s as Me, b6 as Tn, R as A, ai as Lr, bt as Rn, bu as Un, ah as tr, b as xe, c as rr, bv as Nn, e as Ln, k as nr, B as De, bw as or, b7 as Mn, bx as Ke, by as Bn, bz as Wn, bA as sr, O as Ve, bB as ir, bC as qn, bD as Hn, bE as ar } from "./index-DJ5p5ESW.mjs";
import { A as Kn } from "./at-sign-HA7s9_yo.mjs";
var Jn = Symbol.for("react.lazy"), tt = Pn[" use ".trim().toString()];
function Gn(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
function Mr(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === Jn && "_payload" in e && Gn(e._payload);
}
// @__NO_SIDE_EFFECTS__
function Yn(e) {
  const t = /* @__PURE__ */ Xn(e), r = ce((n, o) => {
    let { children: s, ...i } = n;
    Mr(s) && typeof tt == "function" && (s = tt(s._payload));
    const u = Te.toArray(s), d = u.find(eo);
    if (d) {
      const h = d.props.children, p = u.map((w) => w === d ? Te.count(h) > 1 ? Te.only(null) : et(h) ? h.props.children : null : w);
      return /* @__PURE__ */ v.jsx(t, { ...i, ref: o, children: et(h) ? Nr(h, void 0, p) : null });
    }
    return /* @__PURE__ */ v.jsx(t, { ...i, ref: o, children: s });
  });
  return r.displayName = `${e}.Slot`, r;
}
// @__NO_SIDE_EFFECTS__
function Xn(e) {
  const t = ce((r, n) => {
    let { children: o, ...s } = r;
    if (Mr(o) && typeof tt == "function" && (o = tt(o._payload)), et(o)) {
      const i = ro(o), u = to(s, o.props);
      return o.type !== Cn && (u.ref = n ? On(n, i) : i), Nr(o, u);
    }
    return Te.count(o) > 1 ? Te.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var Qn = Symbol("radix.slottable");
function eo(e) {
  return et(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Qn;
}
function to(e, t) {
  const r = { ...t };
  for (const n in t) {
    const o = e[n], s = t[n];
    /^on[A-Z]/.test(n) ? o && s ? r[n] = (...u) => {
      const d = s(...u);
      return o(...u), d;
    } : o && (r[n] = o) : n === "style" ? r[n] = { ...o, ...s } : n === "className" && (r[n] = [o, s].filter(Boolean).join(" "));
  }
  return { ...e, ...r };
}
function ro(e) {
  var n, o;
  let t = (n = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : n.get, r = t && "isReactWarning" in t && t.isReactWarning;
  return r ? e.ref : (t = (o = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : o.get, r = t && "isReactWarning" in t && t.isReactWarning, r ? e.props.ref : e.props.ref || e.ref);
}
var no = [
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
], oo = no.reduce((e, t) => {
  const r = /* @__PURE__ */ Yn(`Primitive.${t}`), n = ce((o, s) => {
    const { asChild: i, ...u } = o, d = i ? r : t;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ v.jsx(d, { ...u, ref: s });
  });
  return n.displayName = `Primitive.${t}`, { ...e, [t]: n };
}, {}), so = "Label", Br = ce((e, t) => /* @__PURE__ */ v.jsx(
  oo.label,
  {
    ...e,
    ref: t,
    onMouseDown: (r) => {
      var o;
      r.target.closest("button, input, select, textarea") || ((o = e.onMouseDown) == null || o.call(e, r), !r.defaultPrevented && r.detail > 1 && r.preventDefault());
    }
  }
));
Br.displayName = so;
var Wr = Br;
const io = Tn(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
), qr = ce(({ className: e, ...t }, r) => /* @__PURE__ */ v.jsx(
  Wr,
  {
    ref: r,
    className: Me(io(), e),
    ...t
  }
));
qr.displayName = Wr.displayName;
var Be = (e) => e.type === "checkbox", ve = (e) => e instanceof Date, Q = (e) => e == null;
const Hr = (e) => typeof e == "object";
var q = (e) => !Q(e) && !Array.isArray(e) && Hr(e) && !ve(e), Kr = (e) => q(e) && e.target ? Be(e.target) ? e.target.checked : e.target.value : e, ao = (e) => e.substring(0, e.search(/\.\d+(\.|$)/)) || e, Jr = (e, t) => e.has(ao(t)), uo = (e) => {
  const t = e.constructor && e.constructor.prototype;
  return q(t) && t.hasOwnProperty("isPrototypeOf");
}, St = typeof window < "u" && typeof window.HTMLElement < "u" && typeof document < "u";
function K(e) {
  let t;
  const r = Array.isArray(e), n = typeof FileList < "u" ? e instanceof FileList : !1;
  if (e instanceof Date)
    t = new Date(e);
  else if (!(St && (e instanceof Blob || n)) && (r || q(e)))
    if (t = r ? [] : Object.create(Object.getPrototypeOf(e)), !r && !uo(e))
      t = e;
    else
      for (const o in e)
        e.hasOwnProperty(o) && (t[o] = K(e[o]));
  else
    return e;
  return t;
}
var ut = (e) => /^\w*$/.test(e), M = (e) => e === void 0, jt = (e) => Array.isArray(e) ? e.filter(Boolean) : [], Dt = (e) => jt(e.replace(/["|']|\]/g, "").split(/\.|\[/)), _ = (e, t, r) => {
  if (!t || !q(e))
    return r;
  const n = (ut(t) ? [t] : Dt(t)).reduce((o, s) => Q(o) ? o : o[s], e);
  return M(n) || n === e ? M(e[t]) ? r : e[t] : n;
}, te = (e) => typeof e == "boolean", C = (e, t, r) => {
  let n = -1;
  const o = ut(t) ? [t] : Dt(t), s = o.length, i = s - 1;
  for (; ++n < s; ) {
    const u = o[n];
    let d = r;
    if (n !== i) {
      const h = e[u];
      d = q(h) || Array.isArray(h) ? h : isNaN(+o[n + 1]) ? {} : [];
    }
    if (u === "__proto__" || u === "constructor" || u === "prototype")
      return;
    e[u] = d, e = e[u];
  }
};
const rt = {
  BLUR: "blur",
  FOCUS_OUT: "focusout",
  CHANGE: "change"
}, ae = {
  onBlur: "onBlur",
  onChange: "onChange",
  onSubmit: "onSubmit",
  onTouched: "onTouched",
  all: "all"
}, pe = {
  max: "max",
  min: "min",
  maxLength: "maxLength",
  minLength: "minLength",
  pattern: "pattern",
  required: "required",
  validate: "validate"
}, Vt = A.createContext(null);
Vt.displayName = "HookFormContext";
const ct = () => A.useContext(Vt), co = (e) => {
  const { children: t, ...r } = e;
  return A.createElement(Vt.Provider, { value: r }, t);
};
var Gr = (e, t, r, n = !0) => {
  const o = {
    defaultValues: t._defaultValues
  };
  for (const s in e)
    Object.defineProperty(o, s, {
      get: () => {
        const i = s;
        return t._proxyFormState[i] !== ae.all && (t._proxyFormState[i] = !n || ae.all), r && (r[i] = !0), e[i];
      }
    });
  return o;
};
const Pt = typeof window < "u" ? A.useLayoutEffect : A.useEffect;
function lo(e) {
  const t = ct(), { control: r = t.control, disabled: n, name: o, exact: s } = e || {}, [i, u] = A.useState(r._formState), d = A.useRef({
    isDirty: !1,
    isLoading: !1,
    dirtyFields: !1,
    touchedFields: !1,
    validatingFields: !1,
    isValidating: !1,
    isValid: !1,
    errors: !1
  });
  return Pt(() => r._subscribe({
    name: o,
    formState: d.current,
    exact: s,
    callback: (h) => {
      !n && u({
        ...r._formState,
        ...h
      });
    }
  }), [o, n, s]), A.useEffect(() => {
    d.current.isValid && r._setValid(!0);
  }, [r]), A.useMemo(() => Gr(i, r, d.current, !1), [i, r]);
}
var re = (e) => typeof e == "string", Yr = (e, t, r, n, o) => re(e) ? (n && t.watch.add(e), _(r, e, o)) : Array.isArray(e) ? e.map((s) => (n && t.watch.add(s), _(r, s))) : (n && (t.watchAll = !0), r), xt = (e) => Q(e) || !Hr(e);
function me(e, t, r = /* @__PURE__ */ new WeakSet()) {
  if (xt(e) || xt(t))
    return e === t;
  if (ve(e) && ve(t))
    return e.getTime() === t.getTime();
  const n = Object.keys(e), o = Object.keys(t);
  if (n.length !== o.length)
    return !1;
  if (r.has(e) || r.has(t))
    return !0;
  r.add(e), r.add(t);
  for (const s of n) {
    const i = e[s];
    if (!o.includes(s))
      return !1;
    if (s !== "ref") {
      const u = t[s];
      if (ve(i) && ve(u) || q(i) && q(u) || Array.isArray(i) && Array.isArray(u) ? !me(i, u, r) : i !== u)
        return !1;
    }
  }
  return !0;
}
function fo(e) {
  const t = ct(), { control: r = t.control, name: n, defaultValue: o, disabled: s, exact: i, compute: u } = e || {}, d = A.useRef(o), h = A.useRef(u), p = A.useRef(void 0);
  h.current = u;
  const w = A.useMemo(() => r._getWatch(n, d.current), [r, n]), [b, F] = A.useState(h.current ? h.current(w) : w);
  return Pt(() => r._subscribe({
    name: n,
    formState: {
      values: !0
    },
    exact: i,
    callback: (D) => {
      if (!s) {
        const I = Yr(n, r._names, D.values || r._formValues, !1, d.current);
        if (h.current) {
          const B = h.current(I);
          me(B, p.current) || (F(B), p.current = B);
        } else
          F(I);
      }
    }
  }), [r, s, n, i]), A.useEffect(() => r._removeUnmounted()), b;
}
function ho(e) {
  const t = ct(), { name: r, disabled: n, control: o = t.control, shouldUnregister: s, defaultValue: i } = e, u = Jr(o._names.array, r), d = A.useMemo(() => _(o._formValues, r, _(o._defaultValues, r, i)), [o, r, i]), h = fo({
    control: o,
    name: r,
    defaultValue: d,
    exact: !0
  }), p = lo({
    control: o,
    name: r,
    exact: !0
  }), w = A.useRef(e), b = A.useRef(void 0), F = A.useRef(o.register(r, {
    ...e.rules,
    value: h,
    ...te(e.disabled) ? { disabled: e.disabled } : {}
  }));
  w.current = e;
  const D = A.useMemo(() => Object.defineProperties({}, {
    invalid: {
      enumerable: !0,
      get: () => !!_(p.errors, r)
    },
    isDirty: {
      enumerable: !0,
      get: () => !!_(p.dirtyFields, r)
    },
    isTouched: {
      enumerable: !0,
      get: () => !!_(p.touchedFields, r)
    },
    isValidating: {
      enumerable: !0,
      get: () => !!_(p.validatingFields, r)
    },
    error: {
      enumerable: !0,
      get: () => _(p.errors, r)
    }
  }), [p, r]), I = A.useCallback((S) => F.current.onChange({
    target: {
      value: Kr(S),
      name: r
    },
    type: rt.CHANGE
  }), [r]), B = A.useCallback(() => F.current.onBlur({
    target: {
      value: _(o._formValues, r),
      name: r
    },
    type: rt.BLUR
  }), [r, o._formValues]), O = A.useCallback((S) => {
    const V = _(o._fields, r);
    V && S && (V._f.ref = {
      focus: () => S.focus && S.focus(),
      select: () => S.select && S.select(),
      setCustomValidity: (j) => S.setCustomValidity(j),
      reportValidity: () => S.reportValidity()
    });
  }, [o._fields, r]), E = A.useMemo(() => ({
    name: r,
    value: h,
    ...te(n) || p.disabled ? { disabled: p.disabled || n } : {},
    onChange: I,
    onBlur: B,
    ref: O
  }), [r, n, p.disabled, I, B, O, h]);
  return A.useEffect(() => {
    const S = o._options.shouldUnregister || s, V = b.current;
    V && V !== r && !u && o.unregister(V), o.register(r, {
      ...w.current.rules,
      ...te(w.current.disabled) ? { disabled: w.current.disabled } : {}
    });
    const j = (ie, ne) => {
      const he = _(o._fields, ie);
      he && he._f && (he._f.mount = ne);
    };
    if (j(r, !0), S) {
      const ie = K(_(o._options.defaultValues, r, w.current.defaultValue));
      C(o._defaultValues, r, ie), M(_(o._formValues, r)) && C(o._formValues, r, ie);
    }
    return !u && o.register(r), b.current = r, () => {
      (u ? S && !o._state.action : S) ? o.unregister(r) : j(r, !1);
    };
  }, [r, o, u, s]), A.useEffect(() => {
    o._setDisabledField({
      disabled: n,
      name: r
    });
  }, [n, r, o]), A.useMemo(() => ({
    field: E,
    formState: p,
    fieldState: D
  }), [E, p, D]);
}
const po = (e) => e.render(ho(e));
var Ct = (e, t, r, n, o) => t ? {
  ...r[e],
  types: {
    ...r[e] && r[e].types ? r[e].types : {},
    [n]: o || !0
  }
} : {}, Re = (e) => Array.isArray(e) ? e : [e], ur = () => {
  let e = [];
  return {
    get observers() {
      return e;
    },
    next: (o) => {
      for (const s of e)
        s.next && s.next(o);
    },
    subscribe: (o) => (e.push(o), {
      unsubscribe: () => {
        e = e.filter((s) => s !== o);
      }
    }),
    unsubscribe: () => {
      e = [];
    }
  };
};
function Xr(e, t) {
  const r = {};
  for (const n in e)
    if (e.hasOwnProperty(n)) {
      const o = e[n], s = t[n];
      if (o && q(o) && s) {
        const i = Xr(o, s);
        q(i) && (r[n] = i);
      } else e[n] && (r[n] = s);
    }
  return r;
}
var X = (e) => q(e) && !Object.keys(e).length, Ot = (e) => e.type === "file", ue = (e) => typeof e == "function", nt = (e) => {
  if (!St)
    return !1;
  const t = e ? e.ownerDocument : 0;
  return e instanceof (t && t.defaultView ? t.defaultView.HTMLElement : HTMLElement);
}, Qr = (e) => e.type === "select-multiple", Tt = (e) => e.type === "radio", mo = (e) => Tt(e) || Be(e), zt = (e) => nt(e) && e.isConnected;
function go(e, t) {
  const r = t.slice(0, -1).length;
  let n = 0;
  for (; n < r; )
    e = M(e) ? n++ : e[t[n++]];
  return e;
}
function _o(e) {
  for (const t in e)
    if (e.hasOwnProperty(t) && !M(e[t]))
      return !1;
  return !0;
}
function W(e, t) {
  const r = Array.isArray(t) ? t : ut(t) ? [t] : Dt(t), n = r.length === 1 ? e : go(e, r), o = r.length - 1, s = r[o];
  return n && delete n[s], o !== 0 && (q(n) && X(n) || Array.isArray(n) && _o(n)) && W(e, r.slice(0, -1)), e;
}
var vo = (e) => {
  for (const t in e)
    if (ue(e[t]))
      return !0;
  return !1;
};
function en(e) {
  return Array.isArray(e) || q(e) && !vo(e);
}
function $t(e, t = {}) {
  for (const r in e)
    en(e[r]) ? (t[r] = Array.isArray(e[r]) ? [] : {}, $t(e[r], t[r])) : M(e[r]) || (t[r] = !0);
  return t;
}
function Ze(e, t, r) {
  r || (r = $t(t));
  for (const n in e)
    en(e[n]) ? M(t) || xt(r[n]) ? r[n] = $t(e[n], Array.isArray(e[n]) ? [] : {}) : Ze(e[n], Q(t) ? {} : t[n], r[n]) : r[n] = !me(e[n], t[n]);
  return r;
}
const cr = {
  value: !1,
  isValid: !1
}, lr = { value: !0, isValid: !0 };
var tn = (e) => {
  if (Array.isArray(e)) {
    if (e.length > 1) {
      const t = e.filter((r) => r && r.checked && !r.disabled).map((r) => r.value);
      return { value: t, isValid: !!t.length };
    }
    return e[0].checked && !e[0].disabled ? (
      // @ts-expect-error expected to work in the browser
      e[0].attributes && !M(e[0].attributes.value) ? M(e[0].value) || e[0].value === "" ? lr : { value: e[0].value, isValid: !0 } : lr
    ) : cr;
  }
  return cr;
}, rn = (e, { valueAsNumber: t, valueAsDate: r, setValueAs: n }) => M(e) ? e : t ? e === "" ? NaN : e && +e : r && re(e) ? new Date(e) : n ? n(e) : e;
const dr = {
  isValid: !1,
  value: null
};
var nn = (e) => Array.isArray(e) ? e.reduce((t, r) => r && r.checked && !r.disabled ? {
  isValid: !0,
  value: r.value
} : t, dr) : dr;
function fr(e) {
  const t = e.ref;
  return Ot(t) ? t.files : Tt(t) ? nn(e.refs).value : Qr(t) ? [...t.selectedOptions].map(({ value: r }) => r) : Be(t) ? tn(e.refs).value : rn(M(t.value) ? e.ref.value : t.value, e);
}
var yo = (e, t, r, n) => {
  const o = {};
  for (const s of e) {
    const i = _(t, s);
    i && C(o, s, i._f);
  }
  return {
    criteriaMode: r,
    names: [...e],
    fields: o,
    shouldUseNativeValidation: n
  };
}, ot = (e) => e instanceof RegExp, Pe = (e) => M(e) ? e : ot(e) ? e.source : q(e) ? ot(e.value) ? e.value.source : e.value : e, hr = (e) => ({
  isOnSubmit: !e || e === ae.onSubmit,
  isOnBlur: e === ae.onBlur,
  isOnChange: e === ae.onChange,
  isOnAll: e === ae.all,
  isOnTouch: e === ae.onTouched
});
const pr = "AsyncFunction";
var bo = (e) => !!e && !!e.validate && !!(ue(e.validate) && e.validate.constructor.name === pr || q(e.validate) && Object.values(e.validate).find((t) => t.constructor.name === pr)), wo = (e) => e.mount && (e.required || e.min || e.max || e.maxLength || e.minLength || e.pattern || e.validate), mr = (e, t, r) => !r && (t.watchAll || t.watch.has(e) || [...t.watch].some((n) => e.startsWith(n) && /^\.\w+/.test(e.slice(n.length))));
const Ue = (e, t, r, n) => {
  for (const o of r || Object.keys(e)) {
    const s = _(e, o);
    if (s) {
      const { _f: i, ...u } = s;
      if (i) {
        if (i.refs && i.refs[0] && t(i.refs[0], o) && !n)
          return !0;
        if (i.ref && t(i.ref, i.name) && !n)
          return !0;
        if (Ue(u, t))
          break;
      } else if (q(u) && Ue(u, t))
        break;
    }
  }
};
function gr(e, t, r) {
  const n = _(e, r);
  if (n || ut(r))
    return {
      error: n,
      name: r
    };
  const o = r.split(".");
  for (; o.length; ) {
    const s = o.join("."), i = _(t, s), u = _(e, s);
    if (i && !Array.isArray(i) && r !== s)
      return { name: r };
    if (u && u.type)
      return {
        name: s,
        error: u
      };
    if (u && u.root && u.root.type)
      return {
        name: `${s}.root`,
        error: u.root
      };
    o.pop();
  }
  return {
    name: r
  };
}
var ko = (e, t, r, n) => {
  r(e);
  const { name: o, ...s } = e;
  return X(s) || Object.keys(s).length >= Object.keys(t).length || Object.keys(s).find((i) => t[i] === (!n || ae.all));
}, zo = (e, t, r) => !e || !t || e === t || Re(e).some((n) => n && (r ? n === t : n.startsWith(t) || t.startsWith(n))), xo = (e, t, r, n, o) => o.isOnAll ? !1 : !r && o.isOnTouch ? !(t || e) : (r ? n.isOnBlur : o.isOnBlur) ? !e : (r ? n.isOnChange : o.isOnChange) ? e : !0, $o = (e, t) => !jt(_(e, t)).length && W(e, t), Zo = (e, t, r) => {
  const n = Re(_(e, r));
  return C(n, "root", t[r]), C(e, r, n), e;
};
function _r(e, t, r = "validate") {
  if (re(e) || Array.isArray(e) && e.every(re) || te(e) && !e)
    return {
      type: r,
      message: re(e) ? e : "",
      ref: t
    };
}
var $e = (e) => q(e) && !ot(e) ? e : {
  value: e,
  message: ""
}, vr = async (e, t, r, n, o, s) => {
  const { ref: i, refs: u, required: d, maxLength: h, minLength: p, min: w, max: b, pattern: F, validate: D, name: I, valueAsNumber: B, mount: O } = e._f, E = _(r, I);
  if (!O || t.has(I))
    return {};
  const S = u ? u[0] : i, V = (z) => {
    o && S.reportValidity && (S.setCustomValidity(te(z) ? "" : z || ""), S.reportValidity());
  }, j = {}, ie = Tt(i), ne = Be(i), he = ie || ne, ee = (B || Ot(i)) && M(i.value) && M(E) || nt(i) && i.value === "" || E === "" || Array.isArray(E) && !E.length, le = Ct.bind(null, I, n, j), k = (z, Z, U, H = pe.maxLength, Y = pe.minLength) => {
    const de = z ? Z : U;
    j[I] = {
      type: z ? H : Y,
      message: de,
      ref: i,
      ...le(z ? H : Y, de)
    };
  };
  if (s ? !Array.isArray(E) || !E.length : d && (!he && (ee || Q(E)) || te(E) && !E || ne && !tn(u).isValid || ie && !nn(u).isValid)) {
    const { value: z, message: Z } = re(d) ? { value: !!d, message: d } : $e(d);
    if (z && (j[I] = {
      type: pe.required,
      message: Z,
      ref: S,
      ...le(pe.required, Z)
    }, !n))
      return V(Z), j;
  }
  if (!ee && (!Q(w) || !Q(b))) {
    let z, Z;
    const U = $e(b), H = $e(w);
    if (!Q(E) && !isNaN(E)) {
      const Y = i.valueAsNumber || E && +E;
      Q(U.value) || (z = Y > U.value), Q(H.value) || (Z = Y < H.value);
    } else {
      const Y = i.valueAsDate || new Date(E), de = (qe) => /* @__PURE__ */ new Date((/* @__PURE__ */ new Date()).toDateString() + " " + qe), je = i.type == "time", ze = i.type == "week";
      re(U.value) && E && (z = je ? de(E) > de(U.value) : ze ? E > U.value : Y > new Date(U.value)), re(H.value) && E && (Z = je ? de(E) < de(H.value) : ze ? E < H.value : Y < new Date(H.value));
    }
    if ((z || Z) && (k(!!z, U.message, H.message, pe.max, pe.min), !n))
      return V(j[I].message), j;
  }
  if ((h || p) && !ee && (re(E) || s && Array.isArray(E))) {
    const z = $e(h), Z = $e(p), U = !Q(z.value) && E.length > +z.value, H = !Q(Z.value) && E.length < +Z.value;
    if ((U || H) && (k(U, z.message, Z.message), !n))
      return V(j[I].message), j;
  }
  if (F && !ee && re(E)) {
    const { value: z, message: Z } = $e(F);
    if (ot(z) && !E.match(z) && (j[I] = {
      type: pe.pattern,
      message: Z,
      ref: i,
      ...le(pe.pattern, Z)
    }, !n))
      return V(Z), j;
  }
  if (D) {
    if (ue(D)) {
      const z = await D(E, r), Z = _r(z, S);
      if (Z && (j[I] = {
        ...Z,
        ...le(pe.validate, Z.message)
      }, !n))
        return V(Z.message), j;
    } else if (q(D)) {
      let z = {};
      for (const Z in D) {
        if (!X(z) && !n)
          break;
        const U = _r(await D[Z](E, r), S, Z);
        U && (z = {
          ...U,
          ...le(Z, U.message)
        }, V(U.message), n && (j[I] = z));
      }
      if (!X(z) && (j[I] = {
        ref: S,
        ...z
      }, !n))
        return j;
    }
  }
  return V(!0), j;
};
const Eo = {
  mode: ae.onSubmit,
  reValidateMode: ae.onChange,
  shouldFocusError: !0
};
function Ao(e = {}) {
  let t = {
    ...Eo,
    ...e
  }, r = {
    submitCount: 0,
    isDirty: !1,
    isReady: !1,
    isLoading: ue(t.defaultValues),
    isValidating: !1,
    isSubmitted: !1,
    isSubmitting: !1,
    isSubmitSuccessful: !1,
    isValid: !1,
    touchedFields: {},
    dirtyFields: {},
    validatingFields: {},
    errors: t.errors || {},
    disabled: t.disabled || !1
  }, n = {}, o = q(t.defaultValues) || q(t.values) ? K(t.defaultValues || t.values) || {} : {}, s = t.shouldUnregister ? {} : K(o), i = {
    action: !1,
    mount: !1,
    watch: !1
  }, u = {
    mount: /* @__PURE__ */ new Set(),
    disabled: /* @__PURE__ */ new Set(),
    unMount: /* @__PURE__ */ new Set(),
    array: /* @__PURE__ */ new Set(),
    watch: /* @__PURE__ */ new Set()
  }, d, h = 0;
  const p = {
    isDirty: !1,
    dirtyFields: !1,
    validatingFields: !1,
    touchedFields: !1,
    isValidating: !1,
    isValid: !1,
    errors: !1
  };
  let w = {
    ...p
  };
  const b = {
    array: ur(),
    state: ur()
  }, F = t.criteriaMode === ae.all, D = (a) => (c) => {
    clearTimeout(h), h = setTimeout(a, c);
  }, I = async (a) => {
    if (!t.disabled && (p.isValid || w.isValid || a)) {
      const c = t.resolver ? X((await ne()).errors) : await ee(n, !0);
      c !== r.isValid && b.state.next({
        isValid: c
      });
    }
  }, B = (a, c) => {
    !t.disabled && (p.isValidating || p.validatingFields || w.isValidating || w.validatingFields) && ((a || Array.from(u.mount)).forEach((l) => {
      l && (c ? C(r.validatingFields, l, c) : W(r.validatingFields, l));
    }), b.state.next({
      validatingFields: r.validatingFields,
      isValidating: !X(r.validatingFields)
    }));
  }, O = (a, c = [], l, y, g = !0, m = !0) => {
    if (y && l && !t.disabled) {
      if (i.action = !0, m && Array.isArray(_(n, a))) {
        const x = l(_(n, a), y.argA, y.argB);
        g && C(n, a, x);
      }
      if (m && Array.isArray(_(r.errors, a))) {
        const x = l(_(r.errors, a), y.argA, y.argB);
        g && C(r.errors, a, x), $o(r.errors, a);
      }
      if ((p.touchedFields || w.touchedFields) && m && Array.isArray(_(r.touchedFields, a))) {
        const x = l(_(r.touchedFields, a), y.argA, y.argB);
        g && C(r.touchedFields, a, x);
      }
      (p.dirtyFields || w.dirtyFields) && (r.dirtyFields = Ze(o, s)), b.state.next({
        name: a,
        isDirty: k(a, c),
        dirtyFields: r.dirtyFields,
        errors: r.errors,
        isValid: r.isValid
      });
    } else
      C(s, a, c);
  }, E = (a, c) => {
    C(r.errors, a, c), b.state.next({
      errors: r.errors
    });
  }, S = (a) => {
    r.errors = a, b.state.next({
      errors: r.errors,
      isValid: !1
    });
  }, V = (a, c, l, y) => {
    const g = _(n, a);
    if (g) {
      const m = _(s, a, M(l) ? _(o, a) : l);
      M(m) || y && y.defaultChecked || c ? C(s, a, c ? m : fr(g._f)) : U(a, m), i.mount && I();
    }
  }, j = (a, c, l, y, g) => {
    let m = !1, x = !1;
    const P = {
      name: a
    };
    if (!t.disabled) {
      if (!l || y) {
        (p.isDirty || w.isDirty) && (x = r.isDirty, r.isDirty = P.isDirty = k(), m = x !== P.isDirty);
        const T = me(_(o, a), c);
        x = !!_(r.dirtyFields, a), T ? W(r.dirtyFields, a) : C(r.dirtyFields, a, !0), P.dirtyFields = r.dirtyFields, m = m || (p.dirtyFields || w.dirtyFields) && x !== !T;
      }
      if (l) {
        const T = _(r.touchedFields, a);
        T || (C(r.touchedFields, a, l), P.touchedFields = r.touchedFields, m = m || (p.touchedFields || w.touchedFields) && T !== l);
      }
      m && g && b.state.next(P);
    }
    return m ? P : {};
  }, ie = (a, c, l, y) => {
    const g = _(r.errors, a), m = (p.isValid || w.isValid) && te(c) && r.isValid !== c;
    if (t.delayError && l ? (d = D(() => E(a, l)), d(t.delayError)) : (clearTimeout(h), d = null, l ? C(r.errors, a, l) : W(r.errors, a)), (l ? !me(g, l) : g) || !X(y) || m) {
      const x = {
        ...y,
        ...m && te(c) ? { isValid: c } : {},
        errors: r.errors,
        name: a
      };
      r = {
        ...r,
        ...x
      }, b.state.next(x);
    }
  }, ne = async (a) => {
    B(a, !0);
    const c = await t.resolver(s, t.context, yo(a || u.mount, n, t.criteriaMode, t.shouldUseNativeValidation));
    return B(a), c;
  }, he = async (a) => {
    const { errors: c } = await ne(a);
    if (a)
      for (const l of a) {
        const y = _(c, l);
        y ? C(r.errors, l, y) : W(r.errors, l);
      }
    else
      r.errors = c;
    return c;
  }, ee = async (a, c, l = {
    valid: !0
  }) => {
    for (const y in a) {
      const g = a[y];
      if (g) {
        const { _f: m, ...x } = g;
        if (m) {
          const P = u.array.has(m.name), T = g._f && bo(g._f);
          T && p.validatingFields && B([m.name], !0);
          const oe = await vr(g, u.disabled, s, F, t.shouldUseNativeValidation && !c, P);
          if (T && p.validatingFields && B([m.name]), oe[m.name] && (l.valid = !1, c))
            break;
          !c && (_(oe, m.name) ? P ? Zo(r.errors, oe, m.name) : C(r.errors, m.name, oe[m.name]) : W(r.errors, m.name));
        }
        !X(x) && await ee(x, c, l);
      }
    }
    return l.valid;
  }, le = () => {
    for (const a of u.unMount) {
      const c = _(n, a);
      c && (c._f.refs ? c._f.refs.every((l) => !zt(l)) : !zt(c._f.ref)) && vt(a);
    }
    u.unMount = /* @__PURE__ */ new Set();
  }, k = (a, c) => !t.disabled && (a && c && C(s, a, c), !me(qe(), o)), z = (a, c, l) => Yr(a, u, {
    ...i.mount ? s : M(c) ? o : re(a) ? { [a]: c } : c
  }, l, c), Z = (a) => jt(_(i.mount ? s : o, a, t.shouldUnregister ? _(o, a, []) : [])), U = (a, c, l = {}) => {
    const y = _(n, a);
    let g = c;
    if (y) {
      const m = y._f;
      m && (!m.disabled && C(s, a, rn(c, m)), g = nt(m.ref) && Q(c) ? "" : c, Qr(m.ref) ? [...m.ref.options].forEach((x) => x.selected = g.includes(x.value)) : m.refs ? Be(m.ref) ? m.refs.forEach((x) => {
        (!x.defaultChecked || !x.disabled) && (Array.isArray(g) ? x.checked = !!g.find((P) => P === x.value) : x.checked = g === x.value || !!g);
      }) : m.refs.forEach((x) => x.checked = x.value === g) : Ot(m.ref) ? m.ref.value = "" : (m.ref.value = g, m.ref.type || b.state.next({
        name: a,
        values: K(s)
      })));
    }
    (l.shouldDirty || l.shouldTouch) && j(a, g, l.shouldTouch, l.shouldDirty, !0), l.shouldValidate && ze(a);
  }, H = (a, c, l) => {
    for (const y in c) {
      if (!c.hasOwnProperty(y))
        return;
      const g = c[y], m = a + "." + y, x = _(n, m);
      (u.array.has(a) || q(g) || x && !x._f) && !ve(g) ? H(m, g, l) : U(m, g, l);
    }
  }, Y = (a, c, l = {}) => {
    const y = _(n, a), g = u.array.has(a), m = K(c);
    C(s, a, m), g ? (b.array.next({
      name: a,
      values: K(s)
    }), (p.isDirty || p.dirtyFields || w.isDirty || w.dirtyFields) && l.shouldDirty && b.state.next({
      name: a,
      dirtyFields: Ze(o, s),
      isDirty: k(a, m)
    })) : y && !y._f && !Q(m) ? H(a, m, l) : U(a, m, l), mr(a, u) && b.state.next({ ...r, name: a }), b.state.next({
      name: i.mount ? a : void 0,
      values: K(s)
    });
  }, de = async (a) => {
    i.mount = !0;
    const c = a.target;
    let l = c.name, y = !0;
    const g = _(n, l), m = (T) => {
      y = Number.isNaN(T) || ve(T) && isNaN(T.getTime()) || me(T, _(s, l, T));
    }, x = hr(t.mode), P = hr(t.reValidateMode);
    if (g) {
      let T, oe;
      const He = c.type ? fr(g._f) : Kr(a), ge = a.type === rt.BLUR || a.type === rt.FOCUS_OUT, jn = !wo(g._f) && !t.resolver && !_(r.errors, l) && !g._f.deps || xo(ge, _(r.touchedFields, l), r.isSubmitted, P, x), wt = mr(l, u, ge);
      C(s, l, He), ge ? (!c || !c.readOnly) && (g._f.onBlur && g._f.onBlur(a), d && d(0)) : g._f.onChange && g._f.onChange(a);
      const kt = j(l, He, ge), Dn = !X(kt) || wt;
      if (!ge && b.state.next({
        name: l,
        type: a.type,
        values: K(s)
      }), jn)
        return (p.isValid || w.isValid) && (t.mode === "onBlur" ? ge && I() : ge || I()), Dn && b.state.next({ name: l, ...wt ? {} : kt });
      if (!ge && wt && b.state.next({ ...r }), t.resolver) {
        const { errors: Qt } = await ne([l]);
        if (m(He), y) {
          const Vn = gr(r.errors, n, l), er = gr(Qt, n, Vn.name || l);
          T = er.error, l = er.name, oe = X(Qt);
        }
      } else
        B([l], !0), T = (await vr(g, u.disabled, s, F, t.shouldUseNativeValidation))[l], B([l]), m(He), y && (T ? oe = !1 : (p.isValid || w.isValid) && (oe = await ee(n, !0)));
      y && (g._f.deps && (!Array.isArray(g._f.deps) || g._f.deps.length > 0) && ze(g._f.deps), ie(l, oe, T, kt));
    }
  }, je = (a, c) => {
    if (_(r.errors, c) && a.focus)
      return a.focus(), 1;
  }, ze = async (a, c = {}) => {
    let l, y;
    const g = Re(a);
    if (t.resolver) {
      const m = await he(M(a) ? a : g);
      l = X(m), y = a ? !g.some((x) => _(m, x)) : l;
    } else a ? (y = (await Promise.all(g.map(async (m) => {
      const x = _(n, m);
      return await ee(x && x._f ? { [m]: x } : x);
    }))).every(Boolean), !(!y && !r.isValid) && I()) : y = l = await ee(n);
    return b.state.next({
      ...!re(a) || (p.isValid || w.isValid) && l !== r.isValid ? {} : { name: a },
      ...t.resolver || !a ? { isValid: l } : {},
      errors: r.errors
    }), c.shouldFocus && !y && Ue(n, je, a ? g : u.mount), y;
  }, qe = (a, c) => {
    let l = {
      ...i.mount ? s : o
    };
    return c && (l = Xr(c.dirtyFields ? r.dirtyFields : r.touchedFields, l)), M(a) ? l : re(a) ? _(l, a) : a.map((y) => _(l, y));
  }, Wt = (a, c) => ({
    invalid: !!_((c || r).errors, a),
    isDirty: !!_((c || r).dirtyFields, a),
    error: _((c || r).errors, a),
    isValidating: !!_(r.validatingFields, a),
    isTouched: !!_((c || r).touchedFields, a)
  }), $n = (a) => {
    a && Re(a).forEach((c) => W(r.errors, c)), b.state.next({
      errors: a ? r.errors : {}
    });
  }, qt = (a, c, l) => {
    const y = (_(n, a, { _f: {} })._f || {}).ref, g = _(r.errors, a) || {}, { ref: m, message: x, type: P, ...T } = g;
    C(r.errors, a, {
      ...T,
      ...c,
      ref: y
    }), b.state.next({
      name: a,
      errors: r.errors,
      isValid: !1
    }), l && l.shouldFocus && y && y.focus && y.focus();
  }, Zn = (a, c) => ue(a) ? b.state.subscribe({
    next: (l) => "values" in l && a(z(void 0, c), l)
  }) : z(a, c, !0), Ht = (a) => b.state.subscribe({
    next: (c) => {
      zo(a.name, c.name, a.exact) && ko(c, a.formState || p, Sn, a.reRenderRoot) && a.callback({
        values: { ...s },
        ...r,
        ...c,
        defaultValues: o
      });
    }
  }).unsubscribe, En = (a) => (i.mount = !0, w = {
    ...w,
    ...a.formState
  }, Ht({
    ...a,
    formState: w
  })), vt = (a, c = {}) => {
    for (const l of a ? Re(a) : u.mount)
      u.mount.delete(l), u.array.delete(l), c.keepValue || (W(n, l), W(s, l)), !c.keepError && W(r.errors, l), !c.keepDirty && W(r.dirtyFields, l), !c.keepTouched && W(r.touchedFields, l), !c.keepIsValidating && W(r.validatingFields, l), !t.shouldUnregister && !c.keepDefaultValue && W(o, l);
    b.state.next({
      values: K(s)
    }), b.state.next({
      ...r,
      ...c.keepDirty ? { isDirty: k() } : {}
    }), !c.keepIsValid && I();
  }, Kt = ({ disabled: a, name: c }) => {
    (te(a) && i.mount || a || u.disabled.has(c)) && (a ? u.disabled.add(c) : u.disabled.delete(c));
  }, yt = (a, c = {}) => {
    let l = _(n, a);
    const y = te(c.disabled) || te(t.disabled);
    return C(n, a, {
      ...l || {},
      _f: {
        ...l && l._f ? l._f : { ref: { name: a } },
        name: a,
        mount: !0,
        ...c
      }
    }), u.mount.add(a), l ? Kt({
      disabled: te(c.disabled) ? c.disabled : t.disabled,
      name: a
    }) : V(a, !0, c.value), {
      ...y ? { disabled: c.disabled || t.disabled } : {},
      ...t.progressive ? {
        required: !!c.required,
        min: Pe(c.min),
        max: Pe(c.max),
        minLength: Pe(c.minLength),
        maxLength: Pe(c.maxLength),
        pattern: Pe(c.pattern)
      } : {},
      name: a,
      onChange: de,
      onBlur: de,
      ref: (g) => {
        if (g) {
          yt(a, c), l = _(n, a);
          const m = M(g.value) && g.querySelectorAll && g.querySelectorAll("input,select,textarea")[0] || g, x = mo(m), P = l._f.refs || [];
          if (x ? P.find((T) => T === m) : m === l._f.ref)
            return;
          C(n, a, {
            _f: {
              ...l._f,
              ...x ? {
                refs: [
                  ...P.filter(zt),
                  m,
                  ...Array.isArray(_(o, a)) ? [{}] : []
                ],
                ref: { type: m.type, name: a }
              } : { ref: m }
            }
          }), V(a, !1, void 0, m);
        } else
          l = _(n, a, {}), l._f && (l._f.mount = !1), (t.shouldUnregister || c.shouldUnregister) && !(Jr(u.array, a) && i.action) && u.unMount.add(a);
      }
    };
  }, bt = () => t.shouldFocusError && Ue(n, je, u.mount), An = (a) => {
    te(a) && (b.state.next({ disabled: a }), Ue(n, (c, l) => {
      const y = _(n, l);
      y && (c.disabled = y._f.disabled || a, Array.isArray(y._f.refs) && y._f.refs.forEach((g) => {
        g.disabled = y._f.disabled || a;
      }));
    }, 0, !1));
  }, Jt = (a, c) => async (l) => {
    let y;
    l && (l.preventDefault && l.preventDefault(), l.persist && l.persist());
    let g = K(s);
    if (b.state.next({
      isSubmitting: !0
    }), t.resolver) {
      const { errors: m, values: x } = await ne();
      r.errors = m, g = K(x);
    } else
      await ee(n);
    if (u.disabled.size)
      for (const m of u.disabled)
        W(g, m);
    if (W(r.errors, "root"), X(r.errors)) {
      b.state.next({
        errors: {}
      });
      try {
        await a(g, l);
      } catch (m) {
        y = m;
      }
    } else
      c && await c({ ...r.errors }, l), bt(), setTimeout(bt);
    if (b.state.next({
      isSubmitted: !0,
      isSubmitting: !1,
      isSubmitSuccessful: X(r.errors) && !y,
      submitCount: r.submitCount + 1,
      errors: r.errors
    }), y)
      throw y;
  }, In = (a, c = {}) => {
    _(n, a) && (M(c.defaultValue) ? Y(a, K(_(o, a))) : (Y(a, c.defaultValue), C(o, a, K(c.defaultValue))), c.keepTouched || W(r.touchedFields, a), c.keepDirty || (W(r.dirtyFields, a), r.isDirty = c.defaultValue ? k(a, K(_(o, a))) : k()), c.keepError || (W(r.errors, a), p.isValid && I()), b.state.next({ ...r }));
  }, Gt = (a, c = {}) => {
    const l = a ? K(a) : o, y = K(l), g = X(a), m = g ? o : y;
    if (c.keepDefaultValues || (o = l), !c.keepValues) {
      if (c.keepDirtyValues) {
        const x = /* @__PURE__ */ new Set([
          ...u.mount,
          ...Object.keys(Ze(o, s))
        ]);
        for (const P of Array.from(x))
          _(r.dirtyFields, P) ? C(m, P, _(s, P)) : Y(P, _(m, P));
      } else {
        if (St && M(a))
          for (const x of u.mount) {
            const P = _(n, x);
            if (P && P._f) {
              const T = Array.isArray(P._f.refs) ? P._f.refs[0] : P._f.ref;
              if (nt(T)) {
                const oe = T.closest("form");
                if (oe) {
                  oe.reset();
                  break;
                }
              }
            }
          }
        if (c.keepFieldsRef)
          for (const x of u.mount)
            Y(x, _(m, x));
        else
          n = {};
      }
      s = t.shouldUnregister ? c.keepDefaultValues ? K(o) : {} : K(m), b.array.next({
        values: { ...m }
      }), b.state.next({
        values: { ...m }
      });
    }
    u = {
      mount: c.keepDirtyValues ? u.mount : /* @__PURE__ */ new Set(),
      unMount: /* @__PURE__ */ new Set(),
      array: /* @__PURE__ */ new Set(),
      disabled: /* @__PURE__ */ new Set(),
      watch: /* @__PURE__ */ new Set(),
      watchAll: !1,
      focus: ""
    }, i.mount = !p.isValid || !!c.keepIsValid || !!c.keepDirtyValues, i.watch = !!t.shouldUnregister, b.state.next({
      submitCount: c.keepSubmitCount ? r.submitCount : 0,
      isDirty: g ? !1 : c.keepDirty ? r.isDirty : !!(c.keepDefaultValues && !me(a, o)),
      isSubmitted: c.keepIsSubmitted ? r.isSubmitted : !1,
      dirtyFields: g ? {} : c.keepDirtyValues ? c.keepDefaultValues && s ? Ze(o, s) : r.dirtyFields : c.keepDefaultValues && a ? Ze(o, a) : c.keepDirty ? r.dirtyFields : {},
      touchedFields: c.keepTouched ? r.touchedFields : {},
      errors: c.keepErrors ? r.errors : {},
      isSubmitSuccessful: c.keepIsSubmitSuccessful ? r.isSubmitSuccessful : !1,
      isSubmitting: !1,
      defaultValues: o
    });
  }, Yt = (a, c) => Gt(ue(a) ? a(s) : a, c), Fn = (a, c = {}) => {
    const l = _(n, a), y = l && l._f;
    if (y) {
      const g = y.refs ? y.refs[0] : y.ref;
      g.focus && (g.focus(), c.shouldSelect && ue(g.select) && g.select());
    }
  }, Sn = (a) => {
    r = {
      ...r,
      ...a
    };
  }, Xt = {
    control: {
      register: yt,
      unregister: vt,
      getFieldState: Wt,
      handleSubmit: Jt,
      setError: qt,
      _subscribe: Ht,
      _runSchema: ne,
      _focusError: bt,
      _getWatch: z,
      _getDirty: k,
      _setValid: I,
      _setFieldArray: O,
      _setDisabledField: Kt,
      _setErrors: S,
      _getFieldArray: Z,
      _reset: Gt,
      _resetDefaultValues: () => ue(t.defaultValues) && t.defaultValues().then((a) => {
        Yt(a, t.resetOptions), b.state.next({
          isLoading: !1
        });
      }),
      _removeUnmounted: le,
      _disableForm: An,
      _subjects: b,
      _proxyFormState: p,
      get _fields() {
        return n;
      },
      get _formValues() {
        return s;
      },
      get _state() {
        return i;
      },
      set _state(a) {
        i = a;
      },
      get _defaultValues() {
        return o;
      },
      get _names() {
        return u;
      },
      set _names(a) {
        u = a;
      },
      get _formState() {
        return r;
      },
      get _options() {
        return t;
      },
      set _options(a) {
        t = {
          ...t,
          ...a
        };
      }
    },
    subscribe: En,
    trigger: ze,
    register: yt,
    handleSubmit: Jt,
    watch: Zn,
    setValue: Y,
    getValues: qe,
    reset: Yt,
    resetField: In,
    clearErrors: $n,
    unregister: vt,
    setError: qt,
    setFocus: Fn,
    getFieldState: Wt
  };
  return {
    ...Xt,
    formControl: Xt
  };
}
function Io(e = {}) {
  const t = A.useRef(void 0), r = A.useRef(void 0), [n, o] = A.useState({
    isDirty: !1,
    isValidating: !1,
    isLoading: ue(e.defaultValues),
    isSubmitted: !1,
    isSubmitting: !1,
    isSubmitSuccessful: !1,
    isValid: !1,
    submitCount: 0,
    dirtyFields: {},
    touchedFields: {},
    validatingFields: {},
    errors: e.errors || {},
    disabled: e.disabled || !1,
    isReady: !1,
    defaultValues: ue(e.defaultValues) ? void 0 : e.defaultValues
  });
  if (!t.current)
    if (e.formControl)
      t.current = {
        ...e.formControl,
        formState: n
      }, e.defaultValues && !ue(e.defaultValues) && e.formControl.reset(e.defaultValues, e.resetOptions);
    else {
      const { formControl: i, ...u } = Ao(e);
      t.current = {
        ...u,
        formState: n
      };
    }
  const s = t.current.control;
  return s._options = e, Pt(() => {
    const i = s._subscribe({
      formState: s._proxyFormState,
      callback: () => o({ ...s._formState }),
      reRenderRoot: !0
    });
    return o((u) => ({
      ...u,
      isReady: !0
    })), s._formState.isReady = !0, i;
  }, [s]), A.useEffect(() => s._disableForm(e.disabled), [s, e.disabled]), A.useEffect(() => {
    e.mode && (s._options.mode = e.mode), e.reValidateMode && (s._options.reValidateMode = e.reValidateMode);
  }, [s, e.mode, e.reValidateMode]), A.useEffect(() => {
    e.errors && (s._setErrors(e.errors), s._focusError());
  }, [s, e.errors]), A.useEffect(() => {
    e.shouldUnregister && s._subjects.state.next({
      values: s._getWatch()
    });
  }, [s, e.shouldUnregister]), A.useEffect(() => {
    if (s._proxyFormState.isDirty) {
      const i = s._getDirty();
      i !== n.isDirty && s._subjects.state.next({
        isDirty: i
      });
    }
  }, [s, n.isDirty]), A.useEffect(() => {
    e.values && !me(e.values, r.current) ? (s._reset(e.values, {
      keepFieldsRef: !0,
      ...s._options.resetOptions
    }), r.current = e.values, o((i) => ({ ...i }))) : s._resetDefaultValues();
  }, [s, e.values]), A.useEffect(() => {
    s._state.mount || (s._setValid(), s._state.mount = !0), s._state.watch && (s._state.watch = !1, s._subjects.state.next({ ...s._formState })), s._removeUnmounted();
  }), t.current.formState = Gr(n, s), t.current;
}
const Fo = co, on = Lr(
  {}
), Ce = ({
  ...e
}) => /* @__PURE__ */ v.jsx(on.Provider, { value: { name: e.name }, children: /* @__PURE__ */ v.jsx(po, { ...e }) }), lt = () => {
  const e = tr(on), t = tr(sn), { getFieldState: r, formState: n } = ct(), o = r(e.name, n);
  if (!e)
    throw new Error("useFormField should be used within <FormField>");
  const { id: s } = t;
  return {
    id: s,
    name: e.name,
    formItemId: `${s}-form-item`,
    formDescriptionId: `${s}-form-item-description`,
    formMessageId: `${s}-form-item-message`,
    ...o
  };
}, sn = Lr(
  {}
), Ee = ce(({ className: e, ...t }, r) => {
  const n = Rn();
  return /* @__PURE__ */ v.jsx(sn.Provider, { value: { id: n }, children: /* @__PURE__ */ v.jsx("div", { ref: r, className: Me("space-y-2", e), ...t }) });
});
Ee.displayName = "FormItem";
const Qe = ce(({ className: e, ...t }, r) => {
  const { formItemId: n } = lt();
  return /* @__PURE__ */ v.jsx(
    qr,
    {
      ref: r,
      className: e,
      htmlFor: n,
      ...t
    }
  );
});
Qe.displayName = "FormLabel";
const Ae = ce(({ ...e }, t) => {
  const { error: r, formItemId: n, formDescriptionId: o, formMessageId: s } = lt();
  return /* @__PURE__ */ v.jsx(
    Un,
    {
      ref: t,
      "aria-describedby": r ? `${o} ${s}` : `${o}`,
      "aria-invalid": !!r,
      id: n,
      ...e
    }
  );
});
Ae.displayName = "FormControl";
const Zt = ce(({ className: e, ...t }, r) => {
  const { formDescriptionId: n } = lt();
  return /* @__PURE__ */ v.jsx(
    "p",
    {
      ref: r,
      className: Me("text-xs text-gray-700", e),
      id: n,
      ...t
    }
  );
});
Zt.displayName = "FormDescription";
const Ie = ce(({ className: e, children: t, ...r }, n) => {
  const { error: o, formMessageId: s } = lt(), i = o ? String((o == null ? void 0 : o.message) ?? "") : t;
  return i ? /* @__PURE__ */ v.jsx(
    "p",
    {
      ref: n,
      className: Me("text-xs text-destructive", e),
      id: s,
      ...r,
      children: i
    }
  ) : null;
});
Ie.displayName = "FormMessage";
const an = ce(({ className: e, ...t }, r) => /* @__PURE__ */ v.jsx(
  "textarea",
  {
    ref: r,
    className: Me(
      "flex min-h-[80px] w-full rounded-md border border-transparent bg-gray-150 dark:bg-gray-900 px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:bg-transparent focus-visible:border-green focus-visible:shadow-[0_0_0_2px_rgba(48,207,67,.25)] disabled:cursor-not-allowed disabled:opacity-50",
      e
    ),
    ...t
  }
));
an.displayName = "Textarea";
function f(e, t, r) {
  function n(u, d) {
    var h;
    Object.defineProperty(u, "_zod", {
      value: u._zod ?? {},
      enumerable: !1
    }), (h = u._zod).traits ?? (h.traits = /* @__PURE__ */ new Set()), u._zod.traits.add(e), t(u, d);
    for (const p in i.prototype)
      p in u || Object.defineProperty(u, p, { value: i.prototype[p].bind(u) });
    u._zod.constr = i, u._zod.def = d;
  }
  const o = (r == null ? void 0 : r.Parent) ?? Object;
  class s extends o {
  }
  Object.defineProperty(s, "name", { value: e });
  function i(u) {
    var d;
    const h = r != null && r.Parent ? new s() : this;
    n(h, u), (d = h._zod).deferred ?? (d.deferred = []);
    for (const p of h._zod.deferred)
      p();
    return h;
  }
  return Object.defineProperty(i, "init", { value: n }), Object.defineProperty(i, Symbol.hasInstance, {
    value: (u) => {
      var d, h;
      return r != null && r.Parent && u instanceof r.Parent ? !0 : (h = (d = u == null ? void 0 : u._zod) == null ? void 0 : d.traits) == null ? void 0 : h.has(e);
    }
  }), Object.defineProperty(i, "name", { value: e }), i;
}
class Se extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class un extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
const cn = {};
function ye(e) {
  return cn;
}
function So(e) {
  const t = Object.values(e).filter((n) => typeof n == "number");
  return Object.entries(e).filter(([n, o]) => t.indexOf(+n) === -1).map(([n, o]) => o);
}
function Et(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function Rt(e) {
  return {
    get value() {
      {
        const t = e();
        return Object.defineProperty(this, "value", { value: t }), t;
      }
    }
  };
}
function Ut(e) {
  return e == null;
}
function Nt(e) {
  const t = e.startsWith("^") ? 1 : 0, r = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, r);
}
const yr = Symbol("evaluating");
function R(e, t, r) {
  let n;
  Object.defineProperty(e, t, {
    get() {
      if (n !== yr)
        return n === void 0 && (n = yr, n = r()), n;
    },
    set(o) {
      Object.defineProperty(e, t, {
        value: o
        // configurable: true,
      });
    },
    configurable: !0
  });
}
function we(e, t, r) {
  Object.defineProperty(e, t, {
    value: r,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function ke(...e) {
  const t = {};
  for (const r of e) {
    const n = Object.getOwnPropertyDescriptors(r);
    Object.assign(t, n);
  }
  return Object.defineProperties({}, t);
}
function br(e) {
  return JSON.stringify(e);
}
const ln = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function st(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const jo = Rt(() => {
  var e;
  if (typeof navigator < "u" && ((e = navigator == null ? void 0 : navigator.userAgent) != null && e.includes("Cloudflare")))
    return !1;
  try {
    const t = Function;
    return new t(""), !0;
  } catch {
    return !1;
  }
});
function Ne(e) {
  if (st(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0)
    return !0;
  const r = t.prototype;
  return !(st(r) === !1 || Object.prototype.hasOwnProperty.call(r, "isPrototypeOf") === !1);
}
function dn(e) {
  return Ne(e) ? { ...e } : Array.isArray(e) ? [...e] : e;
}
const Do = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function dt(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function _e(e, t, r) {
  const n = new e._zod.constr(t ?? e._zod.def);
  return (!t || r != null && r.parent) && (n._zod.parent = e), n;
}
function $(e) {
  const t = e;
  if (!t)
    return {};
  if (typeof t == "string")
    return { error: () => t };
  if ((t == null ? void 0 : t.message) !== void 0) {
    if ((t == null ? void 0 : t.error) !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return delete t.message, typeof t.error == "string" ? { ...t, error: () => t.error } : t;
}
function Vo(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional");
}
function Po(e, t) {
  const r = e._zod.def, n = ke(e._zod.def, {
    get shape() {
      const o = {};
      for (const s in t) {
        if (!(s in r.shape))
          throw new Error(`Unrecognized key: "${s}"`);
        t[s] && (o[s] = r.shape[s]);
      }
      return we(this, "shape", o), o;
    },
    checks: []
  });
  return _e(e, n);
}
function Co(e, t) {
  const r = e._zod.def, n = ke(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape };
      for (const s in t) {
        if (!(s in r.shape))
          throw new Error(`Unrecognized key: "${s}"`);
        t[s] && delete o[s];
      }
      return we(this, "shape", o), o;
    },
    checks: []
  });
  return _e(e, n);
}
function Oo(e, t) {
  if (!Ne(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const r = e._zod.def.checks;
  if (r && r.length > 0)
    throw new Error("Object schemas containing refinements cannot be extended. Use `.safeExtend()` instead.");
  const o = ke(e._zod.def, {
    get shape() {
      const s = { ...e._zod.def.shape, ...t };
      return we(this, "shape", s), s;
    },
    checks: []
  });
  return _e(e, o);
}
function To(e, t) {
  if (!Ne(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  const r = {
    ...e._zod.def,
    get shape() {
      const n = { ...e._zod.def.shape, ...t };
      return we(this, "shape", n), n;
    },
    checks: e._zod.def.checks
  };
  return _e(e, r);
}
function Ro(e, t) {
  const r = ke(e._zod.def, {
    get shape() {
      const n = { ...e._zod.def.shape, ...t._zod.def.shape };
      return we(this, "shape", n), n;
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: []
    // delete existing checks
  });
  return _e(e, r);
}
function Uo(e, t, r) {
  const n = ke(t._zod.def, {
    get shape() {
      const o = t._zod.def.shape, s = { ...o };
      if (r)
        for (const i in r) {
          if (!(i in o))
            throw new Error(`Unrecognized key: "${i}"`);
          r[i] && (s[i] = e ? new e({
            type: "optional",
            innerType: o[i]
          }) : o[i]);
        }
      else
        for (const i in o)
          s[i] = e ? new e({
            type: "optional",
            innerType: o[i]
          }) : o[i];
      return we(this, "shape", s), s;
    },
    checks: []
  });
  return _e(t, n);
}
function No(e, t, r) {
  const n = ke(t._zod.def, {
    get shape() {
      const o = t._zod.def.shape, s = { ...o };
      if (r)
        for (const i in r) {
          if (!(i in s))
            throw new Error(`Unrecognized key: "${i}"`);
          r[i] && (s[i] = new e({
            type: "nonoptional",
            innerType: o[i]
          }));
        }
      else
        for (const i in o)
          s[i] = new e({
            type: "nonoptional",
            innerType: o[i]
          });
      return we(this, "shape", s), s;
    },
    checks: []
  });
  return _e(t, n);
}
function Fe(e, t = 0) {
  var r;
  if (e.aborted === !0)
    return !0;
  for (let n = t; n < e.issues.length; n++)
    if (((r = e.issues[n]) == null ? void 0 : r.continue) !== !0)
      return !0;
  return !1;
}
function fn(e, t) {
  return t.map((r) => {
    var n;
    return (n = r).path ?? (n.path = []), r.path.unshift(e), r;
  });
}
function Je(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function be(e, t, r) {
  var o, s, i, u, d, h;
  const n = { ...e, path: e.path ?? [] };
  if (!e.message) {
    const p = Je((i = (s = (o = e.inst) == null ? void 0 : o._zod.def) == null ? void 0 : s.error) == null ? void 0 : i.call(s, e)) ?? Je((u = t == null ? void 0 : t.error) == null ? void 0 : u.call(t, e)) ?? Je((d = r.customError) == null ? void 0 : d.call(r, e)) ?? Je((h = r.localeError) == null ? void 0 : h.call(r, e)) ?? "Invalid input";
    n.message = p;
  }
  return delete n.inst, delete n.continue, t != null && t.reportInput || delete n.input, n;
}
function Lt(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Le(...e) {
  const [t, r, n] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: r,
    inst: n
  } : { ...t };
}
const hn = (e, t) => {
  e.name = "$ZodError", Object.defineProperty(e, "_zod", {
    value: e._zod,
    enumerable: !1
  }), Object.defineProperty(e, "issues", {
    value: t,
    enumerable: !1
  }), e.message = JSON.stringify(t, Et, 2), Object.defineProperty(e, "toString", {
    value: () => e.message,
    enumerable: !1
  });
}, Mt = f("$ZodError", hn), ft = f("$ZodError", hn, { Parent: Error });
function Lo(e, t = (r) => r.message) {
  const r = {}, n = [];
  for (const o of e.issues)
    o.path.length > 0 ? (r[o.path[0]] = r[o.path[0]] || [], r[o.path[0]].push(t(o))) : n.push(t(o));
  return { formErrors: n, fieldErrors: r };
}
function Mo(e, t = (r) => r.message) {
  const r = { _errors: [] }, n = (o) => {
    for (const s of o.issues)
      if (s.code === "invalid_union" && s.errors.length)
        s.errors.map((i) => n({ issues: i }));
      else if (s.code === "invalid_key")
        n({ issues: s.issues });
      else if (s.code === "invalid_element")
        n({ issues: s.issues });
      else if (s.path.length === 0)
        r._errors.push(t(s));
      else {
        let i = r, u = 0;
        for (; u < s.path.length; ) {
          const d = s.path[u];
          u === s.path.length - 1 ? (i[d] = i[d] || { _errors: [] }, i[d]._errors.push(t(s))) : i[d] = i[d] || { _errors: [] }, i = i[d], u++;
        }
      }
  };
  return n(e), r;
}
const ht = (e) => (t, r, n, o) => {
  const s = n ? Object.assign(n, { async: !1 }) : { async: !1 }, i = t._zod.run({ value: r, issues: [] }, s);
  if (i instanceof Promise)
    throw new Se();
  if (i.issues.length) {
    const u = new ((o == null ? void 0 : o.Err) ?? e)(i.issues.map((d) => be(d, s, ye())));
    throw ln(u, o == null ? void 0 : o.callee), u;
  }
  return i.value;
}, Bo = /* @__PURE__ */ ht(ft), pt = (e) => async (t, r, n, o) => {
  const s = n ? Object.assign(n, { async: !0 }) : { async: !0 };
  let i = t._zod.run({ value: r, issues: [] }, s);
  if (i instanceof Promise && (i = await i), i.issues.length) {
    const u = new ((o == null ? void 0 : o.Err) ?? e)(i.issues.map((d) => be(d, s, ye())));
    throw ln(u, o == null ? void 0 : o.callee), u;
  }
  return i.value;
}, Wo = /* @__PURE__ */ pt(ft), mt = (e) => (t, r, n) => {
  const o = n ? { ...n, async: !1 } : { async: !1 }, s = t._zod.run({ value: r, issues: [] }, o);
  if (s instanceof Promise)
    throw new Se();
  return s.issues.length ? {
    success: !1,
    error: new (e ?? Mt)(s.issues.map((i) => be(i, o, ye())))
  } : { success: !0, data: s.value };
}, qo = /* @__PURE__ */ mt(ft), gt = (e) => async (t, r, n) => {
  const o = n ? Object.assign(n, { async: !0 }) : { async: !0 };
  let s = t._zod.run({ value: r, issues: [] }, o);
  return s instanceof Promise && (s = await s), s.issues.length ? {
    success: !1,
    error: new e(s.issues.map((i) => be(i, o, ye())))
  } : { success: !0, data: s.value };
}, Ho = /* @__PURE__ */ gt(ft), Ko = (e) => (t, r, n) => {
  const o = n ? Object.assign(n, { direction: "backward" }) : { direction: "backward" };
  return ht(e)(t, r, o);
}, Jo = (e) => (t, r, n) => ht(e)(t, r, n), Go = (e) => async (t, r, n) => {
  const o = n ? Object.assign(n, { direction: "backward" }) : { direction: "backward" };
  return pt(e)(t, r, o);
}, Yo = (e) => async (t, r, n) => pt(e)(t, r, n), Xo = (e) => (t, r, n) => {
  const o = n ? Object.assign(n, { direction: "backward" }) : { direction: "backward" };
  return mt(e)(t, r, o);
}, Qo = (e) => (t, r, n) => mt(e)(t, r, n), es = (e) => async (t, r, n) => {
  const o = n ? Object.assign(n, { direction: "backward" }) : { direction: "backward" };
  return gt(e)(t, r, o);
}, ts = (e) => async (t, r, n) => gt(e)(t, r, n), rs = /^[cC][^\s-]{8,}$/, ns = /^[0-9a-z]+$/, os = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/, ss = /^[0-9a-vA-V]{20}$/, is = /^[A-Za-z0-9]{27}$/, as = /^[a-zA-Z0-9_-]{21}$/, us = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, cs = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, wr = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, ls = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, ds = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function fs() {
  return new RegExp(ds, "u");
}
const hs = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, ps = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, ms = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, gs = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, _s = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, pn = /^[A-Za-z0-9_-]*$/, vs = /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/, ys = /^\+(?:[0-9]){6,14}[0-9]$/, mn = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))", bs = /* @__PURE__ */ new RegExp(`^${mn}$`);
function gn(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function ws(e) {
  return new RegExp(`^${gn(e)}$`);
}
function ks(e) {
  const t = gn({ precision: e.precision }), r = ["Z"];
  e.local && r.push(""), e.offset && r.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const n = `${t}(?:${r.join("|")})`;
  return new RegExp(`^${mn}T(?:${n})$`);
}
const zs = (e) => {
  const t = e ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}` : "[\\s\\S]*";
  return new RegExp(`^${t}$`);
}, xs = /^[^A-Z]*$/, $s = /^[^a-z]*$/, fe = /* @__PURE__ */ f("$ZodCheck", (e, t) => {
  var r;
  e._zod ?? (e._zod = {}), e._zod.def = t, (r = e._zod).onattach ?? (r.onattach = []);
}), Zs = /* @__PURE__ */ f("$ZodCheckMaxLength", (e, t) => {
  var r;
  fe.init(e, t), (r = e._zod.def).when ?? (r.when = (n) => {
    const o = n.value;
    return !Ut(o) && o.length !== void 0;
  }), e._zod.onattach.push((n) => {
    const o = n._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
    t.maximum < o && (n._zod.bag.maximum = t.maximum);
  }), e._zod.check = (n) => {
    const o = n.value;
    if (o.length <= t.maximum)
      return;
    const i = Lt(o);
    n.issues.push({
      origin: i,
      code: "too_big",
      maximum: t.maximum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), Es = /* @__PURE__ */ f("$ZodCheckMinLength", (e, t) => {
  var r;
  fe.init(e, t), (r = e._zod.def).when ?? (r.when = (n) => {
    const o = n.value;
    return !Ut(o) && o.length !== void 0;
  }), e._zod.onattach.push((n) => {
    const o = n._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
    t.minimum > o && (n._zod.bag.minimum = t.minimum);
  }), e._zod.check = (n) => {
    const o = n.value;
    if (o.length >= t.minimum)
      return;
    const i = Lt(o);
    n.issues.push({
      origin: i,
      code: "too_small",
      minimum: t.minimum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), As = /* @__PURE__ */ f("$ZodCheckLengthEquals", (e, t) => {
  var r;
  fe.init(e, t), (r = e._zod.def).when ?? (r.when = (n) => {
    const o = n.value;
    return !Ut(o) && o.length !== void 0;
  }), e._zod.onattach.push((n) => {
    const o = n._zod.bag;
    o.minimum = t.length, o.maximum = t.length, o.length = t.length;
  }), e._zod.check = (n) => {
    const o = n.value, s = o.length;
    if (s === t.length)
      return;
    const i = Lt(o), u = s > t.length;
    n.issues.push({
      origin: i,
      ...u ? { code: "too_big", maximum: t.length } : { code: "too_small", minimum: t.length },
      inclusive: !0,
      exact: !0,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), _t = /* @__PURE__ */ f("$ZodCheckStringFormat", (e, t) => {
  var r, n;
  fe.init(e, t), e._zod.onattach.push((o) => {
    const s = o._zod.bag;
    s.format = t.format, t.pattern && (s.patterns ?? (s.patterns = /* @__PURE__ */ new Set()), s.patterns.add(t.pattern));
  }), t.pattern ? (r = e._zod).check ?? (r.check = (o) => {
    t.pattern.lastIndex = 0, !t.pattern.test(o.value) && o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: t.format,
      input: o.value,
      ...t.pattern ? { pattern: t.pattern.toString() } : {},
      inst: e,
      continue: !t.abort
    });
  }) : (n = e._zod).check ?? (n.check = () => {
  });
}), Is = /* @__PURE__ */ f("$ZodCheckRegex", (e, t) => {
  _t.init(e, t), e._zod.check = (r) => {
    t.pattern.lastIndex = 0, !t.pattern.test(r.value) && r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: r.value,
      pattern: t.pattern.toString(),
      inst: e,
      continue: !t.abort
    });
  };
}), Fs = /* @__PURE__ */ f("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = xs), _t.init(e, t);
}), Ss = /* @__PURE__ */ f("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = $s), _t.init(e, t);
}), js = /* @__PURE__ */ f("$ZodCheckIncludes", (e, t) => {
  fe.init(e, t);
  const r = dt(t.includes), n = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${r}` : r);
  t.pattern = n, e._zod.onattach.push((o) => {
    const s = o._zod.bag;
    s.patterns ?? (s.patterns = /* @__PURE__ */ new Set()), s.patterns.add(n);
  }), e._zod.check = (o) => {
    o.value.includes(t.includes, t.position) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: t.includes,
      input: o.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ds = /* @__PURE__ */ f("$ZodCheckStartsWith", (e, t) => {
  fe.init(e, t);
  const r = new RegExp(`^${dt(t.prefix)}.*`);
  t.pattern ?? (t.pattern = r), e._zod.onattach.push((n) => {
    const o = n._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(r);
  }), e._zod.check = (n) => {
    n.value.startsWith(t.prefix) || n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: t.prefix,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Vs = /* @__PURE__ */ f("$ZodCheckEndsWith", (e, t) => {
  fe.init(e, t);
  const r = new RegExp(`.*${dt(t.suffix)}$`);
  t.pattern ?? (t.pattern = r), e._zod.onattach.push((n) => {
    const o = n._zod.bag;
    o.patterns ?? (o.patterns = /* @__PURE__ */ new Set()), o.patterns.add(r);
  }), e._zod.check = (n) => {
    n.value.endsWith(t.suffix) || n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: t.suffix,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ps = /* @__PURE__ */ f("$ZodCheckOverwrite", (e, t) => {
  fe.init(e, t), e._zod.check = (r) => {
    r.value = t.tx(r.value);
  };
});
class Cs {
  constructor(t = []) {
    this.content = [], this.indent = 0, this && (this.args = t);
  }
  indented(t) {
    this.indent += 1, t(this), this.indent -= 1;
  }
  write(t) {
    if (typeof t == "function") {
      t(this, { execution: "sync" }), t(this, { execution: "async" });
      return;
    }
    const n = t.split(`
`).filter((i) => i), o = Math.min(...n.map((i) => i.length - i.trimStart().length)), s = n.map((i) => i.slice(o)).map((i) => " ".repeat(this.indent * 2) + i);
    for (const i of s)
      this.content.push(i);
  }
  compile() {
    const t = Function, r = this == null ? void 0 : this.args, o = [...((this == null ? void 0 : this.content) ?? [""]).map((s) => `  ${s}`)];
    return new t(...r, o.join(`
`));
  }
}
const Os = {
  major: 4,
  minor: 1,
  patch: 12
}, J = /* @__PURE__ */ f("$ZodType", (e, t) => {
  var o;
  var r;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Os;
  const n = [...e._zod.def.checks ?? []];
  e._zod.traits.has("$ZodCheck") && n.unshift(e);
  for (const s of n)
    for (const i of s._zod.onattach)
      i(e);
  if (n.length === 0)
    (r = e._zod).deferred ?? (r.deferred = []), (o = e._zod.deferred) == null || o.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const s = (u, d, h) => {
      let p = Fe(u), w;
      for (const b of d) {
        if (b._zod.def.when) {
          if (!b._zod.def.when(u))
            continue;
        } else if (p)
          continue;
        const F = u.issues.length, D = b._zod.check(u);
        if (D instanceof Promise && (h == null ? void 0 : h.async) === !1)
          throw new Se();
        if (w || D instanceof Promise)
          w = (w ?? Promise.resolve()).then(async () => {
            await D, u.issues.length !== F && (p || (p = Fe(u, F)));
          });
        else {
          if (u.issues.length === F)
            continue;
          p || (p = Fe(u, F));
        }
      }
      return w ? w.then(() => u) : u;
    }, i = (u, d, h) => {
      if (Fe(u))
        return u.aborted = !0, u;
      const p = s(d, n, h);
      if (p instanceof Promise) {
        if (h.async === !1)
          throw new Se();
        return p.then((w) => e._zod.parse(w, h));
      }
      return e._zod.parse(p, h);
    };
    e._zod.run = (u, d) => {
      if (d.skipChecks)
        return e._zod.parse(u, d);
      if (d.direction === "backward") {
        const p = e._zod.parse({ value: u.value, issues: [] }, { ...d, skipChecks: !0 });
        return p instanceof Promise ? p.then((w) => i(w, u, d)) : i(p, u, d);
      }
      const h = e._zod.parse(u, d);
      if (h instanceof Promise) {
        if (d.async === !1)
          throw new Se();
        return h.then((p) => s(p, n, d));
      }
      return s(h, n, d);
    };
  }
  e["~standard"] = {
    validate: (s) => {
      var i;
      try {
        const u = qo(e, s);
        return u.success ? { value: u.data } : { issues: (i = u.error) == null ? void 0 : i.issues };
      } catch {
        return Ho(e, s).then((d) => {
          var h;
          return d.success ? { value: d.data } : { issues: (h = d.error) == null ? void 0 : h.issues };
        });
      }
    },
    vendor: "zod",
    version: 1
  };
}), Bt = /* @__PURE__ */ f("$ZodString", (e, t) => {
  var r;
  J.init(e, t), e._zod.pattern = [...((r = e == null ? void 0 : e._zod.bag) == null ? void 0 : r.patterns) ?? []].pop() ?? zs(e._zod.bag), e._zod.parse = (n, o) => {
    if (t.coerce)
      try {
        n.value = String(n.value);
      } catch {
      }
    return typeof n.value == "string" || n.issues.push({
      expected: "string",
      code: "invalid_type",
      input: n.value,
      inst: e
    }), n;
  };
}), N = /* @__PURE__ */ f("$ZodStringFormat", (e, t) => {
  _t.init(e, t), Bt.init(e, t);
}), Ts = /* @__PURE__ */ f("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = cs), N.init(e, t);
}), Rs = /* @__PURE__ */ f("$ZodUUID", (e, t) => {
  if (t.version) {
    const n = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[t.version];
    if (n === void 0)
      throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = wr(n));
  } else
    t.pattern ?? (t.pattern = wr());
  N.init(e, t);
}), Us = /* @__PURE__ */ f("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = ls), N.init(e, t);
}), Ns = /* @__PURE__ */ f("$ZodURL", (e, t) => {
  N.init(e, t), e._zod.check = (r) => {
    try {
      const n = r.value.trim(), o = new URL(n);
      t.hostname && (t.hostname.lastIndex = 0, t.hostname.test(o.hostname) || r.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: vs.source,
        input: r.value,
        inst: e,
        continue: !t.abort
      })), t.protocol && (t.protocol.lastIndex = 0, t.protocol.test(o.protocol.endsWith(":") ? o.protocol.slice(0, -1) : o.protocol) || r.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: r.value,
        inst: e,
        continue: !t.abort
      })), t.normalize ? r.value = o.href : r.value = n;
      return;
    } catch {
      r.issues.push({
        code: "invalid_format",
        format: "url",
        input: r.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), Ls = /* @__PURE__ */ f("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = fs()), N.init(e, t);
}), Ms = /* @__PURE__ */ f("$ZodNanoID", (e, t) => {
  t.pattern ?? (t.pattern = as), N.init(e, t);
}), Bs = /* @__PURE__ */ f("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = rs), N.init(e, t);
}), Ws = /* @__PURE__ */ f("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = ns), N.init(e, t);
}), qs = /* @__PURE__ */ f("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = os), N.init(e, t);
}), Hs = /* @__PURE__ */ f("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = ss), N.init(e, t);
}), Ks = /* @__PURE__ */ f("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = is), N.init(e, t);
}), Js = /* @__PURE__ */ f("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = ks(t)), N.init(e, t);
}), Gs = /* @__PURE__ */ f("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = bs), N.init(e, t);
}), Ys = /* @__PURE__ */ f("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = ws(t)), N.init(e, t);
}), Xs = /* @__PURE__ */ f("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = us), N.init(e, t);
}), Qs = /* @__PURE__ */ f("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = hs), N.init(e, t), e._zod.onattach.push((r) => {
    const n = r._zod.bag;
    n.format = "ipv4";
  });
}), ei = /* @__PURE__ */ f("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = ps), N.init(e, t), e._zod.onattach.push((r) => {
    const n = r._zod.bag;
    n.format = "ipv6";
  }), e._zod.check = (r) => {
    try {
      new URL(`http://[${r.value}]`);
    } catch {
      r.issues.push({
        code: "invalid_format",
        format: "ipv6",
        input: r.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), ti = /* @__PURE__ */ f("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = ms), N.init(e, t);
}), ri = /* @__PURE__ */ f("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = gs), N.init(e, t), e._zod.check = (r) => {
    const n = r.value.split("/");
    try {
      if (n.length !== 2)
        throw new Error();
      const [o, s] = n;
      if (!s)
        throw new Error();
      const i = Number(s);
      if (`${i}` !== s)
        throw new Error();
      if (i < 0 || i > 128)
        throw new Error();
      new URL(`http://[${o}]`);
    } catch {
      r.issues.push({
        code: "invalid_format",
        format: "cidrv6",
        input: r.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
});
function _n(e) {
  if (e === "")
    return !0;
  if (e.length % 4 !== 0)
    return !1;
  try {
    return atob(e), !0;
  } catch {
    return !1;
  }
}
const ni = /* @__PURE__ */ f("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = _s), N.init(e, t), e._zod.onattach.push((r) => {
    r._zod.bag.contentEncoding = "base64";
  }), e._zod.check = (r) => {
    _n(r.value) || r.issues.push({
      code: "invalid_format",
      format: "base64",
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function oi(e) {
  if (!pn.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (n) => n === "-" ? "+" : "/"), r = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return _n(r);
}
const si = /* @__PURE__ */ f("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = pn), N.init(e, t), e._zod.onattach.push((r) => {
    r._zod.bag.contentEncoding = "base64url";
  }), e._zod.check = (r) => {
    oi(r.value) || r.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), ii = /* @__PURE__ */ f("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = ys), N.init(e, t);
});
function ai(e, t = null) {
  try {
    const r = e.split(".");
    if (r.length !== 3)
      return !1;
    const [n] = r;
    if (!n)
      return !1;
    const o = JSON.parse(atob(n));
    return !("typ" in o && (o == null ? void 0 : o.typ) !== "JWT" || !o.alg || t && (!("alg" in o) || o.alg !== t));
  } catch {
    return !1;
  }
}
const ui = /* @__PURE__ */ f("$ZodJWT", (e, t) => {
  N.init(e, t), e._zod.check = (r) => {
    ai(r.value, t.alg) || r.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), ci = /* @__PURE__ */ f("$ZodUnknown", (e, t) => {
  J.init(e, t), e._zod.parse = (r) => r;
}), li = /* @__PURE__ */ f("$ZodNever", (e, t) => {
  J.init(e, t), e._zod.parse = (r, n) => (r.issues.push({
    expected: "never",
    code: "invalid_type",
    input: r.value,
    inst: e
  }), r);
});
function kr(e, t, r) {
  e.issues.length && t.issues.push(...fn(r, e.issues)), t.value[r] = e.value;
}
const di = /* @__PURE__ */ f("$ZodArray", (e, t) => {
  J.init(e, t), e._zod.parse = (r, n) => {
    const o = r.value;
    if (!Array.isArray(o))
      return r.issues.push({
        expected: "array",
        code: "invalid_type",
        input: o,
        inst: e
      }), r;
    r.value = Array(o.length);
    const s = [];
    for (let i = 0; i < o.length; i++) {
      const u = o[i], d = t.element._zod.run({
        value: u,
        issues: []
      }, n);
      d instanceof Promise ? s.push(d.then((h) => kr(h, r, i))) : kr(d, r, i);
    }
    return s.length ? Promise.all(s).then(() => r) : r;
  };
});
function it(e, t, r, n) {
  e.issues.length && t.issues.push(...fn(r, e.issues)), e.value === void 0 ? r in n && (t.value[r] = void 0) : t.value[r] = e.value;
}
function vn(e) {
  var n, o, s, i;
  const t = Object.keys(e.shape);
  for (const u of t)
    if (!((i = (s = (o = (n = e.shape) == null ? void 0 : n[u]) == null ? void 0 : o._zod) == null ? void 0 : s.traits) != null && i.has("$ZodType")))
      throw new Error(`Invalid element at key "${u}": expected a Zod schema`);
  const r = Vo(e.shape);
  return {
    ...e,
    keys: t,
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(r)
  };
}
function yn(e, t, r, n, o, s) {
  const i = [], u = o.keySet, d = o.catchall._zod, h = d.def.type;
  for (const p of Object.keys(t)) {
    if (u.has(p))
      continue;
    if (h === "never") {
      i.push(p);
      continue;
    }
    const w = d.run({ value: t[p], issues: [] }, n);
    w instanceof Promise ? e.push(w.then((b) => it(b, r, p, t))) : it(w, r, p, t);
  }
  return i.length && r.issues.push({
    code: "unrecognized_keys",
    keys: i,
    input: t,
    inst: s
  }), e.length ? Promise.all(e).then(() => r) : r;
}
const fi = /* @__PURE__ */ f("$ZodObject", (e, t) => {
  J.init(e, t);
  const r = Object.getOwnPropertyDescriptor(t, "shape");
  if (!(r != null && r.get)) {
    const u = t.shape;
    Object.defineProperty(t, "shape", {
      get: () => {
        const d = { ...u };
        return Object.defineProperty(t, "shape", {
          value: d
        }), d;
      }
    });
  }
  const n = Rt(() => vn(t));
  R(e._zod, "propValues", () => {
    const u = t.shape, d = {};
    for (const h in u) {
      const p = u[h]._zod;
      if (p.values) {
        d[h] ?? (d[h] = /* @__PURE__ */ new Set());
        for (const w of p.values)
          d[h].add(w);
      }
    }
    return d;
  });
  const o = st, s = t.catchall;
  let i;
  e._zod.parse = (u, d) => {
    i ?? (i = n.value);
    const h = u.value;
    if (!o(h))
      return u.issues.push({
        expected: "object",
        code: "invalid_type",
        input: h,
        inst: e
      }), u;
    u.value = {};
    const p = [], w = i.shape;
    for (const b of i.keys) {
      const D = w[b]._zod.run({ value: h[b], issues: [] }, d);
      D instanceof Promise ? p.push(D.then((I) => it(I, u, b, h))) : it(D, u, b, h);
    }
    return s ? yn(p, h, u, d, n.value, e) : p.length ? Promise.all(p).then(() => u) : u;
  };
}), hi = /* @__PURE__ */ f("$ZodObjectJIT", (e, t) => {
  fi.init(e, t);
  const r = e._zod.parse, n = Rt(() => vn(t)), o = (b) => {
    const F = new Cs(["shape", "payload", "ctx"]), D = n.value, I = (S) => {
      const V = br(S);
      return `shape[${V}]._zod.run({ value: input[${V}], issues: [] }, ctx)`;
    };
    F.write("const input = payload.value;");
    const B = /* @__PURE__ */ Object.create(null);
    let O = 0;
    for (const S of D.keys)
      B[S] = `key_${O++}`;
    F.write("const newResult = {};");
    for (const S of D.keys) {
      const V = B[S], j = br(S);
      F.write(`const ${V} = ${I(S)};`), F.write(`
        if (${V}.issues.length) {
          payload.issues = payload.issues.concat(${V}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${j}, ...iss.path] : [${j}]
          })));
        }
        
        
        if (${V}.value === undefined) {
          if (${j} in input) {
            newResult[${j}] = undefined;
          }
        } else {
          newResult[${j}] = ${V}.value;
        }
        
      `);
    }
    F.write("payload.value = newResult;"), F.write("return payload;");
    const E = F.compile();
    return (S, V) => E(b, S, V);
  };
  let s;
  const i = st, u = !cn.jitless, h = u && jo.value, p = t.catchall;
  let w;
  e._zod.parse = (b, F) => {
    w ?? (w = n.value);
    const D = b.value;
    return i(D) ? u && h && (F == null ? void 0 : F.async) === !1 && F.jitless !== !0 ? (s || (s = o(t.shape)), b = s(b, F), p ? yn([], D, b, F, w, e) : b) : r(b, F) : (b.issues.push({
      expected: "object",
      code: "invalid_type",
      input: D,
      inst: e
    }), b);
  };
});
function zr(e, t, r, n) {
  for (const s of e)
    if (s.issues.length === 0)
      return t.value = s.value, t;
  const o = e.filter((s) => !Fe(s));
  return o.length === 1 ? (t.value = o[0].value, o[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: r,
    errors: e.map((s) => s.issues.map((i) => be(i, n, ye())))
  }), t);
}
const pi = /* @__PURE__ */ f("$ZodUnion", (e, t) => {
  J.init(e, t), R(e._zod, "optin", () => t.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0), R(e._zod, "optout", () => t.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0), R(e._zod, "values", () => {
    if (t.options.every((o) => o._zod.values))
      return new Set(t.options.flatMap((o) => Array.from(o._zod.values)));
  }), R(e._zod, "pattern", () => {
    if (t.options.every((o) => o._zod.pattern)) {
      const o = t.options.map((s) => s._zod.pattern);
      return new RegExp(`^(${o.map((s) => Nt(s.source)).join("|")})$`);
    }
  });
  const r = t.options.length === 1, n = t.options[0]._zod.run;
  e._zod.parse = (o, s) => {
    if (r)
      return n(o, s);
    let i = !1;
    const u = [];
    for (const d of t.options) {
      const h = d._zod.run({
        value: o.value,
        issues: []
      }, s);
      if (h instanceof Promise)
        u.push(h), i = !0;
      else {
        if (h.issues.length === 0)
          return h;
        u.push(h);
      }
    }
    return i ? Promise.all(u).then((d) => zr(d, o, e, s)) : zr(u, o, e, s);
  };
}), mi = /* @__PURE__ */ f("$ZodIntersection", (e, t) => {
  J.init(e, t), e._zod.parse = (r, n) => {
    const o = r.value, s = t.left._zod.run({ value: o, issues: [] }, n), i = t.right._zod.run({ value: o, issues: [] }, n);
    return s instanceof Promise || i instanceof Promise ? Promise.all([s, i]).then(([d, h]) => xr(r, d, h)) : xr(r, s, i);
  };
});
function At(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (Ne(e) && Ne(t)) {
    const r = Object.keys(t), n = Object.keys(e).filter((s) => r.indexOf(s) !== -1), o = { ...e, ...t };
    for (const s of n) {
      const i = At(e[s], t[s]);
      if (!i.valid)
        return {
          valid: !1,
          mergeErrorPath: [s, ...i.mergeErrorPath]
        };
      o[s] = i.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length)
      return { valid: !1, mergeErrorPath: [] };
    const r = [];
    for (let n = 0; n < e.length; n++) {
      const o = e[n], s = t[n], i = At(o, s);
      if (!i.valid)
        return {
          valid: !1,
          mergeErrorPath: [n, ...i.mergeErrorPath]
        };
      r.push(i.data);
    }
    return { valid: !0, data: r };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function xr(e, t, r) {
  if (t.issues.length && e.issues.push(...t.issues), r.issues.length && e.issues.push(...r.issues), Fe(e))
    return e;
  const n = At(t.value, r.value);
  if (!n.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(n.mergeErrorPath)}`);
  return e.value = n.data, e;
}
const gi = /* @__PURE__ */ f("$ZodEnum", (e, t) => {
  J.init(e, t);
  const r = So(t.entries), n = new Set(r);
  e._zod.values = n, e._zod.pattern = new RegExp(`^(${r.filter((o) => Do.has(typeof o)).map((o) => typeof o == "string" ? dt(o) : o.toString()).join("|")})$`), e._zod.parse = (o, s) => {
    const i = o.value;
    return n.has(i) || o.issues.push({
      code: "invalid_value",
      values: r,
      input: i,
      inst: e
    }), o;
  };
}), _i = /* @__PURE__ */ f("$ZodTransform", (e, t) => {
  J.init(e, t), e._zod.parse = (r, n) => {
    if (n.direction === "backward")
      throw new un(e.constructor.name);
    const o = t.transform(r.value, r);
    if (n.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((i) => (r.value = i, r));
    if (o instanceof Promise)
      throw new Se();
    return r.value = o, r;
  };
});
function $r(e, t) {
  return e.issues.length && t === void 0 ? { issues: [], value: void 0 } : e;
}
const vi = /* @__PURE__ */ f("$ZodOptional", (e, t) => {
  J.init(e, t), e._zod.optin = "optional", e._zod.optout = "optional", R(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, void 0]) : void 0), R(e._zod, "pattern", () => {
    const r = t.innerType._zod.pattern;
    return r ? new RegExp(`^(${Nt(r.source)})?$`) : void 0;
  }), e._zod.parse = (r, n) => {
    if (t.innerType._zod.optin === "optional") {
      const o = t.innerType._zod.run(r, n);
      return o instanceof Promise ? o.then((s) => $r(s, r.value)) : $r(o, r.value);
    }
    return r.value === void 0 ? r : t.innerType._zod.run(r, n);
  };
}), yi = /* @__PURE__ */ f("$ZodNullable", (e, t) => {
  J.init(e, t), R(e._zod, "optin", () => t.innerType._zod.optin), R(e._zod, "optout", () => t.innerType._zod.optout), R(e._zod, "pattern", () => {
    const r = t.innerType._zod.pattern;
    return r ? new RegExp(`^(${Nt(r.source)}|null)$`) : void 0;
  }), R(e._zod, "values", () => t.innerType._zod.values ? /* @__PURE__ */ new Set([...t.innerType._zod.values, null]) : void 0), e._zod.parse = (r, n) => r.value === null ? r : t.innerType._zod.run(r, n);
}), bi = /* @__PURE__ */ f("$ZodDefault", (e, t) => {
  J.init(e, t), e._zod.optin = "optional", R(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (r, n) => {
    if (n.direction === "backward")
      return t.innerType._zod.run(r, n);
    if (r.value === void 0)
      return r.value = t.defaultValue, r;
    const o = t.innerType._zod.run(r, n);
    return o instanceof Promise ? o.then((s) => Zr(s, t)) : Zr(o, t);
  };
});
function Zr(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const wi = /* @__PURE__ */ f("$ZodPrefault", (e, t) => {
  J.init(e, t), e._zod.optin = "optional", R(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (r, n) => (n.direction === "backward" || r.value === void 0 && (r.value = t.defaultValue), t.innerType._zod.run(r, n));
}), ki = /* @__PURE__ */ f("$ZodNonOptional", (e, t) => {
  J.init(e, t), R(e._zod, "values", () => {
    const r = t.innerType._zod.values;
    return r ? new Set([...r].filter((n) => n !== void 0)) : void 0;
  }), e._zod.parse = (r, n) => {
    const o = t.innerType._zod.run(r, n);
    return o instanceof Promise ? o.then((s) => Er(s, e)) : Er(o, e);
  };
});
function Er(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
const zi = /* @__PURE__ */ f("$ZodCatch", (e, t) => {
  J.init(e, t), R(e._zod, "optin", () => t.innerType._zod.optin), R(e._zod, "optout", () => t.innerType._zod.optout), R(e._zod, "values", () => t.innerType._zod.values), e._zod.parse = (r, n) => {
    if (n.direction === "backward")
      return t.innerType._zod.run(r, n);
    const o = t.innerType._zod.run(r, n);
    return o instanceof Promise ? o.then((s) => (r.value = s.value, s.issues.length && (r.value = t.catchValue({
      ...r,
      error: {
        issues: s.issues.map((i) => be(i, n, ye()))
      },
      input: r.value
    }), r.issues = []), r)) : (r.value = o.value, o.issues.length && (r.value = t.catchValue({
      ...r,
      error: {
        issues: o.issues.map((s) => be(s, n, ye()))
      },
      input: r.value
    }), r.issues = []), r);
  };
}), xi = /* @__PURE__ */ f("$ZodPipe", (e, t) => {
  J.init(e, t), R(e._zod, "values", () => t.in._zod.values), R(e._zod, "optin", () => t.in._zod.optin), R(e._zod, "optout", () => t.out._zod.optout), R(e._zod, "propValues", () => t.in._zod.propValues), e._zod.parse = (r, n) => {
    if (n.direction === "backward") {
      const s = t.out._zod.run(r, n);
      return s instanceof Promise ? s.then((i) => Ge(i, t.in, n)) : Ge(s, t.in, n);
    }
    const o = t.in._zod.run(r, n);
    return o instanceof Promise ? o.then((s) => Ge(s, t.out, n)) : Ge(o, t.out, n);
  };
});
function Ge(e, t, r) {
  return e.issues.length ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, r);
}
const $i = /* @__PURE__ */ f("$ZodReadonly", (e, t) => {
  J.init(e, t), R(e._zod, "propValues", () => t.innerType._zod.propValues), R(e._zod, "values", () => t.innerType._zod.values), R(e._zod, "optin", () => t.innerType._zod.optin), R(e._zod, "optout", () => t.innerType._zod.optout), e._zod.parse = (r, n) => {
    if (n.direction === "backward")
      return t.innerType._zod.run(r, n);
    const o = t.innerType._zod.run(r, n);
    return o instanceof Promise ? o.then(Ar) : Ar(o);
  };
});
function Ar(e) {
  return e.value = Object.freeze(e.value), e;
}
const Zi = /* @__PURE__ */ f("$ZodCustom", (e, t) => {
  fe.init(e, t), J.init(e, t), e._zod.parse = (r, n) => r, e._zod.check = (r) => {
    const n = r.value, o = t.fn(n);
    if (o instanceof Promise)
      return o.then((s) => Ir(s, r, n, e));
    Ir(o, r, n, e);
  };
});
function Ir(e, t, r, n) {
  if (!e) {
    const o = {
      code: "custom",
      input: r,
      inst: n,
      // incorporates params.error into issue reporting
      path: [...n._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !n._zod.def.abort
      // params: inst._zod.def.params,
    };
    n._zod.def.params && (o.params = n._zod.def.params), t.issues.push(Le(o));
  }
}
class Ei {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(t, ...r) {
    const n = r[0];
    if (this._map.set(t, n), n && typeof n == "object" && "id" in n) {
      if (this._idmap.has(n.id))
        throw new Error(`ID ${n.id} already exists in the registry`);
      this._idmap.set(n.id, t);
    }
    return this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(t) {
    const r = this._map.get(t);
    return r && typeof r == "object" && "id" in r && this._idmap.delete(r.id), this._map.delete(t), this;
  }
  get(t) {
    const r = t._zod.parent;
    if (r) {
      const n = { ...this.get(r) ?? {} };
      delete n.id;
      const o = { ...n, ...this._map.get(t) };
      return Object.keys(o).length ? o : void 0;
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function Ai() {
  return new Ei();
}
const Ye = /* @__PURE__ */ Ai();
function Ii(e, t) {
  return new e({
    type: "string",
    ...$(t)
  });
}
function Fi(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Fr(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Si(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function ji(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...$(t)
  });
}
function Di(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...$(t)
  });
}
function Vi(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...$(t)
  });
}
function Pi(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Ci(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Oi(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Ti(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Ri(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Ui(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Ni(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Li(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Mi(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Bi(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Wi(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function qi(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Hi(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Ki(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Ji(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Gi(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...$(t)
  });
}
function Yi(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...$(t)
  });
}
function Xi(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...$(t)
  });
}
function Qi(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...$(t)
  });
}
function ea(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...$(t)
  });
}
function ta(e) {
  return new e({
    type: "unknown"
  });
}
function ra(e, t) {
  return new e({
    type: "never",
    ...$(t)
  });
}
function bn(e, t) {
  return new Zs({
    check: "max_length",
    ...$(t),
    maximum: e
  });
}
function at(e, t) {
  return new Es({
    check: "min_length",
    ...$(t),
    minimum: e
  });
}
function wn(e, t) {
  return new As({
    check: "length_equals",
    ...$(t),
    length: e
  });
}
function na(e, t) {
  return new Is({
    check: "string_format",
    format: "regex",
    ...$(t),
    pattern: e
  });
}
function oa(e) {
  return new Fs({
    check: "string_format",
    format: "lowercase",
    ...$(e)
  });
}
function sa(e) {
  return new Ss({
    check: "string_format",
    format: "uppercase",
    ...$(e)
  });
}
function ia(e, t) {
  return new js({
    check: "string_format",
    format: "includes",
    ...$(t),
    includes: e
  });
}
function aa(e, t) {
  return new Ds({
    check: "string_format",
    format: "starts_with",
    ...$(t),
    prefix: e
  });
}
function ua(e, t) {
  return new Vs({
    check: "string_format",
    format: "ends_with",
    ...$(t),
    suffix: e
  });
}
function We(e) {
  return new Ps({
    check: "overwrite",
    tx: e
  });
}
function ca(e) {
  return We((t) => t.normalize(e));
}
function la() {
  return We((e) => e.trim());
}
function da() {
  return We((e) => e.toLowerCase());
}
function fa() {
  return We((e) => e.toUpperCase());
}
function ha(e, t, r) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...$(r)
  });
}
function pa(e, t, r) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...$(r)
  });
}
function ma(e) {
  const t = ga((r) => (r.addIssue = (n) => {
    if (typeof n == "string")
      r.issues.push(Le(n, r.value, t._zod.def));
    else {
      const o = n;
      o.fatal && (o.continue = !1), o.code ?? (o.code = "custom"), o.input ?? (o.input = r.value), o.inst ?? (o.inst = t), o.continue ?? (o.continue = !t._zod.def.abort), r.issues.push(Le(o));
    }
  }, e(r.value, r)));
  return t;
}
function ga(e, t) {
  const r = new fe({
    check: "custom",
    ...$(t)
  });
  return r._zod.check = e, r;
}
const _a = /* @__PURE__ */ f("ZodISODateTime", (e, t) => {
  Js.init(e, t), L.init(e, t);
});
function va(e) {
  return Yi(_a, e);
}
const ya = /* @__PURE__ */ f("ZodISODate", (e, t) => {
  Gs.init(e, t), L.init(e, t);
});
function ba(e) {
  return Xi(ya, e);
}
const wa = /* @__PURE__ */ f("ZodISOTime", (e, t) => {
  Ys.init(e, t), L.init(e, t);
});
function ka(e) {
  return Qi(wa, e);
}
const za = /* @__PURE__ */ f("ZodISODuration", (e, t) => {
  Xs.init(e, t), L.init(e, t);
});
function xa(e) {
  return ea(za, e);
}
const $a = (e, t) => {
  Mt.init(e, t), e.name = "ZodError", Object.defineProperties(e, {
    format: {
      value: (r) => Mo(e, r)
      // enumerable: false,
    },
    flatten: {
      value: (r) => Lo(e, r)
      // enumerable: false,
    },
    addIssue: {
      value: (r) => {
        e.issues.push(r), e.message = JSON.stringify(e.issues, Et, 2);
      }
      // enumerable: false,
    },
    addIssues: {
      value: (r) => {
        e.issues.push(...r), e.message = JSON.stringify(e.issues, Et, 2);
      }
      // enumerable: false,
    },
    isEmpty: {
      get() {
        return e.issues.length === 0;
      }
      // enumerable: false,
    }
  });
}, se = f("ZodError", $a, {
  Parent: Error
}), Za = /* @__PURE__ */ ht(se), Ea = /* @__PURE__ */ pt(se), Aa = /* @__PURE__ */ mt(se), Ia = /* @__PURE__ */ gt(se), Fa = /* @__PURE__ */ Ko(se), Sa = /* @__PURE__ */ Jo(se), ja = /* @__PURE__ */ Go(se), Da = /* @__PURE__ */ Yo(se), Va = /* @__PURE__ */ Xo(se), Pa = /* @__PURE__ */ Qo(se), Ca = /* @__PURE__ */ es(se), Oa = /* @__PURE__ */ ts(se), G = /* @__PURE__ */ f("ZodType", (e, t) => (J.init(e, t), e.def = t, e.type = t.type, Object.defineProperty(e, "_def", { value: t }), e.check = (...r) => e.clone(ke(t, {
  checks: [
    ...t.checks ?? [],
    ...r.map((n) => typeof n == "function" ? { _zod: { check: n, def: { check: "custom" }, onattach: [] } } : n)
  ]
})), e.clone = (r, n) => _e(e, r, n), e.brand = () => e, e.register = (r, n) => (r.add(e, n), e), e.parse = (r, n) => Za(e, r, n, { callee: e.parse }), e.safeParse = (r, n) => Aa(e, r, n), e.parseAsync = async (r, n) => Ea(e, r, n, { callee: e.parseAsync }), e.safeParseAsync = async (r, n) => Ia(e, r, n), e.spa = e.safeParseAsync, e.encode = (r, n) => Fa(e, r, n), e.decode = (r, n) => Sa(e, r, n), e.encodeAsync = async (r, n) => ja(e, r, n), e.decodeAsync = async (r, n) => Da(e, r, n), e.safeEncode = (r, n) => Va(e, r, n), e.safeDecode = (r, n) => Pa(e, r, n), e.safeEncodeAsync = async (r, n) => Ca(e, r, n), e.safeDecodeAsync = async (r, n) => Oa(e, r, n), e.refine = (r, n) => e.check(Au(r, n)), e.superRefine = (r) => e.check(Iu(r)), e.overwrite = (r) => e.check(We(r)), e.optional = () => Dr(e), e.nullable = () => Vr(e), e.nullish = () => Dr(Vr(e)), e.nonoptional = (r) => wu(e, r), e.array = () => iu(e), e.or = (r) => lu([e, r]), e.and = (r) => fu(e, r), e.transform = (r) => Pr(e, mu(r)), e.default = (r) => vu(e, r), e.prefault = (r) => bu(e, r), e.catch = (r) => zu(e, r), e.pipe = (r) => Pr(e, r), e.readonly = () => Zu(e), e.describe = (r) => {
  const n = e.clone();
  return Ye.add(n, { description: r }), n;
}, Object.defineProperty(e, "description", {
  get() {
    var r;
    return (r = Ye.get(e)) == null ? void 0 : r.description;
  },
  configurable: !0
}), e.meta = (...r) => {
  if (r.length === 0)
    return Ye.get(e);
  const n = e.clone();
  return Ye.add(n, r[0]), n;
}, e.isOptional = () => e.safeParse(void 0).success, e.isNullable = () => e.safeParse(null).success, e)), kn = /* @__PURE__ */ f("_ZodString", (e, t) => {
  Bt.init(e, t), G.init(e, t);
  const r = e._zod.bag;
  e.format = r.format ?? null, e.minLength = r.minimum ?? null, e.maxLength = r.maximum ?? null, e.regex = (...n) => e.check(na(...n)), e.includes = (...n) => e.check(ia(...n)), e.startsWith = (...n) => e.check(aa(...n)), e.endsWith = (...n) => e.check(ua(...n)), e.min = (...n) => e.check(at(...n)), e.max = (...n) => e.check(bn(...n)), e.length = (...n) => e.check(wn(...n)), e.nonempty = (...n) => e.check(at(1, ...n)), e.lowercase = (n) => e.check(oa(n)), e.uppercase = (n) => e.check(sa(n)), e.trim = () => e.check(la()), e.normalize = (...n) => e.check(ca(...n)), e.toLowerCase = () => e.check(da()), e.toUpperCase = () => e.check(fa());
}), Ta = /* @__PURE__ */ f("ZodString", (e, t) => {
  Bt.init(e, t), kn.init(e, t), e.email = (r) => e.check(Fi(Ra, r)), e.url = (r) => e.check(Pi(Ua, r)), e.jwt = (r) => e.check(Gi(tu, r)), e.emoji = (r) => e.check(Ci(Na, r)), e.guid = (r) => e.check(Fr(Sr, r)), e.uuid = (r) => e.check(Si(Xe, r)), e.uuidv4 = (r) => e.check(ji(Xe, r)), e.uuidv6 = (r) => e.check(Di(Xe, r)), e.uuidv7 = (r) => e.check(Vi(Xe, r)), e.nanoid = (r) => e.check(Oi(La, r)), e.guid = (r) => e.check(Fr(Sr, r)), e.cuid = (r) => e.check(Ti(Ma, r)), e.cuid2 = (r) => e.check(Ri(Ba, r)), e.ulid = (r) => e.check(Ui(Wa, r)), e.base64 = (r) => e.check(Hi(Xa, r)), e.base64url = (r) => e.check(Ki(Qa, r)), e.xid = (r) => e.check(Ni(qa, r)), e.ksuid = (r) => e.check(Li(Ha, r)), e.ipv4 = (r) => e.check(Mi(Ka, r)), e.ipv6 = (r) => e.check(Bi(Ja, r)), e.cidrv4 = (r) => e.check(Wi(Ga, r)), e.cidrv6 = (r) => e.check(qi(Ya, r)), e.e164 = (r) => e.check(Ji(eu, r)), e.datetime = (r) => e.check(va(r)), e.date = (r) => e.check(ba(r)), e.time = (r) => e.check(ka(r)), e.duration = (r) => e.check(xa(r));
});
function Oe(e) {
  return Ii(Ta, e);
}
const L = /* @__PURE__ */ f("ZodStringFormat", (e, t) => {
  N.init(e, t), kn.init(e, t);
}), Ra = /* @__PURE__ */ f("ZodEmail", (e, t) => {
  Us.init(e, t), L.init(e, t);
}), Sr = /* @__PURE__ */ f("ZodGUID", (e, t) => {
  Ts.init(e, t), L.init(e, t);
}), Xe = /* @__PURE__ */ f("ZodUUID", (e, t) => {
  Rs.init(e, t), L.init(e, t);
}), Ua = /* @__PURE__ */ f("ZodURL", (e, t) => {
  Ns.init(e, t), L.init(e, t);
}), Na = /* @__PURE__ */ f("ZodEmoji", (e, t) => {
  Ls.init(e, t), L.init(e, t);
}), La = /* @__PURE__ */ f("ZodNanoID", (e, t) => {
  Ms.init(e, t), L.init(e, t);
}), Ma = /* @__PURE__ */ f("ZodCUID", (e, t) => {
  Bs.init(e, t), L.init(e, t);
}), Ba = /* @__PURE__ */ f("ZodCUID2", (e, t) => {
  Ws.init(e, t), L.init(e, t);
}), Wa = /* @__PURE__ */ f("ZodULID", (e, t) => {
  qs.init(e, t), L.init(e, t);
}), qa = /* @__PURE__ */ f("ZodXID", (e, t) => {
  Hs.init(e, t), L.init(e, t);
}), Ha = /* @__PURE__ */ f("ZodKSUID", (e, t) => {
  Ks.init(e, t), L.init(e, t);
}), Ka = /* @__PURE__ */ f("ZodIPv4", (e, t) => {
  Qs.init(e, t), L.init(e, t);
}), Ja = /* @__PURE__ */ f("ZodIPv6", (e, t) => {
  ei.init(e, t), L.init(e, t);
}), Ga = /* @__PURE__ */ f("ZodCIDRv4", (e, t) => {
  ti.init(e, t), L.init(e, t);
}), Ya = /* @__PURE__ */ f("ZodCIDRv6", (e, t) => {
  ri.init(e, t), L.init(e, t);
}), Xa = /* @__PURE__ */ f("ZodBase64", (e, t) => {
  ni.init(e, t), L.init(e, t);
}), Qa = /* @__PURE__ */ f("ZodBase64URL", (e, t) => {
  si.init(e, t), L.init(e, t);
}), eu = /* @__PURE__ */ f("ZodE164", (e, t) => {
  ii.init(e, t), L.init(e, t);
}), tu = /* @__PURE__ */ f("ZodJWT", (e, t) => {
  ui.init(e, t), L.init(e, t);
}), ru = /* @__PURE__ */ f("ZodUnknown", (e, t) => {
  ci.init(e, t), G.init(e, t);
});
function jr() {
  return ta(ru);
}
const nu = /* @__PURE__ */ f("ZodNever", (e, t) => {
  li.init(e, t), G.init(e, t);
});
function ou(e) {
  return ra(nu, e);
}
const su = /* @__PURE__ */ f("ZodArray", (e, t) => {
  di.init(e, t), G.init(e, t), e.element = t.element, e.min = (r, n) => e.check(at(r, n)), e.nonempty = (r) => e.check(at(1, r)), e.max = (r, n) => e.check(bn(r, n)), e.length = (r, n) => e.check(wn(r, n)), e.unwrap = () => e.element;
});
function iu(e, t) {
  return ha(su, e, t);
}
const au = /* @__PURE__ */ f("ZodObject", (e, t) => {
  hi.init(e, t), G.init(e, t), R(e, "shape", () => t.shape), e.keyof = () => hu(Object.keys(e._zod.def.shape)), e.catchall = (r) => e.clone({ ...e._zod.def, catchall: r }), e.passthrough = () => e.clone({ ...e._zod.def, catchall: jr() }), e.loose = () => e.clone({ ...e._zod.def, catchall: jr() }), e.strict = () => e.clone({ ...e._zod.def, catchall: ou() }), e.strip = () => e.clone({ ...e._zod.def, catchall: void 0 }), e.extend = (r) => Oo(e, r), e.safeExtend = (r) => To(e, r), e.merge = (r) => Ro(e, r), e.pick = (r) => Po(e, r), e.omit = (r) => Co(e, r), e.partial = (...r) => Uo(zn, e, r[0]), e.required = (...r) => No(xn, e, r[0]);
});
function uu(e, t) {
  const r = {
    type: "object",
    shape: e ?? {},
    ...$(t)
  };
  return new au(r);
}
const cu = /* @__PURE__ */ f("ZodUnion", (e, t) => {
  pi.init(e, t), G.init(e, t), e.options = t.options;
});
function lu(e, t) {
  return new cu({
    type: "union",
    options: e,
    ...$(t)
  });
}
const du = /* @__PURE__ */ f("ZodIntersection", (e, t) => {
  mi.init(e, t), G.init(e, t);
});
function fu(e, t) {
  return new du({
    type: "intersection",
    left: e,
    right: t
  });
}
const It = /* @__PURE__ */ f("ZodEnum", (e, t) => {
  gi.init(e, t), G.init(e, t), e.enum = t.entries, e.options = Object.values(t.entries);
  const r = new Set(Object.keys(t.entries));
  e.extract = (n, o) => {
    const s = {};
    for (const i of n)
      if (r.has(i))
        s[i] = t.entries[i];
      else
        throw new Error(`Key ${i} not found in enum`);
    return new It({
      ...t,
      checks: [],
      ...$(o),
      entries: s
    });
  }, e.exclude = (n, o) => {
    const s = { ...t.entries };
    for (const i of n)
      if (r.has(i))
        delete s[i];
      else
        throw new Error(`Key ${i} not found in enum`);
    return new It({
      ...t,
      checks: [],
      ...$(o),
      entries: s
    });
  };
});
function hu(e, t) {
  const r = Array.isArray(e) ? Object.fromEntries(e.map((n) => [n, n])) : e;
  return new It({
    type: "enum",
    entries: r,
    ...$(t)
  });
}
const pu = /* @__PURE__ */ f("ZodTransform", (e, t) => {
  _i.init(e, t), G.init(e, t), e._zod.parse = (r, n) => {
    if (n.direction === "backward")
      throw new un(e.constructor.name);
    r.addIssue = (s) => {
      if (typeof s == "string")
        r.issues.push(Le(s, r.value, t));
      else {
        const i = s;
        i.fatal && (i.continue = !1), i.code ?? (i.code = "custom"), i.input ?? (i.input = r.value), i.inst ?? (i.inst = e), r.issues.push(Le(i));
      }
    };
    const o = t.transform(r.value, r);
    return o instanceof Promise ? o.then((s) => (r.value = s, r)) : (r.value = o, r);
  };
});
function mu(e) {
  return new pu({
    type: "transform",
    transform: e
  });
}
const zn = /* @__PURE__ */ f("ZodOptional", (e, t) => {
  vi.init(e, t), G.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function Dr(e) {
  return new zn({
    type: "optional",
    innerType: e
  });
}
const gu = /* @__PURE__ */ f("ZodNullable", (e, t) => {
  yi.init(e, t), G.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function Vr(e) {
  return new gu({
    type: "nullable",
    innerType: e
  });
}
const _u = /* @__PURE__ */ f("ZodDefault", (e, t) => {
  bi.init(e, t), G.init(e, t), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function vu(e, t) {
  return new _u({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : dn(t);
    }
  });
}
const yu = /* @__PURE__ */ f("ZodPrefault", (e, t) => {
  wi.init(e, t), G.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function bu(e, t) {
  return new yu({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : dn(t);
    }
  });
}
const xn = /* @__PURE__ */ f("ZodNonOptional", (e, t) => {
  ki.init(e, t), G.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function wu(e, t) {
  return new xn({
    type: "nonoptional",
    innerType: e,
    ...$(t)
  });
}
const ku = /* @__PURE__ */ f("ZodCatch", (e, t) => {
  zi.init(e, t), G.init(e, t), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function zu(e, t) {
  return new ku({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : () => t
  });
}
const xu = /* @__PURE__ */ f("ZodPipe", (e, t) => {
  xi.init(e, t), G.init(e, t), e.in = t.in, e.out = t.out;
});
function Pr(e, t) {
  return new xu({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const $u = /* @__PURE__ */ f("ZodReadonly", (e, t) => {
  $i.init(e, t), G.init(e, t), e.unwrap = () => e._zod.def.innerType;
});
function Zu(e) {
  return new $u({
    type: "readonly",
    innerType: e
  });
}
const Eu = /* @__PURE__ */ f("ZodCustom", (e, t) => {
  Zi.init(e, t), G.init(e, t);
});
function Au(e, t = {}) {
  return pa(Eu, e, t);
}
function Iu(e) {
  return ma(e);
}
const Cr = (e, t, r) => {
  if (e && "reportValidity" in e) {
    const n = _(r, t);
    e.setCustomValidity(n && n.message || ""), e.reportValidity();
  }
}, Ft = (e, t) => {
  for (const r in t.fields) {
    const n = t.fields[r];
    n && n.ref && "reportValidity" in n.ref ? Cr(n.ref, r, e) : n && n.refs && n.refs.forEach((o) => Cr(o, r, e));
  }
}, Or = (e, t) => {
  t.shouldUseNativeValidation && Ft(e, t);
  const r = {};
  for (const n in e) {
    const o = _(t.fields, n), s = Object.assign(e[n] || {}, { ref: o && o.ref });
    if (Fu(t.names || Object.keys(e), n)) {
      const i = Object.assign({}, _(r, n));
      C(i, "root", s), C(r, n, i);
    } else C(r, n, s);
  }
  return r;
}, Fu = (e, t) => {
  const r = Tr(t);
  return e.some((n) => Tr(n).match(`^${r}\\.\\d+`));
};
function Tr(e) {
  return e.replace(/\]|\[/g, "");
}
function Rr(e, t) {
  try {
    var r = e();
  } catch (n) {
    return t(n);
  }
  return r && r.then ? r.then(void 0, t) : r;
}
function Su(e, t) {
  for (var r = {}; e.length; ) {
    var n = e[0], o = n.code, s = n.message, i = n.path.join(".");
    if (!r[i]) if ("unionErrors" in n) {
      var u = n.unionErrors[0].errors[0];
      r[i] = { message: u.message, type: u.code };
    } else r[i] = { message: s, type: o };
    if ("unionErrors" in n && n.unionErrors.forEach(function(p) {
      return p.errors.forEach(function(w) {
        return e.push(w);
      });
    }), t) {
      var d = r[i].types, h = d && d[n.code];
      r[i] = Ct(i, t, r, o, h ? [].concat(h, n.message) : n.message);
    }
    e.shift();
  }
  return r;
}
function ju(e, t) {
  for (var r = {}; e.length; ) {
    var n = e[0], o = n.code, s = n.message, i = n.path.join(".");
    if (!r[i]) if (n.code === "invalid_union" && n.errors.length > 0) {
      var u = n.errors[0][0];
      r[i] = { message: u.message, type: u.code };
    } else r[i] = { message: s, type: o };
    if (n.code === "invalid_union" && n.errors.forEach(function(p) {
      return p.forEach(function(w) {
        return e.push(w);
      });
    }), t) {
      var d = r[i].types, h = d && d[n.code];
      r[i] = Ct(i, t, r, o, h ? [].concat(h, n.message) : n.message);
    }
    e.shift();
  }
  return r;
}
function Du(e, t, r) {
  if (r === void 0 && (r = {}), function(n) {
    return "_def" in n && typeof n._def == "object" && "typeName" in n._def;
  }(e)) return function(n, o, s) {
    try {
      return Promise.resolve(Rr(function() {
        return Promise.resolve(e[r.mode === "sync" ? "parse" : "parseAsync"](n, t)).then(function(i) {
          return s.shouldUseNativeValidation && Ft({}, s), { errors: {}, values: r.raw ? Object.assign({}, n) : i };
        });
      }, function(i) {
        if (function(u) {
          return Array.isArray(u == null ? void 0 : u.issues);
        }(i)) return { values: {}, errors: Or(Su(i.errors, !s.shouldUseNativeValidation && s.criteriaMode === "all"), s) };
        throw i;
      }));
    } catch (i) {
      return Promise.reject(i);
    }
  };
  if (function(n) {
    return "_zod" in n && typeof n._zod == "object";
  }(e)) return function(n, o, s) {
    try {
      return Promise.resolve(Rr(function() {
        return Promise.resolve((r.mode === "sync" ? Bo : Wo)(e, n, t)).then(function(i) {
          return s.shouldUseNativeValidation && Ft({}, s), { errors: {}, values: r.raw ? Object.assign({}, n) : i };
        });
      }, function(i) {
        if (function(u) {
          return u instanceof Mt;
        }(i)) return { values: {}, errors: Or(ju(i.issues, !s.shouldUseNativeValidation && s.criteriaMode === "all"), s) };
        throw i;
      }));
    } catch (i) {
      return Promise.reject(i);
    }
  };
  throw new Error("Invalid input: not a Zod schema");
}
const Ur = (e) => {
  const t = document.createElement("textarea");
  return t.innerHTML = e, t.value;
}, Vu = uu({
  profileImage: Oe().optional(),
  coverImage: Oe().optional(),
  name: Oe().nonempty({
    message: "Display name is required."
  }).max(64, {
    message: "Display name must be less than 64 characters."
  }),
  handle: Oe().min(2, {
    message: "Handle must be at least 2 characters."
  }).max(100, {
    message: "Handle must be less than 100 characters."
  }).regex(/^[a-zA-Z0-9_]+$/, {
    message: "Handle must contain only letters, numbers, and underscores."
  }),
  bio: Oe().max(250, {
    message: "Bio must be less than 250 characters."
  }).optional()
}), Tu = ({ account: e, setIsEditingProfile: t }) => {
  const [r, n] = xe(e.avatarUrl || null), o = rr(null), [s, i] = xe(!1), [u, d] = xe(e.bannerImageUrl || null), h = rr(null), [p, w] = xe(!1), [b, F] = xe(""), [D, I] = xe(!1), { mutate: B } = Nn((e == null ? void 0 : e.handle) || ""), O = Io({
    resolver: Du(Vu),
    defaultValues: {
      profileImage: e.avatarUrl,
      coverImage: e.bannerImageUrl || "",
      name: e.name,
      handle: "",
      bio: e.bio ? Ur(e.bio) : ""
    }
  }), E = !!O.formState.errors.name, S = !!O.formState.errors.handle;
  Ln(() => {
    if (e.handle) {
      const k = e.handle.match(/@([^@]+)@(.+)/);
      k && (O.setValue("handle", k[1]), F(k[2]));
    }
  }, [e.handle, O]);
  const V = () => {
    var k;
    (k = o.current) == null || k.click();
  }, j = async (k) => {
    try {
      return i(!0), await ar(k);
    } catch (z) {
      n(null), O.setValue("profileImage", "");
      let Z = "Failed to upload image. Try again.";
      if (z && typeof z == "object" && "statusCode" in z)
        switch (z.statusCode) {
          case 413:
            Z = "Image size exceeds limit.";
            break;
          case 415:
            Z = "The file type is not supported.";
            break;
        }
      Ve.error(Z);
    } finally {
      i(!1);
    }
  }, ie = async (k) => {
    const z = k.target.files;
    if (z && z.length > 0) {
      const Z = z[0];
      if (Z.size > sr) {
        Ve.error(ir), k.target.value = "";
        return;
      }
      if (!await qn(Z)) {
        Ve.error(Hn), k.target.value = "";
        return;
      }
      const H = URL.createObjectURL(Z);
      n(H);
      const Y = await j(Z);
      O.setValue("profileImage", Y);
    }
  }, ne = () => {
    var k;
    (k = h.current) == null || k.click();
  }, he = async (k) => {
    try {
      return w(!0), await ar(k);
    } catch (z) {
      d(null), O.setValue("coverImage", "");
      let Z = "Failed to upload image. Try again.";
      if (z && typeof z == "object" && "statusCode" in z)
        switch (z.statusCode) {
          case 413:
            Z = "Image size exceeds limit.";
            break;
          case 415:
            Z = "The file type is not supported.";
            break;
        }
      Ve.error(Z);
    } finally {
      w(!1);
    }
  }, ee = async (k) => {
    const z = k.target.files;
    if (z && z.length > 0) {
      const Z = z[0];
      if (Z.size > sr) {
        Ve.error(ir), k.target.value = "";
        return;
      }
      const U = URL.createObjectURL(Z);
      d(U);
      const H = await he(Z);
      O.setValue("coverImage", H);
    }
  };
  function le(k) {
    I(!0);
    const z = e.bio ? Ur(e.bio) : "";
    if (k.name === e.name && k.handle === e.handle.split("@")[1] && k.bio === z && k.profileImage === e.avatarUrl && k.coverImage === e.bannerImageUrl) {
      I(!1), t(!1);
      return;
    }
    B({
      name: k.name || e.name,
      username: k.handle || e.handle,
      bio: k.bio ?? "",
      avatarUrl: k.profileImage || "",
      bannerImageUrl: k.coverImage || ""
    }, {
      onSettled() {
        I(!1), t(!1);
      }
    });
  }
  return /* @__PURE__ */ v.jsx(Fo, { ...O, children: /* @__PURE__ */ v.jsxs(
    "form",
    {
      className: "flex flex-col gap-5",
      onKeyDown: (k) => {
        k.key === "Enter" && !k.shiftKey && (k.preventDefault(), O.handleSubmit(le)());
      },
      onSubmit: O.handleSubmit(le),
      children: [
        /* @__PURE__ */ v.jsxs("div", { className: "relative mb-2", children: [
          /* @__PURE__ */ v.jsx("div", { className: "group relative flex h-[180px] cursor-pointer items-center justify-center bg-gray-100 dark:bg-gray-950", onClick: ne, children: u ? /* @__PURE__ */ v.jsxs(v.Fragment, { children: [
            /* @__PURE__ */ v.jsx("img", { className: `size-full object-cover ${p && "opacity-10"}`, src: u }),
            p && /* @__PURE__ */ v.jsx("div", { className: "absolute leading-[0]", children: /* @__PURE__ */ v.jsx(nr, { size: "md" }) }),
            /* @__PURE__ */ v.jsx(De, { className: "absolute right-3 top-3 size-8 bg-black/60 opacity-0 hover:bg-black/80 group-hover:opacity-100 dark:text-white", onClick: (k) => {
              k.stopPropagation(), d(null), O.setValue("coverImage", "");
            }, children: /* @__PURE__ */ v.jsx(or, {}) })
          ] }) : /* @__PURE__ */ v.jsx(De, { className: "pointer-events-none absolute bottom-3 right-3 bg-gray-250 group-hover:bg-gray-300", variant: "secondary", children: "Upload cover image" }) }),
          /* @__PURE__ */ v.jsx("div", { className: "group absolute -bottom-10 left-4 flex size-20 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-gray-100 dark:border-[#101114] dark:bg-gray-950", onClick: V, children: r ? /* @__PURE__ */ v.jsxs(v.Fragment, { children: [
            /* @__PURE__ */ v.jsx("img", { className: `size-full rounded-full object-cover ${s && "opacity-10"}`, src: r }),
            s && /* @__PURE__ */ v.jsx("div", { className: "absolute leading-[0]", children: /* @__PURE__ */ v.jsx(nr, { size: "md" }) }),
            /* @__PURE__ */ v.jsx(De, { className: "absolute -right-2 -top-2 h-8 w-10 rounded-full bg-black/80 opacity-0 hover:bg-black/90 group-hover:opacity-100 dark:text-white", onClick: (k) => {
              k.stopPropagation(), n(null), O.setValue("profileImage", "");
            }, children: /* @__PURE__ */ v.jsx(or, {}) })
          ] }) : /* @__PURE__ */ v.jsx(Mn, { size: 32, strokeWidth: 1.5 }) })
        ] }),
        /* @__PURE__ */ v.jsx(
          Ce,
          {
            control: O.control,
            name: "profileImage",
            render: () => /* @__PURE__ */ v.jsxs(Ee, { children: [
              /* @__PURE__ */ v.jsx(Ae, { children: /* @__PURE__ */ v.jsx(
                Ke,
                {
                  ref: o,
                  accept: "image/*",
                  className: "hidden",
                  type: "file",
                  onChange: ie
                }
              ) }),
              /* @__PURE__ */ v.jsx(Ie, {})
            ] })
          }
        ),
        /* @__PURE__ */ v.jsx(
          Ce,
          {
            control: O.control,
            name: "coverImage",
            render: () => /* @__PURE__ */ v.jsxs(Ee, { children: [
              /* @__PURE__ */ v.jsx(Ae, { children: /* @__PURE__ */ v.jsx(
                Ke,
                {
                  ref: h,
                  accept: "image/*",
                  className: "hidden",
                  type: "file",
                  onChange: ee
                }
              ) }),
              /* @__PURE__ */ v.jsx(Ie, {})
            ] })
          }
        ),
        /* @__PURE__ */ v.jsx(
          Ce,
          {
            control: O.control,
            name: "name",
            render: ({ field: k }) => /* @__PURE__ */ v.jsxs(Ee, { children: [
              /* @__PURE__ */ v.jsx(Qe, { children: "Display name" }),
              /* @__PURE__ */ v.jsx(Ae, { children: /* @__PURE__ */ v.jsx(Ke, { placeholder: "Jamie Larson", ...k }) }),
              !E && /* @__PURE__ */ v.jsx(Zt, { children: "The name shown to your followers in the Inbox and Feed" }),
              /* @__PURE__ */ v.jsx(Ie, {})
            ] })
          }
        ),
        /* @__PURE__ */ v.jsx(
          Ce,
          {
            control: O.control,
            name: "handle",
            render: ({ field: k }) => /* @__PURE__ */ v.jsxs(Ee, { children: [
              /* @__PURE__ */ v.jsx(Qe, { children: "Handle" }),
              /* @__PURE__ */ v.jsx(Ae, { children: /* @__PURE__ */ v.jsxs("div", { className: "focus-within:outline-hidden relative flex items-center justify-stretch gap-1 rounded-md border border-transparent bg-gray-150 px-3 transition-colors focus-within:border-green focus-within:bg-transparent focus-within:shadow-[0_0_0_2px_rgba(48,207,67,.25)] dark:bg-gray-900", children: [
                /* @__PURE__ */ v.jsx(Kn, { className: "w-4 min-w-4 text-gray-700", size: 16 }),
                /* @__PURE__ */ v.jsx(Ke, { className: "border-none! shadow-none! outline-hidden! w-auto grow bg-transparent px-0", placeholder: "index", ...k }),
                /* @__PURE__ */ v.jsxs("span", { className: "max-w-[200px] truncate whitespace-nowrap text-right text-gray-700 max-sm:hidden", title: `@${b}`, children: [
                  "@",
                  b
                ] })
              ] }) }),
              !S && /* @__PURE__ */ v.jsxs(Zt, { children: [
                "Your social web handle that others can follow. Works just like an email address. ",
                /* @__PURE__ */ v.jsx("a", { className: "font-medium text-purple", href: "https://ghost.org/help/social-web/", rel: "noreferrer", target: "_blank", children: "Learn more" })
              ] }),
              /* @__PURE__ */ v.jsx(Ie, {})
            ] })
          }
        ),
        /* @__PURE__ */ v.jsx(
          Ce,
          {
            control: O.control,
            name: "bio",
            render: ({ field: k }) => /* @__PURE__ */ v.jsxs(Ee, { children: [
              /* @__PURE__ */ v.jsx(Qe, { children: "Bio" }),
              /* @__PURE__ */ v.jsx(Ae, { children: /* @__PURE__ */ v.jsx(an, { ...k }) }),
              /* @__PURE__ */ v.jsx(Ie, {})
            ] })
          }
        ),
        /* @__PURE__ */ v.jsxs(Bn, { className: "max-sm:gap-2", children: [
          /* @__PURE__ */ v.jsx(Wn, { asChild: !0, children: /* @__PURE__ */ v.jsx(De, { variant: "outline", children: "Cancel" }) }),
          /* @__PURE__ */ v.jsx(De, { disabled: D || s || p, type: "submit", children: "Save" })
        ] })
      ]
    }
  ) });
};
export {
  Tu as E
};
//# sourceMappingURL=edit-profile-C4Z2TwUh.mjs.map

import { h as g, i as b } from "./heading-BU5ZMUV_.mjs";
import { o as u, F as P, G as c, H as d, j as f, J as h, K as _, n as O } from "./index-DHZtUctP.mjs";
var R = Symbol.for("react.lazy"), y = P[" use ".trim().toString()];
function j(t) {
  return typeof t == "object" && t !== null && "then" in t;
}
function S(t) {
  return t != null && typeof t == "object" && "$$typeof" in t && t.$$typeof === R && "_payload" in t && j(t._payload);
}
// @__NO_SIDE_EFFECTS__
function A(t) {
  const n = /* @__PURE__ */ C(t), e = u((o, r) => {
    let { children: i, ...s } = o;
    S(i) && typeof y == "function" && (i = y(i._payload));
    const a = c.toArray(i), l = a.find(T);
    if (l) {
      const p = l.props.children, N = a.map((m) => m === l ? c.count(p) > 1 ? c.only(null) : d(p) ? p.props.children : null : m);
      return /* @__PURE__ */ f.jsx(n, { ...s, ref: r, children: d(p) ? h(p, void 0, N) : null });
    }
    return /* @__PURE__ */ f.jsx(n, { ...s, ref: r, children: i });
  });
  return e.displayName = `${t}.Slot`, e;
}
// @__NO_SIDE_EFFECTS__
function C(t) {
  const n = u((e, o) => {
    let { children: r, ...i } = e;
    if (S(r) && typeof y == "function" && (r = y(r._payload)), d(r)) {
      const s = $(r), a = w(i, r.props);
      return r.type !== _ && (a.ref = o ? g(o, s) : s), h(r, a);
    }
    return c.count(r) > 1 ? c.only(null) : null;
  });
  return n.displayName = `${t}.SlotClone`, n;
}
var I = Symbol("radix.slottable");
function T(t) {
  return d(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === I;
}
function w(t, n) {
  const e = { ...n };
  for (const o in n) {
    const r = t[o], i = n[o];
    /^on[A-Z]/.test(o) ? r && i ? e[o] = (...a) => {
      const l = i(...a);
      return r(...a), l;
    } : r && (e[o] = r) : o === "style" ? e[o] = { ...r, ...i } : o === "className" && (e[o] = [r, i].filter(Boolean).join(" "));
  }
  return { ...t, ...e };
}
function $(t) {
  var o, r;
  let n = (o = Object.getOwnPropertyDescriptor(t.props, "ref")) == null ? void 0 : o.get, e = n && "isReactWarning" in n && n.isReactWarning;
  return e ? t.ref : (n = (r = Object.getOwnPropertyDescriptor(t, "ref")) == null ? void 0 : r.get, e = n && "isReactWarning" in n && n.isReactWarning, e ? t.props.ref : t.props.ref || t.ref);
}
var L = [
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
], k = L.reduce((t, n) => {
  const e = /* @__PURE__ */ A(`Primitive.${n}`), o = u((r, i) => {
    const { asChild: s, ...a } = r, l = s ? e : n;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ f.jsx(l, { ...a, ref: i });
  });
  return o.displayName = `Primitive.${n}`, { ...t, [n]: o };
}, {}), z = "Separator", v = "horizontal", D = ["horizontal", "vertical"], x = u((t, n) => {
  const { decorative: e, orientation: o = v, ...r } = t, i = V(o) ? o : v, a = e ? { role: "none" } : { "aria-orientation": i === "vertical" ? i : void 0, role: "separator" };
  return /* @__PURE__ */ f.jsx(
    k.div,
    {
      "data-orientation": i,
      ...a,
      ...r,
      ref: n
    }
  );
});
x.displayName = z;
function V(t) {
  return D.includes(t);
}
var E = x;
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const W = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
], q = b("external-link", W), F = u(
  ({ className: t, orientation: n = "horizontal", decorative: e = !0, ...o }, r) => /* @__PURE__ */ f.jsx(
    E,
    {
      ref: r,
      className: O(
        "shrink-0 bg-border",
        n === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        t
      ),
      decorative: e,
      orientation: n,
      ...o
    }
  )
);
F.displayName = E.displayName;
export {
  q as E,
  F as S
};
//# sourceMappingURL=separator-B97phMDm.mjs.map

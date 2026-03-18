import { R, j as s, E as ee, D as te, o as P, b as U, p as k, u as G, q as N, a as oe, n as B } from "./index-DHZtUctP.mjs";
import { c as q, b as j, g as L, a as ne, P as V, e as E, u as re, f as se } from "./heading-BU5ZMUV_.mjs";
function ce(e) {
  const t = e + "CollectionProvider", [c, n] = q(t), [b, m] = c(
    t,
    { collectionRef: { current: null }, itemMap: /* @__PURE__ */ new Map() }
  ), l = (p) => {
    const { scope: o, children: u } = p, I = R.useRef(null), a = R.useRef(/* @__PURE__ */ new Map()).current;
    return /* @__PURE__ */ s.jsx(b, { scope: o, itemMap: a, collectionRef: I, children: u });
  };
  l.displayName = t;
  const x = e + "CollectionSlot", h = L(x), f = R.forwardRef(
    (p, o) => {
      const { scope: u, children: I } = p, a = m(x, u), i = j(o, a.collectionRef);
      return /* @__PURE__ */ s.jsx(h, { ref: i, children: I });
    }
  );
  f.displayName = x;
  const r = e + "CollectionItemSlot", v = "data-radix-collection-item", C = L(r), g = R.forwardRef(
    (p, o) => {
      const { scope: u, children: I, ...a } = p, i = R.useRef(null), T = j(o, i), w = m(r, u);
      return R.useEffect(() => (w.itemMap.set(i, { ref: i, ...a }), () => void w.itemMap.delete(i))), /* @__PURE__ */ s.jsx(C, { [v]: "", ref: T, children: I });
    }
  );
  g.displayName = r;
  function S(p) {
    const o = m(e + "CollectionConsumer", p);
    return R.useCallback(() => {
      const I = o.collectionRef.current;
      if (!I) return [];
      const a = Array.from(I.querySelectorAll(`[${v}]`));
      return Array.from(o.itemMap.values()).sort(
        (w, A) => a.indexOf(w.ref.current) - a.indexOf(A.ref.current)
      );
    }, [o.collectionRef, o.itemMap]);
  }
  return [
    { Provider: l, Slot: f, ItemSlot: g },
    S,
    n
  ];
}
var ae = te(void 0);
function le(e) {
  const t = ee(ae);
  return e || t || "ltr";
}
var M = "rovingFocusGroup.onEntryFocus", ie = { bubbles: !1, cancelable: !0 }, y = "RovingFocusGroup", [D, Y, ue] = ce(y), [fe, he] = q(
  y,
  [ue]
), [de, me] = fe(y), $ = P(
  (e, t) => /* @__PURE__ */ s.jsx(D.Provider, { scope: e.__scopeRovingFocusGroup, children: /* @__PURE__ */ s.jsx(D.Slot, { scope: e.__scopeRovingFocusGroup, children: /* @__PURE__ */ s.jsx(pe, { ...e, ref: t }) }) })
);
$.displayName = y;
var pe = P((e, t) => {
  const {
    __scopeRovingFocusGroup: c,
    orientation: n,
    loop: b = !1,
    dir: m,
    currentTabStopId: l,
    defaultCurrentTabStopId: x,
    onCurrentTabStopIdChange: h,
    onEntryFocus: f,
    preventScrollOnEntryFocus: r = !1,
    ...v
  } = e, C = k(null), g = j(t, C), S = le(m), [p, o] = re({
    prop: l,
    defaultProp: x ?? null,
    onChange: h,
    caller: y
  }), [u, I] = G(!1), a = se(f), i = Y(c), T = k(!1), [w, A] = G(0);
  return U(() => {
    const d = C.current;
    if (d)
      return d.addEventListener(M, a), () => d.removeEventListener(M, a);
  }, [a]), /* @__PURE__ */ s.jsx(
    de,
    {
      scope: c,
      orientation: n,
      dir: S,
      loop: b,
      currentTabStopId: p,
      onItemFocus: N(
        (d) => o(d),
        [o]
      ),
      onItemShiftTab: N(() => I(!0), []),
      onFocusableItemAdd: N(
        () => A((d) => d + 1),
        []
      ),
      onFocusableItemRemove: N(
        () => A((d) => d - 1),
        []
      ),
      children: /* @__PURE__ */ s.jsx(
        V.div,
        {
          tabIndex: u || w === 0 ? -1 : 0,
          "data-orientation": n,
          ...v,
          ref: g,
          style: { outline: "none", ...e.style },
          onMouseDown: E(e.onMouseDown, () => {
            T.current = !0;
          }),
          onFocus: E(e.onFocus, (d) => {
            const Q = !T.current;
            if (d.target === d.currentTarget && Q && !u) {
              const O = new CustomEvent(M, ie);
              if (d.currentTarget.dispatchEvent(O), !O.defaultPrevented) {
                const _ = i().filter((F) => F.focusable), X = _.find((F) => F.active), Z = _.find((F) => F.id === p), z = [X, Z, ..._].filter(
                  Boolean
                ).map((F) => F.ref.current);
                J(z, r);
              }
            }
            T.current = !1;
          }),
          onBlur: E(e.onBlur, () => I(!1))
        }
      )
    }
  );
}), H = "RovingFocusGroupItem", W = P(
  (e, t) => {
    const {
      __scopeRovingFocusGroup: c,
      focusable: n = !0,
      active: b = !1,
      tabStopId: m,
      children: l,
      ...x
    } = e, h = ne(), f = m || h, r = me(H, c), v = r.currentTabStopId === f, C = Y(c), { onFocusableItemAdd: g, onFocusableItemRemove: S, currentTabStopId: p } = r;
    return U(() => {
      if (n)
        return g(), () => S();
    }, [n, g, S]), /* @__PURE__ */ s.jsx(
      D.ItemSlot,
      {
        scope: c,
        id: f,
        focusable: n,
        active: b,
        children: /* @__PURE__ */ s.jsx(
          V.span,
          {
            tabIndex: v ? 0 : -1,
            "data-orientation": r.orientation,
            ...x,
            ref: t,
            onMouseDown: E(e.onMouseDown, (o) => {
              n ? r.onItemFocus(f) : o.preventDefault();
            }),
            onFocus: E(e.onFocus, () => r.onItemFocus(f)),
            onKeyDown: E(e.onKeyDown, (o) => {
              if (o.key === "Tab" && o.shiftKey) {
                r.onItemShiftTab();
                return;
              }
              if (o.target !== o.currentTarget) return;
              const u = be(o, r.orientation, r.dir);
              if (u !== void 0) {
                if (o.metaKey || o.ctrlKey || o.altKey || o.shiftKey) return;
                o.preventDefault();
                let a = C().filter((i) => i.focusable).map((i) => i.ref.current);
                if (u === "last") a.reverse();
                else if (u === "prev" || u === "next") {
                  u === "prev" && a.reverse();
                  const i = a.indexOf(o.currentTarget);
                  a = r.loop ? xe(a, i + 1) : a.slice(i + 1);
                }
                setTimeout(() => J(a));
              }
            }),
            children: typeof l == "function" ? l({ isCurrentTabStop: v, hasTabStop: p != null }) : l
          }
        )
      }
    );
  }
);
W.displayName = H;
var Ie = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
  End: "last"
};
function ve(e, t) {
  return t !== "rtl" ? e : e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e;
}
function be(e, t, c) {
  const n = ve(e.key, c);
  if (!(t === "vertical" && ["ArrowLeft", "ArrowRight"].includes(n)) && !(t === "horizontal" && ["ArrowUp", "ArrowDown"].includes(n)))
    return Ie[n];
}
function J(e, t = !1) {
  const c = document.activeElement;
  for (const n of e)
    if (n === c || (n.focus({ preventScroll: t }), document.activeElement !== c)) return;
}
function xe(e, t) {
  return e.map((c, n) => e[(t + n) % e.length]);
}
var Fe = $, Te = W;
function K({
  containerClassName: e,
  count: t = 1,
  randomize: c = !1,
  minWidth: n = 70,
  maxWidth: b = 100,
  className: m,
  ...l
}) {
  const { randomWidths: x, keys: h } = oe(() => {
    const f = [], r = [];
    for (let v = 0; v < t; v++) {
      if (c) {
        const C = Math.floor((b - n) / 5), g = Math.floor(Math.random() * (C + 1)), S = n + g * 5;
        f.push(`${S}%`);
      }
      r.push(`skeleton-${crypto.randomUUID()}`);
    }
    return {
      randomWidths: f,
      keys: r
    };
  }, [t, c, n, b]);
  return /* @__PURE__ */ s.jsx("span", { className: e, children: Array.from({ length: t }).map((f, r) => /* @__PURE__ */ s.jsxs(R.Fragment, { children: [
    /* @__PURE__ */ s.jsx(
      "span",
      {
        className: B("inline-flex w-full leading-none animate-pulse rounded-[2px] bg-primary/10", m),
        style: c ? { width: x[r] } : void 0,
        ...l,
        children: "‌"
      }
    ),
    /* @__PURE__ */ s.jsx("br", {})
  ] }, h[r])) });
}
const ge = R.forwardRef(({ className: e, lines: t = 5, ...c }, n) => t < 1 ? /* @__PURE__ */ s.jsx(s.Fragment, {}) : /* @__PURE__ */ s.jsx("div", { ref: n, className: B("flex flex-col gap-2", e), ...c, children: Array.from({ length: t }, (b, m) => {
  let l = "66%";
  switch (m % 5) {
    case 0:
      l = "57%";
      break;
    case 1:
      l = "33%";
      break;
    case 2:
      l = "40%";
      break;
    case 3:
      l = "48%";
      break;
    case 4:
      l = "24%";
      break;
  }
  return /* @__PURE__ */ s.jsxs("div", { className: "flex justify-between gap-6", children: [
    /* @__PURE__ */ s.jsx("div", { className: "grow", style: {
      maxWidth: l
    }, children: /* @__PURE__ */ s.jsx(K, {}) }),
    /* @__PURE__ */ s.jsx(K, { className: "w-[60px] self-end" })
  ] }, m);
}) }));
ge.displayName = "SkeletonTable";
export {
  Te as I,
  Fe as R,
  K as S,
  ge as a,
  he as b,
  ce as c,
  le as u
};
//# sourceMappingURL=skeleton-BY5P5NDt.mjs.map

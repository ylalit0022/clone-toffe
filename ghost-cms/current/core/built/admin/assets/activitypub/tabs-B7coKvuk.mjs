import { aj as d, an as zt, j as r, ae as de, ak as Yt, al as N, am as v, c as h, e as k, aV as K, a6 as Xt, aW as Te, aX as Wt, af as V, aY as Ht, b as ie, aZ as Zt, W as R, a_ as qt, aC as Jt, ag as Qt, a$ as en, b0 as tn, b1 as nn, ao as on, b2 as rn, aD as Pe, b3 as an, b4 as sn, s as _, C as cn, b5 as Se, Y as dn, ai as un, ah as J, b6 as ue, B as ln } from "./index-DJ5p5ESW.mjs";
import { u as pn, c as Q, R as Ee, I as je, a as mn } from "./index-DBDE7Pwv.mjs";
var ee = "Tabs", [fn] = de(ee, [
  Q
]), Ae = Q(), [gn, le] = fn(ee), Re = d(
  (e, n) => {
    const {
      __scopeTabs: t,
      value: o,
      onValueChange: a,
      defaultValue: s,
      orientation: c = "horizontal",
      dir: u,
      activationMode: f = "automatic",
      ...g
    } = e, l = pn(u), [i, m] = zt({
      prop: o,
      onChange: a,
      defaultProp: s ?? "",
      caller: ee
    });
    return /* @__PURE__ */ r.jsx(
      gn,
      {
        scope: t,
        baseId: Yt(),
        value: i,
        onValueChange: m,
        orientation: c,
        dir: l,
        activationMode: f,
        children: /* @__PURE__ */ r.jsx(
          N.div,
          {
            dir: l,
            "data-orientation": c,
            ...g,
            ref: n
          }
        )
      }
    );
  }
);
Re.displayName = ee;
var ke = "TabsList", Oe = d(
  (e, n) => {
    const { __scopeTabs: t, loop: o = !0, ...a } = e, s = le(ke, t), c = Ae(t);
    return /* @__PURE__ */ r.jsx(
      Ee,
      {
        asChild: !0,
        ...c,
        orientation: s.orientation,
        dir: s.dir,
        loop: o,
        children: /* @__PURE__ */ r.jsx(
          N.div,
          {
            role: "tablist",
            "aria-orientation": s.orientation,
            ...a,
            ref: n
          }
        )
      }
    );
  }
);
Oe.displayName = ke;
var Fe = "TabsTrigger", Le = d(
  (e, n) => {
    const { __scopeTabs: t, value: o, disabled: a = !1, ...s } = e, c = le(Fe, t), u = Ae(t), f = Ke(c.baseId, o), g = Ve(c.baseId, o), l = o === c.value;
    return /* @__PURE__ */ r.jsx(
      je,
      {
        asChild: !0,
        ...u,
        focusable: !a,
        active: l,
        children: /* @__PURE__ */ r.jsx(
          N.button,
          {
            type: "button",
            role: "tab",
            "aria-selected": l,
            "aria-controls": g,
            "data-state": l ? "active" : "inactive",
            "data-disabled": a ? "" : void 0,
            disabled: a,
            id: f,
            ...s,
            ref: n,
            onMouseDown: v(e.onMouseDown, (i) => {
              !a && i.button === 0 && i.ctrlKey === !1 ? c.onValueChange(o) : i.preventDefault();
            }),
            onKeyDown: v(e.onKeyDown, (i) => {
              [" ", "Enter"].includes(i.key) && c.onValueChange(o);
            }),
            onFocus: v(e.onFocus, () => {
              const i = c.activationMode !== "manual";
              !l && !a && i && c.onValueChange(o);
            })
          }
        )
      }
    );
  }
);
Le.displayName = Fe;
var Ge = "TabsContent", $e = d(
  (e, n) => {
    const { __scopeTabs: t, value: o, forceMount: a, children: s, ...c } = e, u = le(Ge, t), f = Ke(u.baseId, o), g = Ve(u.baseId, o), l = o === u.value, i = h(l);
    return k(() => {
      const m = requestAnimationFrame(() => i.current = !1);
      return () => cancelAnimationFrame(m);
    }, []), /* @__PURE__ */ r.jsx(K, { present: a || l, children: ({ present: m }) => /* @__PURE__ */ r.jsx(
      N.div,
      {
        "data-state": l ? "active" : "inactive",
        "data-orientation": u.orientation,
        role: "tabpanel",
        "aria-labelledby": f,
        hidden: !m,
        id: g,
        tabIndex: 0,
        ...c,
        ref: n,
        style: {
          ...e.style,
          animationDuration: i.current ? "0s" : void 0
        },
        children: m && s
      }
    ) });
  }
);
$e.displayName = Ge;
function Ke(e, n) {
  return `${e}-trigger-${n}`;
}
function Ve(e, n) {
  return `${e}-content-${n}`;
}
var Be = Re, Ue = Oe, pe = Le, ze = $e;
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const vn = [["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]], xn = Xt("circle", vn);
var ce = ["Enter", " "], bn = ["ArrowDown", "PageUp", "Home"], Ye = ["ArrowUp", "PageDown", "End"], hn = [...bn, ...Ye], Mn = {
  ltr: [...ce, "ArrowRight"],
  rtl: [...ce, "ArrowLeft"]
}, _n = {
  ltr: ["ArrowLeft"],
  rtl: ["ArrowRight"]
}, te = "Menu", [G, yn, wn] = mn(te), [P, Xe] = de(te, [
  wn,
  Te,
  Q
]), me = Te(), We = Q(), [Bo, S] = P(te), [Uo, B] = P(te), Cn = "MenuAnchor", fe = d(
  (e, n) => {
    const { __scopeMenu: t, ...o } = e, a = me(t);
    return /* @__PURE__ */ r.jsx(Wt, { ...a, ...o, ref: n });
  }
);
fe.displayName = Cn;
var ge = "MenuPortal", [Nn, He] = P(ge, {
  forceMount: void 0
}), Ze = (e) => {
  const { __scopeMenu: n, forceMount: t, children: o, container: a } = e, s = S(ge, n);
  return /* @__PURE__ */ r.jsx(Nn, { scope: n, forceMount: t, children: /* @__PURE__ */ r.jsx(K, { present: t || s.open, children: /* @__PURE__ */ r.jsx(sn, { asChild: !0, container: a, children: o }) }) });
};
Ze.displayName = ge;
var w = "MenuContent", [In, ve] = P(w), qe = d(
  (e, n) => {
    const t = He(w, e.__scopeMenu), { forceMount: o = t.forceMount, ...a } = e, s = S(w, e.__scopeMenu), c = B(w, e.__scopeMenu);
    return /* @__PURE__ */ r.jsx(G.Provider, { scope: e.__scopeMenu, children: /* @__PURE__ */ r.jsx(K, { present: o || s.open, children: /* @__PURE__ */ r.jsx(G.Slot, { scope: e.__scopeMenu, children: c.modal ? /* @__PURE__ */ r.jsx(Dn, { ...a, ref: n }) : /* @__PURE__ */ r.jsx(Tn, { ...a, ref: n }) }) }) });
  }
), Dn = d(
  (e, n) => {
    const t = S(w, e.__scopeMenu), o = h(null), a = V(n, o);
    return k(() => {
      const s = o.current;
      if (s) return Ht(s);
    }, []), /* @__PURE__ */ r.jsx(
      xe,
      {
        ...e,
        ref: a,
        trapFocus: t.open,
        disableOutsidePointerEvents: t.open,
        disableOutsideScroll: !0,
        onFocusOutside: v(
          e.onFocusOutside,
          (s) => s.preventDefault(),
          { checkForDefaultPrevented: !1 }
        ),
        onDismiss: () => t.onOpenChange(!1)
      }
    );
  }
), Tn = d((e, n) => {
  const t = S(w, e.__scopeMenu);
  return /* @__PURE__ */ r.jsx(
    xe,
    {
      ...e,
      ref: n,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      disableOutsideScroll: !1,
      onDismiss: () => t.onOpenChange(!1)
    }
  );
}), Pn = Qt("MenuContent.ScrollLock"), xe = d(
  (e, n) => {
    const {
      __scopeMenu: t,
      loop: o = !1,
      trapFocus: a,
      onOpenAutoFocus: s,
      onCloseAutoFocus: c,
      disableOutsidePointerEvents: u,
      onEntryFocus: f,
      onEscapeKeyDown: g,
      onPointerDownOutside: l,
      onFocusOutside: i,
      onInteractOutside: m,
      onDismiss: x,
      disableOutsideScroll: b,
      ...T
    } = e, E = S(w, t), O = B(w, t), z = me(t), Y = We(t), _e = yn(t), [Gt, ye] = ie(null), X = h(null), $t = V(n, X, E.onContentChange), W = h(0), H = h(""), Kt = h(0), oe = h(null), we = h("right"), re = h(0), Vt = b ? qt : Jt, Bt = b ? { as: Pn, allowPinchZoom: !0 } : void 0, Ut = (p) => {
      var A, Ne;
      const y = H.current + p, C = _e().filter((I) => !I.disabled), D = document.activeElement, ae = (A = C.find((I) => I.ref.current === D)) == null ? void 0 : A.textValue, se = C.map((I) => I.textValue), Ce = Kn(se, y, ae), F = (Ne = C.find((I) => I.textValue === Ce)) == null ? void 0 : Ne.ref.current;
      (function I(Ie) {
        H.current = Ie, window.clearTimeout(W.current), Ie !== "" && (W.current = window.setTimeout(() => I(""), 1e3));
      })(y), F && setTimeout(() => F.focus());
    };
    k(() => () => window.clearTimeout(W.current), []), Zt();
    const j = R((p) => {
      var C, D;
      return we.current === ((C = oe.current) == null ? void 0 : C.side) && Bn(p, (D = oe.current) == null ? void 0 : D.area);
    }, []);
    return /* @__PURE__ */ r.jsx(
      In,
      {
        scope: t,
        searchRef: H,
        onItemEnter: R(
          (p) => {
            j(p) && p.preventDefault();
          },
          [j]
        ),
        onItemLeave: R(
          (p) => {
            var y;
            j(p) || ((y = X.current) == null || y.focus(), ye(null));
          },
          [j]
        ),
        onTriggerLeave: R(
          (p) => {
            j(p) && p.preventDefault();
          },
          [j]
        ),
        pointerGraceTimerRef: Kt,
        onPointerGraceIntentChange: R((p) => {
          oe.current = p;
        }, []),
        children: /* @__PURE__ */ r.jsx(Vt, { ...Bt, children: /* @__PURE__ */ r.jsx(
          en,
          {
            asChild: !0,
            trapped: a,
            onMountAutoFocus: v(s, (p) => {
              var y;
              p.preventDefault(), (y = X.current) == null || y.focus({ preventScroll: !0 });
            }),
            onUnmountAutoFocus: c,
            children: /* @__PURE__ */ r.jsx(
              tn,
              {
                asChild: !0,
                disableOutsidePointerEvents: u,
                onEscapeKeyDown: g,
                onPointerDownOutside: l,
                onFocusOutside: i,
                onInteractOutside: m,
                onDismiss: x,
                children: /* @__PURE__ */ r.jsx(
                  Ee,
                  {
                    asChild: !0,
                    ...Y,
                    dir: O.dir,
                    orientation: "vertical",
                    loop: o,
                    currentTabStopId: Gt,
                    onCurrentTabStopIdChange: ye,
                    onEntryFocus: v(f, (p) => {
                      O.isUsingKeyboardRef.current || p.preventDefault();
                    }),
                    preventScrollOnEntryFocus: !0,
                    children: /* @__PURE__ */ r.jsx(
                      nn,
                      {
                        role: "menu",
                        "aria-orientation": "vertical",
                        "data-state": mt(E.open),
                        "data-radix-menu-content": "",
                        dir: O.dir,
                        ...z,
                        ...T,
                        ref: $t,
                        style: { outline: "none", ...T.style },
                        onKeyDown: v(T.onKeyDown, (p) => {
                          const C = p.target.closest("[data-radix-menu-content]") === p.currentTarget, D = p.ctrlKey || p.altKey || p.metaKey, ae = p.key.length === 1;
                          C && (p.key === "Tab" && p.preventDefault(), !D && ae && Ut(p.key));
                          const se = X.current;
                          if (p.target !== se || !hn.includes(p.key)) return;
                          p.preventDefault();
                          const F = _e().filter((A) => !A.disabled).map((A) => A.ref.current);
                          Ye.includes(p.key) && F.reverse(), Gn(F);
                        }),
                        onBlur: v(e.onBlur, (p) => {
                          p.currentTarget.contains(p.target) || (window.clearTimeout(W.current), H.current = "");
                        }),
                        onPointerMove: v(
                          e.onPointerMove,
                          $((p) => {
                            const y = p.target, C = re.current !== p.clientX;
                            if (p.currentTarget.contains(y) && C) {
                              const D = p.clientX > re.current ? "right" : "left";
                              we.current = D, re.current = p.clientX;
                            }
                          })
                        )
                      }
                    )
                  }
                )
              }
            )
          }
        ) })
      }
    );
  }
);
qe.displayName = w;
var Sn = "MenuGroup", be = d(
  (e, n) => {
    const { __scopeMenu: t, ...o } = e;
    return /* @__PURE__ */ r.jsx(N.div, { role: "group", ...o, ref: n });
  }
);
be.displayName = Sn;
var En = "MenuLabel", Je = d(
  (e, n) => {
    const { __scopeMenu: t, ...o } = e;
    return /* @__PURE__ */ r.jsx(N.div, { ...o, ref: n });
  }
);
Je.displayName = En;
var Z = "MenuItem", De = "menu.itemSelect", ne = d(
  (e, n) => {
    const { disabled: t = !1, onSelect: o, ...a } = e, s = h(null), c = B(Z, e.__scopeMenu), u = ve(Z, e.__scopeMenu), f = V(n, s), g = h(!1), l = () => {
      const i = s.current;
      if (!t && i) {
        const m = new CustomEvent(De, { bubbles: !0, cancelable: !0 });
        i.addEventListener(De, (x) => o == null ? void 0 : o(x), { once: !0 }), an(i, m), m.defaultPrevented ? g.current = !1 : c.onClose();
      }
    };
    return /* @__PURE__ */ r.jsx(
      Qe,
      {
        ...a,
        ref: f,
        disabled: t,
        onClick: v(e.onClick, l),
        onPointerDown: (i) => {
          var m;
          (m = e.onPointerDown) == null || m.call(e, i), g.current = !0;
        },
        onPointerUp: v(e.onPointerUp, (i) => {
          var m;
          g.current || (m = i.currentTarget) == null || m.click();
        }),
        onKeyDown: v(e.onKeyDown, (i) => {
          const m = u.searchRef.current !== "";
          t || m && i.key === " " || ce.includes(i.key) && (i.currentTarget.click(), i.preventDefault());
        })
      }
    );
  }
);
ne.displayName = Z;
var Qe = d(
  (e, n) => {
    const { __scopeMenu: t, disabled: o = !1, textValue: a, ...s } = e, c = ve(Z, t), u = We(t), f = h(null), g = V(n, f), [l, i] = ie(!1), [m, x] = ie("");
    return k(() => {
      const b = f.current;
      b && x((b.textContent ?? "").trim());
    }, [s.children]), /* @__PURE__ */ r.jsx(
      G.ItemSlot,
      {
        scope: t,
        disabled: o,
        textValue: a ?? m,
        children: /* @__PURE__ */ r.jsx(je, { asChild: !0, ...u, focusable: !o, children: /* @__PURE__ */ r.jsx(
          N.div,
          {
            role: "menuitem",
            "data-highlighted": l ? "" : void 0,
            "aria-disabled": o || void 0,
            "data-disabled": o ? "" : void 0,
            ...s,
            ref: g,
            onPointerMove: v(
              e.onPointerMove,
              $((b) => {
                o ? c.onItemLeave(b) : (c.onItemEnter(b), b.defaultPrevented || b.currentTarget.focus({ preventScroll: !0 }));
              })
            ),
            onPointerLeave: v(
              e.onPointerLeave,
              $((b) => c.onItemLeave(b))
            ),
            onFocus: v(e.onFocus, () => i(!0)),
            onBlur: v(e.onBlur, () => i(!1))
          }
        ) })
      }
    );
  }
), jn = "MenuCheckboxItem", et = d(
  (e, n) => {
    const { checked: t = !1, onCheckedChange: o, ...a } = e;
    return /* @__PURE__ */ r.jsx(at, { scope: e.__scopeMenu, checked: t, children: /* @__PURE__ */ r.jsx(
      ne,
      {
        role: "menuitemcheckbox",
        "aria-checked": q(t) ? "mixed" : t,
        ...a,
        ref: n,
        "data-state": Me(t),
        onSelect: v(
          a.onSelect,
          () => o == null ? void 0 : o(q(t) ? !0 : !t),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
);
et.displayName = jn;
var tt = "MenuRadioGroup", [An, Rn] = P(
  tt,
  { value: void 0, onValueChange: () => {
  } }
), nt = d(
  (e, n) => {
    const { value: t, onValueChange: o, ...a } = e, s = on(o);
    return /* @__PURE__ */ r.jsx(An, { scope: e.__scopeMenu, value: t, onValueChange: s, children: /* @__PURE__ */ r.jsx(be, { ...a, ref: n }) });
  }
);
nt.displayName = tt;
var ot = "MenuRadioItem", rt = d(
  (e, n) => {
    const { value: t, ...o } = e, a = Rn(ot, e.__scopeMenu), s = t === a.value;
    return /* @__PURE__ */ r.jsx(at, { scope: e.__scopeMenu, checked: s, children: /* @__PURE__ */ r.jsx(
      ne,
      {
        role: "menuitemradio",
        "aria-checked": s,
        ...o,
        ref: n,
        "data-state": Me(s),
        onSelect: v(
          o.onSelect,
          () => {
            var c;
            return (c = a.onValueChange) == null ? void 0 : c.call(a, t);
          },
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
);
rt.displayName = ot;
var he = "MenuItemIndicator", [at, kn] = P(
  he,
  { checked: !1 }
), st = d(
  (e, n) => {
    const { __scopeMenu: t, forceMount: o, ...a } = e, s = kn(he, t);
    return /* @__PURE__ */ r.jsx(
      K,
      {
        present: o || q(s.checked) || s.checked === !0,
        children: /* @__PURE__ */ r.jsx(
          N.span,
          {
            ...a,
            ref: n,
            "data-state": Me(s.checked)
          }
        )
      }
    );
  }
);
st.displayName = he;
var On = "MenuSeparator", it = d(
  (e, n) => {
    const { __scopeMenu: t, ...o } = e;
    return /* @__PURE__ */ r.jsx(
      N.div,
      {
        role: "separator",
        "aria-orientation": "horizontal",
        ...o,
        ref: n
      }
    );
  }
);
it.displayName = On;
var Fn = "MenuArrow", ct = d(
  (e, n) => {
    const { __scopeMenu: t, ...o } = e, a = me(t);
    return /* @__PURE__ */ r.jsx(rn, { ...a, ...o, ref: n });
  }
);
ct.displayName = Fn;
var Ln = "MenuSub", [zo, dt] = P(Ln), L = "MenuSubTrigger", ut = d(
  (e, n) => {
    const t = S(L, e.__scopeMenu), o = B(L, e.__scopeMenu), a = dt(L, e.__scopeMenu), s = ve(L, e.__scopeMenu), c = h(null), { pointerGraceTimerRef: u, onPointerGraceIntentChange: f } = s, g = { __scopeMenu: e.__scopeMenu }, l = R(() => {
      c.current && window.clearTimeout(c.current), c.current = null;
    }, []);
    return k(() => l, [l]), k(() => {
      const i = u.current;
      return () => {
        window.clearTimeout(i), f(null);
      };
    }, [u, f]), /* @__PURE__ */ r.jsx(fe, { asChild: !0, ...g, children: /* @__PURE__ */ r.jsx(
      Qe,
      {
        id: a.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": t.open,
        "aria-controls": a.contentId,
        "data-state": mt(t.open),
        ...e,
        ref: Pe(n, a.onTriggerChange),
        onClick: (i) => {
          var m;
          (m = e.onClick) == null || m.call(e, i), !(e.disabled || i.defaultPrevented) && (i.currentTarget.focus(), t.open || t.onOpenChange(!0));
        },
        onPointerMove: v(
          e.onPointerMove,
          $((i) => {
            s.onItemEnter(i), !i.defaultPrevented && !e.disabled && !t.open && !c.current && (s.onPointerGraceIntentChange(null), c.current = window.setTimeout(() => {
              t.onOpenChange(!0), l();
            }, 100));
          })
        ),
        onPointerLeave: v(
          e.onPointerLeave,
          $((i) => {
            var x, b;
            l();
            const m = (x = t.content) == null ? void 0 : x.getBoundingClientRect();
            if (m) {
              const T = (b = t.content) == null ? void 0 : b.dataset.side, E = T === "right", O = E ? -5 : 5, z = m[E ? "left" : "right"], Y = m[E ? "right" : "left"];
              s.onPointerGraceIntentChange({
                area: [
                  // Apply a bleed on clientX to ensure that our exit point is
                  // consistently within polygon bounds
                  { x: i.clientX + O, y: i.clientY },
                  { x: z, y: m.top },
                  { x: Y, y: m.top },
                  { x: Y, y: m.bottom },
                  { x: z, y: m.bottom }
                ],
                side: T
              }), window.clearTimeout(u.current), u.current = window.setTimeout(
                () => s.onPointerGraceIntentChange(null),
                300
              );
            } else {
              if (s.onTriggerLeave(i), i.defaultPrevented) return;
              s.onPointerGraceIntentChange(null);
            }
          })
        ),
        onKeyDown: v(e.onKeyDown, (i) => {
          var x;
          const m = s.searchRef.current !== "";
          e.disabled || m && i.key === " " || Mn[o.dir].includes(i.key) && (t.onOpenChange(!0), (x = t.content) == null || x.focus(), i.preventDefault());
        })
      }
    ) });
  }
);
ut.displayName = L;
var lt = "MenuSubContent", pt = d(
  (e, n) => {
    const t = He(w, e.__scopeMenu), { forceMount: o = t.forceMount, ...a } = e, s = S(w, e.__scopeMenu), c = B(w, e.__scopeMenu), u = dt(lt, e.__scopeMenu), f = h(null), g = V(n, f);
    return /* @__PURE__ */ r.jsx(G.Provider, { scope: e.__scopeMenu, children: /* @__PURE__ */ r.jsx(K, { present: o || s.open, children: /* @__PURE__ */ r.jsx(G.Slot, { scope: e.__scopeMenu, children: /* @__PURE__ */ r.jsx(
      xe,
      {
        id: u.contentId,
        "aria-labelledby": u.triggerId,
        ...a,
        ref: g,
        align: "start",
        side: c.dir === "rtl" ? "left" : "right",
        disableOutsidePointerEvents: !1,
        disableOutsideScroll: !1,
        trapFocus: !1,
        onOpenAutoFocus: (l) => {
          var i;
          c.isUsingKeyboardRef.current && ((i = f.current) == null || i.focus()), l.preventDefault();
        },
        onCloseAutoFocus: (l) => l.preventDefault(),
        onFocusOutside: v(e.onFocusOutside, (l) => {
          l.target !== u.trigger && s.onOpenChange(!1);
        }),
        onEscapeKeyDown: v(e.onEscapeKeyDown, (l) => {
          c.onClose(), l.preventDefault();
        }),
        onKeyDown: v(e.onKeyDown, (l) => {
          var x;
          const i = l.currentTarget.contains(l.target), m = _n[c.dir].includes(l.key);
          i && m && (s.onOpenChange(!1), (x = u.trigger) == null || x.focus(), l.preventDefault());
        })
      }
    ) }) }) });
  }
);
pt.displayName = lt;
function mt(e) {
  return e ? "open" : "closed";
}
function q(e) {
  return e === "indeterminate";
}
function Me(e) {
  return q(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
function Gn(e) {
  const n = document.activeElement;
  for (const t of e)
    if (t === n || (t.focus(), document.activeElement !== n)) return;
}
function $n(e, n) {
  return e.map((t, o) => e[(n + o) % e.length]);
}
function Kn(e, n, t) {
  const a = n.length > 1 && Array.from(n).every((g) => g === n[0]) ? n[0] : n, s = t ? e.indexOf(t) : -1;
  let c = $n(e, Math.max(s, 0));
  a.length === 1 && (c = c.filter((g) => g !== t));
  const f = c.find(
    (g) => g.toLowerCase().startsWith(a.toLowerCase())
  );
  return f !== t ? f : void 0;
}
function Vn(e, n) {
  const { x: t, y: o } = e;
  let a = !1;
  for (let s = 0, c = n.length - 1; s < n.length; c = s++) {
    const u = n[s], f = n[c], g = u.x, l = u.y, i = f.x, m = f.y;
    l > o != m > o && t < (i - g) * (o - l) / (m - l) + g && (a = !a);
  }
  return a;
}
function Bn(e, n) {
  if (!n) return !1;
  const t = { x: e.clientX, y: e.clientY };
  return Vn(t, n);
}
function $(e) {
  return (n) => n.pointerType === "mouse" ? e(n) : void 0;
}
var Un = fe, zn = Ze, Yn = qe, Xn = be, Wn = Je, Hn = ne, Zn = et, qn = nt, Jn = rt, Qn = st, eo = it, to = ct, no = ut, oo = pt, ft = "DropdownMenu", [ro] = de(
  ft,
  [Xe]
), M = Xe(), [Yo, gt] = ro(ft), vt = "DropdownMenuTrigger", xt = d(
  (e, n) => {
    const { __scopeDropdownMenu: t, disabled: o = !1, ...a } = e, s = gt(vt, t), c = M(t);
    return /* @__PURE__ */ r.jsx(Un, { asChild: !0, ...c, children: /* @__PURE__ */ r.jsx(
      N.button,
      {
        type: "button",
        id: s.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": s.open,
        "aria-controls": s.open ? s.contentId : void 0,
        "data-state": s.open ? "open" : "closed",
        "data-disabled": o ? "" : void 0,
        disabled: o,
        ...a,
        ref: Pe(n, s.triggerRef),
        onPointerDown: v(e.onPointerDown, (u) => {
          !o && u.button === 0 && u.ctrlKey === !1 && (s.onOpenToggle(), s.open || u.preventDefault());
        }),
        onKeyDown: v(e.onKeyDown, (u) => {
          o || (["Enter", " "].includes(u.key) && s.onOpenToggle(), u.key === "ArrowDown" && s.onOpenChange(!0), ["Enter", " ", "ArrowDown"].includes(u.key) && u.preventDefault());
        })
      }
    ) });
  }
);
xt.displayName = vt;
var ao = "DropdownMenuPortal", bt = (e) => {
  const { __scopeDropdownMenu: n, ...t } = e, o = M(n);
  return /* @__PURE__ */ r.jsx(zn, { ...o, ...t });
};
bt.displayName = ao;
var ht = "DropdownMenuContent", Mt = d(
  (e, n) => {
    const { __scopeDropdownMenu: t, ...o } = e, a = gt(ht, t), s = M(t), c = h(!1);
    return /* @__PURE__ */ r.jsx(
      Yn,
      {
        id: a.contentId,
        "aria-labelledby": a.triggerId,
        ...s,
        ...o,
        ref: n,
        onCloseAutoFocus: v(e.onCloseAutoFocus, (u) => {
          var f;
          c.current || (f = a.triggerRef.current) == null || f.focus(), c.current = !1, u.preventDefault();
        }),
        onInteractOutside: v(e.onInteractOutside, (u) => {
          const f = u.detail.originalEvent, g = f.button === 0 && f.ctrlKey === !0, l = f.button === 2 || g;
          (!a.modal || l) && (c.current = !0);
        }),
        style: {
          ...e.style,
          "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
          "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
          "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
        }
      }
    );
  }
);
Mt.displayName = ht;
var so = "DropdownMenuGroup", io = d(
  (e, n) => {
    const { __scopeDropdownMenu: t, ...o } = e, a = M(t);
    return /* @__PURE__ */ r.jsx(Xn, { ...a, ...o, ref: n });
  }
);
io.displayName = so;
var co = "DropdownMenuLabel", _t = d(
  (e, n) => {
    const { __scopeDropdownMenu: t, ...o } = e, a = M(t);
    return /* @__PURE__ */ r.jsx(Wn, { ...a, ...o, ref: n });
  }
);
_t.displayName = co;
var uo = "DropdownMenuItem", yt = d(
  (e, n) => {
    const { __scopeDropdownMenu: t, ...o } = e, a = M(t);
    return /* @__PURE__ */ r.jsx(Hn, { ...a, ...o, ref: n });
  }
);
yt.displayName = uo;
var lo = "DropdownMenuCheckboxItem", wt = d((e, n) => {
  const { __scopeDropdownMenu: t, ...o } = e, a = M(t);
  return /* @__PURE__ */ r.jsx(Zn, { ...a, ...o, ref: n });
});
wt.displayName = lo;
var po = "DropdownMenuRadioGroup", mo = d((e, n) => {
  const { __scopeDropdownMenu: t, ...o } = e, a = M(t);
  return /* @__PURE__ */ r.jsx(qn, { ...a, ...o, ref: n });
});
mo.displayName = po;
var fo = "DropdownMenuRadioItem", Ct = d((e, n) => {
  const { __scopeDropdownMenu: t, ...o } = e, a = M(t);
  return /* @__PURE__ */ r.jsx(Jn, { ...a, ...o, ref: n });
});
Ct.displayName = fo;
var go = "DropdownMenuItemIndicator", Nt = d((e, n) => {
  const { __scopeDropdownMenu: t, ...o } = e, a = M(t);
  return /* @__PURE__ */ r.jsx(Qn, { ...a, ...o, ref: n });
});
Nt.displayName = go;
var vo = "DropdownMenuSeparator", It = d((e, n) => {
  const { __scopeDropdownMenu: t, ...o } = e, a = M(t);
  return /* @__PURE__ */ r.jsx(eo, { ...a, ...o, ref: n });
});
It.displayName = vo;
var xo = "DropdownMenuArrow", bo = d(
  (e, n) => {
    const { __scopeDropdownMenu: t, ...o } = e, a = M(t);
    return /* @__PURE__ */ r.jsx(to, { ...a, ...o, ref: n });
  }
);
bo.displayName = xo;
var ho = "DropdownMenuSubTrigger", Dt = d((e, n) => {
  const { __scopeDropdownMenu: t, ...o } = e, a = M(t);
  return /* @__PURE__ */ r.jsx(no, { ...a, ...o, ref: n });
});
Dt.displayName = ho;
var Mo = "DropdownMenuSubContent", Tt = d((e, n) => {
  const { __scopeDropdownMenu: t, ...o } = e, a = M(t);
  return /* @__PURE__ */ r.jsx(
    oo,
    {
      ...a,
      ...o,
      ref: n,
      style: {
        ...e.style,
        "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
        "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
        "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
      }
    }
  );
});
Tt.displayName = Mo;
var _o = xt, yo = bt, Pt = Mt, St = _t, Et = yt, jt = wt, At = Ct, Rt = Nt, kt = It, Ot = Dt, Ft = Tt;
const wo = _o, Co = d(({ className: e, inset: n, children: t, ...o }, a) => /* @__PURE__ */ r.jsxs(
  Ot,
  {
    ref: a,
    className: _(
      "flex cursor-default gap-2 select-none hover:bg-accent items-center rounded-xs px-2 py-1.5 text-sm outline-hidden focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      n && "pl-8",
      e
    ),
    ...o,
    children: [
      t,
      /* @__PURE__ */ r.jsx(cn, { className: "ml-auto" })
    ]
  }
));
Co.displayName = Ot.displayName;
const No = d(({ className: e, ...n }, t) => /* @__PURE__ */ r.jsx("div", { className: Se, children: /* @__PURE__ */ r.jsx(
  Ft,
  {
    ref: t,
    className: _(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      e
    ),
    ...n
  }
) }));
No.displayName = Ft.displayName;
const Io = d(({ className: e, sideOffset: n = 4, ...t }, o) => /* @__PURE__ */ r.jsx(yo, { children: /* @__PURE__ */ r.jsx("div", { className: Se, children: /* @__PURE__ */ r.jsx(
  Pt,
  {
    ref: o,
    className: _(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      e
    ),
    sideOffset: n,
    ...t
  }
) }) }));
Io.displayName = Pt.displayName;
const Do = d(({ className: e, inset: n, ...t }, o) => /* @__PURE__ */ r.jsx(
  Et,
  {
    ref: o,
    className: _(
      "relative flex cursor-default select-none cursor-pointer items-center gap-2 rounded-xs px-2 py-1.5 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      n && "pl-8",
      e
    ),
    ...t
  }
));
Do.displayName = Et.displayName;
const To = d(({ className: e, children: n, checked: t, ...o }, a) => /* @__PURE__ */ r.jsxs(
  jt,
  {
    ref: a,
    checked: t,
    className: _(
      "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      e
    ),
    ...o,
    children: [
      /* @__PURE__ */ r.jsx("span", { className: "absolute left-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ r.jsx(Rt, { children: /* @__PURE__ */ r.jsx(dn, { className: "size-4" }) }) }),
      n
    ]
  }
));
To.displayName = jt.displayName;
const Po = d(({ className: e, children: n, ...t }, o) => /* @__PURE__ */ r.jsxs(
  At,
  {
    ref: o,
    className: _(
      "relative flex cursor-default select-none items-center rounded-xs py-1.5 pl-8 pr-2 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      e
    ),
    ...t,
    children: [
      /* @__PURE__ */ r.jsx("span", { className: "absolute left-2 flex size-3.5 items-center justify-center", children: /* @__PURE__ */ r.jsx(Rt, { children: /* @__PURE__ */ r.jsx(xn, { className: "size-2 fill-current" }) }) }),
      n
    ]
  }
));
Po.displayName = At.displayName;
const So = d(({ className: e, inset: n, ...t }, o) => /* @__PURE__ */ r.jsx(
  St,
  {
    ref: o,
    className: _(
      "px-2 py-1.5 text-sm font-semibold",
      n && "pl-8",
      e
    ),
    ...t
  }
));
So.displayName = St.displayName;
const Eo = d(({ className: e, ...n }, t) => /* @__PURE__ */ r.jsx(
  kt,
  {
    ref: t,
    className: _("-mx-1 my-1 h-px bg-muted", e),
    ...n
  }
));
Eo.displayName = kt.displayName;
const U = un("segmented"), jo = d(({ variant: e = "segmented", ...n }, t) => /* @__PURE__ */ r.jsx(U.Provider, { value: e, children: /* @__PURE__ */ r.jsx(Be, { ref: t, ...n }) }));
jo.displayName = Be.displayName;
const Ao = ue(
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
), Ro = d(({ className: e, ...n }, t) => {
  const o = J(U);
  return /* @__PURE__ */ r.jsx(
    Ue,
    {
      ref: t,
      className: _(Ao({ variant: o, className: e })),
      ...n
    }
  );
});
Ro.displayName = Ue.displayName;
const Lt = ue(
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
), ko = d(({ className: e, ...n }, t) => {
  const o = J(U);
  return /* @__PURE__ */ r.jsx(
    pe,
    {
      ref: t,
      className: _(Lt({ variant: o, className: e })),
      ...n
    }
  );
});
ko.displayName = pe.displayName;
const Oo = ({ className: e = "", children: n }) => /* @__PURE__ */ r.jsx("span", { className: `ml-1.5 mt-px flex h-5 items-center justify-center rounded-full bg-gray-200 px-1.5 py-0 text-xs font-semibold leading-[21px] text-gray-800 dark:bg-gray-900 dark:text-gray-300 ${e}`, children: n });
Oo.displayName = "TabsTriggerCount";
const Fo = ue(
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
), Lo = d(({ className: e, ...n }, t) => {
  const o = J(U);
  return /* @__PURE__ */ r.jsx(
    ze,
    {
      ref: t,
      className: _(Fo({ variant: o, className: e })),
      ...n
    }
  );
});
Lo.displayName = ze.displayName;
const Go = d(
  ({ variant: e = "dropdown", className: n, ...t }, o) => /* @__PURE__ */ r.jsx(
    ln,
    {
      ref: o,
      className: _(
        "h-auto w-full rounded-none border-x-0 border-t-0 focus-visible:ring-0 bg-transparent py-5",
        n
      ),
      variant: e,
      ...t
    }
  )
);
Go.displayName = "KpiDropdownButton";
const $o = d(({
  children: e,
  className: n,
  ...t
}, o) => {
  const a = J(U);
  return /* @__PURE__ */ r.jsxs("div", { className: "relative rounded-md hover:bg-muted", children: [
    /* @__PURE__ */ r.jsx(
      pe,
      {
        ref: o,
        className: _(Lt({ variant: a, className: n })),
        ...t,
        children: /* @__PURE__ */ r.jsx("div", { className: "flex items-center gap-2", children: e })
      }
    ),
    /* @__PURE__ */ r.jsx(
      wo,
      {
        className: "absolute inset-0 size-full cursor-pointer",
        onClick: (s) => {
          s.preventDefault();
        }
      }
    )
  ] });
});
$o.displayName = "TabsDropdownTrigger";
export {
  jo as T,
  Ro as a,
  ko as b,
  Lo as c,
  Oo as d
};
//# sourceMappingURL=tabs-B7coKvuk.mjs.map

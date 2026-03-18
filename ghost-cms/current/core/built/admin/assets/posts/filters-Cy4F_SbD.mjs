import { p as A, a as re, o as F, u as M, j as a, b as z, q as D, F as gr, G as _e, H as ke, J as nt, K as br, W as yr, x as V, E as Le, D as Me, a2 as wr, n as I, S as yt, V as B } from "./index-DHZtUctP.mjs";
import { a as He, P as wt, D as jt, h as jr, R as Cr, u as Nr, F as Pr, d as _r, e as kr, O as Sr, f as Er, C as Q, X as Ct } from "./dialog-B8MooVkm.mjs";
import { b as we, u as st, c as ot, P as je, e as W, a as te, j as Tr, g as Fr, h as ge } from "./heading-BU5ZMUV_.mjs";
import { S as Ir, P as Ar, L as Qe, a as Or } from "./search-hHdC4f3P.mjs";
import { u as zr, c as qe, R as Nt, A as lt, C as Pt, a as _t, D as Rr, b as Vr, d as $r, e as Dr } from "./dropdown-menu-D5NyPbW9.mjs";
function Lr(e) {
  const r = A({ value: e, previous: e });
  return re(() => (r.current.value !== e && (r.current.previous = r.current.value, r.current.value = e), r.current.previous), [e]);
}
var We = "Switch", [Mr] = ot(We), [Hr, qr] = Mr(We), kt = F(
  (e, r) => {
    const {
      __scopeSwitch: t,
      name: s,
      checked: n,
      defaultChecked: o,
      required: l,
      disabled: i,
      value: d = "on",
      onCheckedChange: p,
      form: c,
      ...y
    } = e, [w, g] = M(null), C = we(r, (O) => g(O)), h = A(!1), x = w ? c || !!w.closest("form") : !0, [b, _] = st({
      prop: n,
      defaultProp: o ?? !1,
      onChange: p,
      caller: We
    });
    return /* @__PURE__ */ a.jsxs(Hr, { scope: t, checked: b, disabled: i, children: [
      /* @__PURE__ */ a.jsx(
        je.button,
        {
          type: "button",
          role: "switch",
          "aria-checked": b,
          "aria-required": l,
          "data-state": Ft(b),
          "data-disabled": i ? "" : void 0,
          disabled: i,
          value: d,
          ...y,
          ref: C,
          onClick: W(e.onClick, (O) => {
            _((v) => !v), x && (h.current = O.isPropagationStopped(), h.current || O.stopPropagation());
          })
        }
      ),
      x && /* @__PURE__ */ a.jsx(
        Tt,
        {
          control: w,
          bubbles: !h.current,
          name: s,
          value: d,
          checked: b,
          required: l,
          disabled: i,
          form: c,
          style: { transform: "translateX(-100%)" }
        }
      )
    ] });
  }
);
kt.displayName = We;
var St = "SwitchThumb", Et = F(
  (e, r) => {
    const { __scopeSwitch: t, ...s } = e, n = qr(St, t);
    return /* @__PURE__ */ a.jsx(
      je.span,
      {
        "data-state": Ft(n.checked),
        "data-disabled": n.disabled ? "" : void 0,
        ...s,
        ref: r
      }
    );
  }
);
Et.displayName = St;
var Wr = "SwitchBubbleInput", Tt = F(
  ({
    __scopeSwitch: e,
    control: r,
    checked: t,
    bubbles: s = !0,
    ...n
  }, o) => {
    const l = A(null), i = we(l, o), d = Lr(t), p = zr(r);
    return z(() => {
      const c = l.current;
      if (!c) return;
      const y = window.HTMLInputElement.prototype, g = Object.getOwnPropertyDescriptor(
        y,
        "checked"
      ).set;
      if (d !== t && g) {
        const C = new Event("click", { bubbles: s });
        g.call(c, t), c.dispatchEvent(C);
      }
    }, [d, t, s]), /* @__PURE__ */ a.jsx(
      "input",
      {
        type: "checkbox",
        "aria-hidden": !0,
        defaultChecked: t,
        ...n,
        tabIndex: -1,
        ref: i,
        style: {
          ...n.style,
          ...p,
          position: "absolute",
          pointerEvents: "none",
          opacity: 0,
          margin: 0
        }
      }
    );
  }
);
Tt.displayName = Wr;
function Ft(e) {
  return e ? "checked" : "unchecked";
}
var It = kt, Br = Et, Kr = Object.freeze({
  // See: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
  position: "absolute",
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  wordWrap: "normal"
}), Gr = "VisuallyHidden", At = F(
  (e, r) => /* @__PURE__ */ a.jsx(
    je.span,
    {
      ...e,
      ref: r,
      style: { ...Kr, ...e.style }
    }
  )
);
At.displayName = Gr;
var Ur = At, [Be] = ot("Tooltip", [
  qe
]), Ke = qe(), Ot = "TooltipProvider", Yr = 700, et = "tooltip.open", [Xr, it] = Be(Ot), zt = (e) => {
  const {
    __scopeTooltip: r,
    delayDuration: t = Yr,
    skipDelayDuration: s = 300,
    disableHoverableContent: n = !1,
    children: o
  } = e, l = A(!0), i = A(!1), d = A(0);
  return z(() => {
    const p = d.current;
    return () => window.clearTimeout(p);
  }, []), /* @__PURE__ */ a.jsx(
    Xr,
    {
      scope: r,
      isOpenDelayedRef: l,
      delayDuration: t,
      onOpen: D(() => {
        window.clearTimeout(d.current), l.current = !1;
      }, []),
      onClose: D(() => {
        window.clearTimeout(d.current), d.current = window.setTimeout(
          () => l.current = !0,
          s
        );
      }, [s]),
      isPointerInTransitRef: i,
      onPointerInTransitChange: D((p) => {
        i.current = p;
      }, []),
      disableHoverableContent: n,
      children: o
    }
  );
};
zt.displayName = Ot;
var Se = "Tooltip", [Zr, Ee] = Be(Se), Rt = (e) => {
  const {
    __scopeTooltip: r,
    children: t,
    open: s,
    defaultOpen: n,
    onOpenChange: o,
    disableHoverableContent: l,
    delayDuration: i
  } = e, d = it(Se, e.__scopeTooltip), p = Ke(r), [c, y] = M(null), w = te(), g = A(0), C = l ?? d.disableHoverableContent, h = i ?? d.delayDuration, x = A(!1), [b, _] = st({
    prop: s,
    defaultProp: n ?? !1,
    onChange: (R) => {
      R ? (d.onOpen(), document.dispatchEvent(new CustomEvent(et))) : d.onClose(), o == null || o(R);
    },
    caller: Se
  }), O = re(() => b ? x.current ? "delayed-open" : "instant-open" : "closed", [b]), v = D(() => {
    window.clearTimeout(g.current), g.current = 0, x.current = !1, _(!0);
  }, [_]), S = D(() => {
    window.clearTimeout(g.current), g.current = 0, _(!1);
  }, [_]), E = D(() => {
    window.clearTimeout(g.current), g.current = window.setTimeout(() => {
      x.current = !0, _(!0), g.current = 0;
    }, h);
  }, [h, _]);
  return z(() => () => {
    g.current && (window.clearTimeout(g.current), g.current = 0);
  }, []), /* @__PURE__ */ a.jsx(Nt, { ...p, children: /* @__PURE__ */ a.jsx(
    Zr,
    {
      scope: r,
      contentId: w,
      open: b,
      stateAttribute: O,
      trigger: c,
      onTriggerChange: y,
      onTriggerEnter: D(() => {
        d.isOpenDelayedRef.current ? E() : v();
      }, [d.isOpenDelayedRef, E, v]),
      onTriggerLeave: D(() => {
        C ? S() : (window.clearTimeout(g.current), g.current = 0);
      }, [S, C]),
      onOpen: v,
      onClose: S,
      disableHoverableContent: C,
      children: t
    }
  ) });
};
Rt.displayName = Se;
var tt = "TooltipTrigger", Vt = F(
  (e, r) => {
    const { __scopeTooltip: t, ...s } = e, n = Ee(tt, t), o = it(tt, t), l = Ke(t), i = A(null), d = we(r, i, n.onTriggerChange), p = A(!1), c = A(!1), y = D(() => p.current = !1, []);
    return z(() => () => document.removeEventListener("pointerup", y), [y]), /* @__PURE__ */ a.jsx(lt, { asChild: !0, ...l, children: /* @__PURE__ */ a.jsx(
      je.button,
      {
        "aria-describedby": n.open ? n.contentId : void 0,
        "data-state": n.stateAttribute,
        ...s,
        ref: d,
        onPointerMove: W(e.onPointerMove, (w) => {
          w.pointerType !== "touch" && !c.current && !o.isPointerInTransitRef.current && (n.onTriggerEnter(), c.current = !0);
        }),
        onPointerLeave: W(e.onPointerLeave, () => {
          n.onTriggerLeave(), c.current = !1;
        }),
        onPointerDown: W(e.onPointerDown, () => {
          n.open && n.onClose(), p.current = !0, document.addEventListener("pointerup", y, { once: !0 });
        }),
        onFocus: W(e.onFocus, () => {
          p.current || n.onOpen();
        }),
        onBlur: W(e.onBlur, n.onClose),
        onClick: W(e.onClick, n.onClose)
      }
    ) });
  }
);
Vt.displayName = tt;
var ct = "TooltipPortal", [Jr, Qr] = Be(ct, {
  forceMount: void 0
}), $t = (e) => {
  const { __scopeTooltip: r, forceMount: t, children: s, container: n } = e, o = Ee(ct, r);
  return /* @__PURE__ */ a.jsx(Jr, { scope: r, forceMount: t, children: /* @__PURE__ */ a.jsx(He, { present: t || o.open, children: /* @__PURE__ */ a.jsx(wt, { asChild: !0, container: n, children: s }) }) });
};
$t.displayName = ct;
var be = "TooltipContent", Dt = F(
  (e, r) => {
    const t = Qr(be, e.__scopeTooltip), { forceMount: s = t.forceMount, side: n = "top", ...o } = e, l = Ee(be, e.__scopeTooltip);
    return /* @__PURE__ */ a.jsx(He, { present: s || l.open, children: l.disableHoverableContent ? /* @__PURE__ */ a.jsx(Lt, { side: n, ...o, ref: r }) : /* @__PURE__ */ a.jsx(ea, { side: n, ...o, ref: r }) });
  }
), ea = F((e, r) => {
  const t = Ee(be, e.__scopeTooltip), s = it(be, e.__scopeTooltip), n = A(null), o = we(r, n), [l, i] = M(null), { trigger: d, onClose: p } = t, c = n.current, { onPointerInTransitChange: y } = s, w = D(() => {
    i(null), y(!1);
  }, [y]), g = D(
    (C, h) => {
      const x = C.currentTarget, b = { x: C.clientX, y: C.clientY }, _ = sa(b, x.getBoundingClientRect()), O = oa(b, _), v = la(h.getBoundingClientRect()), S = ca([...O, ...v]);
      i(S), y(!0);
    },
    [y]
  );
  return z(() => () => w(), [w]), z(() => {
    if (d && c) {
      const C = (x) => g(x, c), h = (x) => g(x, d);
      return d.addEventListener("pointerleave", C), c.addEventListener("pointerleave", h), () => {
        d.removeEventListener("pointerleave", C), c.removeEventListener("pointerleave", h);
      };
    }
  }, [d, c, g, w]), z(() => {
    if (l) {
      const C = (h) => {
        const x = h.target, b = { x: h.clientX, y: h.clientY }, _ = (d == null ? void 0 : d.contains(x)) || (c == null ? void 0 : c.contains(x)), O = !ia(b, l);
        _ ? w() : O && (w(), p());
      };
      return document.addEventListener("pointermove", C), () => document.removeEventListener("pointermove", C);
    }
  }, [d, c, l, p, w]), /* @__PURE__ */ a.jsx(Lt, { ...e, ref: o });
}), [ta, ra] = Be(Se, { isInside: !1 }), aa = Tr("TooltipContent"), Lt = F(
  (e, r) => {
    const {
      __scopeTooltip: t,
      children: s,
      "aria-label": n,
      onEscapeKeyDown: o,
      onPointerDownOutside: l,
      ...i
    } = e, d = Ee(be, t), p = Ke(t), { onClose: c } = d;
    return z(() => (document.addEventListener(et, c), () => document.removeEventListener(et, c)), [c]), z(() => {
      if (d.trigger) {
        const y = (w) => {
          const g = w.target;
          g != null && g.contains(d.trigger) && c();
        };
        return window.addEventListener("scroll", y, { capture: !0 }), () => window.removeEventListener("scroll", y, { capture: !0 });
      }
    }, [d.trigger, c]), /* @__PURE__ */ a.jsx(
      jt,
      {
        asChild: !0,
        disableOutsidePointerEvents: !1,
        onEscapeKeyDown: o,
        onPointerDownOutside: l,
        onFocusOutside: (y) => y.preventDefault(),
        onDismiss: c,
        children: /* @__PURE__ */ a.jsxs(
          Pt,
          {
            "data-state": d.stateAttribute,
            ...p,
            ...i,
            ref: r,
            style: {
              ...i.style,
              "--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
              "--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
              "--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
              "--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
              "--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)"
            },
            children: [
              /* @__PURE__ */ a.jsx(aa, { children: s }),
              /* @__PURE__ */ a.jsx(ta, { scope: t, isInside: !0, children: /* @__PURE__ */ a.jsx(Ur, { id: d.contentId, role: "tooltip", children: n || s }) })
            ]
          }
        )
      }
    );
  }
);
Dt.displayName = be;
var Mt = "TooltipArrow", na = F(
  (e, r) => {
    const { __scopeTooltip: t, ...s } = e, n = Ke(t);
    return ra(
      Mt,
      t
    ).isInside ? null : /* @__PURE__ */ a.jsx(_t, { ...n, ...s, ref: r });
  }
);
na.displayName = Mt;
function sa(e, r) {
  const t = Math.abs(r.top - e.y), s = Math.abs(r.bottom - e.y), n = Math.abs(r.right - e.x), o = Math.abs(r.left - e.x);
  switch (Math.min(t, s, n, o)) {
    case o:
      return "left";
    case n:
      return "right";
    case t:
      return "top";
    case s:
      return "bottom";
    default:
      throw new Error("unreachable");
  }
}
function oa(e, r, t = 5) {
  const s = [];
  switch (r) {
    case "top":
      s.push(
        { x: e.x - t, y: e.y + t },
        { x: e.x + t, y: e.y + t }
      );
      break;
    case "bottom":
      s.push(
        { x: e.x - t, y: e.y - t },
        { x: e.x + t, y: e.y - t }
      );
      break;
    case "left":
      s.push(
        { x: e.x + t, y: e.y - t },
        { x: e.x + t, y: e.y + t }
      );
      break;
    case "right":
      s.push(
        { x: e.x - t, y: e.y - t },
        { x: e.x - t, y: e.y + t }
      );
      break;
  }
  return s;
}
function la(e) {
  const { top: r, right: t, bottom: s, left: n } = e;
  return [
    { x: n, y: r },
    { x: t, y: r },
    { x: t, y: s },
    { x: n, y: s }
  ];
}
function ia(e, r) {
  const { x: t, y: s } = e;
  let n = !1;
  for (let o = 0, l = r.length - 1; o < r.length; l = o++) {
    const i = r[o], d = r[l], p = i.x, c = i.y, y = d.x, w = d.y;
    c > s != w > s && t < (y - p) * (s - c) / (w - c) + p && (n = !n);
  }
  return n;
}
function ca(e) {
  const r = e.slice();
  return r.sort((t, s) => t.x < s.x ? -1 : t.x > s.x ? 1 : t.y < s.y ? -1 : t.y > s.y ? 1 : 0), ua(r);
}
function ua(e) {
  if (e.length <= 1) return e.slice();
  const r = [];
  for (let s = 0; s < e.length; s++) {
    const n = e[s];
    for (; r.length >= 2; ) {
      const o = r[r.length - 1], l = r[r.length - 2];
      if ((o.x - l.x) * (n.y - l.y) >= (o.y - l.y) * (n.x - l.x)) r.pop();
      else break;
    }
    r.push(n);
  }
  r.pop();
  const t = [];
  for (let s = e.length - 1; s >= 0; s--) {
    const n = e[s];
    for (; t.length >= 2; ) {
      const o = t[t.length - 1], l = t[t.length - 2];
      if ((o.x - l.x) * (n.y - l.y) >= (o.y - l.y) * (n.x - l.x)) t.pop();
      else break;
    }
    t.push(n);
  }
  return t.pop(), r.length === 1 && t.length === 1 && r[0].x === t[0].x && r[0].y === t[0].y ? r : r.concat(t);
}
var da = zt, pa = Rt, ma = Vt, va = $t, Ht = Dt, Ge = "Popover", [qt] = ot(Ge, [
  qe
]), Te = qe(), [ha, ne] = qt(Ge), Wt = (e) => {
  const {
    __scopePopover: r,
    children: t,
    open: s,
    defaultOpen: n,
    onOpenChange: o,
    modal: l = !1
  } = e, i = Te(r), d = A(null), [p, c] = M(!1), [y, w] = st({
    prop: s,
    defaultProp: n ?? !1,
    onChange: o,
    caller: Ge
  });
  return /* @__PURE__ */ a.jsx(Nt, { ...i, children: /* @__PURE__ */ a.jsx(
    ha,
    {
      scope: r,
      contentId: te(),
      triggerRef: d,
      open: y,
      onOpenChange: w,
      onOpenToggle: D(() => w((g) => !g), [w]),
      hasCustomAnchor: p,
      onCustomAnchorAdd: D(() => c(!0), []),
      onCustomAnchorRemove: D(() => c(!1), []),
      modal: l,
      children: t
    }
  ) });
};
Wt.displayName = Ge;
var Bt = "PopoverAnchor", fa = F(
  (e, r) => {
    const { __scopePopover: t, ...s } = e, n = ne(Bt, t), o = Te(t), { onCustomAnchorAdd: l, onCustomAnchorRemove: i } = n;
    return z(() => (l(), () => i()), [l, i]), /* @__PURE__ */ a.jsx(lt, { ...o, ...s, ref: r });
  }
);
fa.displayName = Bt;
var Kt = "PopoverTrigger", Gt = F(
  (e, r) => {
    const { __scopePopover: t, ...s } = e, n = ne(Kt, t), o = Te(t), l = we(r, n.triggerRef), i = /* @__PURE__ */ a.jsx(
      je.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": n.open,
        "aria-controls": n.contentId,
        "data-state": Jt(n.open),
        ...s,
        ref: l,
        onClick: W(e.onClick, n.onOpenToggle)
      }
    );
    return n.hasCustomAnchor ? i : /* @__PURE__ */ a.jsx(lt, { asChild: !0, ...o, children: i });
  }
);
Gt.displayName = Kt;
var ut = "PopoverPortal", [xa, ga] = qt(ut, {
  forceMount: void 0
}), Ut = (e) => {
  const { __scopePopover: r, forceMount: t, children: s, container: n } = e, o = ne(ut, r);
  return /* @__PURE__ */ a.jsx(xa, { scope: r, forceMount: t, children: /* @__PURE__ */ a.jsx(He, { present: t || o.open, children: /* @__PURE__ */ a.jsx(wt, { asChild: !0, container: n, children: s }) }) });
};
Ut.displayName = ut;
var ye = "PopoverContent", Yt = F(
  (e, r) => {
    const t = ga(ye, e.__scopePopover), { forceMount: s = t.forceMount, ...n } = e, o = ne(ye, e.__scopePopover);
    return /* @__PURE__ */ a.jsx(He, { present: s || o.open, children: o.modal ? /* @__PURE__ */ a.jsx(ya, { ...n, ref: r }) : /* @__PURE__ */ a.jsx(wa, { ...n, ref: r }) });
  }
);
Yt.displayName = ye;
var ba = Fr("PopoverContent.RemoveScroll"), ya = F(
  (e, r) => {
    const t = ne(ye, e.__scopePopover), s = A(null), n = we(r, s), o = A(!1);
    return z(() => {
      const l = s.current;
      if (l) return jr(l);
    }, []), /* @__PURE__ */ a.jsx(Cr, { as: ba, allowPinchZoom: !0, children: /* @__PURE__ */ a.jsx(
      Xt,
      {
        ...e,
        ref: n,
        trapFocus: t.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: W(e.onCloseAutoFocus, (l) => {
          var i;
          l.preventDefault(), o.current || (i = t.triggerRef.current) == null || i.focus();
        }),
        onPointerDownOutside: W(
          e.onPointerDownOutside,
          (l) => {
            const i = l.detail.originalEvent, d = i.button === 0 && i.ctrlKey === !0, p = i.button === 2 || d;
            o.current = p;
          },
          { checkForDefaultPrevented: !1 }
        ),
        onFocusOutside: W(
          e.onFocusOutside,
          (l) => l.preventDefault(),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
), wa = F(
  (e, r) => {
    const t = ne(ye, e.__scopePopover), s = A(!1), n = A(!1);
    return /* @__PURE__ */ a.jsx(
      Xt,
      {
        ...e,
        ref: r,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (o) => {
          var l, i;
          (l = e.onCloseAutoFocus) == null || l.call(e, o), o.defaultPrevented || (s.current || (i = t.triggerRef.current) == null || i.focus(), o.preventDefault()), s.current = !1, n.current = !1;
        },
        onInteractOutside: (o) => {
          var d, p;
          (d = e.onInteractOutside) == null || d.call(e, o), o.defaultPrevented || (s.current = !0, o.detail.originalEvent.type === "pointerdown" && (n.current = !0));
          const l = o.target;
          ((p = t.triggerRef.current) == null ? void 0 : p.contains(l)) && o.preventDefault(), o.detail.originalEvent.type === "focusin" && n.current && o.preventDefault();
        }
      }
    );
  }
), Xt = F(
  (e, r) => {
    const {
      __scopePopover: t,
      trapFocus: s,
      onOpenAutoFocus: n,
      onCloseAutoFocus: o,
      disableOutsidePointerEvents: l,
      onEscapeKeyDown: i,
      onPointerDownOutside: d,
      onFocusOutside: p,
      onInteractOutside: c,
      ...y
    } = e, w = ne(ye, t), g = Te(t);
    return Nr(), /* @__PURE__ */ a.jsx(
      Pr,
      {
        asChild: !0,
        loop: !0,
        trapped: s,
        onMountAutoFocus: n,
        onUnmountAutoFocus: o,
        children: /* @__PURE__ */ a.jsx(
          jt,
          {
            asChild: !0,
            disableOutsidePointerEvents: l,
            onInteractOutside: c,
            onEscapeKeyDown: i,
            onPointerDownOutside: d,
            onFocusOutside: p,
            onDismiss: () => w.onOpenChange(!1),
            children: /* @__PURE__ */ a.jsx(
              Pt,
              {
                "data-state": Jt(w.open),
                role: "dialog",
                id: w.contentId,
                ...g,
                ...y,
                ref: r,
                style: {
                  ...y.style,
                  "--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
                  "--radix-popover-content-available-width": "var(--radix-popper-available-width)",
                  "--radix-popover-content-available-height": "var(--radix-popper-available-height)",
                  "--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
                  "--radix-popover-trigger-height": "var(--radix-popper-anchor-height)"
                }
              }
            )
          }
        )
      }
    );
  }
), Zt = "PopoverClose", ja = F(
  (e, r) => {
    const { __scopePopover: t, ...s } = e, n = ne(Zt, t);
    return /* @__PURE__ */ a.jsx(
      je.button,
      {
        type: "button",
        ...s,
        ref: r,
        onClick: W(e.onClick, () => n.onOpenChange(!1))
      }
    );
  }
);
ja.displayName = Zt;
var Ca = "PopoverArrow", Na = F(
  (e, r) => {
    const { __scopePopover: t, ...s } = e, n = Te(t);
    return /* @__PURE__ */ a.jsx(_t, { ...n, ...s, ref: r });
  }
);
Na.displayName = Ca;
function Jt(e) {
  return e ? "open" : "closed";
}
var Pa = Wt, _a = Gt, ka = Ut, Qt = Yt, vt = 1, Sa = 0.9, Ea = 0.8, Ta = 0.17, Xe = 0.1, Ze = 0.999, Fa = 0.9999, Ia = 0.99, Aa = /[\\\/_+.#"@\[\(\{&]/, Oa = /[\\\/_+.#"@\[\(\{&]/g, za = /[\s-]/, er = /[\s-]/g;
function rt(e, r, t, s, n, o, l) {
  if (o === r.length) return n === e.length ? vt : Ia;
  var i = `${n},${o}`;
  if (l[i] !== void 0) return l[i];
  for (var d = s.charAt(o), p = t.indexOf(d, n), c = 0, y, w, g, C; p >= 0; ) y = rt(e, r, t, s, p + 1, o + 1, l), y > c && (p === n ? y *= vt : Aa.test(e.charAt(p - 1)) ? (y *= Ea, g = e.slice(n, p - 1).match(Oa), g && n > 0 && (y *= Math.pow(Ze, g.length))) : za.test(e.charAt(p - 1)) ? (y *= Sa, C = e.slice(n, p - 1).match(er), C && n > 0 && (y *= Math.pow(Ze, C.length))) : (y *= Ta, n > 0 && (y *= Math.pow(Ze, p - n))), e.charAt(p) !== r.charAt(o) && (y *= Fa)), (y < Xe && t.charAt(p - 1) === s.charAt(o + 1) || s.charAt(o + 1) === s.charAt(o) && t.charAt(p - 1) !== s.charAt(o)) && (w = rt(e, r, t, s, p + 1, o + 2, l), w * Xe > y && (y = w * Xe)), y > c && (c = y), p = t.indexOf(d, p + 1);
  return l[i] = c, c;
}
function ht(e) {
  return e.toLowerCase().replace(er, " ");
}
function Ra(e, r, t) {
  return e = t && t.length > 0 ? `${e + " " + t.join(" ")}` : e, rt(e, r, ht(e), ht(r), 0, 0, {});
}
var Va = Symbol.for("react.lazy"), ze = gr[" use ".trim().toString()];
function $a(e) {
  return typeof e == "object" && e !== null && "then" in e;
}
function tr(e) {
  return e != null && typeof e == "object" && "$$typeof" in e && e.$$typeof === Va && "_payload" in e && $a(e._payload);
}
// @__NO_SIDE_EFFECTS__
function Da(e) {
  const r = /* @__PURE__ */ La(e), t = F((s, n) => {
    let { children: o, ...l } = s;
    tr(o) && typeof ze == "function" && (o = ze(o._payload));
    const i = _e.toArray(o), d = i.find(Ha);
    if (d) {
      const p = d.props.children, c = i.map((y) => y === d ? _e.count(p) > 1 ? _e.only(null) : ke(p) ? p.props.children : null : y);
      return /* @__PURE__ */ a.jsx(r, { ...l, ref: n, children: ke(p) ? nt(p, void 0, c) : null });
    }
    return /* @__PURE__ */ a.jsx(r, { ...l, ref: n, children: o });
  });
  return t.displayName = `${e}.Slot`, t;
}
// @__NO_SIDE_EFFECTS__
function La(e) {
  const r = F((t, s) => {
    let { children: n, ...o } = t;
    if (tr(n) && typeof ze == "function" && (n = ze(n._payload)), ke(n)) {
      const l = Wa(n), i = qa(o, n.props);
      return n.type !== br && (i.ref = s ? ge(s, l) : l), nt(n, i);
    }
    return _e.count(n) > 1 ? _e.only(null) : null;
  });
  return r.displayName = `${e}.SlotClone`, r;
}
var Ma = Symbol("radix.slottable");
function Ha(e) {
  return ke(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Ma;
}
function qa(e, r) {
  const t = { ...r };
  for (const s in r) {
    const n = e[s], o = r[s];
    /^on[A-Z]/.test(s) ? n && o ? t[s] = (...i) => {
      const d = o(...i);
      return n(...i), d;
    } : n && (t[s] = n) : s === "style" ? t[s] = { ...n, ...o } : s === "className" && (t[s] = [n, o].filter(Boolean).join(" "));
  }
  return { ...e, ...t };
}
function Wa(e) {
  var s, n;
  let r = (s = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : s.get, t = r && "isReactWarning" in r && r.isReactWarning;
  return t ? e.ref : (r = (n = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : n.get, t = r && "isReactWarning" in r && r.isReactWarning, t ? e.props.ref : e.props.ref || e.ref);
}
var Ba = [
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
], se = Ba.reduce((e, r) => {
  const t = /* @__PURE__ */ Da(`Primitive.${r}`), s = F((n, o) => {
    const { asChild: l, ...i } = n, d = l ? t : r;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ a.jsx(d, { ...i, ref: o });
  });
  return s.displayName = `Primitive.${r}`, { ...e, [r]: s };
}, {}), Ne = '[cmdk-group=""]', Je = '[cmdk-group-items=""]', Ka = '[cmdk-group-heading=""]', rr = '[cmdk-item=""]', ft = `${rr}:not([aria-disabled="true"])`, at = "cmdk-item-select", ve = "data-value", Ga = (e, r, t) => Ra(e, r, t), ar = Me(void 0), Fe = () => Le(ar), nr = Me(void 0), dt = () => Le(nr), sr = Me(void 0), or = F((e, r) => {
  let t = he(() => {
    var m, N;
    return { search: "", value: (N = (m = e.value) != null ? m : e.defaultValue) != null ? N : "", selectedItemId: void 0, filtered: { count: 0, items: /* @__PURE__ */ new Map(), groups: /* @__PURE__ */ new Set() } };
  }), s = he(() => /* @__PURE__ */ new Set()), n = he(() => /* @__PURE__ */ new Map()), o = he(() => /* @__PURE__ */ new Map()), l = he(() => /* @__PURE__ */ new Set()), i = lr(e), { label: d, children: p, value: c, onValueChange: y, filter: w, shouldFilter: g, loop: C, disablePointerSelection: h = !1, vimBindings: x = !0, ...b } = e, _ = te(), O = te(), v = te(), S = A(null), E = nn();
  de(() => {
    if (c !== void 0) {
      let m = c.trim();
      t.current.value = m, R.emit();
    }
  }, [c]), de(() => {
    E(6, J);
  }, []);
  let R = re(() => ({ subscribe: (m) => (l.current.add(m), () => l.current.delete(m)), snapshot: () => t.current, setState: (m, N, T) => {
    var u, f, j, k;
    if (!Object.is(t.current[m], N)) {
      if (t.current[m] = N, m === "search") K(), oe(), E(1, le);
      else if (m === "value") {
        if (document.activeElement.hasAttribute("cmdk-input") || document.activeElement.hasAttribute("cmdk-root")) {
          let P = document.getElementById(v);
          P ? P.focus() : (u = document.getElementById(_)) == null || u.focus();
        }
        if (E(7, () => {
          var P;
          t.current.selectedItemId = (P = q()) == null ? void 0 : P.id, R.emit();
        }), T || E(5, J), ((f = i.current) == null ? void 0 : f.value) !== void 0) {
          let P = N ?? "";
          (k = (j = i.current).onValueChange) == null || k.call(j, P);
          return;
        }
      }
      R.emit();
    }
  }, emit: () => {
    l.current.forEach((m) => m());
  } }), []), Y = re(() => ({ value: (m, N, T) => {
    var u;
    N !== ((u = o.current.get(m)) == null ? void 0 : u.value) && (o.current.set(m, { value: N, keywords: T }), t.current.filtered.items.set(m, me(N, T)), E(2, () => {
      oe(), R.emit();
    }));
  }, item: (m, N) => (s.current.add(m), N && (n.current.has(N) ? n.current.get(N).add(m) : n.current.set(N, /* @__PURE__ */ new Set([m]))), E(3, () => {
    K(), oe(), t.current.value || le(), R.emit();
  }), () => {
    o.current.delete(m), s.current.delete(m), t.current.filtered.items.delete(m);
    let T = q();
    E(4, () => {
      K(), (T == null ? void 0 : T.getAttribute("id")) === m && le(), R.emit();
    });
  }), group: (m) => (n.current.has(m) || n.current.set(m, /* @__PURE__ */ new Set()), () => {
    o.current.delete(m), n.current.delete(m);
  }), filter: () => i.current.shouldFilter, label: d || e["aria-label"], getDisablePointerSelection: () => i.current.disablePointerSelection, listId: _, inputId: v, labelId: O, listInnerRef: S }), []);
  function me(m, N) {
    var T, u;
    let f = (u = (T = i.current) == null ? void 0 : T.filter) != null ? u : Ga;
    return m ? f(m, t.current.search, N) : 0;
  }
  function oe() {
    if (!t.current.search || i.current.shouldFilter === !1) return;
    let m = t.current.filtered.items, N = [];
    t.current.filtered.groups.forEach((u) => {
      let f = n.current.get(u), j = 0;
      f.forEach((k) => {
        let P = m.get(k);
        j = Math.max(P, j);
      }), N.push([u, j]);
    });
    let T = S.current;
    ie().sort((u, f) => {
      var j, k;
      let P = u.getAttribute("id"), $ = f.getAttribute("id");
      return ((j = m.get($)) != null ? j : 0) - ((k = m.get(P)) != null ? k : 0);
    }).forEach((u) => {
      let f = u.closest(Je);
      f ? f.appendChild(u.parentElement === f ? u : u.closest(`${Je} > *`)) : T.appendChild(u.parentElement === T ? u : u.closest(`${Je} > *`));
    }), N.sort((u, f) => f[1] - u[1]).forEach((u) => {
      var f;
      let j = (f = S.current) == null ? void 0 : f.querySelector(`${Ne}[${ve}="${encodeURIComponent(u[0])}"]`);
      j == null || j.parentElement.appendChild(j);
    });
  }
  function le() {
    let m = ie().find((T) => T.getAttribute("aria-disabled") !== "true"), N = m == null ? void 0 : m.getAttribute(ve);
    R.setState("value", N || void 0);
  }
  function K() {
    var m, N, T, u;
    if (!t.current.search || i.current.shouldFilter === !1) {
      t.current.filtered.count = s.current.size;
      return;
    }
    t.current.filtered.groups = /* @__PURE__ */ new Set();
    let f = 0;
    for (let j of s.current) {
      let k = (N = (m = o.current.get(j)) == null ? void 0 : m.value) != null ? N : "", P = (u = (T = o.current.get(j)) == null ? void 0 : T.keywords) != null ? u : [], $ = me(k, P);
      t.current.filtered.items.set(j, $), $ > 0 && f++;
    }
    for (let [j, k] of n.current) for (let P of k) if (t.current.filtered.items.get(P) > 0) {
      t.current.filtered.groups.add(j);
      break;
    }
    t.current.filtered.count = f;
  }
  function J() {
    var m, N, T;
    let u = q();
    u && (((m = u.parentElement) == null ? void 0 : m.firstChild) === u && ((T = (N = u.closest(Ne)) == null ? void 0 : N.querySelector(Ka)) == null || T.scrollIntoView({ block: "nearest" })), u.scrollIntoView({ block: "nearest" }));
  }
  function q() {
    var m;
    return (m = S.current) == null ? void 0 : m.querySelector(`${rr}[aria-selected="true"]`);
  }
  function ie() {
    var m;
    return Array.from(((m = S.current) == null ? void 0 : m.querySelectorAll(ft)) || []);
  }
  function G(m) {
    let N = ie()[m];
    N && R.setState("value", N.getAttribute(ve));
  }
  function U(m) {
    var N;
    let T = q(), u = ie(), f = u.findIndex((k) => k === T), j = u[f + m];
    (N = i.current) != null && N.loop && (j = f + m < 0 ? u[u.length - 1] : f + m === u.length ? u[0] : u[f + m]), j && R.setState("value", j.getAttribute(ve));
  }
  function ce(m) {
    let N = q(), T = N == null ? void 0 : N.closest(Ne), u;
    for (; T && !u; ) T = m > 0 ? rn(T, Ne) : an(T, Ne), u = T == null ? void 0 : T.querySelector(ft);
    u ? R.setState("value", u.getAttribute(ve)) : U(m);
  }
  let X = () => G(ie().length - 1), Ce = (m) => {
    m.preventDefault(), m.metaKey ? X() : m.altKey ? ce(1) : U(1);
  }, Ae = (m) => {
    m.preventDefault(), m.metaKey ? G(0) : m.altKey ? ce(-1) : U(-1);
  };
  return V(se.div, { ref: r, tabIndex: -1, ...b, "cmdk-root": "", onKeyDown: (m) => {
    var N;
    (N = b.onKeyDown) == null || N.call(b, m);
    let T = m.nativeEvent.isComposing || m.keyCode === 229;
    if (!(m.defaultPrevented || T)) switch (m.key) {
      case "n":
      case "j": {
        x && m.ctrlKey && Ce(m);
        break;
      }
      case "ArrowDown": {
        Ce(m);
        break;
      }
      case "p":
      case "k": {
        x && m.ctrlKey && Ae(m);
        break;
      }
      case "ArrowUp": {
        Ae(m);
        break;
      }
      case "Home": {
        m.preventDefault(), G(0);
        break;
      }
      case "End": {
        m.preventDefault(), X();
        break;
      }
      case "Enter": {
        m.preventDefault();
        let u = q();
        if (u) {
          let f = new Event(at);
          u.dispatchEvent(f);
        }
      }
    }
  } }, V("label", { "cmdk-label": "", htmlFor: Y.inputId, id: Y.labelId, style: on }, d), Ue(e, (m) => V(nr.Provider, { value: R }, V(ar.Provider, { value: Y }, m))));
}), Ua = F((e, r) => {
  var t, s;
  let n = te(), o = A(null), l = Le(sr), i = Fe(), d = lr(e), p = (s = (t = d.current) == null ? void 0 : t.forceMount) != null ? s : l == null ? void 0 : l.forceMount;
  de(() => {
    if (!p) return i.item(n, l == null ? void 0 : l.id);
  }, [p]);
  let c = ir(n, o, [e.value, e.children, o], e.keywords), y = dt(), w = ae((E) => E.value && E.value === c.current), g = ae((E) => p || i.filter() === !1 ? !0 : E.search ? E.filtered.items.get(n) > 0 : !0);
  z(() => {
    let E = o.current;
    if (!(!E || e.disabled)) return E.addEventListener(at, C), () => E.removeEventListener(at, C);
  }, [g, e.onSelect, e.disabled]);
  function C() {
    var E, R;
    h(), (R = (E = d.current).onSelect) == null || R.call(E, c.current);
  }
  function h() {
    y.setState("value", c.current, !0);
  }
  if (!g) return null;
  let { disabled: x, value: b, onSelect: _, forceMount: O, keywords: v, ...S } = e;
  return V(se.div, { ref: ge(o, r), ...S, id: n, "cmdk-item": "", role: "option", "aria-disabled": !!x, "aria-selected": !!w, "data-disabled": !!x, "data-selected": !!w, onPointerMove: x || i.getDisablePointerSelection() ? void 0 : h, onClick: x ? void 0 : C }, e.children);
}), Ya = F((e, r) => {
  let { heading: t, children: s, forceMount: n, ...o } = e, l = te(), i = A(null), d = A(null), p = te(), c = Fe(), y = ae((g) => n || c.filter() === !1 ? !0 : g.search ? g.filtered.groups.has(l) : !0);
  de(() => c.group(l), []), ir(l, i, [e.value, e.heading, d]);
  let w = re(() => ({ id: l, forceMount: n }), [n]);
  return V(se.div, { ref: ge(i, r), ...o, "cmdk-group": "", role: "presentation", hidden: y ? void 0 : !0 }, t && V("div", { ref: d, "cmdk-group-heading": "", "aria-hidden": !0, id: p }, t), Ue(e, (g) => V("div", { "cmdk-group-items": "", role: "group", "aria-labelledby": t ? p : void 0 }, V(sr.Provider, { value: w }, g))));
}), Xa = F((e, r) => {
  let { alwaysRender: t, ...s } = e, n = A(null), o = ae((l) => !l.search);
  return !t && !o ? null : V(se.div, { ref: ge(n, r), ...s, "cmdk-separator": "", role: "separator" });
}), Za = F((e, r) => {
  let { onValueChange: t, ...s } = e, n = e.value != null, o = dt(), l = ae((p) => p.search), i = ae((p) => p.selectedItemId), d = Fe();
  return z(() => {
    e.value != null && o.setState("search", e.value);
  }, [e.value]), V(se.input, { ref: r, ...s, "cmdk-input": "", autoComplete: "off", autoCorrect: "off", spellCheck: !1, "aria-autocomplete": "list", role: "combobox", "aria-expanded": !0, "aria-controls": d.listId, "aria-labelledby": d.labelId, "aria-activedescendant": i, id: d.inputId, type: "text", value: n ? e.value : l, onChange: (p) => {
    n || o.setState("search", p.target.value), t == null || t(p.target.value);
  } });
}), Ja = F((e, r) => {
  let { children: t, label: s = "Suggestions", ...n } = e, o = A(null), l = A(null), i = ae((p) => p.selectedItemId), d = Fe();
  return z(() => {
    if (l.current && o.current) {
      let p = l.current, c = o.current, y, w = new ResizeObserver(() => {
        y = requestAnimationFrame(() => {
          let g = p.offsetHeight;
          c.style.setProperty("--cmdk-list-height", g.toFixed(1) + "px");
        });
      });
      return w.observe(p), () => {
        cancelAnimationFrame(y), w.unobserve(p);
      };
    }
  }, []), V(se.div, { ref: ge(o, r), ...n, "cmdk-list": "", role: "listbox", tabIndex: -1, "aria-activedescendant": i, "aria-label": s, id: d.listId }, Ue(e, (p) => V("div", { ref: ge(l, d.listInnerRef), "cmdk-list-sizer": "" }, p)));
}), Qa = F((e, r) => {
  let { open: t, onOpenChange: s, overlayClassName: n, contentClassName: o, container: l, ...i } = e;
  return V(_r, { open: t, onOpenChange: s }, V(kr, { container: l }, V(Sr, { "cmdk-overlay": "", className: n }), V(Er, { "aria-label": e.label, "cmdk-dialog": "", className: o }, V(or, { ref: r, ...i }))));
}), en = F((e, r) => ae((t) => t.filtered.count === 0) ? V(se.div, { ref: r, ...e, "cmdk-empty": "", role: "presentation" }) : null), tn = F((e, r) => {
  let { progress: t, children: s, label: n = "Loading...", ...o } = e;
  return V(se.div, { ref: r, ...o, "cmdk-loading": "", role: "progressbar", "aria-valuenow": t, "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": n }, Ue(e, (l) => V("div", { "aria-hidden": !0 }, l)));
}), pe = Object.assign(or, { List: Ja, Item: Ua, Input: Za, Group: Ya, Separator: Xa, Dialog: Qa, Empty: en, Loading: tn });
function rn(e, r) {
  let t = e.nextElementSibling;
  for (; t; ) {
    if (t.matches(r)) return t;
    t = t.nextElementSibling;
  }
}
function an(e, r) {
  let t = e.previousElementSibling;
  for (; t; ) {
    if (t.matches(r)) return t;
    t = t.previousElementSibling;
  }
}
function lr(e) {
  let r = A(e);
  return de(() => {
    r.current = e;
  }), r;
}
var de = typeof window > "u" ? z : yr;
function he(e) {
  let r = A();
  return r.current === void 0 && (r.current = e()), r;
}
function ae(e) {
  let r = dt(), t = () => e(r.snapshot());
  return wr(r.subscribe, t, t);
}
function ir(e, r, t, s = []) {
  let n = A(), o = Fe();
  return de(() => {
    var l;
    let i = (() => {
      var p;
      for (let c of t) {
        if (typeof c == "string") return c.trim();
        if (typeof c == "object" && "current" in c) return c.current ? (p = c.current.textContent) == null ? void 0 : p.trim() : n.current;
      }
    })(), d = s.map((p) => p.trim());
    o.value(e, i, d), (l = r.current) == null || l.setAttribute(ve, i), n.current = i;
  }), n;
}
var nn = () => {
  let [e, r] = M(), t = he(() => /* @__PURE__ */ new Map());
  return de(() => {
    t.current.forEach((s) => s()), t.current = /* @__PURE__ */ new Map();
  }, [e]), (s, n) => {
    t.current.set(s, n), r({});
  };
};
function sn(e) {
  let r = e.type;
  return typeof r == "function" ? r(e.props) : "render" in r ? r.render(e.props) : e;
}
function Ue({ asChild: e, children: r }, t) {
  return e && ke(r) ? nt(sn(r), { ref: r.ref }, t(r.props.children)) : t(r);
}
var on = { position: "absolute", width: "1px", height: "1px", padding: "0", margin: "-1px", overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", borderWidth: "0" };
function Re({ className: e, ...r }) {
  return /* @__PURE__ */ a.jsx(
    pe,
    {
      className: I(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        e
      ),
      ...r
    }
  );
}
function Ve({ className: e, ...r }) {
  return /* @__PURE__ */ a.jsxs("div", { className: "flex items-center border-b border-border px-3", "cmdk-input-wrapper": "", "data-slot": "command-input", children: [
    /* @__PURE__ */ a.jsx(Ir, { className: "me-2 size-4 shrink-0 opacity-50" }),
    /* @__PURE__ */ a.jsx(
      pe.Input,
      {
        className: I(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          e
        ),
        ...r
      }
    )
  ] });
}
function $e({ className: e, ...r }) {
  return /* @__PURE__ */ a.jsx(
    pe.List,
    {
      className: I("max-h-[300px] p-1 overflow-y-auto overflow-x-hidden", e),
      "data-slot": "command-list",
      ...r
    }
  );
}
function De({ ...e }) {
  return /* @__PURE__ */ a.jsx(pe.Empty, { className: "py-6 text-center text-sm", "data-slot": "command-empty", ...e });
}
function ee({ className: e, ...r }) {
  return /* @__PURE__ */ a.jsx(
    pe.Group,
    {
      className: I(
        "overflow-hidden p-1.5 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        e
      ),
      "data-slot": "command-group",
      ...r
    }
  );
}
function xe({ className: e, ...r }) {
  return /* @__PURE__ */ a.jsx(
    pe.Separator,
    {
      className: I("-mx-1.5 h-px bg-border", e),
      "data-slot": "command-separator",
      ...r
    }
  );
}
function Z({ className: e, ...r }) {
  return /* @__PURE__ */ a.jsx(
    pe.Item,
    {
      className: I(
        "relative flex text-foreground cursor-default gap-2 select-none items-center rounded-xs px-2 py-1.5 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5px]",
        e
      ),
      "data-slot": "command-item",
      ...r
    }
  );
}
function Sn({ icon: e = Q, className: r, ...t }) {
  return /* @__PURE__ */ a.jsx(
    e,
    {
      className: I("size-4 ms-auto text-primary", r),
      "data-check": "true",
      "data-slot": "command-check",
      ...t
    }
  );
}
const pt = Pa, mt = _a, Ye = F(({ className: e, align: r = "center", sideOffset: t = 4, ...s }, n) => /* @__PURE__ */ a.jsx(ka, { children: /* @__PURE__ */ a.jsx("div", { className: yt, children: /* @__PURE__ */ a.jsx(
  Qt,
  {
    ref: n,
    align: r,
    className: I(
      "z-50 rounded-md bg-white dark:bg-gray-950 p-5 text-popover-foreground shadow-md border outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
      e
    ),
    sideOffset: t,
    ...s
  }
) }) }));
Ye.displayName = Qt.displayName;
const ln = B(
  "focus-visible:outline-hidden peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
  {
    variants: {
      size: {
        default: "h-5 w-9",
        sm: "h-4 w-7"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
), cn = B(
  "pointer-events-none block rounded-full bg-background ring-0 transition-transform [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.07))] data-[state=unchecked]:translate-x-0",
  {
    variants: {
      size: {
        default: "size-4 data-[state=checked]:translate-x-4",
        sm: "size-3 data-[state=checked]:translate-x-3"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
), cr = F(({ className: e, size: r, ...t }, s) => /* @__PURE__ */ a.jsx(
  It,
  {
    className: I(ln({ size: r, className: e })),
    ...t,
    ref: s,
    children: /* @__PURE__ */ a.jsx(
      Br,
      {
        className: I(cn({ size: r }))
      }
    )
  }
));
cr.displayName = It.displayName;
const En = da, un = pa, dn = ma, ur = F(({ className: e, sideOffset: r = 4, ...t }, s) => /* @__PURE__ */ a.jsx(va, { children: /* @__PURE__ */ a.jsx("div", { className: yt, children: /* @__PURE__ */ a.jsx(
  Ht,
  {
    ref: s,
    className: I(
      "z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      e
    ),
    sideOffset: r,
    ...t
  }
) }) }));
ur.displayName = Ht.displayName;
const fe = {
  // UI Labels
  addFilter: "",
  clearFilters: "Clear",
  searchFields: "Search fields...",
  noFieldsFound: "No fields found.",
  noResultsFound: "No results found.",
  loading: "Loading...",
  select: "Select...",
  true: "True",
  false: "False",
  min: "Min",
  max: "Max",
  to: "to",
  typeAndPressEnter: "Type and press Enter to add tag",
  selected: "selected",
  selectedCount: "selected",
  percent: "%",
  defaultCurrency: "$",
  defaultColor: "#000000",
  addFilterTitle: "",
  // Operators
  operators: {
    is: "is",
    isNot: "is not",
    isAnyOf: "is any of",
    isNotAnyOf: "is not any of",
    includesAll: "includes all",
    excludesAll: "excludes all",
    before: "before",
    after: "after",
    between: "between",
    notBetween: "not between",
    contains: "contains",
    notContains: "does not contain",
    startsWith: "starts with",
    endsWith: "ends with",
    isExactly: "is exactly",
    equals: "equals",
    notEquals: "not equals",
    greaterThan: "greater than",
    lessThan: "less than",
    overlaps: "overlaps",
    includes: "includes",
    excludes: "excludes",
    includesAllOf: "includes all of",
    includesAnyOf: "includes any of",
    empty: "is empty",
    notEmpty: "is not empty"
  },
  // Placeholders
  placeholders: {
    enterField: (e) => `Enter ${e}...`,
    selectField: "Select...",
    searchField: (e) => `Search ${e.toLowerCase()}...`,
    enterKey: "Enter key...",
    enterValue: "Enter value..."
  },
  // Helper functions
  helpers: {
    formatOperator: (e) => e.replace(/_/g, " ")
  },
  // Validation
  validation: {
    invalidEmail: "Invalid email format",
    invalidUrl: "Invalid URL format",
    invalidTel: "Invalid phone format",
    invalid: "Invalid input format"
  }
}, dr = Me({
  variant: "outline",
  size: "md",
  radius: "md",
  i18n: fe,
  cursorPointer: !0,
  className: void 0,
  showAddButton: !0,
  addButtonText: void 0,
  addButtonIcon: void 0,
  addButtonClassName: void 0,
  addButton: void 0,
  showSearchInput: !0,
  trigger: void 0,
  allowMultiple: !0
}), Ie = () => Le(dr), pn = B(
  [
    "outline-hidden relative flex shrink-0 items-center text-foreground transition",
    "has-[[data-slot=filters-input]:focus-visible]:ring-ring/30",
    "has-[[data-slot=filters-input]:focus-visible]:border-ring",
    "has-[[data-slot=filters-input]:focus-visible]:outline-hidden",
    "has-[[data-slot=filters-input]:focus-visible]:ring-[3px]",
    "has-[[data-slot=filters-input]:focus-visible]:z-1",
    "has-[[data-slot=filters-input]:[aria-invalid=true]]:border",
    "has-[[data-slot=filters-input]:[aria-invalid=true]]:border-solid",
    "has-[[data-slot=filters-input]:[aria-invalid=true]]:border-destructive/60",
    "has-[[data-slot=filters-input]:[aria-invalid=true]]:ring-destructive/10",
    "dark:has-[[data-slot=filters-input]:[aria-invalid=true]]:border-destructive",
    "dark:has-[[data-slot=filters-input]:[aria-invalid=true]]:ring-destructive/20"
  ],
  {
    variants: {
      variant: {
        solid: "border-0 bg-secondary",
        outline: "border border-border bg-background"
      },
      size: {
        lg: "h-10 px-2.5 text-sm has-[[data-slot=filters-prefix]]:ps-0 has-[[data-slot=filters-suffix]]:pe-0",
        md: "h-[34px] px-2 text-sm has-[[data-slot=filters-prefix]]:ps-0 has-[[data-slot=filters-suffix]]:pe-0",
        sm: "h-8 px-2 text-xs has-[[data-slot=filters-prefix]]:ps-0 has-[[data-slot=filters-suffix]]:pe-0"
      },
      cursorPointer: {
        true: "cursor-pointer",
        false: ""
      }
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
      cursorPointer: !0
    }
  }
), mn = B(
  [
    "inline-flex shrink-0 items-center justify-center text-muted-foreground transition hover:text-foreground",
    "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
  ],
  {
    variants: {
      variant: {
        solid: "bg-secondary",
        outline: "border border-s-0 border-border hover:bg-secondary"
      },
      size: {
        lg: "size-10 [&_svg:not([class*=size-])]:size-4",
        md: "size-[34px] [&_svg:not([class*=size-])]:size-3.5",
        sm: "size-8 [&_svg:not([class*=size-])]:size-3"
      },
      cursorPointer: {
        true: "cursor-pointer",
        false: ""
      },
      radius: {
        md: "rounded-e-md",
        full: "rounded-e-full"
      }
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
      radius: "md",
      cursorPointer: !0
    }
  }
), xt = B(
  [
    "inline-flex shrink-0 items-center justify-center text-foreground transition",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.5px]",
    "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
  ],
  {
    variants: {
      variant: {
        solid: "hover:bg-secondary/60 border border-input",
        outline: "border border-border hover:bg-accent"
      },
      size: {
        lg: "h-10 gap-1.5 px-4 text-sm [&_svg:not([class*=size-])]:size-4",
        md: "h-[34px] gap-1.5 px-3 text-sm [&_svg:not([class*=size-])]:size-4",
        sm: "h-8 gap-1.5 px-2.5 text-xs [&_svg:not([class*=size-])]:size-3.5"
      },
      radius: {
        md: "rounded-md",
        full: "rounded-full"
      },
      cursorPointer: {
        true: "cursor-pointer",
        false: ""
      }
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
      cursorPointer: !0
    }
  }
), vn = B(
  [
    "focus-visible:z-1 relative flex shrink-0 items-center whitespace-nowrap text-muted-foreground transition hover:text-foreground data-[state=open]:text-foreground",
    "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
  ],
  {
    variants: {
      variant: {
        solid: "bg-secondary",
        outline: "border border-e-0 border-border bg-background hover:bg-secondary data-[state=open]:bg-secondary [&+[data-slot=filters-remove]]:border-s"
      },
      size: {
        lg: "h-10 gap-1.5 px-4 text-sm",
        md: "h-[34px] gap-0.5 px-3 text-sm",
        sm: "h-8 gap-1 px-2.5 text-xs"
      },
      cursorPointer: {
        true: "cursor-pointer",
        false: ""
      }
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
      cursorPointer: !0
    }
  }
), hn = B(
  [
    "flex shrink-0 items-center gap-1.5 px-1.5 py-1 text-foreground",
    "[&_svg:not([class*=size-])]:size-4"
  ],
  {
    variants: {
      variant: {
        solid: "bg-secondary",
        outline: "border border-e-0 border-border"
      },
      size: {
        lg: "h-10 gap-1.5 px-4 text-sm [&_svg:not([class*=size-])]:size-4",
        md: "h-[34px] gap-1.5 px-3 text-sm [&_svg:not([class*=size-])]:size-4",
        sm: "h-8 gap-0.5 px-2.5 text-xs [&_svg:not([class*=size-])]:size-3.5"
      },
      radius: {
        md: "rounded-s-md",
        full: "rounded-s-full"
      }
    },
    defaultVariants: {
      variant: "outline",
      size: "md"
    }
  }
), Pe = B(
  [
    "focus-visible:z-1 relative flex min-w-0 shrink items-center gap-1 text-foreground transition",
    "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
  ],
  {
    variants: {
      variant: {
        solid: "bg-secondary",
        outline: "border border-border bg-background hover:bg-secondary has-[[data-slot=switch]]:hover:bg-transparent"
      },
      size: {
        lg: "h-10 gap-1.5 px-4 text-sm [&_svg:not([class*=size-])]:size-4",
        md: "h-[34px] gap-1.5 px-3 text-sm [&_svg:not([class*=size-])]:size-4",
        sm: "h-8 gap-0.5 px-2.5 text-xs [&_svg:not([class*=size-])]:size-3.5"
      },
      cursorPointer: {
        true: "cursor-pointer has-[[data-slot=switch]]:cursor-default",
        false: ""
      }
    },
    defaultVariants: {
      variant: "outline",
      size: "md",
      cursorPointer: !0
    }
  }
), gt = B("flex shrink-0 items-center justify-center text-foreground", {
  variants: {
    variant: {
      solid: "",
      outline: ""
    },
    size: {
      lg: "h-10 px-4 text-sm",
      md: "h-[34px] px-3 text-sm",
      sm: "h-8 px-2.5 text-xs"
    }
  },
  defaultVariants: {
    variant: "outline",
    size: "md"
  }
}), Oe = B("flex shrink-0 items-center text-muted-foreground", {
  variants: {
    variant: {
      solid: "bg-secondary",
      outline: "border border-x-0 border-border bg-background"
    },
    size: {
      lg: "h-10 px-4 text-sm",
      md: "h-[34px] px-3 text-sm",
      sm: "h-8 px-2.5 text-xs"
    }
  },
  defaultVariants: {
    variant: "outline",
    size: "md"
  }
}), fn = B("relative flex flex-wrap items-center", {
  variants: {
    variant: {
      solid: "gap-2",
      outline: ""
    },
    size: {
      sm: "gap-1.5",
      md: "gap-2.5",
      lg: "gap-3.5"
    }
  },
  defaultVariants: {
    variant: "outline",
    size: "md"
  }
}), xn = B("flex max-w-[calc(100vw-32px)] items-center", {
  variants: {
    variant: {
      solid: "gap-px",
      outline: ""
    }
  },
  defaultVariants: {
    variant: "outline"
  }
});
function H({
  field: e,
  onChange: r,
  onBlur: t,
  onKeyDown: s,
  onInputChange: n,
  className: o,
  ...l
}) {
  const i = Ie(), [d, p] = M(!0), [c, y] = M(""), w = (b, _) => !_ || !b ? !0 : new RegExp(_).test(b), g = (b, _ = !1) => {
    if ((b === "text" || b === "number") && _)
      return i.i18n.validation.invalid;
    switch (b) {
      case "email":
        return i.i18n.validation.invalidEmail;
      case "url":
        return i.i18n.validation.invalidUrl;
      case "tel":
        return i.i18n.validation.invalidTel;
      default:
        return i.i18n.validation.invalid;
    }
  }, C = (b) => {
    r == null || r(b);
  }, h = (b) => {
    const _ = b.target.value, O = (e == null ? void 0 : e.pattern) || l.pattern;
    if (_ && O) {
      let v = !0;
      e != null && e.validation ? v = e.validation(_) : v = w(_, O), p(v);
      const S = !!(e != null && e.pattern || l.pattern);
      y(v ? "" : g((e == null ? void 0 : e.type) || "", S));
    } else
      p(!0), y("");
    n && n(b), t == null || t(b);
  }, x = (b) => {
    if (!d && !["Tab", "Escape", "Enter", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(b.key) && (p(!0), y("")), b.key === "Enter" && n) {
      const _ = {
        ...b,
        target: b.target,
        currentTarget: b.currentTarget
      };
      n(_);
    }
    s == null || s(b);
  };
  return /* @__PURE__ */ a.jsxs(
    "div",
    {
      className: I("w-36", pn({ variant: i.variant, size: i.size }), o),
      "data-slot": "filters-input-wrapper",
      children: [
        (e == null ? void 0 : e.prefix) && /* @__PURE__ */ a.jsx(
          "div",
          {
            className: gt({ variant: i.variant, size: i.size }),
            "data-slot": "filters-prefix",
            children: e.prefix
          }
        ),
        /* @__PURE__ */ a.jsxs("div", { className: "flex w-full items-stretch", children: [
          /* @__PURE__ */ a.jsx(
            "input",
            {
              "aria-describedby": !d && c ? `${(e == null ? void 0 : e.key) || "input"}-error` : void 0,
              "aria-invalid": !d,
              className: "outline-hidden w-full",
              "data-slot": "filters-input",
              onBlur: h,
              onChange: C,
              onKeyDown: x,
              ...l
            }
          ),
          !d && c && /* @__PURE__ */ a.jsxs(un, { children: [
            /* @__PURE__ */ a.jsx(dn, { asChild: !0, children: /* @__PURE__ */ a.jsx("div", { className: "absolute right-2 top-1/2 flex -translate-y-1/2 items-center", children: /* @__PURE__ */ a.jsx(Or, { className: "size-3.5 text-destructive" }) }) }),
            /* @__PURE__ */ a.jsx(ur, { children: /* @__PURE__ */ a.jsx("p", { className: "text-sm", children: c }) })
          ] })
        ] }),
        (e == null ? void 0 : e.suffix) && /* @__PURE__ */ a.jsx(
          "div",
          {
            className: I(gt({ variant: i.variant, size: i.size })),
            "data-slot": "filters-suffix",
            children: e.suffix
          }
        )
      ]
    }
  );
}
function gn({ className: e, icon: r = /* @__PURE__ */ a.jsx(Ct, {}), ...t }) {
  const s = Ie();
  return /* @__PURE__ */ a.jsx(
    "button",
    {
      className: I(
        mn({
          variant: s.variant,
          size: s.size,
          cursorPointer: s.cursorPointer,
          radius: s.radius
        }),
        e
      ),
      "data-slot": "filters-remove",
      ...t,
      type: "button",
      children: r
    }
  );
}
const pr = (e) => "fields" in e && Array.isArray(e.fields), mr = (e) => !!(e.group && e.fields), vr = (e) => e.reduce((r, t) => pr(t) ? [...r, ...t.fields] : mr(t) ? [...r, ...t.fields] : [...r, t], []), bn = (e) => vr(e).reduce(
  (t, s) => (s.key && (t[s.key] = s), t),
  {}
), hr = (e) => ({
  select: [
    { value: "is", label: e.operators.is },
    { value: "is_not", label: e.operators.isNot },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ],
  multiselect: [
    { value: "is_any_of", label: e.operators.isAnyOf },
    { value: "is_not_any_of", label: e.operators.isNotAnyOf },
    { value: "includes_all", label: e.operators.includesAll },
    { value: "excludes_all", label: e.operators.excludesAll },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ],
  date: [
    { value: "before", label: e.operators.before },
    { value: "after", label: e.operators.after },
    { value: "is", label: e.operators.is },
    { value: "is_not", label: e.operators.isNot },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ],
  daterange: [
    { value: "between", label: e.operators.between },
    { value: "not_between", label: e.operators.notBetween },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ],
  text: [
    { value: "contains", label: e.operators.contains },
    { value: "not_contains", label: e.operators.notContains },
    { value: "starts_with", label: e.operators.startsWith },
    { value: "ends_with", label: e.operators.endsWith },
    { value: "is", label: e.operators.isExactly },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ],
  number: [
    { value: "equals", label: e.operators.equals },
    { value: "not_equals", label: e.operators.notEquals },
    { value: "greater_than", label: e.operators.greaterThan },
    { value: "less_than", label: e.operators.lessThan },
    { value: "between", label: e.operators.between },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ],
  numberrange: [
    { value: "between", label: e.operators.between },
    { value: "overlaps", label: e.operators.overlaps },
    { value: "contains", label: e.operators.contains },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ],
  boolean: [
    { value: "is", label: e.operators.is },
    { value: "is_not", label: e.operators.isNot },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ],
  email: [
    { value: "contains", label: e.operators.contains },
    { value: "not_contains", label: e.operators.notContains },
    { value: "starts_with", label: e.operators.startsWith },
    { value: "ends_with", label: e.operators.endsWith },
    { value: "is", label: e.operators.isExactly },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ],
  url: [
    { value: "contains", label: e.operators.contains },
    { value: "not_contains", label: e.operators.notContains },
    { value: "starts_with", label: e.operators.startsWith },
    { value: "ends_with", label: e.operators.endsWith },
    { value: "is", label: e.operators.isExactly },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ],
  tel: [
    { value: "contains", label: e.operators.contains },
    { value: "not_contains", label: e.operators.notContains },
    { value: "starts_with", label: e.operators.startsWith },
    { value: "ends_with", label: e.operators.endsWith },
    { value: "is", label: e.operators.isExactly },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ],
  time: [
    { value: "before", label: e.operators.before },
    { value: "after", label: e.operators.after },
    { value: "is", label: e.operators.is },
    { value: "between", label: e.operators.between },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ],
  datetime: [
    { value: "before", label: e.operators.before },
    { value: "after", label: e.operators.after },
    { value: "is", label: e.operators.is },
    { value: "between", label: e.operators.between },
    { value: "empty", label: e.operators.empty },
    { value: "not_empty", label: e.operators.notEmpty }
  ]
});
hr(fe);
const yn = (e, r, t) => {
  if (e.operators)
    return e.operators;
  const s = hr(t);
  let n = e.type || "select";
  return n === "select" && r.length > 1 && (n = "multiselect"), n === "multiselect" || e.type === "multiselect" ? s.multiselect : s[n] || s.select;
};
function wn({ field: e, operator: r, values: t, onChange: s }) {
  var n;
  const o = Ie(), l = yn(e, t, o.i18n), i = ((n = l.find((d) => d.value === r)) == null ? void 0 : n.label) || o.i18n.helpers.formatOperator(r);
  return e.hideOperatorSelect ? /* @__PURE__ */ a.jsx("div", { className: "flex items-center self-stretch whitespace-nowrap border border-r-[0px] px-3 text-sm text-muted-foreground", children: i }) : /* @__PURE__ */ a.jsxs(Rr, { children: [
    /* @__PURE__ */ a.jsx(Vr, { className: vn({ variant: o.variant, size: o.size }), children: i }),
    /* @__PURE__ */ a.jsx($r, { align: "start", className: "w-fit min-w-fit", children: l.map((d) => /* @__PURE__ */ a.jsxs(
      Dr,
      {
        className: "flex items-center justify-between",
        onClick: () => s(d.value),
        children: [
          /* @__PURE__ */ a.jsx("span", { children: d.label }),
          /* @__PURE__ */ a.jsx(Q, { className: `ms-auto text-primary ${d.value === r ? "opacity-100" : "opacity-0"}` })
        ]
      },
      d.value
    )) })
  ] });
}
function fr({
  field: e,
  values: r,
  onChange: t,
  onClose: s,
  inline: n = !1
}) {
  var o;
  const [l, i] = M(!1), [d, p] = M(e.searchValue || ""), [c, y] = M([]), w = Ie();
  z(() => {
    e.searchValue !== void 0 && p(e.searchValue);
  }, [e.searchValue]);
  const g = e.type === "multiselect" || r.length > 1, C = (e.value !== void 0 ? e.value : r) || [];
  z(() => {
    l && e.searchable !== !1 && setTimeout(() => {
      const v = document.querySelector("[cmdk-input]");
      v && v.focus();
    }, 0);
  }, [l, e.searchable]);
  const h = re(
    () => {
      var v;
      return ((v = e.options) == null ? void 0 : v.filter((S) => C.includes(S.value))) || [];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [e.options, JSON.stringify(C)]
  );
  z(() => {
    if (C.length === 0) {
      y([]);
      return;
    }
    h.length > 0 && y((v) => {
      const S = [];
      for (const E of C) {
        const R = h.find((Y) => Y.value === E) ?? v.find((Y) => Y.value === E);
        R && S.push(R);
      }
      return S;
    });
  }, [h, C]);
  const x = C.length > 0 ? c.length > 0 ? c : h : [], b = ((o = e.options) == null ? void 0 : o.filter((v) => !C.includes(v.value))) || [], _ = (v) => {
    var S;
    p(v), (S = e.onSearchChange) == null || S.call(e, v);
  }, O = () => {
    i(!1), e.searchValue === void 0 && setTimeout(() => p(""), 200), s == null || s();
  };
  return n ? /* @__PURE__ */ a.jsx("div", { className: "w-full", children: /* @__PURE__ */ a.jsxs(Re, { children: [
    e.searchable !== !1 && /* @__PURE__ */ a.jsx(
      Ve,
      {
        className: "h-8.5 text-sm",
        placeholder: w.i18n.placeholders.searchField(e.label || ""),
        value: d,
        onValueChange: _
      }
    ),
    /* @__PURE__ */ a.jsxs($e, { className: "outline-hidden", children: [
      e.isLoading ? /* @__PURE__ */ a.jsxs("div", { className: "flex items-center justify-center py-6 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ a.jsx(Qe, { className: "mr-2 size-4 animate-spin" }),
        w.i18n.loading
      ] }) : /* @__PURE__ */ a.jsx(De, { children: w.i18n.noResultsFound }),
      x.length > 0 && /* @__PURE__ */ a.jsx(ee, { heading: e.label || "Selected", children: x.map((v) => /* @__PURE__ */ a.jsxs(
        Z,
        {
          className: "group flex items-center gap-2",
          onSelect: () => {
            if (g) {
              const S = C.filter((E) => E !== v.value);
              e.onValueChange ? e.onValueChange(S) : t(S);
            } else
              e.onValueChange ? e.onValueChange([]) : t([]);
          },
          children: [
            v.icon && v.icon,
            /* @__PURE__ */ a.jsxs("div", { className: "flex flex-col overflow-hidden", children: [
              /* @__PURE__ */ a.jsx("span", { className: "truncate text-accent-foreground", title: v.label, children: v.label }),
              v.detail && /* @__PURE__ */ a.jsx("span", { className: "truncate text-sm text-muted-foreground", title: v.detail, children: v.detail })
            ] }),
            /* @__PURE__ */ a.jsx(Q, { className: "ms-auto text-primary" })
          ]
        },
        String(v.value)
      )) }),
      b.length > 0 && /* @__PURE__ */ a.jsxs(a.Fragment, { children: [
        x.length > 0 && /* @__PURE__ */ a.jsx(xe, {}),
        /* @__PURE__ */ a.jsx(ee, { children: b.map((v) => /* @__PURE__ */ a.jsxs(
          Z,
          {
            className: "group flex items-center gap-2",
            value: v.label + (v.detail ? ` - ${v.detail}` : ""),
            onSelect: () => {
              if (g) {
                const S = [...C, v.value];
                if (e.maxSelections && S.length > e.maxSelections)
                  return;
                e.onValueChange ? e.onValueChange(S) : t(S), e.autoCloseOnSelect && (s == null || s());
              } else
                e.onValueChange ? e.onValueChange([v.value]) : t([v.value]), s == null || s();
            },
            children: [
              v.icon && v.icon,
              /* @__PURE__ */ a.jsxs("div", { className: "flex flex-col overflow-hidden", children: [
                /* @__PURE__ */ a.jsx("span", { className: "truncate text-accent-foreground", title: v.label, children: v.label }),
                v.detail && /* @__PURE__ */ a.jsx("span", { className: "truncate text-sm text-muted-foreground", title: v.detail, children: v.detail })
              ] }),
              /* @__PURE__ */ a.jsx(Q, { className: "ms-auto text-primary opacity-0" })
            ]
          },
          String(v.value)
        )) })
      ] })
    ] })
  ] }) }) : /* @__PURE__ */ a.jsxs(
    pt,
    {
      open: l,
      onOpenChange: (v) => {
        i(v), !v && e.searchValue === void 0 && setTimeout(() => p(""), 200);
      },
      children: [
        /* @__PURE__ */ a.jsx(
          mt,
          {
            className: I(Pe({
              variant: w.variant,
              size: w.size,
              cursorPointer: w.cursorPointer
            }), e.triggerClassName ?? "max-w-[240px]"),
            children: /* @__PURE__ */ a.jsx("div", { className: "flex min-w-0 items-center gap-1.5", children: e.customValueRenderer ? e.customValueRenderer(r, e.options || []) : /* @__PURE__ */ a.jsxs(a.Fragment, { children: [
              x.length > 0 && x.some((v) => v.icon) && /* @__PURE__ */ a.jsx("div", { className: I("-space-x-0.5 flex shrink-0 items-center", e.selectedOptionsClassName), children: x.slice(0, 3).map((v) => /* @__PURE__ */ a.jsx("div", { children: v.icon }, String(v.value))) }),
              x.length === 1 ? /* @__PURE__ */ a.jsx("span", { className: "min-w-0 truncate text-accent-foreground", title: x[0].detail ? `${x[0].label} - ${x[0].detail}` : x[0].label, children: x[0].label }) : x.length > 1 ? `${x.length} ${w.i18n.selectedCount}` : w.i18n.select
            ] }) })
          }
        ),
        /* @__PURE__ */ a.jsx(
          Ye,
          {
            align: "start",
            className: I(
              "p-0 data-[state=closed]:animation-none! data-[state=closed]:duration-0!",
              e.className || "w-[200px]"
            ),
            children: /* @__PURE__ */ a.jsxs(Re, { children: [
              e.searchable !== !1 && /* @__PURE__ */ a.jsx(
                Ve,
                {
                  className: "h-[34px] text-sm",
                  placeholder: w.i18n.placeholders.searchField(e.label || ""),
                  value: d,
                  onValueChange: _
                }
              ),
              /* @__PURE__ */ a.jsxs($e, { className: "outline-hidden", children: [
                e.isLoading ? /* @__PURE__ */ a.jsxs("div", { className: "flex items-center justify-center py-6 text-sm text-muted-foreground", children: [
                  /* @__PURE__ */ a.jsx(Qe, { className: "mr-2 size-4 animate-spin" }),
                  w.i18n.loading
                ] }) : /* @__PURE__ */ a.jsx(De, { children: w.i18n.noResultsFound }),
                x.length > 0 && /* @__PURE__ */ a.jsx(ee, { children: x.map((v) => /* @__PURE__ */ a.jsxs(
                  Z,
                  {
                    className: "group flex items-center gap-2",
                    onSelect: () => {
                      t(g ? r.filter((S) => S !== v.value) : []), g || (i(!1), O());
                    },
                    children: [
                      v.icon && v.icon,
                      /* @__PURE__ */ a.jsxs("div", { className: "flex flex-col overflow-hidden", children: [
                        /* @__PURE__ */ a.jsx("span", { className: "truncate text-accent-foreground", title: v.label, children: v.label }),
                        v.detail && /* @__PURE__ */ a.jsx("span", { className: "truncate text-sm text-muted-foreground", title: v.detail, children: v.detail })
                      ] }),
                      /* @__PURE__ */ a.jsx(Q, { className: "ms-auto text-primary" })
                    ]
                  },
                  String(v.value)
                )) }),
                b.length > 0 && /* @__PURE__ */ a.jsxs(a.Fragment, { children: [
                  x.length > 0 && /* @__PURE__ */ a.jsx(xe, {}),
                  /* @__PURE__ */ a.jsx(ee, { children: b.map((v) => /* @__PURE__ */ a.jsxs(
                    Z,
                    {
                      className: "group flex items-center gap-2",
                      value: v.label + (v.detail ? ` - ${v.detail}` : ""),
                      onSelect: () => {
                        if (g) {
                          const S = [...r, v.value];
                          if (e.maxSelections && S.length > e.maxSelections)
                            return;
                          t(S), e.autoCloseOnSelect && O();
                        } else
                          t([v.value]), i(!1), O();
                      },
                      children: [
                        v.icon && v.icon,
                        /* @__PURE__ */ a.jsxs("div", { className: "flex flex-col overflow-hidden", children: [
                          /* @__PURE__ */ a.jsx("span", { className: "truncate text-accent-foreground", title: v.label, children: v.label }),
                          v.detail && /* @__PURE__ */ a.jsx("span", { className: "truncate text-sm text-muted-foreground", title: v.detail, children: v.detail })
                        ] }),
                        /* @__PURE__ */ a.jsx(Q, { className: "ms-auto text-primary opacity-0" })
                      ]
                    },
                    String(v.value)
                  )) })
                ] })
              ] })
            ] })
          }
        )
      ]
    }
  );
}
function jn({ field: e, values: r, onChange: t, operator: s }) {
  var n, o;
  const [l, i] = M(!1), [d, p] = M(e.searchValue || ""), c = Ie();
  z(() => {
    e.searchValue !== void 0 && p(e.searchValue);
  }, [e.searchValue]);
  const y = (h) => {
    var x;
    p(h), (x = e.onSearchChange) == null || x.call(e, h);
  };
  if (z(() => {
    l && e.searchable !== !1 && setTimeout(() => {
      const h = document.querySelector("[cmdk-input]");
      h && h.focus();
    }, 0);
  }, [l, e.searchable]), s === "empty" || s === "not_empty")
    return null;
  if (e.customRenderer)
    return /* @__PURE__ */ a.jsx(
      "div",
      {
        className: Pe({
          variant: c.variant,
          size: c.size,
          cursorPointer: c.cursorPointer
        }),
        children: e.customRenderer({ field: e, values: r, onChange: t, operator: s })
      }
    );
  if (e.type === "boolean") {
    const h = r[0] === !0, x = e.onLabel || c.i18n.true, b = e.offLabel || c.i18n.false;
    return /* @__PURE__ */ a.jsx(
      "div",
      {
        className: Pe({
          variant: c.variant,
          size: c.size,
          cursorPointer: c.cursorPointer
        }),
        children: /* @__PURE__ */ a.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ a.jsx(cr, { checked: h, size: "sm", onCheckedChange: (_) => t([_]) }),
          e.onLabel && e.offLabel && /* @__PURE__ */ a.jsx("span", { className: "text-xs text-muted-foreground", children: h ? x : b })
        ] })
      }
    );
  }
  if (e.type === "time") {
    if (s === "between") {
      const h = r[0] || "", x = r[1] || "";
      return /* @__PURE__ */ a.jsxs("div", { className: "flex items-center", "data-slot": "filters-item", children: [
        /* @__PURE__ */ a.jsx(
          H,
          {
            className: e.className,
            field: e,
            type: "time",
            value: h,
            onChange: (b) => t([b.target.value, x]),
            onInputChange: e.onInputChange
          }
        ),
        /* @__PURE__ */ a.jsx(
          "div",
          {
            className: Oe({ variant: c.variant, size: c.size }),
            "data-slot": "filters-between",
            children: c.i18n.to
          }
        ),
        /* @__PURE__ */ a.jsx(
          H,
          {
            className: e.className,
            field: e,
            type: "time",
            value: x,
            onChange: (b) => t([h, b.target.value]),
            onInputChange: e.onInputChange
          }
        )
      ] });
    }
    return /* @__PURE__ */ a.jsx(
      H,
      {
        className: e.className,
        field: e,
        type: "time",
        value: r[0] || "",
        onChange: (h) => t([h.target.value]),
        onInputChange: e.onInputChange
      }
    );
  }
  if (e.type === "datetime") {
    if (s === "between") {
      const h = r[0] || "", x = r[1] || "";
      return /* @__PURE__ */ a.jsxs("div", { className: "flex items-center", "data-slot": "filters-item", children: [
        /* @__PURE__ */ a.jsx(
          H,
          {
            className: I("w-36 max-w-full", e.className),
            field: e,
            type: "datetime-local",
            value: h,
            onChange: (b) => t([b.target.value, x]),
            onInputChange: e.onInputChange
          }
        ),
        /* @__PURE__ */ a.jsx(
          "div",
          {
            className: Oe({ variant: c.variant, size: c.size }),
            "data-slot": "filters-between",
            children: c.i18n.to
          }
        ),
        /* @__PURE__ */ a.jsx(
          H,
          {
            className: I("w-36 max-w-full", e.className),
            field: e,
            type: "datetime-local",
            value: x,
            onChange: (b) => t([h, b.target.value]),
            onInputChange: e.onInputChange
          }
        )
      ] });
    }
    return /* @__PURE__ */ a.jsx(
      H,
      {
        className: I("w-36 max-w-full", e.className),
        field: e,
        type: "datetime-local",
        value: r[0] || "",
        onChange: (h) => t([h.target.value]),
        onInputChange: e.onInputChange
      }
    );
  }
  if (["email", "url", "tel"].includes(e.type || "")) {
    const h = () => {
      switch (e.type) {
        case "email":
          return "email";
        case "url":
          return "url";
        case "tel":
          return "tel";
        default:
          return "text";
      }
    }, x = () => {
      switch (e.type) {
        case "email":
          return "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$";
        case "url":
          return "^https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)$";
        case "tel":
          return "^[\\+]?[1-9][\\d]{0,15}$";
        default:
          return;
      }
    };
    return /* @__PURE__ */ a.jsx(
      H,
      {
        className: e.className,
        field: e,
        pattern: e.pattern || x(),
        placeholder: e.placeholder || c.i18n.placeholders.enterField(e.type || "text"),
        type: h(),
        value: r[0] || "",
        onChange: (b) => t([b.target.value]),
        onInputChange: e.onInputChange
      }
    );
  }
  if (e.type === "daterange") {
    const h = r[0] || "", x = r[1] || "";
    return /* @__PURE__ */ a.jsxs(
      "div",
      {
        className: Pe({
          variant: c.variant,
          size: c.size,
          cursorPointer: c.cursorPointer
        }),
        children: [
          /* @__PURE__ */ a.jsx(
            H,
            {
              className: I("w-24 max-w-full", e.className),
              field: e,
              type: "date",
              value: h,
              onChange: (b) => t([b.target.value, x]),
              onInputChange: e.onInputChange
            }
          ),
          /* @__PURE__ */ a.jsx(
            "div",
            {
              className: Oe({ variant: c.variant, size: c.size }),
              "data-slot": "filters-between",
              children: c.i18n.to
            }
          ),
          /* @__PURE__ */ a.jsx(
            H,
            {
              className: I("w-24 max-w-full", e.className),
              field: e,
              type: "date",
              value: x,
              onChange: (b) => t([h, b.target.value]),
              onInputChange: e.onInputChange
            }
          )
        ]
      }
    );
  }
  if (e.type === "text" || e.type === "number") {
    if (e.type === "number" && s === "between") {
      const h = r[0] || "", x = r[1] || "";
      return /* @__PURE__ */ a.jsxs("div", { className: "flex items-center", "data-slot": "filters-item", children: [
        /* @__PURE__ */ a.jsx(
          H,
          {
            className: I("w-16 max-w-full", e.className),
            field: e,
            max: e.max,
            min: e.min,
            pattern: e.pattern,
            placeholder: c.i18n.min,
            step: e.step,
            type: "number",
            value: h,
            onChange: (b) => t([b.target.value, x]),
            onInputChange: e.onInputChange
          }
        ),
        /* @__PURE__ */ a.jsx(
          "div",
          {
            className: Oe({ variant: c.variant, size: c.size }),
            "data-slot": "filters-between",
            children: c.i18n.to
          }
        ),
        /* @__PURE__ */ a.jsx(
          H,
          {
            className: I("w-16 max-w-full", e.className),
            field: e,
            max: e.max,
            min: e.min,
            pattern: e.pattern,
            placeholder: c.i18n.max,
            step: e.step,
            type: "number",
            value: x,
            onChange: (b) => t([h, b.target.value]),
            onInputChange: e.onInputChange
          }
        )
      ] });
    }
    return /* @__PURE__ */ a.jsx("div", { className: "flex items-center", "data-slot": "filters-item", children: /* @__PURE__ */ a.jsx(
      H,
      {
        className: I("w-36", e.className),
        field: e,
        max: e.type === "number" ? e.max : void 0,
        min: e.type === "number" ? e.min : void 0,
        pattern: e.pattern,
        placeholder: e.placeholder,
        step: e.type === "number" ? e.step : void 0,
        type: e.type === "number" ? "number" : "text",
        value: r[0] || "",
        onChange: (h) => t([h.target.value]),
        onInputChange: e.onInputChange
      }
    ) });
  }
  if (e.type === "date")
    return /* @__PURE__ */ a.jsx(
      H,
      {
        className: I("w-16", e.className),
        field: e,
        type: "date",
        value: r[0] || "",
        onChange: (h) => t([h.target.value]),
        onInputChange: e.onInputChange
      }
    );
  if (e.type === "select" || e.type === "multiselect")
    return /* @__PURE__ */ a.jsx(fr, { field: e, values: r, onChange: t });
  const w = r.length > 1, g = ((n = e.options) == null ? void 0 : n.filter((h) => r.includes(h.value))) || [], C = ((o = e.options) == null ? void 0 : o.filter((h) => !r.includes(h.value))) || [];
  return /* @__PURE__ */ a.jsxs(
    pt,
    {
      open: l,
      onOpenChange: (h) => {
        i(h), !h && e.searchValue === void 0 && setTimeout(() => p(""), 200);
      },
      children: [
        /* @__PURE__ */ a.jsx(
          mt,
          {
            className: Pe({
              variant: c.variant,
              size: c.size,
              cursorPointer: c.cursorPointer
            }),
            children: /* @__PURE__ */ a.jsx("div", { className: "flex w-full min-w-0 items-center gap-1.5", children: e.customValueRenderer ? e.customValueRenderer(r, e.options || []) : /* @__PURE__ */ a.jsxs(a.Fragment, { children: [
              g.length > 0 && /* @__PURE__ */ a.jsx("div", { className: "flex shrink-0 items-center -space-x-1.5", children: g.slice(0, 3).map((h) => /* @__PURE__ */ a.jsx("div", { children: h.icon }, String(h.value))) }),
              g.length === 1 ? /* @__PURE__ */ a.jsx("span", { className: "min-w-0 truncate text-accent-foreground", title: g[0].detail ? `${g[0].label} - ${g[0].detail}` : g[0].label, children: g[0].label }) : g.length > 1 ? `${g.length} ${c.i18n.selectedCount}` : c.i18n.select
            ] }) })
          }
        ),
        /* @__PURE__ */ a.jsx(Ye, { className: I("w-36 p-0 data-[state=closed]:animation-none! data-[state=closed]:duration-0!", e.popoverContentClassName), children: /* @__PURE__ */ a.jsxs(Re, { children: [
          e.searchable !== !1 && /* @__PURE__ */ a.jsx(
            Ve,
            {
              className: "h-[34px] text-sm",
              placeholder: c.i18n.placeholders.searchField(e.label || ""),
              value: d,
              onValueChange: y
            }
          ),
          /* @__PURE__ */ a.jsxs($e, { className: "outline-hidden", children: [
            e.isLoading ? /* @__PURE__ */ a.jsxs("div", { className: "flex items-center justify-center py-6 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ a.jsx(Qe, { className: "mr-2 size-4 animate-spin" }),
              c.i18n.loading
            ] }) : /* @__PURE__ */ a.jsx(De, { children: c.i18n.noResultsFound }),
            g.length > 0 && /* @__PURE__ */ a.jsx(ee, { children: g.map((h) => /* @__PURE__ */ a.jsxs(
              Z,
              {
                className: "group flex items-center gap-2",
                onSelect: () => {
                  t(w ? r.filter((x) => x !== h.value) : []), w || i(!1);
                },
                children: [
                  h.icon && h.icon,
                  /* @__PURE__ */ a.jsx("span", { className: "truncate text-accent-foreground", children: h.label }),
                  /* @__PURE__ */ a.jsx(Q, { className: "ms-auto text-primary" })
                ]
              },
              String(h.value)
            )) }),
            C.length > 0 && /* @__PURE__ */ a.jsxs(a.Fragment, { children: [
              g.length > 0 && /* @__PURE__ */ a.jsx(xe, {}),
              /* @__PURE__ */ a.jsx(ee, { children: C.map((h) => /* @__PURE__ */ a.jsxs(
                Z,
                {
                  className: "group flex items-center gap-2",
                  value: h.label,
                  onSelect: () => {
                    if (w) {
                      const x = [...r, h.value];
                      if (e.maxSelections && x.length > e.maxSelections)
                        return;
                      t(x);
                    } else
                      t([h.value]), i(!1);
                  },
                  children: [
                    h.icon && h.icon,
                    /* @__PURE__ */ a.jsx("span", { className: "truncate text-accent-foreground", children: h.label }),
                    /* @__PURE__ */ a.jsx(Q, { className: "ms-auto text-primary opacity-0" })
                  ]
                },
                String(h.value)
              )) })
            ] })
          ] })
        ] }) })
      ]
    }
  );
}
function Tn({
  filters: e,
  fields: r,
  onChange: t,
  className: s,
  showAddButton: n = !0,
  addButtonText: o,
  addButtonIcon: l,
  addButtonClassName: i,
  addButton: d,
  showClearButton: p = !1,
  clearButtonText: c,
  clearButtonIcon: y,
  clearButtonClassName: w,
  clearButton: g,
  onClear: C,
  variant: h = "outline",
  size: x = "md",
  radius: b = "md",
  i18n: _,
  showSearchInput: O = !0,
  cursorPointer: v = !0,
  trigger: S,
  allowMultiple: E = !0,
  popoverContentClassName: R,
  popoverAlign: Y = "start",
  keyboardShortcut: me,
  onActiveFieldChange: oe
}) {
  const [le, K] = M(!1), [J, q] = M(null), [ie, G] = M([]);
  z(() => {
    oe == null || oe(J);
  }, [J, oe]), z(() => {
    if (!me)
      return;
    const u = (f) => {
      const j = f.target;
      j.tagName === "INPUT" || j.tagName === "TEXTAREA" || j.isContentEditable || f.key.toLowerCase() === me.toLowerCase() && !f.metaKey && !f.ctrlKey && !f.altKey && (f.preventDefault(), K((k) => !k));
    };
    return window.addEventListener("keydown", u), () => window.removeEventListener("keydown", u);
  }, [me]), z(() => {
    le && setTimeout(() => {
      const u = document.querySelector("[cmdk-input]");
      if (u)
        u.focus();
      else {
        const f = document.querySelector("[cmdk-root]");
        f && f.focus();
      }
    }, 0);
  }, [le, J, O]);
  const U = {
    ...fe,
    ..._,
    operators: {
      ...fe.operators,
      ..._ == null ? void 0 : _.operators
    },
    placeholders: {
      ...fe.placeholders,
      ..._ == null ? void 0 : _.placeholders
    },
    validation: {
      ...fe.validation,
      ..._ == null ? void 0 : _.validation
    }
  }, ce = re(() => bn(r), [r]), X = J ? ce[J] : null, Ce = D(
    (u, f) => {
      t(
        e.map((j) => {
          if (j.id === u) {
            const k = { ...j, ...f };
            return (f.operator === "empty" || f.operator === "not_empty") && (k.values = []), k;
          }
          return j;
        })
      );
    },
    [e, t]
  ), Ae = D(
    (u) => {
      t(e.filter((f) => f.id !== u));
    },
    [e, t]
  ), m = D(
    (u) => {
      const f = ce[u];
      if (f && f.key) {
        if (f.type === "select" || f.type === "multiselect") {
          q(f.key);
          const L = e.find((xr) => xr.field === u), ue = f.type === "multiselect" && L ? L.values : [];
          G(ue);
          return;
        }
        const j = f.defaultOperator || (f.type === "daterange" || f.type === "numberrange" ? "between" : (f.type === "boolean", "is"));
        let k = [];
        f.defaultValue !== void 0 ? k = [f.defaultValue] : ["text", "number", "date", "email", "url", "tel", "time", "datetime"].includes(f.type || "") ? k = [""] : f.type === "daterange" ? k = ["", ""] : f.type === "numberrange" ? k = [f.min || 0, f.max || 100] : f.type === "boolean" && (k = [!1]);
        const P = bt(u, j, k), $ = [...e, P];
        t($), K(!1);
      }
    },
    [ce, e, t]
  ), N = D(
    (u, f, j = !0) => {
      if (!u.key)
        return;
      const k = e.find((L) => L.field === u.key);
      if (k) {
        const L = e.map((ue) => ue.id === k.id ? { ...ue, values: f } : ue);
        t(L), G(f), j && (K(!1), q(null));
        return;
      }
      const P = u.defaultOperator || (u.type === "multiselect" ? "is_any_of" : "is"), $ = e.findIndex((L) => L.field === u.key);
      if ($ >= 0) {
        const L = [...e];
        L[$] = {
          ...L[$],
          values: f
        }, t(L);
      } else {
        const L = bt(u.key, P, f), ue = [...e, L];
        t(ue);
      }
      j ? (K(!1), q(null), G([])) : G(f);
    },
    [e, t]
  ), T = re(() => vr(r).filter((f) => !f.key || f.type === "separator" ? !1 : E ? !0 : !e.some((j) => j.field === f.key)), [r, e, E]);
  return /* @__PURE__ */ a.jsx(
    dr.Provider,
    {
      value: {
        variant: h,
        size: x,
        radius: b,
        i18n: U,
        cursorPointer: v,
        className: s,
        showAddButton: n,
        addButtonText: o,
        addButtonIcon: l,
        addButtonClassName: i,
        addButton: d,
        showSearchInput: O,
        trigger: S,
        allowMultiple: E
      },
      children: /* @__PURE__ */ a.jsxs("div", { className: I(
        fn({ variant: h, size: x }),
        e.length > 0 && "w-full",
        p && e.length > 0 && "sm:pr-24",
        s
      ), children: [
        e.map((u) => {
          const f = ce[u.field];
          return f ? /* @__PURE__ */ a.jsxs("div", { className: xn({ variant: h }), "data-slot": "filter-item", children: [
            /* @__PURE__ */ a.jsxs("div", { className: hn({ variant: h, size: x, radius: b }), children: [
              f.icon,
              f.label
            ] }),
            /* @__PURE__ */ a.jsx(
              wn,
              {
                field: f,
                operator: u.operator,
                values: u.values,
                onChange: (j) => Ce(u.id, { operator: j })
              }
            ),
            /* @__PURE__ */ a.jsx(
              jn,
              {
                field: f,
                operator: u.operator,
                values: u.values,
                onChange: (j) => Ce(u.id, { values: j })
              }
            ),
            /* @__PURE__ */ a.jsx(gn, { onClick: () => Ae(u.id) })
          ] }, u.id) : null;
        }),
        n && T.length > 0 && /* @__PURE__ */ a.jsxs(
          pt,
          {
            open: le,
            onOpenChange: (u) => {
              K(u), u || (q(null), G([]));
            },
            children: [
              /* @__PURE__ */ a.jsx(mt, { asChild: !0, children: d || /* @__PURE__ */ a.jsxs(
                "button",
                {
                  className: I(
                    xt({
                      variant: h,
                      size: x,
                      cursorPointer: v,
                      radius: b
                    }),
                    i
                  ),
                  title: U.addFilterTitle,
                  type: "button",
                  children: [
                    l || /* @__PURE__ */ a.jsx(Ar, {}),
                    o || U.addFilter
                  ]
                }
              ) }),
              /* @__PURE__ */ a.jsx(
                Ye,
                {
                  align: Y,
                  className: I(
                    "p-0 data-[state=closed]:animation-none! data-[state=closed]:duration-0!",
                    (X == null ? void 0 : X.className) || R || "w-[220px]"
                  ),
                  children: X ? (
                    // Show original select/multiselect rendering without back button
                    // SelectOptionsPopover renders its own Command component when inline={true}
                    /* @__PURE__ */ a.jsx(
                      fr,
                      {
                        field: X,
                        inline: !0,
                        values: ie,
                        onChange: (u) => {
                          const f = X.type === "select";
                          N(X, u, f);
                        },
                        onClose: () => {
                          K(!1), q(null), G([]);
                        }
                      }
                    )
                  ) : (
                    // Show field selection - needs Command wrapper for search/list
                    /* @__PURE__ */ a.jsxs(Re, { className: "outline-hidden", tabIndex: O ? void 0 : 0, children: [
                      O && /* @__PURE__ */ a.jsx(Ve, { className: "h-[34px]", placeholder: U.searchFields }),
                      /* @__PURE__ */ a.jsxs($e, { className: "outline-hidden", children: [
                        /* @__PURE__ */ a.jsx(De, { children: U.noFieldsFound }),
                        r.map((u, f) => {
                          if (pr(u)) {
                            const k = u.fields.filter((P) => P.type === "separator" || E ? !0 : !e.some(($) => $.field === P.key));
                            return k.length === 0 ? null : /* @__PURE__ */ a.jsx(ee, { heading: u.group || "Fields", children: k.map((P, $) => {
                              if (P.type === "separator") {
                                const L = P.key ?? `${u.group ?? `group-${f}`}-separator-${$}`;
                                return /* @__PURE__ */ a.jsx(xe, {}, L);
                              }
                              return /* @__PURE__ */ a.jsxs(
                                Z,
                                {
                                  className: "min-w-0",
                                  onSelect: () => P.key && m(P.key),
                                  children: [
                                    P.icon,
                                    /* @__PURE__ */ a.jsx("span", { className: "truncate", children: P.label })
                                  ]
                                },
                                P.key ?? `${u.group ?? `group-${f}`}-field-${$}`
                              );
                            }) }, u.group || `group-${f}`);
                          }
                          if (mr(u)) {
                            const k = u.fields.filter((P) => P.type === "separator" || E ? !0 : !e.some(($) => $.field === P.key));
                            return k.length === 0 ? null : /* @__PURE__ */ a.jsx(ee, { heading: u.group || "Fields", children: k.map((P) => {
                              if (P.type === "separator") {
                                const $ = P.key || `${u.group || `group-${f}`}-separator-${P.label || Math.random()}`;
                                return /* @__PURE__ */ a.jsx(xe, {}, $);
                              }
                              return /* @__PURE__ */ a.jsxs(Z, { className: "min-w-0", onSelect: () => P.key && m(P.key), children: [
                                P.icon,
                                /* @__PURE__ */ a.jsx("span", { className: "truncate", children: P.label })
                              ] }, P.key);
                            }) }, u.group || `group-${f}`);
                          }
                          const j = u;
                          if (j.type === "separator") {
                            const k = j.key || `flat-separator-${j.label || f}`;
                            return /* @__PURE__ */ a.jsx(xe, {}, k);
                          }
                          return !E && e.some((k) => k.field === j.key) ? null : /* @__PURE__ */ a.jsxs(Z, { className: "min-w-0", onSelect: () => j.key && m(j.key), children: [
                            j.icon,
                            /* @__PURE__ */ a.jsx("span", { className: "truncate", children: j.label })
                          ] }, j.key);
                        })
                      ] })
                    ] })
                  )
                }
              )
            ]
          }
        ),
        p && e.length > 0 && (g || /* @__PURE__ */ a.jsxs(
          "button",
          {
            className: I(
              xt({
                variant: h,
                size: x,
                cursorPointer: v,
                radius: b
              }),
              "border-0 bg-transparent hover:bg-transparent hover:text-foreground",
              "sm:absolute sm:right-0 sm:top-0",
              w
            ),
            type: "button",
            onClick: () => {
              C ? C() : t([]);
            },
            children: [
              y || /* @__PURE__ */ a.jsx(Ct, {}),
              c || U.clearFilters
            ]
          }
        ))
      ] })
    }
  );
}
const bt = (e, r, t = []) => ({
  id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  field: e,
  operator: r || "is",
  values: t
});
export {
  Re as C,
  Tn as F,
  pt as P,
  En as T,
  Kr as V,
  un as a,
  dn as b,
  bt as c,
  ur as d,
  mt as e,
  Ye as f,
  $e as g,
  De as h,
  ee as i,
  Z as j,
  Sn as k,
  Lr as u
};
//# sourceMappingURL=filters-Cy4F_SbD.mjs.map

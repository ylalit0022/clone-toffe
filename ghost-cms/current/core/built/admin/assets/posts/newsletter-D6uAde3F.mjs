import { D as he, a as j, j as e, E as st, o as R, F as at, G as B, H as W, J as ye, K as rt, u as $, b as D, p as ae, n as E, R as U, c as nt, d as Ce, f as A, L as ve, M as it, N as ot, Q as lt, g as ct, e as O } from "./index-DHZtUctP.mjs";
import { h as dt, f as ut, d as re, B as V, H as Le } from "./heading-BU5ZMUV_.mjs";
import { s as mt, c as pt } from "./hooks-BQt0oM3N.mjs";
import { C as ne, a as ie, b as oe, g as le, c as T, j as Pe, T as gt, h as xt, P as ft, f as ht, n as vt } from "./post-analytics-header-C0v3cpGl.mjs";
import { S as ce } from "./separator-B97phMDm.mjs";
import { a8 as bt, a2 as jt, a3 as kt, a4 as Nt, a9 as be, aa as wt, ab as yt, D as Ct, a as Lt, b as Pt, c as St, d as _t, e as At, f as Rt, g as Ft, ac as $t } from "./tabs-DNo42wAd.mjs";
import { a as Se } from "./skeleton-BY5P5NDt.mjs";
import { g as Et, h as Tt, K as Q, f as Z, a as J, b as X, c as ee } from "./stats-Bpyll2jG.mjs";
import { B as It } from "./loading-indicator-CadEpdNK.mjs";
import { a as zt, u as Mt, p as Bt, g as te, N as se } from "./links-D-IoRZMh.mjs";
import { u as Dt } from "./post-analytics-context-zxkwizI5.mjs";
import { g as je } from "./posts-9lhi5U2u.mjs";
import { f as Vt } from "./dropdown-menu-D5NyPbW9.mjs";
function Ut(t, s = []) {
  let a = [];
  function r(n, o) {
    const l = he(o);
    l.displayName = n + "Context";
    const u = a.length;
    a = [...a, o];
    const m = (x) => {
      var h;
      const { scope: g, children: k, ...p } = x, f = ((h = g == null ? void 0 : g[t]) == null ? void 0 : h[u]) || l, b = j(() => p, Object.values(p));
      return /* @__PURE__ */ e.jsx(f.Provider, { value: b, children: k });
    };
    m.displayName = n + "Provider";
    function c(x, g) {
      var f;
      const k = ((f = g == null ? void 0 : g[t]) == null ? void 0 : f[u]) || l, p = st(k);
      if (p) return p;
      if (o !== void 0) return o;
      throw new Error(`\`${x}\` must be used within \`${n}\``);
    }
    return [m, c];
  }
  const i = () => {
    const n = a.map((o) => he(o));
    return function(l) {
      const u = (l == null ? void 0 : l[t]) || n;
      return j(
        () => ({ [`__scope${t}`]: { ...l, [t]: u } }),
        [l, u]
      );
    };
  };
  return i.scopeName = t, [r, Ot(i, ...s)];
}
function Ot(...t) {
  const s = t[0];
  if (t.length === 1) return s;
  const a = () => {
    const r = t.map((i) => ({
      useScope: i(),
      scopeName: i.scopeName
    }));
    return function(n) {
      const o = r.reduce((l, { useScope: u, scopeName: m }) => {
        const x = u(n)[`__scope${m}`];
        return { ...l, ...x };
      }, {});
      return j(() => ({ [`__scope${s.scopeName}`]: o }), [o]);
    };
  };
  return a.scopeName = s.scopeName, a;
}
var Wt = Symbol.for("react.lazy"), H = at[" use ".trim().toString()];
function Ht(t) {
  return typeof t == "object" && t !== null && "then" in t;
}
function _e(t) {
  return t != null && typeof t == "object" && "$$typeof" in t && t.$$typeof === Wt && "_payload" in t && Ht(t._payload);
}
// @__NO_SIDE_EFFECTS__
function Gt(t) {
  const s = /* @__PURE__ */ Kt(t), a = R((r, i) => {
    let { children: n, ...o } = r;
    _e(n) && typeof H == "function" && (n = H(n._payload));
    const l = B.toArray(n), u = l.find(Yt);
    if (u) {
      const m = u.props.children, c = l.map((x) => x === u ? B.count(m) > 1 ? B.only(null) : W(m) ? m.props.children : null : x);
      return /* @__PURE__ */ e.jsx(s, { ...o, ref: i, children: W(m) ? ye(m, void 0, c) : null });
    }
    return /* @__PURE__ */ e.jsx(s, { ...o, ref: i, children: n });
  });
  return a.displayName = `${t}.Slot`, a;
}
// @__NO_SIDE_EFFECTS__
function Kt(t) {
  const s = R((a, r) => {
    let { children: i, ...n } = a;
    if (_e(i) && typeof H == "function" && (i = H(i._payload)), W(i)) {
      const o = Zt(i), l = Qt(n, i.props);
      return i.type !== rt && (l.ref = r ? dt(r, o) : o), ye(i, l);
    }
    return B.count(i) > 1 ? B.only(null) : null;
  });
  return s.displayName = `${t}.SlotClone`, s;
}
var qt = Symbol("radix.slottable");
function Yt(t) {
  return W(t) && typeof t.type == "function" && "__radixId" in t.type && t.type.__radixId === qt;
}
function Qt(t, s) {
  const a = { ...s };
  for (const r in s) {
    const i = t[r], n = s[r];
    /^on[A-Z]/.test(r) ? i && n ? a[r] = (...l) => {
      const u = n(...l);
      return i(...l), u;
    } : i && (a[r] = i) : r === "style" ? a[r] = { ...i, ...n } : r === "className" && (a[r] = [i, n].filter(Boolean).join(" "));
  }
  return { ...t, ...a };
}
function Zt(t) {
  var r, i;
  let s = (r = Object.getOwnPropertyDescriptor(t.props, "ref")) == null ? void 0 : r.get, a = s && "isReactWarning" in s && s.isReactWarning;
  return a ? t.ref : (s = (i = Object.getOwnPropertyDescriptor(t, "ref")) == null ? void 0 : i.get, a = s && "isReactWarning" in s && s.isReactWarning, a ? t.props.ref : t.props.ref || t.ref);
}
var Jt = [
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
], de = Jt.reduce((t, s) => {
  const a = /* @__PURE__ */ Gt(`Primitive.${s}`), r = R((i, n) => {
    const { asChild: o, ...l } = i, u = o ? a : s;
    return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ e.jsx(u, { ...l, ref: n });
  });
  return r.displayName = `Primitive.${s}`, { ...t, [s]: r };
}, {});
function Xt() {
  return mt.useSyncExternalStore(
    es,
    () => !0,
    () => !1
  );
}
function es() {
  return () => {
  };
}
var ue = "Avatar", [ts] = Ut(ue), [ss, Ae] = ts(ue), Re = R(
  (t, s) => {
    const { __scopeAvatar: a, ...r } = t, [i, n] = $("idle");
    return /* @__PURE__ */ e.jsx(
      ss,
      {
        scope: a,
        imageLoadingStatus: i,
        onImageLoadingStatusChange: n,
        children: /* @__PURE__ */ e.jsx(de.span, { ...r, ref: s })
      }
    );
  }
);
Re.displayName = ue;
var Fe = "AvatarImage", $e = R(
  (t, s) => {
    const { __scopeAvatar: a, src: r, onLoadingStatusChange: i = () => {
    }, ...n } = t, o = Ae(Fe, a), l = as(r, n), u = ut((m) => {
      i(m), o.onImageLoadingStatusChange(m);
    });
    return re(() => {
      l !== "idle" && u(l);
    }, [l, u]), l === "loaded" ? /* @__PURE__ */ e.jsx(de.img, { ...n, ref: s, src: r }) : null;
  }
);
$e.displayName = Fe;
var Ee = "AvatarFallback", Te = R(
  (t, s) => {
    const { __scopeAvatar: a, delayMs: r, ...i } = t, n = Ae(Ee, a), [o, l] = $(r === void 0);
    return D(() => {
      if (r !== void 0) {
        const u = window.setTimeout(() => l(!0), r);
        return () => window.clearTimeout(u);
      }
    }, [r]), o && n.imageLoadingStatus !== "loaded" ? /* @__PURE__ */ e.jsx(de.span, { ...i, ref: s }) : null;
  }
);
Te.displayName = Ee;
function ke(t, s) {
  return t ? s ? (t.src !== s && (t.src = s), t.complete && t.naturalWidth > 0 ? "loaded" : "loading") : "error" : "idle";
}
function as(t, { referrerPolicy: s, crossOrigin: a }) {
  const r = Xt(), i = ae(null), n = r ? (i.current || (i.current = new window.Image()), i.current) : null, [o, l] = $(
    () => ke(n, t)
  );
  return re(() => {
    l(ke(n, t));
  }, [n, t]), re(() => {
    const u = (x) => () => {
      l(x);
    };
    if (!n) return;
    const m = u("loaded"), c = u("error");
    return n.addEventListener("load", m), n.addEventListener("error", c), s && (n.referrerPolicy = s), typeof a == "string" && (n.crossOrigin = a), () => {
      n.removeEventListener("load", m), n.removeEventListener("error", c);
    };
  }, [n, a, s]), o;
}
var Ie = Re, ze = $e, Me = Te;
const Be = R(({ className: t, ...s }, a) => /* @__PURE__ */ e.jsx(
  Ie,
  {
    ref: a,
    className: E(
      "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full",
      t
    ),
    ...s
  }
));
Be.displayName = Ie.displayName;
const rs = R(({ className: t, ...s }, a) => /* @__PURE__ */ e.jsx(
  ze,
  {
    ref: a,
    className: E("aspect-square h-full w-full", t),
    ...s
  }
));
rs.displayName = ze.displayName;
const De = R(({ className: t, ...s }, a) => /* @__PURE__ */ e.jsx(
  Me,
  {
    ref: a,
    className: E(
      "flex h-full w-full items-center justify-center rounded-full bg-muted [&_svg]:size-4",
      t
    ),
    ...s
  }
));
De.displayName = Me.displayName;
const Ve = R(
  ({ className: t, type: s, ...a }, r) => /* @__PURE__ */ e.jsx(
    "input",
    {
      ref: r,
      className: E(
        "flex h-9 w-full rounded-md border border-transparent bg-gray-150 dark:bg-gray-900 px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:bg-transparent focus-visible:border-green focus-visible:shadow-[0_0_0_2px_rgba(48,207,67,.25)] disabled:cursor-not-allowed disabled:opacity-50",
        t
      ),
      type: s,
      ...a
    }
  )
);
Ve.displayName = "Input";
const me = U.forwardRef(({ className: t, children: s, ...a }, r) => /* @__PURE__ */ e.jsx("div", { ref: r, className: E("flex items-center justify-between gap-4 pb-6 text-sm", t), ...a, children: s }));
me.displayName = "SimplePagination";
const ns = U.forwardRef(({ className: t, currentPage: s, totalPages: a, ...r }, i) => /* @__PURE__ */ e.jsxs("span", { ref: i, className: E("text-muted-foreground", t), ...r, children: [
  "Pages ",
  s,
  " of ",
  a
] }));
ns.displayName = "SimplePaginationPages";
const pe = U.forwardRef(({ className: t, children: s, ...a }, r) => /* @__PURE__ */ e.jsx("div", { ref: r, className: E("flex items-center gap-1.5", t), ...a, children: s }));
pe.displayName = "SimplePaginationNavigation";
const ge = U.forwardRef(
  ({ variant: t = "outline", ...s }, a) => /* @__PURE__ */ e.jsx(V, { ref: a, size: "sm", variant: t, ...s, children: /* @__PURE__ */ e.jsx(bt, {}) })
);
ge.displayName = "SimplePaginationPreviousButton";
const xe = U.forwardRef(
  ({ variant: t = "outline", ...s }, a) => /* @__PURE__ */ e.jsx(V, { ref: a, size: "sm", variant: t, ...s, children: /* @__PURE__ */ e.jsx(jt, {}) })
);
xe.displayName = "SimplePaginationNextButton";
function Ue({
  data: t,
  itemsPerPage: s,
  initialPage: a = 1
}) {
  const [r, i] = $(a);
  if (s <= 0)
    throw new Error("itemsPerPage must be a positive number");
  const n = (g) => {
    const k = Math.max(1, Math.min(o, g));
    i(k);
  }, o = j(() => t ? Math.ceil(t.length / s) : 1, [t, s]);
  D(() => {
    r > o && i(1);
  }, [r, o]);
  const l = j(() => {
    if (!t)
      return null;
    const g = (r - 1) * s;
    return t.slice(g, g + s);
  }, [t, r, s]), u = () => {
    i((g) => Math.min(o, g + 1));
  }, m = () => {
    i((g) => Math.max(1, g - 1));
  }, c = r < o, x = r > 1;
  return {
    currentPage: r,
    setCurrentPage: n,
    totalPages: o,
    paginatedData: l,
    nextPage: u,
    previousPage: m,
    hasNextPage: c,
    hasPreviousPage: x
  };
}
const is = "FeedbackResponseType", os = pt({
  dataType: is,
  path: (t) => `/feedback/${t}/`
}), ls = (t, s) => {
  const { data: a, isLoading: r, error: i } = os(t, {
    searchParams: {
      limit: "50",
      // Get more data for pagination
      ...s !== void 0 ? { score: s.toString() } : {}
    }
  });
  return {
    feedback: j(() => a != null && a.feedback ? a.feedback : [], [a]),
    isLoading: r,
    error: i
  };
}, cs = ({ feedbackStats: t }) => {
  const { postId: s } = nt(), a = Ce(), [r, i] = $("positive"), n = 9, o = r === "positive" ? 1 : 0, { feedback: l, isLoading: u } = ls(s || "", o), {
    totalPages: m,
    paginatedData: c,
    nextPage: x,
    previousPage: g,
    hasNextPage: k,
    hasPreviousPage: p
  } = Ue({
    data: l,
    itemsPerPage: n
  }), f = u;
  return /* @__PURE__ */ e.jsxs(ne, { children: [
    /* @__PURE__ */ e.jsxs(ie, { className: "pb-5", children: [
      /* @__PURE__ */ e.jsx(oe, { children: "Feedback" }),
      /* @__PURE__ */ e.jsx(le, { children: "What did your readers think?" })
    ] }),
    t.totalFeedback > 0 ? /* @__PURE__ */ e.jsxs(T, { className: "pb-3", children: [
      /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
        /* @__PURE__ */ e.jsx(kt, { className: "pb-3", defaultValue: "positive", value: r, variant: "button", onValueChange: (b) => i(b), children: /* @__PURE__ */ e.jsxs(Nt, { className: "gap-1", children: [
          /* @__PURE__ */ e.jsx(be, { className: "h-7", value: "positive", children: /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1 text-xs", children: [
            /* @__PURE__ */ e.jsx(wt, { size: 14, strokeWidth: 1.25 }),
            /* @__PURE__ */ e.jsx("span", { className: "sm:visible! sm:inline! hidden font-medium", children: "More like this" }),
            /* @__PURE__ */ e.jsx("span", { className: "font-semibold tracking-tight", children: A(t.positiveFeedback / t.totalFeedback) })
          ] }) }),
          /* @__PURE__ */ e.jsx(be, { className: "h-7", value: "negative", children: /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1 text-xs", children: [
            /* @__PURE__ */ e.jsx(yt, { size: 14, strokeWidth: 1.25 }),
            /* @__PURE__ */ e.jsx("span", { className: "sm:visible! sm:inline! hidden font-medium", children: "Less like this" }),
            /* @__PURE__ */ e.jsx("span", { className: "font-semibold tracking-tight", children: A(t.negativeFeedback / t.totalFeedback) })
          ] }) })
        ] }) }),
        /* @__PURE__ */ e.jsx(Le, { className: "xl:visible! xl:block! mb-3 mr-2 lg:hidden", children: "Date" })
      ] }),
      /* @__PURE__ */ e.jsx(ce, {}),
      f ? /* @__PURE__ */ e.jsx(Se, { className: "mt-3", lines: 3 }) : c && c.length > 0 ? /* @__PURE__ */ e.jsx("div", { className: "flex w-full flex-col py-3", children: c.map((b) => {
        var h, L;
        return /* @__PURE__ */ e.jsxs("div", { className: "flex h-10 w-full items-center justify-between gap-3 rounded-sm border-none px-2 text-sm hover:cursor-pointer hover:bg-accent", onClick: () => {
          a(`/members/${b.member.id}`, { crossApp: !0 });
        }, children: [
          /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 font-medium", children: [
            /* @__PURE__ */ e.jsxs(Be, { className: "size-7", children: [
              ((h = b.member) == null ? void 0 : h.avatar_image) && /* @__PURE__ */ e.jsx("img", { className: "absolute aspect-square size-full", src: (L = b.member) == null ? void 0 : L.avatar_image }),
              /* @__PURE__ */ e.jsx(De, { className: "text-white", style: {
                backgroundColor: `${ot(ve(b.member), 75, 55)}`
              }, children: it(b.member) })
            ] }),
            ve(b.member)
          ] }),
          /* @__PURE__ */ e.jsx("div", { className: "whitespace-nowrap text-muted-foreground", children: lt(b.created_at) })
        ] }, b.id);
      }) }) : /* @__PURE__ */ e.jsx("div", { className: "flex h-full items-center justify-center py-8 text-center text-sm text-muted-foreground", children: /* @__PURE__ */ e.jsxs("div", { children: [
        "No ",
        r === "positive" ? "positive" : "negative",
        " feedback yet"
      ] }) })
    ] }) : /* @__PURE__ */ e.jsxs(T, { className: "flex grow flex-col items-center justify-center text-center text-sm text-muted-foreground", children: [
      /* @__PURE__ */ e.jsx("div", { children: "No members have given feedback yet" }),
      /* @__PURE__ */ e.jsx("div", { children: "When someone does, you'll see their response here." })
    ] }),
    t.totalFeedback > 0 && /* @__PURE__ */ e.jsx(Pe, { className: "grow-0", children: /* @__PURE__ */ e.jsxs("div", { className: "flex w-full items-center justify-between gap-3", children: [
      /* @__PURE__ */ e.jsxs(V, { variant: "outline", onClick: () => {
        const b = `(feedback.post_id:'${s}'+feedback.score:1)`, h = `(feedback.post_id:'${s}'+feedback.score:0)`, L = `${encodeURIComponent(b)}&post=${s}`, P = `${encodeURIComponent(h)}&post=${s}`;
        a(`/members?filter=${r === "positive" ? L : P}`, { crossApp: !0 });
      }, children: [
        "View all",
        /* @__PURE__ */ e.jsx(gt, {})
      ] }),
      m > 1 && /* @__PURE__ */ e.jsx(me, { className: "pb-0", children: /* @__PURE__ */ e.jsxs(pe, { children: [
        /* @__PURE__ */ e.jsx(
          ge,
          {
            disabled: !p,
            onClick: g
          }
        ),
        /* @__PURE__ */ e.jsx(
          xe,
          {
            disabled: !k,
            onClick: x
          }
        )
      ] }) })
    ] }) })
  ] });
}, ds = () => {
  const { mutateAsync: t, isLoading: s } = zt();
  return {
    editLinks: t,
    isEditLinksLoading: s
  };
}, us = (t) => {
  const { data: s, isLoading: a } = je(t), { data: r, isLoading: i } = je(t, {
    searchParams: {
      include: "count.positive_feedback,count.negative_feedback"
    }
  }), n = j(() => s == null ? void 0 : s.posts[0], [s]), o = j(() => r == null ? void 0 : r.posts[0], [r]), l = j(() => {
    var v, C, y, _, w, S;
    return n ? {
      sent: ((v = n.email) == null ? void 0 : v.email_count) || 0,
      opened: ((C = n.email) == null ? void 0 : C.opened_count) || 0,
      clicked: ((y = n.count) == null ? void 0 : y.clicks) || 0,
      openedRate: (_ = n.email) != null && _.opened_count ? n.email.opened_count / n.email.email_count : 0,
      clickedRate: (w = n.count) != null && w.clicks && ((S = n.email) != null && S.email_count) ? n.count.clicks / n.email.email_count : 0
    } : {
      sent: 0,
      opened: 0,
      clicked: 0,
      openedRate: 0,
      clickedRate: 0
    };
  }, [n]), u = j(() => {
    if (!(o != null && o.count))
      return {
        positiveFeedback: 0,
        negativeFeedback: 0,
        totalFeedback: 0
      };
    const v = o.count.positive_feedback || 0, C = o.count.negative_feedback || 0, y = v + C;
    return {
      positiveFeedback: v,
      negativeFeedback: C,
      totalFeedback: y
    };
  }, [o]), m = j(() => {
    var v;
    return (v = n == null ? void 0 : n.newsletter) == null ? void 0 : v.id;
  }, [n]), { data: c, isLoading: x } = Et({
    searchParams: m ? { newsletter_id: m } : {},
    enabled: !!m
  }), g = j(() => c != null && c.stats ? c.stats.map((v) => v.post_id) : [], [c]), { data: k, isLoading: p } = Tt({
    searchParams: m && g.length > 0 ? {
      newsletter_id: m,
      post_ids: g.join(",")
    } : {},
    enabled: !!m && g.length > 0
  }), f = j(() => {
    if (!(c != null && c.stats))
      return;
    const v = c.stats, C = (k == null ? void 0 : k.stats) || [], y = /* @__PURE__ */ new Map();
    C.forEach((w) => {
      y.set(w.post_id, w);
    });
    const _ = v.map((w) => {
      const S = y.get(w.post_id);
      return {
        ...w,
        total_clicks: (S == null ? void 0 : S.total_clicks) || 0,
        click_rate: (S == null ? void 0 : S.click_rate) || 0
      };
    });
    return {
      ...c,
      stats: _
    };
  }, [c, k]), b = x || p, { data: h, isLoading: L, refetch: P } = Mt({
    searchParams: {
      filter: `post_id:'${t}'`
    }
  }), I = j(() => {
    if (!f || !f.stats)
      return {
        openRate: 0,
        clickRate: 0
      };
    const v = f.stats;
    if (v.length === 0)
      return {
        openRate: 0,
        clickRate: 0
      };
    const C = v.reduce((_, w) => _ + (w.open_rate || 0), 0), y = v.reduce((_, w) => _ + (w.click_rate || 0), 0);
    return {
      openRate: Number((C / v.length).toFixed(2)),
      clickRate: Number((y / v.length).toFixed(2))
    };
  }, [f]), G = j(() => Bt(h), [h]), K = j(() => ({
    openedRate: I.openRate,
    clickedRate: I.clickRate
  }), [I]);
  return {
    post: n,
    stats: l,
    feedbackStats: u,
    averageStats: K,
    topLinks: G,
    refetchTopLinks: P,
    isLoading: a || i || b || L
  };
}, ms = ({
  breakpoints: t = {
    sm: 1080,
    md: 1280,
    lg: 1360
  }
} = {}) => {
  const [s, a] = $("md");
  return D(() => {
    const r = () => {
      const i = window.innerWidth;
      i < t.sm ? a("sm") : i < t.md ? a("md") : a("lg");
    };
    return r(), window.addEventListener("resize", r), () => window.removeEventListener("resize", r);
  }, [t]), {
    chartSize: s,
    isSmall: s === "sm",
    isMedium: s === "md",
    isLarge: s === "lg"
  };
}, Ne = () => /* @__PURE__ */ e.jsx("div", { className: "md:visible! md:flex! absolute -right-4 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border   bg-background text-muted-foreground", children: /* @__PURE__ */ e.jsx(Vt, { className: "ml-0.5", size: 16, strokeWidth: 1.5 }) }), we = ({
  dataColor: t,
  value: s,
  avgValue: a
}) => /* @__PURE__ */ e.jsxs("div", { className: "absolute left-1/2 top-6 z-50 flex w-[200px] -translate-x-1/2 flex-col items-stretch gap-1.5 rounded-md bg-background px-4 py-2 text-sm opacity-0 shadow-md transition-all group-hover/block:top-3 group-hover/block:opacity-100", children: [
  /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
      /* @__PURE__ */ e.jsx(
        "div",
        {
          className: "size-2 rounded-full bg-chart-blue opacity-50",
          style: {
            backgroundColor: t
          }
        }
      ),
      "This newsletter"
    ] }),
    /* @__PURE__ */ e.jsx("div", { className: "text-right font-mono", children: s })
  ] }),
  /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
      /* @__PURE__ */ e.jsx("div", { className: "size-2 rounded-full bg-chart-gray opacity-80" }),
      "Average"
    ] }),
    /* @__PURE__ */ e.jsx("div", { className: "text-right font-mono", children: a })
  ] })
] }), Ls = () => {
  const t = Ce(), [s, a] = $(null), [r, i] = $(""), n = ae(null), o = ae(null), l = 10, { chartSize: u } = ms(), { appSettings: m } = ct(), { emailTrackClicks: c, emailTrackOpens: x } = (m == null ? void 0 : m.analytics) || {}, { post: g, isPostLoading: k, postId: p } = Dt(), f = g, b = xt(f);
  D(() => {
    !k && !b && t(`/posts/analytics/${p}`);
  }, [t, p, k, b]);
  const { stats: h, averageStats: L, topLinks: P, isLoading: I, refetchTopLinks: G } = us(p), { editLinks: K } = ds(), v = j(() => {
    if (!(f != null && f.count))
      return {
        positiveFeedback: 0,
        negativeFeedback: 0,
        totalFeedback: 0
      };
    const d = f.count.positive_feedback || 0, N = f.count.negative_feedback || 0, F = d + N;
    return {
      positiveFeedback: d,
      negativeFeedback: N,
      totalFeedback: F
    };
  }, [f]), C = j(() => {
    var d;
    return ((d = f == null ? void 0 : f.newsletter) == null ? void 0 : d.feedback_enabled) === !0;
  }, [f]), y = j(() => v.totalFeedback > 0 ? !0 : C, [v.totalFeedback, C]), _ = (d) => {
    const N = te(P, d);
    N && (a(d), i(N.link.to));
  }, w = () => {
    if (!s)
      return;
    const d = te(P, s);
    if (!d)
      return;
    const N = r.trim();
    if (N === "" || N === d.link.to) {
      a(null), i("");
      return;
    }
    K({
      originalUrl: d.link.originalTo,
      editedUrl: r,
      postId: p
    }, {
      onSuccess: () => {
        a(null), i(""), G();
      }
    });
  }, {
    totalPages: S,
    paginatedData: q,
    nextPage: Oe,
    previousPage: We,
    hasNextPage: He,
    hasPreviousPage: Ge
  } = Ue({
    data: P,
    itemsPerPage: l
  });
  D(() => {
    if (s && n.current) {
      n.current.focus();
      const d = te(P, s), N = (F) => {
        o.current && !o.current.contains(F.target) && r === (d == null ? void 0 : d.link.to) && (a(null), i(""));
      };
      return document.addEventListener("mousedown", N), () => {
        document.removeEventListener("mousedown", N);
      };
    }
  }, [s, r, P]);
  const Y = I || k, Ke = [
    { datatype: "Sent", value: 1, fill: "url(#gradientPurple)", color: "var(--chart-purple)" }
  ], qe = {
    percentage: {
      label: "O"
    },
    Average: {
      label: "Average"
    },
    "This newsletter": {
      label: "This newsletter"
    }
  }, Ye = [
    { datatype: "Average", value: L.openedRate, fill: "url(#gradientGray)", color: "var(--chart-gray)" },
    { datatype: "This newsletter", value: h.openedRate, fill: "url(#gradientBlue)", color: "var(--chart-blue)" }
  ], Qe = {
    percentage: {
      label: "Opened"
    },
    Average: {
      label: "Average"
    },
    "This newsletter": {
      label: "This newsletter"
    }
  }, Ze = [
    { datatype: "Average", value: L.clickedRate, fill: "url(#gradientGray)", color: "var(--chart-gray)" },
    { datatype: "This newsletter", value: h.clickedRate, fill: "url(#gradientTeal)", color: "var(--chart-teal)" }
  ], Je = {
    percentage: {
      label: "Clicked"
    },
    Average: {
      label: "Average"
    },
    "This newsletter": {
      label: "This newsletter"
    }
  };
  let z = "grid-cols-3", M = "aspect-[16/10] w-full max-w-[320px] sm:aspect-[2/1] md:aspect-[10/14] md:max-w-none lg:aspect-square";
  return (!c || !x) && (z = "grid-cols-2", M = "aspect-[16/10] w-full max-w-[320px] sm:aspect-[2/1] md:aspect-square md:max-w-none lg:aspect-[15/10]"), !c && !x && (z = "grid-cols-1", M = "aspect-square w-full sm:aspect-[16/10] md:max-w-[320px] md:max-h-[320px] lg:aspect-[12/10]"), /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    /* @__PURE__ */ e.jsx(ft, { currentTab: "Newsletter" }),
    /* @__PURE__ */ e.jsx(ht, { children: /* @__PURE__ */ e.jsxs("div", { className: `grid grid-cols-1 gap-6 ${y && c && "lg:grid-cols-2"}`, children: [
      /* @__PURE__ */ e.jsxs(ne, { className: y && c ? "lg:col-span-2" : "", children: [
        /* @__PURE__ */ e.jsxs(ie, { className: "hidden", children: [
          /* @__PURE__ */ e.jsx(oe, { children: "Newsletters" }),
          /* @__PURE__ */ e.jsx(le, { children: "How did this post perform" })
        ] }),
        Y ? /* @__PURE__ */ e.jsx(T, { className: "h-[25vw] p-6", children: /* @__PURE__ */ e.jsx(It, {}) }) : /* @__PURE__ */ e.jsxs(T, { className: "p-0", children: [
          /* @__PURE__ */ e.jsxs("div", { className: `grid ${z} items-stretch border-b`, children: [
            /* @__PURE__ */ e.jsxs(Q, { className: "group relative isolate grow p-3 md:px-6 md:py-5", children: [
              /* @__PURE__ */ e.jsx(Z, { onClick: () => {
                const d = new URLSearchParams({
                  filterParam: `emails.post_id:${p}`,
                  postAnalytics: p
                });
                t(`/members?${d.toString()}`, { crossApp: !0 });
              }, children: "View members →" }),
              /* @__PURE__ */ e.jsxs(J, { onClick: () => {
                const d = new URLSearchParams({
                  filterParam: `emails.post_id:${p}`,
                  postAnalytics: p
                });
                t(`/members?${d.toString()}`, { crossApp: !0 });
              }, children: [
                /* @__PURE__ */ e.jsx("div", { className: "ml-0.5 size-[9px] rounded-full bg-chart-purple opacity-50" }),
                "Sent"
              ] }),
              /* @__PURE__ */ e.jsx(X, { children: /* @__PURE__ */ e.jsx(ee, { className: "text-xl leading-none sm:text-2xl md:text-[2.6rem]", children: O(h.sent) }) })
            ] }),
            x && /* @__PURE__ */ e.jsxs(Q, { className: "p-3 md:px-6 md:py-5", children: [
              /* @__PURE__ */ e.jsx(Z, { onClick: () => {
                const d = new URLSearchParams({
                  filterParam: `opened_emails.post_id:${p}`,
                  postAnalytics: p
                });
                t(`/members?${d.toString()}`, { crossApp: !0 });
              }, children: "View members →" }),
              /* @__PURE__ */ e.jsxs(J, { onClick: () => {
                const d = new URLSearchParams({
                  filterParam: `opened_emails.post_id:${p}`,
                  postAnalytics: p
                });
                t(`/members?${d.toString()}`, { crossApp: !0 });
              }, children: [
                /* @__PURE__ */ e.jsx("div", { className: "ml-0.5 size-[9px] rounded-full bg-chart-blue opacity-50" }),
                "Opened"
              ] }),
              /* @__PURE__ */ e.jsx(X, { children: /* @__PURE__ */ e.jsx(ee, { className: "text-xl leading-none sm:text-2xl md:text-[2.6rem]", children: O(h.opened) }) })
            ] }),
            c && /* @__PURE__ */ e.jsxs(Q, { className: "group relative isolate grow p-3 md:px-6 md:py-5", children: [
              /* @__PURE__ */ e.jsx(Z, { onClick: () => {
                const d = new URLSearchParams({
                  filterParam: `clicked_links.post_id:${p}`,
                  postAnalytics: p
                });
                t(`/members?${d.toString()}`, { crossApp: !0 });
              }, children: "View members →" }),
              /* @__PURE__ */ e.jsxs(J, { onClick: () => {
                const d = new URLSearchParams({
                  filterParam: `clicked_links.post_id:${p}`,
                  postAnalytics: p
                });
                t(`/members?${d.toString()}`, { crossApp: !0 });
              }, children: [
                /* @__PURE__ */ e.jsx("div", { className: "ml-0.5 size-[9px] rounded-full bg-chart-teal opacity-50" }),
                "Clicked"
              ] }),
              /* @__PURE__ */ e.jsx(X, { children: /* @__PURE__ */ e.jsx(ee, { className: "text-xl leading-none sm:text-2xl md:text-[2.6rem]", children: O(h.clicked) }) })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("div", { className: `$ mx-auto grid grid-cols-1 items-center justify-center gap-4 transition-all md:gap-0 ${z === "grid-cols-2" && "md:grid-cols-2"} ${z === "grid-cols-3" && "md:grid-cols-3"}`, children: [
            /* @__PURE__ */ e.jsxs("div", { className: `relative border-r-0 px-6 ${(x || c) && "md:border-r"}`, children: [
              /* @__PURE__ */ e.jsx(
                se,
                {
                  className: M,
                  config: qe,
                  data: Ke,
                  percentageLabel: "Sent",
                  percentageValue: A(1),
                  size: u,
                  tooltip: !1
                }
              ),
              (x || c) && /* @__PURE__ */ e.jsx(Ne, {})
            ] }),
            x && /* @__PURE__ */ e.jsxs("div", { className: `group/block hover:bg-muted/25 relative border-r-0 px-6 transition-all ${c && "md:border-r"}`, children: [
              /* @__PURE__ */ e.jsx(
                we,
                {
                  avgValue: A(L.openedRate),
                  dataColor: "var(--chart-blue)",
                  value: A(h.openedRate)
                }
              ),
              /* @__PURE__ */ e.jsx(
                se,
                {
                  className: M,
                  config: Qe,
                  data: Ye,
                  percentageLabel: "Open rate",
                  percentageValue: A(h.openedRate),
                  size: u,
                  tooltip: !1
                }
              ),
              c && /* @__PURE__ */ e.jsx(Ne, {})
            ] }),
            c && /* @__PURE__ */ e.jsxs("div", { className: "group/block hover:bg-muted/25 relative px-6 transition-all", children: [
              /* @__PURE__ */ e.jsx(
                we,
                {
                  avgValue: A(L.clickedRate),
                  dataColor: "var(--chart-teal)",
                  value: A(h.clickedRate)
                }
              ),
              /* @__PURE__ */ e.jsx(
                se,
                {
                  className: M,
                  config: Je,
                  data: Ze,
                  percentageLabel: "Click rate",
                  percentageValue: A(h.clickedRate),
                  size: u,
                  tooltip: !1
                }
              )
            ] })
          ] })
        ] })
      ] }),
      y && /* @__PURE__ */ e.jsx(cs, { feedbackStats: v }),
      c && /* @__PURE__ */ e.jsxs(ne, { className: "group/datalist overflow-hidden", children: [
        /* @__PURE__ */ e.jsxs("div", { className: "flex items-center justify-between p-6", children: [
          /* @__PURE__ */ e.jsxs(ie, { className: "p-0", children: [
            /* @__PURE__ */ e.jsx(oe, { children: "Newsletter clicks" }),
            /* @__PURE__ */ e.jsx(le, { children: "Which links resonated with your readers" })
          ] }),
          /* @__PURE__ */ e.jsx(Le, { className: "mr-2", children: "Members" })
        ] }),
        Y ? /* @__PURE__ */ e.jsxs(T, { className: "p-6 pt-0", children: [
          /* @__PURE__ */ e.jsx(ce, {}),
          /* @__PURE__ */ e.jsx(Se, { className: "mt-6" })
        ] }) : /* @__PURE__ */ e.jsxs(T, { className: "pb-0", children: [
          /* @__PURE__ */ e.jsx(ce, {}),
          P.length > 0 ? /* @__PURE__ */ e.jsx(Ct, { className: "", children: /* @__PURE__ */ e.jsx(Lt, { children: q == null ? void 0 : q.map((d) => {
            const N = h.clicked > 0 ? d.count / h.clicked : 0, F = d.link.link_id, fe = d.link.title, Xe = d.link.to, et = d.link.edited;
            return /* @__PURE__ */ e.jsxs(Pt, { children: [
              s !== F && /* @__PURE__ */ e.jsx(St, { style: {
                width: `${N ? Math.round(N * 100) : 0}%`
              } }),
              /* @__PURE__ */ e.jsx(_t, { className: "w-full", children: s === F ? /* @__PURE__ */ e.jsxs("div", { ref: o, className: "flex w-full items-center gap-2", children: [
                /* @__PURE__ */ e.jsx(
                  Ve,
                  {
                    ref: n,
                    className: "z-50 h-7 w-full border-border bg-background text-sm",
                    value: r,
                    onChange: (tt) => i(tt.target.value)
                  }
                ),
                /* @__PURE__ */ e.jsx(
                  V,
                  {
                    size: "sm",
                    onClick: w,
                    children: "Update"
                  }
                )
              ] }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
                /* @__PURE__ */ e.jsx(
                  V,
                  {
                    className: "mr-2 shrink-0 bg-background",
                    size: "sm",
                    variant: "outline",
                    onClick: () => _(F),
                    children: /* @__PURE__ */ e.jsx(vt, {})
                  }
                ),
                /* @__PURE__ */ e.jsx(
                  "a",
                  {
                    className: "block truncate font-medium hover:underline",
                    href: Xe,
                    rel: "noreferrer",
                    target: "_blank",
                    title: fe,
                    children: fe
                  }
                ),
                et && /* @__PURE__ */ e.jsx("span", { className: "ml-1 text-gray-500", children: "(edited)" })
              ] }) }),
              /* @__PURE__ */ e.jsxs(At, { children: [
                /* @__PURE__ */ e.jsx(Rt, { children: O(d.count || 0) }),
                /* @__PURE__ */ e.jsx(Ft, { children: A(N) })
              ] })
            ] }, F);
          }) }) }) : /* @__PURE__ */ e.jsx("div", { className: "py-20 text-center text-sm text-gray-700", children: "You have no links in your post." })
        ] }),
        !Y && P.length > 1 && /* @__PURE__ */ e.jsx(Pe, { children: /* @__PURE__ */ e.jsxs("div", { className: "flex w-full items-start justify-between gap-3", children: [
          /* @__PURE__ */ e.jsxs("div", { className: "mt-2 flex items-start gap-2 pl-4 text-sm text-green", children: [
            /* @__PURE__ */ e.jsx($t, { size: 20, strokeWidth: 1.5 }),
            "Sent a broken link? You can update it!"
          ] }),
          S > 1 && /* @__PURE__ */ e.jsx(me, { className: "pb-0", children: /* @__PURE__ */ e.jsxs(pe, { children: [
            /* @__PURE__ */ e.jsx(
              ge,
              {
                disabled: !Ge,
                onClick: We
              }
            ),
            /* @__PURE__ */ e.jsx(
              xe,
              {
                disabled: !He,
                onClick: Oe
              }
            )
          ] }) })
        ] }) })
      ] })
    ] }) })
  ] });
};
export {
  Ls as default
};
//# sourceMappingURL=newsletter-D6uAde3F.mjs.map

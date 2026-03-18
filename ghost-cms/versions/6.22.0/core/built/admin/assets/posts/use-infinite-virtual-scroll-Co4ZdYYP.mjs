import { j as v, n as b, V as R, a4 as T, u as F, W as j, b as _, a3 as W } from "./index-DHZtUctP.mjs";
import { l as D } from "./heading-BU5ZMUV_.mjs";
function H({ className: n, children: l }) {
  return /* @__PURE__ */ v.jsx(
    "div",
    {
      className: b("flex items-center gap-2 [grid-area:above]", n),
      "data-header": "header-above",
      children: l
    }
  );
}
function N({ className: n, children: l }) {
  return /* @__PURE__ */ v.jsx(
    D,
    {
      className: b(
        "text-2xl leading-[1.2em] lg:text-3xl [grid-area:title]",
        n
      ),
      "data-header": "header-title",
      children: l
    }
  );
}
function V({ className: n, children: l }) {
  return /* @__PURE__ */ v.jsx(
    "div",
    {
      className: b("flex items-center justify-start text-muted-foreground [grid-area:meta] pb-4 pt-1", n),
      "data-header": "header-meta",
      children: l
    }
  );
}
function L({ className: n, children: l }) {
  return /* @__PURE__ */ v.jsx(
    "div",
    {
      className: b("flex items-center gap-2", n),
      "data-header": "header-action-group",
      children: l
    }
  );
}
function B({ className: n, children: l }) {
  return /* @__PURE__ */ v.jsx(
    "div",
    {
      className: b("flex items-center gap-4 [grid-area:actions] sm:justify-self-end self-start", n),
      "data-header": "header-actions",
      children: l
    }
  );
}
function P({ className: n, children: l }) {
  return /* @__PURE__ */ v.jsx(
    "div",
    {
      className: b("flex items-center gap-2 [grid-area:nav] self-start mt-2 lg:mt-0.5", n),
      "data-header": "header-nav",
      children: l
    }
  );
}
const $ = R("via-background/70 to-background/70 sticky top-0 z-50 -mb-4 grid gap-x-4 bg-gradient-to-b from-background p-4 backdrop-blur-md [grid-template-areas:'above''title''meta''actions''nav'] sm:[grid-template-areas:'above_above''title_actions''meta_actions''nav_nav'] lg:-mb-8 lg:p-8 dark:bg-black", {
  variants: {
    variant: {
      default: "lg:[grid-template-areas:'above_above''title_actions''meta_actions''nav_nav']",
      "inline-nav": "lg:[grid-template-areas:'above_above_above''title_nav_actions''meta_nav_actions'] lg:[grid-template-columns:1fr_auto_auto]"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});
function w({ className: n, children: l, variant: e }) {
  return /* @__PURE__ */ v.jsx(
    "header",
    {
      className: b($({ variant: e, className: n })),
      "data-header": "header",
      children: l
    }
  );
}
w.Above = H;
w.Title = N;
w.Actions = B;
w.ActionGroup = L;
w.Nav = P;
w.Meta = V;
function I(n) {
  const e = n instanceof HTMLElement && window.getComputedStyle(n).overflowY, t = e !== "visible" && e !== "hidden";
  if (n) {
    if (t && n.scrollHeight >= n.clientHeight)
      return n;
  } else return null;
  return I(n.parentNode) || document.body;
}
function S(n, l, e) {
  let t = e.initialDeps ?? [], s;
  function i() {
    var o, r, a, c;
    let h;
    e.key && ((o = e.debug) != null && o.call(e)) && (h = Date.now());
    const d = n();
    if (!(d.length !== t.length || d.some((f, g) => t[g] !== f)))
      return s;
    t = d;
    let m;
    if (e.key && ((r = e.debug) != null && r.call(e)) && (m = Date.now()), s = l(...d), e.key && ((a = e.debug) != null && a.call(e))) {
      const f = Math.round((Date.now() - h) * 100) / 100, g = Math.round((Date.now() - m) * 100) / 100, x = g / 16, p = (y, A) => {
        for (y = String(y); y.length < A; )
          y = " " + y;
        return y;
      };
      console.info(
        `%c⏱ ${p(g, 5)} /${p(f, 5)} ms`,
        `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(
          0,
          Math.min(120 - 120 * x, 120)
        )}deg 100% 31%);`,
        e == null ? void 0 : e.key
      );
    }
    return (c = e == null ? void 0 : e.onChange) == null || c.call(e, s), s;
  }
  return i.updateDeps = (o) => {
    t = o;
  }, i;
}
function M(n, l) {
  if (n === void 0)
    throw new Error("Unexpected undefined");
  return n;
}
const q = (n, l) => Math.abs(n - l) < 1.01, U = (n, l, e) => {
  let t;
  return function(...s) {
    n.clearTimeout(t), t = n.setTimeout(() => l.apply(this, s), e);
  };
}, E = (n) => {
  const { offsetWidth: l, offsetHeight: e } = n;
  return { width: l, height: e };
}, K = (n) => n, G = (n) => {
  const l = Math.max(n.startIndex - n.overscan, 0), e = Math.min(n.endIndex + n.overscan, n.count - 1), t = [];
  for (let s = l; s <= e; s++)
    t.push(s);
  return t;
}, Y = (n, l) => {
  const e = n.scrollElement;
  if (!e)
    return;
  const t = n.targetWindow;
  if (!t)
    return;
  const s = (o) => {
    const { width: r, height: a } = o;
    l({ width: Math.round(r), height: Math.round(a) });
  };
  if (s(E(e)), !t.ResizeObserver)
    return () => {
    };
  const i = new t.ResizeObserver((o) => {
    const r = () => {
      const a = o[0];
      if (a != null && a.borderBoxSize) {
        const c = a.borderBoxSize[0];
        if (c) {
          s({ width: c.inlineSize, height: c.blockSize });
          return;
        }
      }
      s(E(e));
    };
    n.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(r) : r();
  });
  return i.observe(e, { box: "border-box" }), () => {
    i.unobserve(e);
  };
}, z = {
  passive: !0
}, O = typeof window > "u" ? !0 : "onscrollend" in window, J = (n, l) => {
  const e = n.scrollElement;
  if (!e)
    return;
  const t = n.targetWindow;
  if (!t)
    return;
  let s = 0;
  const i = n.options.useScrollendEvent && O ? () => {
  } : U(
    t,
    () => {
      l(s, !1);
    },
    n.options.isScrollingResetDelay
  ), o = (h) => () => {
    const { horizontal: d, isRtl: u } = n.options;
    s = d ? e.scrollLeft * (u && -1 || 1) : e.scrollTop, i(), l(s, h);
  }, r = o(!0), a = o(!1);
  a(), e.addEventListener("scroll", r, z);
  const c = n.options.useScrollendEvent && O;
  return c && e.addEventListener("scrollend", a, z), () => {
    e.removeEventListener("scroll", r), c && e.removeEventListener("scrollend", a);
  };
}, Q = (n, l, e) => {
  if (l != null && l.borderBoxSize) {
    const t = l.borderBoxSize[0];
    if (t)
      return Math.round(
        t[e.options.horizontal ? "inlineSize" : "blockSize"]
      );
  }
  return n[e.options.horizontal ? "offsetWidth" : "offsetHeight"];
}, X = (n, {
  adjustments: l = 0,
  behavior: e
}, t) => {
  var s, i;
  const o = n + l;
  (i = (s = t.scrollElement) == null ? void 0 : s.scrollTo) == null || i.call(s, {
    [t.options.horizontal ? "left" : "top"]: o,
    behavior: e
  });
};
class Z {
  constructor(l) {
    this.unsubs = [], this.scrollElement = null, this.targetWindow = null, this.isScrolling = !1, this.measurementsCache = [], this.itemSizeCache = /* @__PURE__ */ new Map(), this.pendingMeasuredCacheIndexes = [], this.scrollRect = null, this.scrollOffset = null, this.scrollDirection = null, this.scrollAdjustments = 0, this.elementsCache = /* @__PURE__ */ new Map(), this.observer = /* @__PURE__ */ (() => {
      let e = null;
      const t = () => e || (!this.targetWindow || !this.targetWindow.ResizeObserver ? null : e = new this.targetWindow.ResizeObserver((s) => {
        s.forEach((i) => {
          const o = () => {
            this._measureElement(i.target, i);
          };
          this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(o) : o();
        });
      }));
      return {
        disconnect: () => {
          var s;
          (s = t()) == null || s.disconnect(), e = null;
        },
        observe: (s) => {
          var i;
          return (i = t()) == null ? void 0 : i.observe(s, { box: "border-box" });
        },
        unobserve: (s) => {
          var i;
          return (i = t()) == null ? void 0 : i.unobserve(s);
        }
      };
    })(), this.range = null, this.setOptions = (e) => {
      Object.entries(e).forEach(([t, s]) => {
        typeof s > "u" && delete e[t];
      }), this.options = {
        debug: !1,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: !1,
        getItemKey: K,
        rangeExtractor: G,
        onChange: () => {
        },
        measureElement: Q,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        isScrollingResetDelay: 150,
        enabled: !0,
        isRtl: !1,
        useScrollendEvent: !1,
        useAnimationFrameWithResizeObserver: !1,
        ...e
      };
    }, this.notify = (e) => {
      var t, s;
      (s = (t = this.options).onChange) == null || s.call(t, this, e);
    }, this.maybeNotify = S(
      () => (this.calculateRange(), [
        this.isScrolling,
        this.range ? this.range.startIndex : null,
        this.range ? this.range.endIndex : null
      ]),
      (e) => {
        this.notify(e);
      },
      {
        key: !1,
        debug: () => this.options.debug,
        initialDeps: [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ]
      }
    ), this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((e) => e()), this.unsubs = [], this.observer.disconnect(), this.scrollElement = null, this.targetWindow = null;
    }, this._didMount = () => () => {
      this.cleanup();
    }, this._willUpdate = () => {
      var e;
      const t = this.options.enabled ? this.options.getScrollElement() : null;
      if (this.scrollElement !== t) {
        if (this.cleanup(), !t) {
          this.maybeNotify();
          return;
        }
        this.scrollElement = t, this.scrollElement && "ownerDocument" in this.scrollElement ? this.targetWindow = this.scrollElement.ownerDocument.defaultView : this.targetWindow = ((e = this.scrollElement) == null ? void 0 : e.window) ?? null, this.elementsCache.forEach((s) => {
          this.observer.observe(s);
        }), this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        }), this.unsubs.push(
          this.options.observeElementRect(this, (s) => {
            this.scrollRect = s, this.maybeNotify();
          })
        ), this.unsubs.push(
          this.options.observeElementOffset(this, (s, i) => {
            this.scrollAdjustments = 0, this.scrollDirection = i ? this.getScrollOffset() < s ? "forward" : "backward" : null, this.scrollOffset = s, this.isScrolling = i, this.maybeNotify();
          })
        );
      }
    }, this.getSize = () => this.options.enabled ? (this.scrollRect = this.scrollRect ?? this.options.initialRect, this.scrollRect[this.options.horizontal ? "width" : "height"]) : (this.scrollRect = null, 0), this.getScrollOffset = () => this.options.enabled ? (this.scrollOffset = this.scrollOffset ?? (typeof this.options.initialOffset == "function" ? this.options.initialOffset() : this.options.initialOffset), this.scrollOffset) : (this.scrollOffset = null, 0), this.getFurthestMeasurement = (e, t) => {
      const s = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
      for (let o = t - 1; o >= 0; o--) {
        const r = e[o];
        if (s.has(r.lane))
          continue;
        const a = i.get(
          r.lane
        );
        if (a == null || r.end > a.end ? i.set(r.lane, r) : r.end < a.end && s.set(r.lane, !0), s.size === this.options.lanes)
          break;
      }
      return i.size === this.options.lanes ? Array.from(i.values()).sort((o, r) => o.end === r.end ? o.index - r.index : o.end - r.end)[0] : void 0;
    }, this.getMeasurementOptions = S(
      () => [
        this.options.count,
        this.options.paddingStart,
        this.options.scrollMargin,
        this.options.getItemKey,
        this.options.enabled
      ],
      (e, t, s, i, o) => (this.pendingMeasuredCacheIndexes = [], {
        count: e,
        paddingStart: t,
        scrollMargin: s,
        getItemKey: i,
        enabled: o
      }),
      {
        key: !1
      }
    ), this.getMeasurements = S(
      () => [this.getMeasurementOptions(), this.itemSizeCache],
      ({ count: e, paddingStart: t, scrollMargin: s, getItemKey: i, enabled: o }, r) => {
        if (!o)
          return this.measurementsCache = [], this.itemSizeCache.clear(), [];
        this.measurementsCache.length === 0 && (this.measurementsCache = this.options.initialMeasurementsCache, this.measurementsCache.forEach((h) => {
          this.itemSizeCache.set(h.key, h.size);
        }));
        const a = this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
        this.pendingMeasuredCacheIndexes = [];
        const c = this.measurementsCache.slice(0, a);
        for (let h = a; h < e; h++) {
          const d = i(h), u = this.options.lanes === 1 ? c[h - 1] : this.getFurthestMeasurement(c, h), m = u ? u.end + this.options.gap : t + s, f = r.get(d), g = typeof f == "number" ? f : this.options.estimateSize(h), x = m + g, p = u ? u.lane : h % this.options.lanes;
          c[h] = {
            index: h,
            start: m,
            size: g,
            end: x,
            key: d,
            lane: p
          };
        }
        return this.measurementsCache = c, c;
      },
      {
        key: !1,
        debug: () => this.options.debug
      }
    ), this.calculateRange = S(
      () => [
        this.getMeasurements(),
        this.getSize(),
        this.getScrollOffset(),
        this.options.lanes
      ],
      (e, t, s, i) => this.range = e.length > 0 && t > 0 ? ee({
        measurements: e,
        outerSize: t,
        scrollOffset: s,
        lanes: i
      }) : null,
      {
        key: !1,
        debug: () => this.options.debug
      }
    ), this.getVirtualIndexes = S(
      () => {
        let e = null, t = null;
        const s = this.calculateRange();
        return s && (e = s.startIndex, t = s.endIndex), this.maybeNotify.updateDeps([this.isScrolling, e, t]), [
          this.options.rangeExtractor,
          this.options.overscan,
          this.options.count,
          e,
          t
        ];
      },
      (e, t, s, i, o) => i === null || o === null ? [] : e({
        startIndex: i,
        endIndex: o,
        overscan: t,
        count: s
      }),
      {
        key: !1,
        debug: () => this.options.debug
      }
    ), this.indexFromElement = (e) => {
      const t = this.options.indexAttribute, s = e.getAttribute(t);
      return s ? parseInt(s, 10) : (console.warn(
        `Missing attribute name '${t}={index}' on measured element.`
      ), -1);
    }, this._measureElement = (e, t) => {
      const s = this.indexFromElement(e), i = this.measurementsCache[s];
      if (!i)
        return;
      const o = i.key, r = this.elementsCache.get(o);
      r !== e && (r && this.observer.unobserve(r), this.observer.observe(e), this.elementsCache.set(o, e)), e.isConnected && this.resizeItem(s, this.options.measureElement(e, t, this));
    }, this.resizeItem = (e, t) => {
      const s = this.measurementsCache[e];
      if (!s)
        return;
      const i = this.itemSizeCache.get(s.key) ?? s.size, o = t - i;
      o !== 0 && ((this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(s, o, this) : s.start < this.getScrollOffset() + this.scrollAdjustments) && this._scrollToOffset(this.getScrollOffset(), {
        adjustments: this.scrollAdjustments += o,
        behavior: void 0
      }), this.pendingMeasuredCacheIndexes.push(s.index), this.itemSizeCache = new Map(this.itemSizeCache.set(s.key, t)), this.notify(!1));
    }, this.measureElement = (e) => {
      if (!e) {
        this.elementsCache.forEach((t, s) => {
          t.isConnected || (this.observer.unobserve(t), this.elementsCache.delete(s));
        });
        return;
      }
      this._measureElement(e, void 0);
    }, this.getVirtualItems = S(
      () => [this.getVirtualIndexes(), this.getMeasurements()],
      (e, t) => {
        const s = [];
        for (let i = 0, o = e.length; i < o; i++) {
          const r = e[i], a = t[r];
          s.push(a);
        }
        return s;
      },
      {
        key: !1,
        debug: () => this.options.debug
      }
    ), this.getVirtualItemForOffset = (e) => {
      const t = this.getMeasurements();
      if (t.length !== 0)
        return M(
          t[k(
            0,
            t.length - 1,
            (s) => M(t[s]).start,
            e
          )]
        );
    }, this.getOffsetForAlignment = (e, t, s = 0) => {
      const i = this.getSize(), o = this.getScrollOffset();
      t === "auto" && (t = e >= o + i ? "end" : "start"), t === "center" ? e += (s - i) / 2 : t === "end" && (e -= i);
      const r = this.getTotalSize() + this.options.scrollMargin - i;
      return Math.max(Math.min(r, e), 0);
    }, this.getOffsetForIndex = (e, t = "auto") => {
      e = Math.max(0, Math.min(e, this.options.count - 1));
      const s = this.measurementsCache[e];
      if (!s)
        return;
      const i = this.getSize(), o = this.getScrollOffset();
      if (t === "auto")
        if (s.end >= o + i - this.options.scrollPaddingEnd)
          t = "end";
        else if (s.start <= o + this.options.scrollPaddingStart)
          t = "start";
        else
          return [o, t];
      const r = t === "end" ? s.end + this.options.scrollPaddingEnd : s.start - this.options.scrollPaddingStart;
      return [
        this.getOffsetForAlignment(r, t, s.size),
        t
      ];
    }, this.isDynamicMode = () => this.elementsCache.size > 0, this.scrollToOffset = (e, { align: t = "start", behavior: s } = {}) => {
      s === "smooth" && this.isDynamicMode() && console.warn(
        "The `smooth` scroll behavior is not fully supported with dynamic size."
      ), this._scrollToOffset(this.getOffsetForAlignment(e, t), {
        adjustments: void 0,
        behavior: s
      });
    }, this.scrollToIndex = (e, { align: t = "auto", behavior: s } = {}) => {
      s === "smooth" && this.isDynamicMode() && console.warn(
        "The `smooth` scroll behavior is not fully supported with dynamic size."
      ), e = Math.max(0, Math.min(e, this.options.count - 1));
      let i = 0;
      const o = 10, r = (c) => {
        if (!this.targetWindow) return;
        const h = this.getOffsetForIndex(e, c);
        if (!h) {
          console.warn("Failed to get offset for index:", e);
          return;
        }
        const [d, u] = h;
        this._scrollToOffset(d, { adjustments: void 0, behavior: s }), this.targetWindow.requestAnimationFrame(() => {
          const m = this.getScrollOffset(), f = this.getOffsetForIndex(e, u);
          if (!f) {
            console.warn("Failed to get offset for index:", e);
            return;
          }
          q(f[0], m) || a(u);
        });
      }, a = (c) => {
        this.targetWindow && (i++, i < o ? this.targetWindow.requestAnimationFrame(() => r(c)) : console.warn(
          `Failed to scroll to index ${e} after ${o} attempts.`
        ));
      };
      r(t);
    }, this.scrollBy = (e, { behavior: t } = {}) => {
      t === "smooth" && this.isDynamicMode() && console.warn(
        "The `smooth` scroll behavior is not fully supported with dynamic size."
      ), this._scrollToOffset(this.getScrollOffset() + e, {
        adjustments: void 0,
        behavior: t
      });
    }, this.getTotalSize = () => {
      var e;
      const t = this.getMeasurements();
      let s;
      if (t.length === 0)
        s = this.options.paddingStart;
      else if (this.options.lanes === 1)
        s = ((e = t[t.length - 1]) == null ? void 0 : e.end) ?? 0;
      else {
        const i = Array(this.options.lanes).fill(null);
        let o = t.length - 1;
        for (; o >= 0 && i.some((r) => r === null); ) {
          const r = t[o];
          i[r.lane] === null && (i[r.lane] = r.end), o--;
        }
        s = Math.max(...i.filter((r) => r !== null));
      }
      return Math.max(
        s - this.options.scrollMargin + this.options.paddingEnd,
        0
      );
    }, this._scrollToOffset = (e, {
      adjustments: t,
      behavior: s
    }) => {
      this.options.scrollToFn(e, { behavior: s, adjustments: t }, this);
    }, this.measure = () => {
      this.itemSizeCache = /* @__PURE__ */ new Map(), this.notify(!1);
    }, this.setOptions(l);
  }
}
const k = (n, l, e, t) => {
  for (; n <= l; ) {
    const s = (n + l) / 2 | 0, i = e(s);
    if (i < t)
      n = s + 1;
    else if (i > t)
      l = s - 1;
    else
      return s;
  }
  return n > 0 ? n - 1 : 0;
};
function ee({
  measurements: n,
  outerSize: l,
  scrollOffset: e,
  lanes: t
}) {
  const s = n.length - 1, i = (a) => n[a].start;
  if (n.length <= t)
    return {
      startIndex: 0,
      endIndex: s
    };
  let o = k(
    0,
    s,
    i,
    e
  ), r = o;
  if (t === 1)
    for (; r < s && n[r].end < e + l; )
      r++;
  else if (t > 1) {
    const a = Array(t).fill(0);
    for (; r < s && a.some((h) => h < e + l); ) {
      const h = n[r];
      a[h.lane] = h.end, r++;
    }
    const c = Array(t).fill(e + l);
    for (; o >= 0 && c.some((h) => h >= e); ) {
      const h = n[o];
      c[h.lane] = h.start, o--;
    }
    o = Math.max(0, o - o % t), r = Math.min(s, r + (t - 1 - r % t));
  }
  return { startIndex: o, endIndex: r };
}
const C = typeof document < "u" ? j : _;
function te(n) {
  const l = T(() => ({}), {})[1], e = {
    ...n,
    onChange: (s, i) => {
      var o;
      i ? W(l) : l(), (o = n.onChange) == null || o.call(n, s, i);
    }
  }, [t] = F(
    () => new Z(e)
  );
  return t.setOptions(e), C(() => t._didMount(), []), C(() => t._willUpdate()), t;
}
function se(n) {
  return te({
    observeElementRect: Y,
    observeElementOffset: J,
    scrollToFn: X,
    ...n
  });
}
function oe({
  items: n,
  totalItems: l,
  parentRef: e,
  hasNextPage: t,
  isFetchingNextPage: s,
  fetchNextPage: i,
  estimateSize: o = () => 100,
  overscan: r = 5
}) {
  var f, g, x;
  const a = se({
    count: l,
    getScrollElement: () => I(e.current),
    estimateSize: o,
    overscan: r
  }), c = a.getVirtualItems(), h = c.length > 0 ? (((f = c.at(0)) == null ? void 0 : f.start) ?? 0) - a.options.scrollMargin : 0, d = c.length > 0 ? a.getTotalSize() - (((g = c.at(-1)) == null ? void 0 : g.end) ?? 0) : 0, u = c.map((p) => ({
    virtualItem: p,
    key: p.key,
    item: n[p.index],
    props: {
      ref: a.measureElement,
      "data-index": p.index
    }
  })), m = u.at(-1) && !((x = u.at(-1)) != null && x.item);
  return _(() => {
    t && m && !s && i();
  }, [t, m, s, i]), {
    visibleItems: u,
    virtualizer: a,
    spaceBefore: h,
    spaceAfter: d
  };
}
export {
  w as H,
  I as g,
  oe as u
};
//# sourceMappingURL=use-infinite-virtual-scroll-Co4ZdYYP.mjs.map

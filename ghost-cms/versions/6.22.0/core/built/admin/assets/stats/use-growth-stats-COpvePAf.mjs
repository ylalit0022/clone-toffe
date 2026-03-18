import { n as S, o as V, p as j, Y as o, i as F, h as G } from "./index-CQS5C8lQ.mjs";
import { bb as K, b9 as Q, ba as R } from "./stats-Df8kpPQA.mjs";
function q(a) {
  return a ? Intl.NumberFormat("en", { currency: a, style: "currency" }).format(0).replace(/[\d\s.]/g, "") : "";
}
const z = (a, T, h, d) => {
  if (!a.length)
    return {
      totalMembers: 0,
      freeMembers: 0,
      paidMembers: 0,
      mrr: 0,
      percentChanges: {
        total: "0%",
        free: "0%",
        paid: "0%",
        mrr: "0%"
      },
      directions: {
        total: "same",
        free: "same",
        paid: "same",
        mrr: "same"
      }
    };
  const D = d || a[a.length - 1], i = a.length > 0 ? a[a.length - 1] : { free: 0, paid: 0, comped: 0 }, P = T.length > 0 ? T[T.length - 1] : { mrr: 0 }, e = D.free + D.paid + D.comped, m = P.mrr, u = {
    total: "0%",
    free: "0%",
    paid: "0%",
    mrr: "0%"
  }, y = {
    total: "same",
    free: "same",
    paid: "same",
    mrr: "same"
  };
  if (a.length > 1) {
    const t = a[0], s = t.free + t.paid + t.comped;
    if (s > 0) {
      const r = (e - s) / s * 100;
      u.total = F(r / 100), y.total = r > 0 ? "up" : r < 0 ? "down" : "same";
    }
    if (t.free > 0) {
      const r = (i.free - t.free) / t.free * 100;
      u.free = F(r / 100), y.free = r > 0 ? "up" : r < 0 ? "down" : "same";
    }
    const g = t.paid + t.comped, f = i.paid + i.comped;
    if (g > 0) {
      const r = (f - g) / g * 100;
      u.paid = F(r / 100), y.paid = r > 0 ? "up" : r < 0 ? "down" : "same";
    }
  }
  if (T.length > 1) {
    const t = o(h).format("YYYY-MM-DD"), s = T.find((r) => o(r.date).isSameOrAfter(t)), g = o(h).isSame(o().startOf("year"), "day") || o(h).year() < o().year();
    let f = 0;
    if (s && o(s.date).isSame(t, "day") ? f = s.mrr : g ? f = 0 : f = m, f >= 0) {
      const r = f === 0 ? m > 0 ? 100 : 0 : (m - f) / f * 100;
      u.mrr = F(r / 100), y.mrr = r > 0 ? "up" : r < 0 ? "down" : "same";
    }
  }
  return {
    totalMembers: e,
    freeMembers: D.free,
    paidMembers: D.paid + D.comped,
    mrr: m,
    percentChanges: u,
    directions: y
  };
}, J = (a, T) => {
  const h = [...a].sort((t, s) => new Date(t.date).getTime() - new Date(s.date).getTime()), d = [...T].sort((t, s) => new Date(t.date).getTime() - new Date(s.date).getTime()), D = h.map((t) => t.date), i = d.map((t) => t.date), P = [.../* @__PURE__ */ new Set([...D, ...i])].sort((t, s) => new Date(t).getTime() - new Date(s).getTime());
  let e = null, m = null;
  const u = new Map(h.map((t) => [t.date, t])), y = new Map(d.map((t) => [t.date, t]));
  return P.map((t) => {
    const s = u.get(t);
    s && (e = s);
    const g = y.get(t);
    g && (m = g);
    const f = (e == null ? void 0 : e.free) ?? 0, r = (e == null ? void 0 : e.paid) ?? 0, A = (e == null ? void 0 : e.comped) ?? 0, L = r + A, _ = f + L, B = (m == null ? void 0 : m.mrr) ?? 0, n = (e == null ? void 0 : e.paid_subscribed) ?? 0, b = (e == null ? void 0 : e.paid_canceled) ?? 0;
    return {
      date: t,
      value: _,
      free: f,
      paid: L,
      comped: A,
      mrr: B,
      paid_subscribed: n,
      paid_canceled: b,
      formattedValue: G(_),
      label: "Total members"
      // Consider if label needs update based on data type?
    };
  });
}, H = (a) => {
  var B;
  const { startDate: T, endDate: h } = S(() => V(a), [a]), d = j(T), D = a === 1 ? o(d).subtract(1, "day").format("YYYY-MM-DD") : d, { data: i, isLoading: P } = K({
    searchParams: {
      date_from: D
    }
  }), { data: e, isLoading: m } = Q({
    searchParams: {
      date_from: D
    }
  }), { data: u, isLoading: y } = R(), t = S(() => {
    let n = [];
    if (i != null && i.stats ? n = i.stats : Array.isArray(i) && (n = i), a === 1 && n.length >= 2) {
      const b = n[n.length - 2], C = n[n.length - 1], O = o(d).format("YYYY-MM-DD"), l = o(d).add(1, "day").format("YYYY-MM-DD"), p = {
        ...b,
        date: O
      }, M = {
        ...C,
        date: l
      };
      return [p, M];
    }
    return n;
  }, [i, a, d]), { mrrData: s, selectedCurrency: g } = S(() => {
    var C;
    const n = o(d), b = a === 1 ? o().endOf("day") : o().startOf("day");
    if (e != null && e.stats && ((C = e == null ? void 0 : e.meta) != null && C.totals)) {
      const O = e.meta.totals;
      let l = O[0];
      if (!l)
        return { mrrData: [], selectedCurrency: "usd" };
      for (const c of O)
        c.mrr > l.mrr && (l = c);
      const p = l.currency, M = e.stats.filter((c) => c.currency === p), E = M.filter((c) => o(c.date).isSameOrAfter(n)), N = [...M].sort((c, w) => new Date(w.date).getTime() - new Date(c.date).getTime()), Y = [...E];
      if (!Y.some((c) => o(c.date).isSame(n, "day"))) {
        const c = N.find((w) => o(w.date).isBefore(n));
        if (c)
          Y.unshift({
            ...c,
            date: n.format("YYYY-MM-DD")
          });
        else if (Y.length > 0) {
          const w = [...Y].sort((k, v) => new Date(k.date).getTime() - new Date(v.date).getTime())[0];
          Y.unshift({
            ...w,
            date: n.format("YYYY-MM-DD")
          });
        }
      }
      const x = a === 1 ? o().startOf("day") : b;
      if (!Y.some((c) => o(c.date).isSame(x, "day")) && Y.length > 0) {
        const w = [...Y].sort((k, v) => new Date(v.date).getTime() - new Date(k.date).getTime())[0];
        Y.push({
          ...w,
          date: x.format("YYYY-MM-DD")
        });
      }
      return { mrrData: Y.sort((c, w) => new Date(c.date).getTime() - new Date(w.date).getTime()), selectedCurrency: p };
    }
    return { mrrData: [], selectedCurrency: "usd" };
  }, [e, d, a]), f = S(() => {
    var n;
    return z(t, s, d, (n = i == null ? void 0 : i.meta) == null ? void 0 : n.totals);
  }, [t, s, d, (B = i == null ? void 0 : i.meta) == null ? void 0 : B.totals]), r = S(() => J(t, s), [t, s]), A = S(() => q(g), [g]), L = S(() => P || m || y, [P, m, y]), _ = S(() => {
    if (!(u != null && u.stats))
      return [];
    const n = u.stats.reduce((l, p) => {
      const M = p.date;
      return l[M] || (l[M] = {
        date: M,
        signups: 0,
        cancellations: 0
      }), l[M].signups += p.signups, l[M].cancellations += p.cancellations, l;
    }, {}), b = Object.values(n).sort(
      (l, p) => new Date(l.date).getTime() - new Date(p.date).getTime()
    ), C = o(d), O = o(h);
    return b.filter((l) => {
      const p = o(l.date);
      return p.isSameOrAfter(C) && p.isSameOrBefore(O);
    });
  }, [u, d, h]);
  return {
    isLoading: L,
    memberData: t,
    mrrData: s,
    dateFrom: d,
    endDate: h,
    totals: f,
    chartData: r,
    subscriptionData: _,
    selectedCurrency: g,
    currencySymbol: A
  };
};
export {
  q as g,
  H as u
};
//# sourceMappingURL=use-growth-stats-COpvePAf.mjs.map

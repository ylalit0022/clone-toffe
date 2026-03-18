import { u as J, d as Y, b as re, O as ne, e as Q, n as h, h as S, r as le, j as e, i as _, $ as ge, g as ie, X as fe, o as Z, p as I, P as be, R as ee } from "./index-CQS5C8lQ.mjs";
import { aB as je, j as ae, ag as ve, ah as ke, ai as Ne, aj as X, k as we, bh as ye, bk as _e, bl as Ce, bm as Te, bi as Se, bu as Re, bo as Le, E as oe, m as se, bs as ce, bc as De, bd as Me, bv as Pe, be as Be, bf as Oe, bw as Ee, bx as Ae, bg as ze, by as $e, bz as Ve, bA as He, y as Ke, z as We, N as Fe, D as Ge, A as Ie, a as de, e as ue, b as Ye, c as Qe, d as Ue, q as Xe, B as qe } from "./stats-Df8kpPQA.mjs";
import { T as Je, a as Ze, K as q, c as O, d as es } from "./tabs-BVCBnMU6.mjs";
import { B as ss, d as ts, T as as, e as rs, a as G, f as V, S as F, b as M } from "./sort-button-gaSWOAWH.mjs";
const ns = ({ active: a, payload: s }) => {
  if (!a || !(s != null && s.length))
    return null;
  const r = s[0].payload, n = r.send_date;
  return /* @__PURE__ */ e.jsxs("div", { className: "min-w-[220px] max-w-[240px] rounded-lg border bg-background px-3 py-2 shadow-lg", children: [
    /* @__PURE__ */ e.jsxs("div", { className: "mb-2 flex w-full flex-col border-b pb-2", children: [
      /* @__PURE__ */ e.jsx("span", { className: "text-sm font-semibold leading-tight", children: r.post_title }),
      /* @__PURE__ */ e.jsxs("span", { className: "text-sm text-muted-foreground", children: [
        "Sent on ",
        ie(n)
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "mb-1 flex w-full justify-between", children: [
      /* @__PURE__ */ e.jsx("span", { className: "font-medium text-muted-foreground", children: "Sent" }),
      /* @__PURE__ */ e.jsx("div", { className: "ml-2 w-full text-right font-mono", children: S(r.sent_to) })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "mb-1 flex w-full justify-between", children: [
      /* @__PURE__ */ e.jsx("span", { className: "font-medium text-muted-foreground", children: "Opens" }),
      /* @__PURE__ */ e.jsxs("div", { className: "ml-2 w-full text-right font-mono", children: [
        /* @__PURE__ */ e.jsxs("span", { className: "text-muted-foreground", children: [
          S(r.total_opens),
          " / "
        ] }),
        _(r.open_rate)
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "mb-1 flex w-full justify-between", children: [
      /* @__PURE__ */ e.jsx("span", { className: "font-medium text-muted-foreground", children: "Clicks" }),
      /* @__PURE__ */ e.jsxs("div", { className: "ml-2 w-full text-right font-mono", children: [
        /* @__PURE__ */ e.jsxs("span", { className: "text-muted-foreground", children: [
          S(r.total_clicks),
          " / "
        ] }),
        _(r.click_rate)
      ] })
    ] })
  ] });
}, ls = ({
  subscribersData: a,
  avgsData: s,
  totals: r,
  isLoading: n,
  isAvgsLoading: t,
  initialTab: i = "total-subscribers"
}) => {
  const [o, x] = J(i), [u, j] = J(!1), { range: c } = Y(), w = re(), [y] = ne(), { appSettings: b } = Q(), { emailTrackClicks: p, emailTrackOpens: g } = (b == null ? void 0 : b.analytics) || {}, { totalSubscribers: P, avgOpenRate: C, avgClickRate: l } = r, k = h(() => {
    if (!a || a.length === 0)
      return [];
    let d = [];
    return d = je(a, c, "value", "exact"), d.map((L) => ({
      ...L,
      formattedValue: S(L.value),
      label: "Total Subscribers"
    }));
  }, [a, c]), R = h(() => {
    var K, $;
    if (!k || k.length <= 1)
      return {
        direction: "same",
        value: "0%"
      };
    const d = ((K = k[0]) == null ? void 0 : K.value) ?? 0, N = (($ = k[k.length - 1]) == null ? void 0 : $.value) ?? 0;
    let L = "same";
    N > d ? L = "up" : N < d && (L = "down");
    let z;
    if (d === 0)
      z = N === 0 ? "0%" : "+100%";
    else {
      const D = (N - d) / d * 100, W = Math.round(D * 10) / 10;
      z = `${D >= 0 ? "+" : ""}${W}%`;
    }
    return { direction: L, value: z };
  }, [k]);
  le(() => {
    x(i);
  }, [i]);
  const v = (d) => {
    x(d);
    const N = new URLSearchParams(y);
    N.set("tab", d), w(`?${N.toString()}`, { replace: !0 });
  }, T = {
    open_rate: {
      label: "Open rate"
    }
  }, m = h(() => ({
    "total-subscribers": {
      color: "var(--chart-darkblue)",
      datakey: "value"
    },
    "avg-open-rate": {
      color: "var(--chart-blue)",
      datakey: "open_rate"
    },
    "avg-click-rate": {
      color: "var(--chart-teal)",
      datakey: "click_rate"
    }
  }), []), { barDomain: f, barTicks: H } = h(() => {
    var te;
    if (!s || s.length === 0 || o === "total-subscribers")
      return { barDomain: [0, 1], barTicks: [0, 1] };
    const d = (te = m[o]) == null ? void 0 : te.datakey;
    if (!d)
      return { barDomain: [0, 1], barTicks: [0, 1] };
    const N = s.map((U) => U[d]).filter((U) => typeof U == "number");
    if (N.length === 0)
      return { barDomain: [0, 1], barTicks: [0, 1] };
    const L = Math.min(...N), z = Math.max(...N), K = Math.floor(L * 10) / 10, $ = Math.ceil(z * 10) / 10, D = Math.max(0, K), W = $ === D ? D + 0.1 : $;
    return {
      barDomain: [D, W],
      barTicks: [D, W]
    };
  }, [s, o, m]);
  if (n)
    return /* @__PURE__ */ e.jsx("div", { className: "-mb-6 flex h-[calc(16vw+132px)] w-full items-start justify-center", children: /* @__PURE__ */ e.jsx(ae, {}) });
  let E = "grid-cols-3";
  (!p || !g) && (E = "grid-cols-2"), !p && !g && (E = "grid-cols-1");
  const A = o === "avg-open-rate" && C > f[0] && C < f[1] || o === "avg-click-rate" && l > f[0] && l < f[1], B = o === "avg-open-rate" ? C : l;
  return /* @__PURE__ */ e.jsxs(Je, { defaultValue: i, variant: "kpis", children: [
    /* @__PURE__ */ e.jsxs(Ze, { className: `md:visible! md:grid! -mx-6 hidden grid-cols-3 ${E}`, children: [
      /* @__PURE__ */ e.jsx(q, { className: `${!g && !p && "cursor-auto after:hidden"}`, value: "total-subscribers", onClick: () => {
        v("total-subscribers");
      }, children: /* @__PURE__ */ e.jsx(
        O,
        {
          color: m["total-subscribers"].color,
          "data-testid": "total-subscribers-value",
          diffDirection: R.direction,
          diffValue: R.value,
          label: "Total subscribers",
          value: S(P)
        }
      ) }),
      g && /* @__PURE__ */ e.jsx(q, { value: "avg-open-rate", onClick: () => {
        v("avg-open-rate");
      }, children: /* @__PURE__ */ e.jsx(
        O,
        {
          className: t ? "opacity-50" : "",
          color: m["avg-open-rate"].color,
          label: "Avg. open rate",
          value: _(C)
        }
      ) }),
      p && /* @__PURE__ */ e.jsx(q, { value: "avg-click-rate", onClick: () => {
        v("avg-click-rate");
      }, children: /* @__PURE__ */ e.jsx(
        O,
        {
          className: t ? "opacity-50" : "",
          color: m["avg-click-rate"].color,
          label: "Avg. click rate",
          value: _(l)
        }
      ) })
    ] }),
    /* @__PURE__ */ e.jsxs(ve, { children: [
      /* @__PURE__ */ e.jsx(ke, { className: "md:hidden", asChild: !0, children: /* @__PURE__ */ e.jsxs(es, { children: [
        o === "total-subscribers" && /* @__PURE__ */ e.jsx(
          O,
          {
            color: m["total-subscribers"].color,
            label: "Total subscribers",
            value: S(P)
          }
        ),
        o === "avg-open-rate" && g && /* @__PURE__ */ e.jsx(
          O,
          {
            className: t ? "opacity-50" : "",
            color: m["avg-open-rate"].color,
            label: "Avg. open rate",
            value: _(C)
          }
        ),
        o === "avg-click-rate" && p && /* @__PURE__ */ e.jsx(
          O,
          {
            className: t ? "opacity-50" : "",
            color: m["avg-click-rate"].color,
            label: "Avg. click rate",
            value: _(l)
          }
        )
      ] }) }),
      /* @__PURE__ */ e.jsxs(Ne, { align: "end", className: "w-56", children: [
        /* @__PURE__ */ e.jsx(X, { onClick: () => v("total-subscribers"), children: "Total subscribers" }),
        g && /* @__PURE__ */ e.jsx(X, { onClick: () => v("avg-open-rate"), children: "Avg. open rate" }),
        p && /* @__PURE__ */ e.jsx(X, { onClick: () => v("avg-click-rate"), children: "Avg. click rate" })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "my-4 [&_.recharts-cartesian-axis-tick-value]:fill-gray-500", children: [
      o === "total-subscribers" && /* @__PURE__ */ e.jsx(
        we,
        {
          className: "-mb-3 h-[16vw] max-h-[320px] min-h-[180px] w-full",
          color: m["total-subscribers"].color,
          data: k,
          id: "mrr",
          range: c
        }
      ),
      (o === "avg-open-rate" && g || o === "avg-click-rate" && p) && /* @__PURE__ */ e.jsx(e.Fragment, { children: t ? /* @__PURE__ */ e.jsx("div", { className: "h-[320px] w-full items-center justify-center", children: /* @__PURE__ */ e.jsx(ae, {}) }) : s && s.length > 0 ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        /* @__PURE__ */ e.jsx(ye, { className: "aspect-auto h-[200px] w-full md:h-[220px] xl:h-[320px]", config: T, children: /* @__PURE__ */ e.jsxs(
          ss,
          {
            className: u ? "cursor-pointer!" : "",
            data: s,
            margin: {
              top: 20
            },
            onClick: (d) => {
              d.activePayload && d.activePayload[0].payload.post_id && w(`/posts/analytics/${d.activePayload[0].payload.post_id}`, { crossApp: !0 });
            },
            onMouseLeave: () => j(!1),
            onMouseMove: (d) => {
              j(!!(d.activePayload && d.activePayload[0].payload.post_id));
            },
            children: [
              /* @__PURE__ */ e.jsx("defs", { children: /* @__PURE__ */ e.jsxs("linearGradient", { id: "barGradient", x1: "0", x2: "0", y1: "0", y2: "1", children: [
                /* @__PURE__ */ e.jsx("stop", { offset: "0%", stopColor: m[o].color, stopOpacity: 0.8 }),
                /* @__PURE__ */ e.jsx("stop", { offset: "100%", stopColor: m[o].color, stopOpacity: 0.6 })
              ] }) }),
              /* @__PURE__ */ e.jsx(_e, { horizontal: !0, stroke: "var(--border)", vertical: !1 }),
              /* @__PURE__ */ e.jsx(
                Ce,
                {
                  axisLine: { stroke: "var(--border)", strokeWidth: 1 },
                  dataKey: "post_id",
                  interval: 0,
                  stroke: "var(--border)",
                  tickFormatter: () => "",
                  tickLine: !1,
                  tickMargin: 10
                }
              ),
              /* @__PURE__ */ e.jsx(
                Te,
                {
                  axisLine: !1,
                  domain: f,
                  tickFormatter: (d) => _(d),
                  tickLine: !1,
                  ticks: H,
                  width: ge(H, (d) => _(d))
                }
              ),
              /* @__PURE__ */ e.jsx(
                Se,
                {
                  content: /* @__PURE__ */ e.jsx(ns, {}),
                  cursor: !1,
                  isAnimationActive: !1,
                  position: { y: 10 }
                }
              ),
              A && /* @__PURE__ */ e.jsx(Re, { label: { value: `${_(B)}`, position: "left", offset: 8, fill: "var(--muted-foreground)" }, opacity: 0.5, stroke: "var(--muted-foreground)", strokeDasharray: "4 4", y: B }),
              /* @__PURE__ */ e.jsx(
                Le,
                {
                  activeBar: { fillOpacity: 1 },
                  dataKey: m[o].datakey,
                  fill: "url(#barGradient)",
                  fillOpacity: 0.6,
                  isAnimationActive: !1,
                  maxBarSize: 32,
                  minPointSize: 3,
                  radius: 4
                }
              )
            ]
          }
        ) }),
        /* @__PURE__ */ e.jsxs("div", { className: "-mt-4 text-center text-sm text-muted-foreground", children: [
          "Newsletters ",
          o === "avg-open-rate" ? "opens" : "clicks",
          " in this period"
        ] })
      ] }) : /* @__PURE__ */ e.jsx(
        oe,
        {
          className: "size-full py-20",
          title: `No newsletters ${se(c)}`,
          children: /* @__PURE__ */ e.jsx(ce, { strokeWidth: 1.5 })
        }
      ) })
    ] })
  ] });
}, is = ({ newsletters: a }) => {
  const { selectedNewsletterId: s, setSelectedNewsletterId: r } = Y(), n = h(() => (a == null ? void 0 : a.filter((t) => t.status === "active")) || [], [a]);
  return le(() => {
    if (n.length > 0 && !s) {
      const t = n.find((i) => i.sort_order === 0);
      r(t ? t.id : n[0].id);
    }
  }, [n, s, r]), n.length <= 1 ? null : /* @__PURE__ */ e.jsxs(
    De,
    {
      value: s || "",
      onValueChange: (t) => {
        r(t);
      },
      children: [
        /* @__PURE__ */ e.jsxs(Me, { className: "w-auto", children: [
          /* @__PURE__ */ e.jsx(Pe, { className: "mr-2", size: 16, strokeWidth: 1.5 }),
          /* @__PURE__ */ e.jsx(Be, { placeholder: "Select a newsletter" })
        ] }),
        /* @__PURE__ */ e.jsx(Oe, { align: "end", children: /* @__PURE__ */ e.jsxs(Ee, { children: [
          /* @__PURE__ */ e.jsx(Ae, { children: "Newsletters" }),
          n.map((t) => /* @__PURE__ */ e.jsx(ze, { value: t.id, children: t.name }, t.id))
        ] }) })
      ]
    }
  );
}, os = "NewslettersResponseType", cs = fe({
  dataType: os,
  path: "/newsletters/",
  defaultSearchParams: { include: "count.active_members,count.posts", limit: "50" },
  defaultNextPageParams: (a, s) => {
    var r;
    return {
      ...s,
      page: (((r = a.meta) == null ? void 0 : r.pagination.next) || 1).toString()
    };
  },
  returnData: (a) => {
    const { pages: s } = a, r = s.flatMap((t) => t.newsletters), n = s[s.length - 1].meta;
    return {
      newsletters: r,
      meta: n,
      isEnd: n ? n.pagination.pages === n.pagination.page : !0
    };
  }
}), ds = (a, s, r = !0) => {
  const n = a ?? 30, { startDate: t, endDate: i } = h(() => Z(n), [n]), o = h(() => {
    const u = {
      date_from: I(t),
      date_to: I(i)
    };
    return s && (u.newsletter_id = s), u;
  }, [t, i, s]), x = $e({ searchParams: o, enabled: r });
  return r ? x : {
    data: void 0,
    isLoading: !1,
    error: null,
    isError: !1,
    refetch: x.refetch
  };
}, us = (a, s, r, n = !0) => {
  const t = a ?? 30, i = s ?? "date desc", { startDate: o, endDate: x } = h(() => Z(t), [t]), u = h(() => {
    const c = {
      date_from: I(o),
      date_to: I(x),
      order: i
    };
    return r && (c.newsletter_id = r), c;
  }, [o, x, i, r]), j = Ve({ searchParams: u, enabled: n });
  return n ? j : {
    data: void 0,
    isLoading: !1,
    error: null,
    isError: !1,
    refetch: j.refetch
  };
}, ms = (a, s = [], r = !0) => {
  const n = h(() => {
    const i = {};
    return a && (i.newsletter_id = a), s.length > 0 && (i.post_ids = s.join(",")), i;
  }, [a, s]), t = He({ searchParams: n, enabled: r });
  return r ? t : {
    data: void 0,
    isLoading: !1,
    error: null,
    isError: !1,
    refetch: t.refetch
  };
}, me = (a, s, r, n = !0) => {
  const t = us(a, s, r, n), i = h(() => {
    var u;
    return (u = t.data) != null && u.stats ? t.data.stats.map((j) => j.post_id) : [];
  }, [t.data]), o = ms(
    r,
    i,
    n && i.length > 0
  );
  return {
    data: h(() => {
      var y, b;
      if (!((y = t.data) != null && y.stats))
        return;
      const u = t.data.stats, j = ((b = o.data) == null ? void 0 : b.stats) || [], c = /* @__PURE__ */ new Map();
      j.forEach((p) => {
        c.set(p.post_id, p);
      });
      const w = u.map((p) => {
        const g = c.get(p.post_id);
        return {
          ...p,
          total_clicks: (g == null ? void 0 : g.total_clicks) || 0,
          click_rate: (g == null ? void 0 : g.click_rate) || 0
        };
      });
      return {
        ...t.data,
        stats: w
      };
    }, [t.data, o.data]),
    isLoading: t.isLoading,
    isClicksLoading: o.isLoading,
    error: t.error || o.error,
    isError: t.isError || o.isError,
    refetch: () => {
      t.refetch(), o.refetch();
    }
  };
}, he = ee.memo(({ range: a, selectedNewsletterId: s, shouldFetchStats: r, sortBy: n }) => {
  var C;
  const t = re(), { settings: i } = Y(), o = String(((C = i.find((l) => l.key === "timezone")) == null ? void 0 : C.value) || "Etc/UTC"), { data: x, isLoading: u, isClicksLoading: j } = me(
    a,
    n,
    // Reactive to sort changes, but only affects this component
    s || void 0,
    !!r
  ), { appSettings: c } = Q(), { emailTrackClicks: w, emailTrackOpens: y } = (c == null ? void 0 : c.analytics) || {}, b = h(() => (x == null ? void 0 : x.stats) || [], [x]), p = y && w ? 5 : y || w ? 4 : 3, g = h(() => /* @__PURE__ */ e.jsx(e.Fragment, { children: /* @__PURE__ */ e.jsx(G, { className: "last:border-none [&>td]:py-2.5", children: /* @__PURE__ */ e.jsx(M, { className: "font-medium", colSpan: p, children: /* @__PURE__ */ e.jsx(Xe, { className: "mt-5" }) }) }) }), [p]), P = h(() => b.length > 0 ? /* @__PURE__ */ e.jsx(e.Fragment, { children: b.map((l) => /* @__PURE__ */ e.jsxs(G, { className: "last:border-none [&>td]:py-2.5", children: [
    /* @__PURE__ */ e.jsx(M, { className: "font-medium", children: /* @__PURE__ */ e.jsx("div", { className: "group/link inline-flex items-center gap-2", children: l.post_id ? /* @__PURE__ */ e.jsx(qe, { className: "hover:underline! h-auto whitespace-normal p-0 text-left", title: "View post analytics", variant: "link", onClick: () => {
      t(`/posts/analytics/${l.post_id}/`, { crossApp: !0 });
    }, children: l.post_title }) : /* @__PURE__ */ e.jsx(e.Fragment, { children: l.post_title }) }) }),
    /* @__PURE__ */ e.jsx(M, { className: "whitespace-nowrap text-sm", children: ie(l.send_date, o) }),
    /* @__PURE__ */ e.jsx(M, { className: "text-right font-mono text-sm", children: S(l.sent_to) }),
    y && /* @__PURE__ */ e.jsxs(M, { className: "text-right font-mono text-sm", children: [
      /* @__PURE__ */ e.jsx("span", { className: "group-hover:hidden", children: _(l.open_rate) }),
      /* @__PURE__ */ e.jsx("span", { className: "group-hover:visible! group-hover:block! hidden", children: S(l.total_opens) })
    ] }),
    w && /* @__PURE__ */ e.jsx(M, { className: "text-right font-mono text-sm", children: j ? /* @__PURE__ */ e.jsx("span", { className: "inline-block h-4 w-8 animate-pulse rounded bg-gray-200" }) : /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsx("span", { className: "group-hover:hidden", children: _(l.click_rate) }),
      /* @__PURE__ */ e.jsx("span", { className: "group-hover:visible! group-hover:block! hidden", children: S(l.total_clicks) })
    ] }) })
  ] }, l.post_id)) }) : /* @__PURE__ */ e.jsx(G, { className: "border-none hover:bg-transparent", children: /* @__PURE__ */ e.jsx(M, { className: "group-hover:bg-transparent! text-center", colSpan: p, children: /* @__PURE__ */ e.jsx(
    oe,
    {
      className: "size-full py-20",
      title: `No newsletters ${se(a)}`,
      children: /* @__PURE__ */ e.jsx(ce, { strokeWidth: 1.5 })
    }
  ) }) }), [b, j, t, w, y, a]);
  return u || !x ? g : P;
});
he.displayName = "NewsletterTableRows";
const xe = ee.memo(({ sortBy: a, setSortBy: s, range: r }) => {
  const n = h(() => /* @__PURE__ */ e.jsxs(Ye, { children: [
    /* @__PURE__ */ e.jsx(Qe, { children: "Top newsletters" }),
    /* @__PURE__ */ e.jsxs(Ue, { children: [
      " Your best performing newsletters ",
      se(r)
    ] })
  ] }), [r]), { appSettings: t } = Q(), { emailTrackClicks: i, emailTrackOpens: o } = (t == null ? void 0 : t.analytics) || {};
  return /* @__PURE__ */ e.jsx(rs, { children: /* @__PURE__ */ e.jsxs(G, { children: [
    /* @__PURE__ */ e.jsx(V, { className: "min-w-[320px]", variant: "cardhead", children: n }),
    /* @__PURE__ */ e.jsx(V, { className: "w-[65px]", children: /* @__PURE__ */ e.jsx(F, { activeSortBy: a, setSortBy: s, sortBy: "date desc", children: "Date" }) }),
    /* @__PURE__ */ e.jsx(V, { className: "w-[90px] text-right", children: /* @__PURE__ */ e.jsx(F, { activeSortBy: a, setSortBy: s, sortBy: "sent_to desc", children: "Sent" }) }),
    o && /* @__PURE__ */ e.jsx(V, { className: "w-[90px] text-right", children: /* @__PURE__ */ e.jsx(F, { activeSortBy: a, setSortBy: s, sortBy: "open_rate desc", children: "Opens" }) }),
    i && /* @__PURE__ */ e.jsx(V, { className: "w-[90px] text-right", children: /* @__PURE__ */ e.jsx(F, { activeSortBy: a, setSortBy: s, sortBy: "click_rate desc", children: "Clicks" }) })
  ] }) });
});
xe.displayName = "NewsletterTableHeader";
const pe = ee.memo(({ range: a, selectedNewsletterId: s, shouldFetchStats: r }) => {
  const [n, t] = J("open_rate desc");
  return /* @__PURE__ */ e.jsx(de, { className: "w-full max-w-[calc(100vw-64px)] overflow-x-auto sidebar:max-w-[calc(100vw-64px-280px)]", "data-testid": "top-newsletters-card", children: /* @__PURE__ */ e.jsx(ue, { children: /* @__PURE__ */ e.jsxs(ts, { children: [
    /* @__PURE__ */ e.jsx(xe, { range: a, setSortBy: t, sortBy: n }),
    /* @__PURE__ */ e.jsx(as, { children: /* @__PURE__ */ e.jsx(
      he,
      {
        range: a,
        selectedNewsletterId: s,
        shouldFetchStats: r,
        sortBy: n
      }
    ) })
  ] }) }) });
});
pe.displayName = "TopNewslettersTable";
const fs = () => {
  const { range: a, selectedNewsletterId: s } = Y(), [r] = ne(), { appSettings: n } = Q(), t = r.get("tab") || "total-subscribers", { data: i, isLoading: o } = cs({
    searchParams: {
      limit: "50"
    }
  }), x = !o && i && i.newsletters.length > 0 && !!s, { data: u, isLoading: j } = ds(
    a,
    s || void 0,
    x || !1
  ), { data: c, isLoading: w, isClicksLoading: y } = me(
    a,
    "date asc",
    s || void 0,
    x || !1
  ), b = h(() => !(i != null && i.newsletters) || !s ? null : i.newsletters.find((l) => l.id === s) || null, [i, s]), p = h(() => {
    var v, T, m;
    const l = ((v = b == null ? void 0 : b.count) == null ? void 0 : v.active_members) || ((m = (T = u == null ? void 0 : u.stats) == null ? void 0 : T[0]) == null ? void 0 : m.total) || 0;
    let k = 0, R = 0;
    if (c != null && c.stats && c.stats.length > 0) {
      const f = c.stats, H = f.reduce((A, B) => A + (B.open_rate || 0), 0), E = f.reduce((A, B) => A + (B.click_rate || 0), 0);
      k = H / f.length, R = E / f.length;
    }
    return {
      totalSubscribers: l,
      avgOpenRate: k,
      avgClickRate: R
    };
  }, [b, u, c]), g = h(() => {
    var k, R;
    if (!((R = (k = u == null ? void 0 : u.stats) == null ? void 0 : k[0]) != null && R.values) || u.stats[0].values.length === 0) {
      const { startDate: v, endDate: T } = Z(a), m = [], f = new Date(v);
      for (; f <= T; )
        m.push({
          date: f.toISOString().split("T")[0],
          value: 0
        }), f.setDate(f.getDate() + 1);
      return m;
    }
    const l = u.stats[0].values;
    if (l.length === 1) {
      const v = l[0], T = /* @__PURE__ */ new Date(), m = a, f = new Date(T.getTime() - m * 24 * 60 * 60 * 1e3);
      return [
        {
          ...v,
          date: f.toISOString().split("T")[0]
          // Start of range
        },
        {
          ...v,
          date: T.toISOString().split("T")[0]
          // End of range (today)
        }
      ];
    }
    return l;
  }, [u, a]), P = h(() => c != null && c.stats ? c.stats.map((l) => ({
    post_id: l.post_id,
    post_title: l.post_title,
    send_date: l.send_date,
    sent_to: l.sent_to,
    total_opens: l.total_opens,
    open_rate: l.open_rate,
    total_clicks: l.total_clicks || 0,
    click_rate: l.click_rate || 0
  })) : [], [c]), C = j || y || w;
  return n && !n.newslettersEnabled ? /* @__PURE__ */ e.jsx(be, { to: "/analytics" }) : /* @__PURE__ */ e.jsxs(Ke, { children: [
    /* @__PURE__ */ e.jsx(We, { children: /* @__PURE__ */ e.jsxs(Fe, { children: [
      /* @__PURE__ */ e.jsx(is, { newsletters: i == null ? void 0 : i.newsletters }),
      /* @__PURE__ */ e.jsx(Ge, {})
    ] }) }),
    /* @__PURE__ */ e.jsx(Ie, { isLoading: !1, loadingComponent: /* @__PURE__ */ e.jsx(e.Fragment, {}), children: /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsx(de, { "data-testid": "newsletters-card", children: /* @__PURE__ */ e.jsx(ue, { children: /* @__PURE__ */ e.jsx(
        ls,
        {
          avgsData: P,
          initialTab: t,
          isAvgsLoading: !1,
          isLoading: C,
          subscribersData: g,
          totals: p
        }
      ) }) }),
      /* @__PURE__ */ e.jsx(
        pe,
        {
          range: a,
          selectedNewsletterId: s,
          shouldFetchStats: !!x
        }
      )
    ] }) })
  ] });
};
export {
  fs as default
};
//# sourceMappingURL=index-DrjR8LkN.mjs.map

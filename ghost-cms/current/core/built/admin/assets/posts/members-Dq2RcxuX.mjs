import { j as e, p as D, u as S, q as C, b as X, a as F, a0 as O, n as Oe, R as Ye, a1 as xe, o as We, v as Qe } from "./index-DHZtUctP.mjs";
import { B as M } from "./heading-BU5ZMUV_.mjs";
import { X as ie, C as ve, k as Z, m as q, n as ee, o as se, q as te } from "./dialog-B8MooVkm.mjs";
import { B as Fe, u as Ge, d as He, e as Xe, M as Je, c as Ze, f as qe } from "./use-scroll-restoration-665Qr_-H.mjs";
import { P as es, e as ss, f as ts, C as oe, g as ce, h as Ie, i as je, j as de, k as as, F as ls } from "./filters-Cy4F_SbD.mjs";
import { S as ns, P as rs, E as is, C as os, M as cs, F as ds, b as us } from "./search-hHdC4f3P.mjs";
import { P as ms, T as ps } from "./tags-BZrlkC68.mjs";
import { a as ue, b as me, d as ze, e as fs } from "./hooks-BQt0oM3N.mjs";
import { D as hs, b as bs, E as gs, d as xs, e as W, i as ye, U as vs } from "./dropdown-menu-D5NyPbW9.mjs";
import { D as js, T as Re, f as ys, h as ws, N as Ns, d as we, c as _s, a as ks, b as Ss, C as Ls, A as Cs, g as Ps, S as Ne, e as _e, P as Es, M as Ms, U as ke } from "./users-DCTB9kXA.mjs";
import { a as Ts, u as De, g as G } from "./settings-CZrxkyYB.mjs";
import { M as ne, U as $s, g as Os } from "./get-site-timezone-DocCBOxG.mjs";
import { u as Fs } from "./posts-9lhi5U2u.mjs";
import { H as J, u as Is } from "./use-infinite-virtual-scroll-Co4ZdYYP.mjs";
import { E as Se } from "./empty-indicator-1_BranMm.mjs";
import { L as zs } from "./loading-indicator-CadEpdNK.mjs";
const Rs = "OffersResponseType", Ds = ue({
  dataType: Rs,
  path: "/offers/",
  // offers endpoint doesn't support limit or pagination so we exclude the default ?limit=20
  defaultSearchParams: {}
}), As = ({ label: t, onSave: s, onCancel: a, onDelete: l, isDuplicateName: n }) => {
  const [r, o] = S(t.name), [i, c] = S(!1), [p, b] = S(""), [d, x] = S(!1), [v, y] = S(!1), j = D(null), u = d || v;
  X(() => {
    var w, g;
    (w = j.current) == null || w.focus(), (g = j.current) == null || g.select();
  }, []);
  const f = (w) => {
    const g = w.trim();
    return g ? n != null && n(g, t.id) ? "A label with this name already exists" : "" : "Name is required";
  }, m = async () => {
    const w = f(r);
    if (w) {
      b(w);
      return;
    }
    x(!0);
    try {
      await s(t.id, r.trim()), a();
    } catch {
      x(!1);
    }
  }, h = (w) => {
    w.key === "Enter" ? (w.preventDefault(), m()) : w.key === "Escape" && (w.preventDefault(), u || a());
  }, N = async () => {
    y(!0);
    try {
      await l(t.id);
    } catch {
      y(!1), c(!1);
    }
  };
  return /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col gap-2 py-1.5", "data-edit-row": !0, children: [
    /* @__PURE__ */ e.jsx(
      "input",
      {
        ref: j,
        className: "outline-hidden h-7 w-full rounded border border-border bg-background px-2 text-sm focus:ring-1 focus:ring-ring disabled:opacity-50",
        disabled: u,
        type: "text",
        value: r,
        onChange: (w) => {
          o(w.target.value), b("");
        },
        onKeyDown: h
      }
    ),
    p && /* @__PURE__ */ e.jsx("span", { className: "text-xs text-destructive", children: p }),
    i ? /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-1 text-sm", children: [
      /* @__PURE__ */ e.jsx("span", { className: "flex-1 font-semibold", children: "Delete label?" }),
      /* @__PURE__ */ e.jsx(
        M,
        {
          className: "h-6 px-2 text-xs",
          disabled: u,
          size: "sm",
          variant: "outline",
          onClick: () => c(!1),
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ e.jsx(
        M,
        {
          className: "h-6 px-2 text-xs",
          disabled: u,
          size: "sm",
          variant: "destructive",
          onClick: N,
          children: v ? "Deleting..." : "Delete"
        }
      )
    ] }) : /* @__PURE__ */ e.jsxs("div", { className: "flex items-center", children: [
      /* @__PURE__ */ e.jsx(
        M,
        {
          className: "h-6 gap-1 px-1.5 text-xs text-red hover:bg-red/5 hover:text-red",
          disabled: u,
          size: "sm",
          variant: "ghost",
          onClick: () => c(!0),
          children: "Delete"
        }
      ),
      /* @__PURE__ */ e.jsxs("div", { className: "ml-auto flex gap-1", children: [
        /* @__PURE__ */ e.jsx(
          M,
          {
            className: "h-6 px-2 text-xs",
            disabled: u,
            size: "sm",
            variant: "outline",
            onClick: a,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ e.jsx(
          M,
          {
            className: "h-6 px-2 text-xs",
            disabled: u,
            size: "sm",
            onClick: m,
            children: d ? "Saving..." : "Save"
          }
        )
      ] })
    ] })
  ] });
}, Us = ({ label: t, isSelected: s, showEdit: a, onToggle: l, onEditClick: n }) => /* @__PURE__ */ e.jsxs(
  de,
  {
    className: "group",
    value: t.slug,
    onSelect: () => l(t.slug),
    children: [
      /* @__PURE__ */ e.jsx("span", { className: "flex-1 truncate", children: t.name }),
      a ? /* @__PURE__ */ e.jsxs(
        "button",
        {
          "aria-label": `Edit label ${t.name}`,
          className: "relative ml-1 flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground",
          type: "button",
          onClick: (r) => {
            r.stopPropagation(), r.preventDefault(), n();
          },
          children: [
            s && /* @__PURE__ */ e.jsx(ve, { className: "absolute size-3 text-primary transition-opacity duration-150 group-hover:opacity-0" }),
            /* @__PURE__ */ e.jsx(ms, { className: "absolute size-3 translate-x-2 opacity-0 transition-all duration-150 ease-out group-hover:translate-x-0 group-hover:opacity-100" })
          ]
        }
      ) : s && /* @__PURE__ */ e.jsx(ve, { className: "size-4 shrink-0 text-primary" })
    ]
  }
), Ae = ({
  labels: t,
  selectedSlugs: s,
  search: a,
  onToggle: l,
  onEdit: n,
  onDelete: r,
  isDuplicateName: o,
  canCreateFromSearch: i,
  onCreate: c,
  isCreating: p,
  onSearchClear: b
}) => {
  const [d, x] = S(null), v = t.filter((h) => h.name.toLowerCase().includes(a.toLowerCase())), y = !!c && a.trim() && (i == null ? void 0 : i(a)), j = !!n, u = async () => {
    if (c) {
      const h = await c(a.trim());
      h && l(h.slug), b == null || b();
    }
  }, f = async (h, N) => {
    n && await n(h, N);
  }, m = async (h) => {
    r && (await r(h), x(null));
  };
  return /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    !y && v.length === 0 && /* @__PURE__ */ e.jsx(Ie, { children: "No labels found" }),
    v.length > 0 && /* @__PURE__ */ e.jsx(je, { className: "[&_[cmdk-group-heading]]:hidden", children: v.map((h) => d === h.id ? /* @__PURE__ */ e.jsx(
      As,
      {
        isDuplicateName: o,
        label: h,
        onCancel: () => x(null),
        onDelete: m,
        onSave: f
      },
      h.id
    ) : /* @__PURE__ */ e.jsx(
      Us,
      {
        isSelected: s.includes(h.slug),
        label: h,
        showEdit: j,
        onEditClick: () => x(h.id),
        onToggle: l
      },
      h.id
    )) }),
    y && /* @__PURE__ */ e.jsx(je, { className: "[&_[cmdk-group-heading]]:hidden", children: /* @__PURE__ */ e.jsxs(
      de,
      {
        disabled: p,
        onSelect: u,
        children: [
          /* @__PURE__ */ e.jsx(rs, { className: "size-4" }),
          p ? "Creating..." : `Create "${a.trim()}"`
        ]
      }
    ) })
  ] });
}, Ue = ({ labels: t, onToggle: s }) => /* @__PURE__ */ e.jsx(e.Fragment, { children: t.map((a) => /* @__PURE__ */ e.jsxs(
  Fe,
  {
    className: "cursor-pointer gap-1 pr-1",
    variant: "outline",
    onClick: (l) => {
      l.stopPropagation(), s(a.slug);
    },
    children: [
      a.name,
      /* @__PURE__ */ e.jsx(ie, { className: "size-3" })
    ]
  },
  a.id
)) }), pe = ({
  labels: t,
  selectedSlugs: s,
  isLoading: a,
  onToggle: l,
  canCreateFromSearch: n,
  onCreate: r,
  isCreating: o,
  onEdit: i,
  onDelete: c,
  isDuplicateName: p,
  inline: b = !1,
  align: d = "start"
}) => {
  const x = s.map((v) => t.find((y) => y.slug === v)).filter((v) => !!v);
  return b ? /* @__PURE__ */ e.jsx(
    Bs,
    {
      align: d,
      canCreateFromSearch: n,
      isCreating: o,
      isDuplicateName: p,
      isLoading: a,
      labels: t,
      selectedLabels: x,
      selectedSlugs: s,
      onCreate: r,
      onDelete: c,
      onEdit: i,
      onToggle: l
    }
  ) : /* @__PURE__ */ e.jsx(
    Ks,
    {
      canCreateFromSearch: n,
      isCreating: o,
      isDuplicateName: p,
      isLoading: a,
      labels: t,
      selectedLabels: x,
      selectedSlugs: s,
      onCreate: r,
      onDelete: c,
      onEdit: i,
      onToggle: l
    }
  );
}, Bs = ({
  labels: t,
  selectedLabels: s,
  selectedSlugs: a,
  onToggle: l,
  isLoading: n,
  align: r = "start",
  canCreateFromSearch: o,
  onCreate: i,
  isCreating: c,
  onEdit: p,
  onDelete: b,
  isDuplicateName: d
}) => {
  const x = D(null), [v, y] = S(0), j = C(() => {
    const f = x.current, m = f == null ? void 0 : f.parentElement;
    if (f && m) {
      const h = f.getBoundingClientRect(), N = m.getBoundingClientRect();
      y(Math.round(N.left - h.left));
    }
  }, []), u = s.length === 0 ? "Select..." : s.length === 1 ? s[0].name : `${s.length} labels`;
  return /* @__PURE__ */ e.jsxs(
    es,
    {
      onOpenChange: (f) => {
        f && j();
      },
      children: [
        /* @__PURE__ */ e.jsx(ss, { asChild: !0, children: /* @__PURE__ */ e.jsx(
          "button",
          {
            ref: x,
            className: "flex size-full items-center truncate text-left text-sm",
            type: "button",
            children: u
          }
        ) }),
        /* @__PURE__ */ e.jsx(ts, { align: r, alignOffset: v, className: "w-64 p-0", children: n ? /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-center py-6 text-sm text-muted-foreground", children: "Loading labels..." }) : /* @__PURE__ */ e.jsx(
          Vs,
          {
            canCreateFromSearch: o,
            isCreating: c,
            isDuplicateName: d,
            labels: t,
            selectedLabels: s,
            selectedSlugs: a,
            onCreate: i,
            onDelete: b,
            onEdit: p,
            onToggle: l
          }
        ) })
      ]
    }
  );
}, Vs = ({ selectedLabels: t, ...s }) => {
  const [a, l] = S("");
  return /* @__PURE__ */ e.jsxs(oe, { shouldFilter: !1, children: [
    t.length > 0 && /* @__PURE__ */ e.jsx("div", { className: "flex flex-wrap gap-1.5 border-b px-3 py-2", children: /* @__PURE__ */ e.jsx(Ue, { labels: t, onToggle: s.onToggle }) }),
    /* @__PURE__ */ e.jsxs("div", { className: "flex items-center border-b px-3", children: [
      /* @__PURE__ */ e.jsx(ns, { className: "mr-2 size-4 shrink-0 opacity-50" }),
      /* @__PURE__ */ e.jsx(
        "input",
        {
          className: "outline-hidden flex h-9 w-full bg-transparent py-3 text-sm placeholder:text-muted-foreground",
          placeholder: "Search labels...",
          value: a,
          onChange: (n) => l(n.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ e.jsx(ce, { className: "max-h-64 overflow-y-auto", children: /* @__PURE__ */ e.jsx(
      Ae,
      {
        ...s,
        search: a,
        onSearchClear: () => l("")
      }
    ) })
  ] });
}, Ks = ({
  labels: t,
  selectedLabels: s,
  selectedSlugs: a,
  onToggle: l,
  isLoading: n,
  canCreateFromSearch: r,
  onCreate: o,
  isCreating: i,
  onEdit: c,
  onDelete: p,
  isDuplicateName: b
}) => {
  const [d, x] = S(!1), [v, y] = S(""), j = D(null), u = D(null);
  X(() => {
    if (!d)
      return;
    const m = (h) => {
      u.current && !u.current.contains(h.target) && x(!1);
    };
    return document.addEventListener("pointerdown", m), () => document.removeEventListener("pointerdown", m);
  }, [d]);
  const f = (m) => {
    var h;
    m.key === "Backspace" && !v && a.length > 0 && l(a[a.length - 1]), m.key === "Escape" && (x(!1), (h = j.current) == null || h.blur());
  };
  return /* @__PURE__ */ e.jsxs("div", { ref: u, className: "relative", children: [
    /* @__PURE__ */ e.jsxs(
      "div",
      {
        className: "flex min-h-9 w-full cursor-text flex-wrap items-center gap-1.5 rounded-md border border-transparent bg-gray-150 px-3 py-1 text-sm transition-colors focus-within:border-green focus-within:bg-transparent focus-within:shadow-[0_0_0_2px_rgba(48,207,67,.25)] dark:bg-gray-900",
        role: "combobox",
        onClick: () => {
          var m;
          (m = j.current) == null || m.focus(), x(!0);
        },
        children: [
          /* @__PURE__ */ e.jsx(Ue, { labels: s, onToggle: l }),
          /* @__PURE__ */ e.jsx(
            "input",
            {
              ref: j,
              className: "outline-hidden min-w-[80px] flex-1 bg-transparent text-sm placeholder:text-muted-foreground",
              placeholder: s.length === 0 ? "Search labels..." : "",
              value: v,
              onChange: (m) => {
                y(m.target.value), d || x(!0);
              },
              onFocus: () => x(!0),
              onKeyDown: f
            }
          )
        ]
      }
    ),
    d && /* @__PURE__ */ e.jsx("div", { className: "absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-white shadow-md dark:bg-gray-950", children: n ? /* @__PURE__ */ e.jsx("div", { className: "flex items-center justify-center py-6 text-sm text-muted-foreground", children: "Loading labels..." }) : /* @__PURE__ */ e.jsx(oe, { shouldFilter: !1, children: /* @__PURE__ */ e.jsx(ce, { className: "max-h-64 overflow-y-auto", children: /* @__PURE__ */ e.jsx(
      Ae,
      {
        canCreateFromSearch: r,
        isCreating: i,
        isDuplicateName: b,
        labels: t,
        search: v,
        selectedSlugs: a,
        onCreate: o,
        onDelete: p,
        onEdit: c,
        onSearchClear: () => y(""),
        onToggle: l
      }
    ) }) }) })
  ] });
}, ae = "LabelsResponseType", Be = ue({
  dataType: ae,
  path: "/labels/"
}), Ys = me({
  method: "POST",
  path: () => "/labels/",
  body: (t) => ({ labels: [t] }),
  updateQueries: {
    dataType: ae,
    emberUpdateType: "createOrUpdate",
    update: (t, s) => {
      const a = s;
      return a && { ...a, labels: a.labels.concat(t.labels) };
    }
  }
}), Ws = me({
  method: "PUT",
  path: (t) => `/labels/${t.id}/`,
  body: (t) => ({ labels: [t] }),
  updateQueries: {
    dataType: ae,
    emberUpdateType: "createOrUpdate",
    update: (t, s) => {
      const a = s;
      return a && {
        ...a,
        labels: a.labels.map((l) => t.labels.find(({ id: n }) => n === l.id) || l)
      };
    }
  }
}), Qs = me({
  method: "DELETE",
  path: (t) => `/labels/${t}/`,
  updateQueries: {
    dataType: ae,
    emberUpdateType: "delete",
    update: (t, s, a) => {
      const l = s;
      return l && { ...l, labels: l.labels.filter((n) => n.id !== a) };
    }
  }
});
function fe({
  selectedSlugs: t,
  onSelectionChange: s
}) {
  const { data: a, isLoading: l } = Be({ searchParams: { limit: "100" } }), n = F(() => (a == null ? void 0 : a.labels) || [], [a]), { mutateAsync: r, isLoading: o } = Ys(), { mutateAsync: i } = Ws(), { mutateAsync: c } = Qs(), p = D(t);
  p.current = t;
  const b = C((u) => {
    const f = p.current;
    f.includes(u) ? s(f.filter((m) => m !== u)) : s([...f, u]);
  }, [s]), d = C((u, f) => {
    const m = u.trim().toLowerCase();
    return n.some((h) => h.name.toLowerCase() === m && h.id !== f);
  }, [n]), x = C((u) => {
    const f = u.trim();
    return f ? !d(f) : !1;
  }, [d]), v = C(async (u) => {
    var N;
    const f = u.trim();
    if (!f || d(f))
      return;
    const m = await r({ name: f });
    return (N = m == null ? void 0 : m.labels) == null ? void 0 : N[0];
  }, [r, d]), y = C(async (u, f) => {
    var g;
    const m = f.trim();
    if (!m || d(m, u))
      return;
    const h = n.find((_) => _.id === u), N = await i({ id: u, name: m }), w = (g = N == null ? void 0 : N.labels) == null ? void 0 : g[0];
    if (h && w && h.slug !== w.slug) {
      const _ = p.current;
      _.includes(h.slug) && s(_.map((T) => T === h.slug ? w.slug : T));
    }
  }, [i, d, n, s]), j = C(async (u) => {
    const f = n.find((m) => m.id === u);
    if (await c(u), f) {
      const m = p.current;
      m.includes(f.slug) && s(m.filter((h) => h !== f.slug));
    }
  }, [c, n, s]);
  return {
    labels: n,
    selectedSlugs: t,
    isLoading: l,
    toggleLabel: b,
    createLabel: v,
    editLabel: y,
    deleteLabel: j,
    isDuplicateName: d,
    canCreateFromSearch: x,
    isCreating: o
  };
}
const Gs = ({ values: t, onChange: s }) => {
  const a = fe({
    selectedSlugs: t,
    onSelectionChange: s
  });
  return /* @__PURE__ */ e.jsx(
    pe,
    {
      isDuplicateName: a.isDuplicateName,
      labels: a.labels,
      selectedSlugs: a.selectedSlugs,
      inline: !0,
      onDelete: a.deleteLabel,
      onEdit: a.editLabel,
      onToggle: a.toggleLabel
    }
  );
};
function Hs({
  open: t,
  memberCount: s,
  onOpenChange: a,
  onConfirm: l,
  isLoading: n = !1
}) {
  const [r, o] = S([]), i = fe({
    selectedSlugs: r,
    onSelectionChange: o
  }), c = C((b) => {
    b || o([]), a(b);
  }, [a]), p = () => {
    const b = i.labels.filter((d) => r.includes(d.slug)).map((d) => d.id);
    b.length > 0 && l(b);
  };
  return /* @__PURE__ */ e.jsx(Z, { open: t, onOpenChange: c, children: /* @__PURE__ */ e.jsxs(q, { className: "gap-5", onOpenAutoFocus: (b) => b.preventDefault(), children: [
    /* @__PURE__ */ e.jsx(ee, { children: /* @__PURE__ */ e.jsxs(se, { children: [
      "Add label to ",
      s.toLocaleString(),
      " ",
      s === 1 ? "member" : "members"
    ] }) }),
    /* @__PURE__ */ e.jsx(
      pe,
      {
        canCreateFromSearch: i.canCreateFromSearch,
        isCreating: i.isCreating,
        isDuplicateName: i.isDuplicateName,
        isLoading: i.isLoading,
        labels: i.labels,
        selectedSlugs: i.selectedSlugs,
        onCreate: i.createLabel,
        onDelete: i.deleteLabel,
        onEdit: i.editLabel,
        onToggle: i.toggleLabel
      }
    ),
    /* @__PURE__ */ e.jsxs(te, { children: [
      /* @__PURE__ */ e.jsx(M, { variant: "outline", onClick: () => c(!1), children: "Cancel" }),
      /* @__PURE__ */ e.jsx(
        M,
        {
          disabled: r.length === 0 || n,
          onClick: p,
          children: n ? "Adding..." : r.length > 1 ? `Add ${r.length} labels` : "Add label"
        }
      )
    ] })
  ] }) });
}
function Xs({
  open: t,
  memberCount: s,
  nql: a,
  onOpenChange: l,
  onConfirm: n,
  isLoading: r = !1
}) {
  const [o, i] = S([]), { data: c, isLoading: p } = Ge({
    searchParams: {
      ...a ? { filter: a } : {},
      include: "labels",
      limit: "all",
      fields: "id"
    },
    enabled: t
  }), b = F(() => {
    const j = /* @__PURE__ */ new Set();
    for (const u of (c == null ? void 0 : c.members) || [])
      for (const f of u.labels || [])
        j.add(f.slug);
    return j;
  }, [c]), d = fe({
    selectedSlugs: o,
    onSelectionChange: i
  }), x = F(() => d.labels.filter((j) => b.has(j.slug)), [d.labels, b]), v = C((j) => {
    j || i([]), l(j);
  }, [l]), y = () => {
    const j = d.labels.filter((u) => o.includes(u.slug)).map((u) => u.id);
    j.length > 0 && n(j);
  };
  return /* @__PURE__ */ e.jsx(Z, { open: t, onOpenChange: v, children: /* @__PURE__ */ e.jsxs(q, { className: "gap-5", onOpenAutoFocus: (j) => j.preventDefault(), children: [
    /* @__PURE__ */ e.jsx(ee, { children: /* @__PURE__ */ e.jsxs(se, { children: [
      "Remove label from ",
      s.toLocaleString(),
      " ",
      s === 1 ? "member" : "members"
    ] }) }),
    /* @__PURE__ */ e.jsx(
      pe,
      {
        isDuplicateName: d.isDuplicateName,
        isLoading: d.isLoading || p,
        labels: x,
        selectedSlugs: d.selectedSlugs,
        onDelete: d.deleteLabel,
        onEdit: d.editLabel,
        onToggle: d.toggleLabel
      }
    ),
    /* @__PURE__ */ e.jsxs(te, { children: [
      /* @__PURE__ */ e.jsx(M, { variant: "outline", onClick: () => v(!1), children: "Cancel" }),
      /* @__PURE__ */ e.jsx(
        M,
        {
          disabled: o.length === 0 || r,
          onClick: y,
          children: r ? "Removing..." : o.length > 1 ? `Remove ${o.length} labels` : "Remove label"
        }
      )
    ] })
  ] }) });
}
function Js({
  open: t,
  newsletters: s,
  memberCount: a,
  onOpenChange: l,
  onConfirm: n,
  isLoading: r = !1
}) {
  const [o, i] = S("all"), [c, p] = S([]), [b, d] = S(""), [x, v] = S(!1), y = D(null), j = D(null);
  X(() => {
    t || (i("all"), p([]), d(""), v(!1));
  }, [t]), X(() => {
    if (!x)
      return;
    const g = (_) => {
      y.current && !y.current.contains(_.target) && v(!1);
    };
    return document.addEventListener("pointerdown", g), () => document.removeEventListener("pointerdown", g);
  }, [x]);
  const u = (g) => {
    g || (i("all"), p([]), d(""), v(!1)), l(g);
  }, f = C((g) => {
    p((_) => _.includes(g) ? _.filter((T) => T !== g) : [..._, g]);
  }, []), m = s.length >= 2, h = () => {
    n(!m || o === "all" ? null : c);
  }, N = r || m && o === "selected" && c.length === 0, w = a === 1 ? "member" : "members";
  return /* @__PURE__ */ e.jsx(Z, { open: t, onOpenChange: u, children: /* @__PURE__ */ e.jsxs(q, { className: "gap-5", children: [
    /* @__PURE__ */ e.jsx(ee, { children: /* @__PURE__ */ e.jsx(se, { children: "Unsubscribe members" }) }),
    m ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsxs("div", { "aria-label": "Unsubscribe scope", className: "flex flex-col gap-3", role: "radiogroup", children: [
        /* @__PURE__ */ e.jsxs("label", { className: "flex cursor-pointer items-start gap-3", children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              checked: o === "all",
              className: "mt-0.5 size-4 cursor-pointer accent-black",
              name: "unsubscribe-mode",
              type: "radio",
              value: "all",
              onChange: () => i("all")
            }
          ),
          /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-sm font-semibold", children: "Unsubscribe from all newsletters" }),
            /* @__PURE__ */ e.jsxs("span", { className: "text-sm text-muted-foreground", children: [
              a.toLocaleString(),
              " ",
              w,
              " will be unsubscribed from ",
              s.length,
              " ",
              s.length === 1 ? "newsletter" : "newsletters",
              "."
            ] })
          ] })
        ] }),
        /* @__PURE__ */ e.jsxs("label", { className: "flex cursor-pointer items-start gap-3", children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              checked: o === "selected",
              className: "mt-0.5 size-4 cursor-pointer accent-black",
              name: "unsubscribe-mode",
              type: "radio",
              value: "selected",
              onChange: () => i("selected")
            }
          ),
          /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ e.jsx("span", { className: "text-sm font-semibold", children: "Unsubscribe from selected newsletters" }),
            /* @__PURE__ */ e.jsxs("span", { className: "text-sm text-muted-foreground", children: [
              "Select which newsletters to unsubscribe ",
              a.toLocaleString(),
              " ",
              w,
              " from."
            ] })
          ] })
        ] })
      ] }),
      o === "selected" && /* @__PURE__ */ e.jsxs("div", { ref: y, className: "relative space-y-2", children: [
        /* @__PURE__ */ e.jsx("label", { className: "text-sm font-semibold", htmlFor: "newsletter-search", children: "Newsletters" }),
        /* @__PURE__ */ e.jsxs(
          "div",
          {
            className: "flex min-h-9 w-full cursor-text flex-wrap items-center gap-1.5 rounded-md border bg-background px-3 py-1 text-sm",
            onClick: () => {
              var g;
              (g = j.current) == null || g.focus(), v(!0);
            },
            children: [
              c.map((g) => {
                const _ = s.find((T) => T.id === g);
                return _ ? /* @__PURE__ */ e.jsxs(
                  Fe,
                  {
                    className: "cursor-pointer gap-1 pr-1",
                    variant: "outline",
                    onClick: (T) => {
                      T.stopPropagation(), f(g);
                    },
                    children: [
                      _.name,
                      /* @__PURE__ */ e.jsx(ie, { className: "size-3" })
                    ]
                  },
                  g
                ) : null;
              }),
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  ref: j,
                  className: "outline-hidden min-w-[80px] flex-1 bg-transparent py-1 text-sm placeholder:text-muted-foreground",
                  id: "newsletter-search",
                  placeholder: c.length === 0 ? "Search newsletters..." : "",
                  value: b,
                  onChange: (g) => {
                    d(g.target.value), x || v(!0);
                  },
                  onFocus: () => v(!0),
                  onKeyDown: (g) => {
                    var _;
                    g.key === "Escape" && (v(!1), (_ = j.current) == null || _.blur()), g.key === "Backspace" && !b && c.length > 0 && f(c[c.length - 1]);
                  }
                }
              )
            ]
          }
        ),
        x && /* @__PURE__ */ e.jsx("div", { className: "absolute left-0 top-full z-50 mt-1 w-full rounded-md border bg-white shadow-md dark:bg-gray-950", children: /* @__PURE__ */ e.jsx(oe, { shouldFilter: !1, children: /* @__PURE__ */ e.jsxs(ce, { className: "max-h-64 overflow-y-auto", children: [
          /* @__PURE__ */ e.jsx(Ie, { children: "No newsletters found." }),
          s.filter((g) => g.name.toLowerCase().includes(b.toLowerCase())).map((g) => /* @__PURE__ */ e.jsxs(
            de,
            {
              value: g.name,
              onSelect: () => f(g.id),
              children: [
                g.name,
                c.includes(g.id) && /* @__PURE__ */ e.jsx(as, {})
              ]
            },
            g.id
          ))
        ] }) }) })
      ] })
    ] }) : /* @__PURE__ */ e.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Are you sure you want to unsubscribe ",
      a.toLocaleString(),
      " ",
      w,
      " from all newsletters? They will no longer receive any email newsletters from you."
    ] }),
    /* @__PURE__ */ e.jsxs(te, { children: [
      /* @__PURE__ */ e.jsx(M, { variant: "outline", onClick: () => u(!1), children: "Cancel" }),
      /* @__PURE__ */ e.jsx(
        M,
        {
          disabled: N,
          variant: "destructive",
          onClick: h,
          children: r ? "Unsubscribing..." : "Unsubscribe"
        }
      )
    ] })
  ] }) });
}
function Zs({
  open: t,
  memberCount: s,
  onOpenChange: a,
  onConfirm: l,
  onExportBackup: n,
  isLoading: r = !1
}) {
  const [o, i] = S(!1), c = (b) => {
    b || i(!1), a(b);
  }, p = async () => {
    if (!(s < 1 || r || o))
      try {
        i(!0), await n(), l();
      } catch {
      } finally {
        i(!1);
      }
  };
  return /* @__PURE__ */ e.jsx(Z, { open: t, onOpenChange: c, children: /* @__PURE__ */ e.jsxs(q, { className: "gap-5", children: [
    /* @__PURE__ */ e.jsx(ee, { children: /* @__PURE__ */ e.jsx(se, { children: "Delete selected members?" }) }),
    /* @__PURE__ */ e.jsx("div", { className: "text-sm", children: s > 0 ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsxs("p", { children: [
        "You're about to delete ",
        /* @__PURE__ */ e.jsxs("strong", { children: [
          s.toLocaleString(),
          " ",
          s === 1 ? "member" : "members"
        ] }),
        ". This is permanent! All Ghost data will be deleted, this will have no effect on subscriptions in Stripe."
      ] }),
      /* @__PURE__ */ e.jsx("p", { className: "mt-4", children: "A backup of your selection will be automatically downloaded to your device before deletion." })
    ] }) : /* @__PURE__ */ e.jsx("p", { children: "No members are selected." }) }),
    /* @__PURE__ */ e.jsxs(te, { children: [
      /* @__PURE__ */ e.jsx(M, { variant: "outline", onClick: () => c(!1), children: "Cancel" }),
      /* @__PURE__ */ e.jsx(
        M,
        {
          disabled: r || o || s < 1,
          variant: "destructive",
          onClick: p,
          children: r || o ? "Deleting..." : "Download backup & delete members"
        }
      )
    ] })
  ] }) });
}
const qs = "NewslettersResponseType", Ve = ze({
  dataType: qs,
  path: "/newsletters/",
  defaultSearchParams: { include: "count.active_members,count.posts", limit: "50" },
  defaultNextPageParams: (t, s) => {
    var a;
    return {
      ...s,
      page: (((a = t.meta) == null ? void 0 : a.pagination.next) || 1).toString()
    };
  },
  returnData: (t) => {
    const { pages: s } = t, a = s.flatMap((n) => n.newsletters), l = s[s.length - 1].meta;
    return {
      newsletters: a,
      meta: l,
      isEnd: l ? l.pagination.pages === l.pagination.page : !0
    };
  }
});
async function Le(t) {
  const s = new URLSearchParams({ limit: "all" });
  t && s.set("filter", t);
  const a = (/* @__PURE__ */ new Date()).toJSON().substring(0, 10);
  await fs(`/members/upload/?${s}`, `members.${a}.csv`);
}
const et = ({
  isFiltered: t,
  memberCount: s,
  nql: a,
  canBulkDelete: l
}) => {
  const { data: n, isLoading: r } = Ve({
    searchParams: { filter: "status:-archived", limit: "50" }
  }), o = (n == null ? void 0 : n.newsletters) || [], { mutateAsync: i, isLoading: c } = He(), { mutate: p, isLoading: b } = Xe(), [d, x] = S(!1), [v, y] = S(!1), [j, u] = S(!1), [f, m] = S(!1), [h, N] = S(!1), w = C(async () => {
    try {
      await Le(a);
    } catch (L) {
      throw O.error("Export failed", {
        description: "There was a problem downloading your member data. Please check your connection and try again."
      }), L;
    }
  }, [a]), g = C(async (L) => {
    try {
      for (const P of L)
        await i({
          filter: a || "",
          all: !a,
          action: {
            type: "addLabel",
            meta: { label: { id: P } }
          }
        });
      y(!1), O.success(L.length > 1 ? "Labels added successfully" : "Label added successfully");
    } catch {
      O.error("Failed to add label", {
        description: "There was a problem applying this label. Please try again."
      });
    }
  }, [i, a]), _ = C(async (L) => {
    try {
      for (const P of L)
        await i({
          filter: a || "",
          all: !a,
          action: {
            type: "removeLabel",
            meta: { label: { id: P } }
          }
        });
      u(!1), O.success(L.length > 1 ? "Labels removed successfully" : "Label removed successfully");
    } catch {
      O.error("Failed to remove label", {
        description: "There was a problem removing this label. Please try again."
      });
    }
  }, [i, a]), T = C(async (L) => {
    const P = {
      filter: a || "",
      all: !a
    };
    if (L === null) {
      try {
        await i({
          ...P,
          action: { type: "unsubscribe" }
        }), m(!1), O.success("Members unsubscribed successfully");
      } catch {
        O.error("Failed to unsubscribe members", {
          description: "There was a problem unsubscribing these members. Please try again."
        });
      }
      return;
    }
    x(!0);
    try {
      const k = await Promise.allSettled(
        L.map((V) => i({
          ...P,
          action: { type: "unsubscribe", newsletter: V }
        }))
      ), $ = k.filter((V) => V.status === "fulfilled").length, A = k.length;
      m(!1), $ === A ? O.success(`Unsubscribed from ${A} ${A === 1 ? "newsletter" : "newsletters"}`) : $ > 0 ? O.warning(`Unsubscribed from ${$} of ${A} newsletters`, {
        description: "Some newsletters could not be unsubscribed. Please try again."
      }) : O.error("Failed to unsubscribe members", {
        description: "There was a problem unsubscribing these members. Please try again."
      });
    } catch {
      O.error("Failed to unsubscribe members", {
        description: "There was a problem unsubscribing these members. Please try again."
      });
    } finally {
      x(!1);
    }
  }, [i, a]), B = C(() => {
    p({
      filter: a || "",
      all: !a
    }, {
      onSuccess: () => {
        N(!1), O.success("Members deleted successfully");
      },
      onError: () => {
        O.error("Failed to delete members", {
          description: "There was a problem deleting these members. Please try again."
        });
      }
    });
  }, [p, a]), z = C(async () => {
    try {
      await Le(a);
    } catch (L) {
      throw O.error("Export failed", {
        description: "There was a problem downloading your backup. Please check your connection and try again."
      }), L;
    }
  }, [a]);
  return /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
    /* @__PURE__ */ e.jsxs(hs, { children: [
      /* @__PURE__ */ e.jsx(bs, { asChild: !0, children: /* @__PURE__ */ e.jsx(M, { variant: "outline", children: /* @__PURE__ */ e.jsx(gs, { className: "size-4" }) }) }),
      /* @__PURE__ */ e.jsx(xs, { align: "end", children: s > 0 && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
        /* @__PURE__ */ e.jsxs(W, { onClick: w, children: [
          /* @__PURE__ */ e.jsx(js, { className: "mr-2 size-4" }),
          t ? `Export ${s.toLocaleString()} members` : "Export all members"
        ] }),
        /* @__PURE__ */ e.jsx(ye, {}),
        /* @__PURE__ */ e.jsxs(W, { onClick: () => y(!0), children: [
          /* @__PURE__ */ e.jsx(ps, { className: "mr-2 size-4" }),
          "Add label to ",
          s.toLocaleString(),
          " ",
          s === 1 ? "member" : "members"
        ] }),
        /* @__PURE__ */ e.jsxs(W, { onClick: () => u(!0), children: [
          /* @__PURE__ */ e.jsx(Re, { className: "mr-2 size-4" }),
          "Remove label from ",
          s.toLocaleString(),
          " ",
          s === 1 ? "member" : "members"
        ] }),
        /* @__PURE__ */ e.jsxs(
          W,
          {
            disabled: r,
            onClick: () => m(!0),
            children: [
              /* @__PURE__ */ e.jsx(ys, { className: "mr-2 size-4" }),
              "Unsubscribe ",
              s.toLocaleString(),
              " ",
              s === 1 ? "member" : "members"
            ]
          }
        ),
        /* @__PURE__ */ e.jsx(ye, {}),
        /* @__PURE__ */ e.jsxs(
          W,
          {
            className: "text-destructive focus:text-destructive",
            disabled: !l,
            onClick: () => N(!0),
            children: [
              /* @__PURE__ */ e.jsx(ws, { className: "mr-2 size-4" }),
              "Delete ",
              s.toLocaleString(),
              " ",
              s === 1 ? "member" : "members"
            ]
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ e.jsx(M, { asChild: !0, children: /* @__PURE__ */ e.jsx("a", { className: "font-bold", href: "#/members/new", children: "New member" }) }),
    /* @__PURE__ */ e.jsx(
      Hs,
      {
        isLoading: c,
        memberCount: s,
        open: v,
        onConfirm: g,
        onOpenChange: y
      }
    ),
    /* @__PURE__ */ e.jsx(
      Xs,
      {
        isLoading: c,
        memberCount: s,
        nql: a,
        open: j,
        onConfirm: _,
        onOpenChange: u
      }
    ),
    /* @__PURE__ */ e.jsx(
      Js,
      {
        isLoading: c || d,
        memberCount: s,
        newsletters: o,
        open: f,
        onConfirm: T,
        onOpenChange: m
      }
    ),
    /* @__PURE__ */ e.jsx(
      Zs,
      {
        isLoading: b,
        memberCount: s,
        open: h,
        onConfirm: B,
        onExportBackup: z,
        onOpenChange: N
      }
    )
  ] });
}, st = ({ children: t, className: s, ...a }) => /* @__PURE__ */ e.jsx("section", { className: Oe("flex gap-6 flex-col p-4 lg:p-8 size-full grow", s), ...a, children: t }), tt = "TiersResponseType", at = ze({
  dataType: tt,
  path: "/tiers/",
  defaultNextPageParams: (t, s) => {
    var a;
    return {
      ...s,
      page: (((a = t.meta) == null ? void 0 : a.pagination.next) || 1).toString()
    };
  },
  returnData: (t) => {
    const { pages: s } = t, a = s.flatMap((n) => n.tiers), l = s[s.length - 1].meta;
    return {
      tiers: a,
      meta: l,
      isEnd: l ? l.pagination.pages === l.pagination.page : !0
    };
  }
}), lt = [
  { value: "paid", label: "Paid" },
  { value: "free", label: "Free" },
  { value: "comped", label: "Complimentary" }
], nt = [
  { value: "subscribed", label: "Subscribed" },
  { value: "unsubscribed", label: "Unsubscribed" },
  { value: "email-disabled", label: "Email disabled" }
], rt = [
  { value: "subscribed", label: "Subscribed to at least one" },
  { value: "unsubscribed", label: "Unsubscribed from all" },
  { value: "email-disabled", label: "Email disabled" }
], it = [
  { value: "month", label: "Monthly" },
  { value: "year", label: "Yearly" }
], ot = [
  { value: "active", label: "Active" },
  { value: "trialing", label: "Trialing" },
  { value: "canceled", label: "Canceled" },
  { value: "unpaid", label: "Unpaid" },
  { value: "past_due", label: "Past Due" },
  { value: "incomplete", label: "Incomplete" },
  { value: "incomplete_expired", label: "Incomplete - Expired" }
], I = [
  { value: "is", label: "is" },
  { value: "is-not", label: "is not" }
], Ce = [
  { value: "is", label: "is" },
  { value: "contains", label: "contains" },
  { value: "does-not-contain", label: "does not contain" },
  { value: "starts-with", label: "starts with" },
  { value: "ends-with", label: "ends with" }
], H = [
  { value: "is-less", label: "before" },
  { value: "is-or-less", label: "on or before" },
  { value: "is-greater", label: "after" },
  { value: "is-or-greater", label: "on or after" }
], re = [
  { value: "is", label: "is" },
  { value: "is-greater", label: "is greater than" },
  { value: "is-less", label: "is less than" }
], ct = [
  { value: "1", label: "More like this" },
  { value: "0", label: "Less like this" }
];
function dt({
  labels: t = [],
  tiers: s = [],
  newsletters: a = [],
  hasMultipleTiers: l = !1,
  paidMembersEnabled: n = !1,
  emailAnalyticsEnabled: r = !1,
  labelsOptions: o = [],
  tiersOptions: i = [],
  onTiersSearchChange: c,
  tiersSearchValue: p,
  tiersLoading: b = !1,
  offersOptions: d = [],
  hasOffers: x = !1,
  postResourceOptions: v = [],
  onPostResourceSearchChange: y,
  postResourceSearchValue: j,
  postResourceLoading: u = !1,
  emailResourceOptions: f = [],
  onEmailResourceSearchChange: m,
  emailResourceSearchValue: h,
  emailResourceLoading: N = !1,
  membersTrackSources: w = !1,
  emailTrackOpens: g = !1,
  emailTrackClicks: _ = !1,
  audienceFeedbackEnabled: T = !1,
  siteTimezone: B = "Etc/UTC"
}) {
  return F(() => {
    const z = [], L = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: B })).toISOString().split("T")[0], P = [];
    if (P.push({
      key: "name",
      label: "Name",
      type: "text",
      icon: /* @__PURE__ */ e.jsx(vs, { className: "size-4" }),
      placeholder: "Enter name...",
      operators: Ce,
      defaultOperator: "is",
      className: "w-48"
    }), P.push({
      key: "email",
      label: "Email",
      type: "text",
      icon: /* @__PURE__ */ e.jsx(ne, { className: "size-4" }),
      placeholder: "Enter email...",
      operators: Ce,
      defaultOperator: "is",
      className: "w-64"
    }), (t.length > 0 || o.length > 0) && P.push({
      key: "label",
      label: "Label",
      type: "select",
      icon: /* @__PURE__ */ e.jsx(Re, { className: "size-4" }),
      options: o.length > 0 ? o : t.map((k) => ({
        value: k.slug,
        label: k.name
      })),
      customRenderer: (k) => Ye.createElement(Gs, k),
      defaultOperator: "is_any_of",
      hideOperatorSelect: !0,
      searchable: !0,
      className: "w-64"
    }), a.length <= 1 && P.push({
      key: "subscribed",
      label: "Newsletter subscription",
      type: "select",
      icon: /* @__PURE__ */ e.jsx(ne, { className: "size-4" }),
      options: nt,
      operators: I,
      searchable: !1
    }), P.push({
      key: "last_seen_at",
      label: "Last seen",
      type: "date",
      icon: /* @__PURE__ */ e.jsx(is, { className: "size-4" }),
      operators: H,
      defaultOperator: "is-or-less",
      defaultValue: L,
      className: "w-40"
    }), P.push({
      key: "created_at",
      label: "Created",
      type: "date",
      icon: /* @__PURE__ */ e.jsx(os, { className: "size-4" }),
      operators: H,
      defaultOperator: "is-or-less",
      defaultValue: L,
      className: "w-40"
    }), w && P.push({
      key: "signup",
      label: "Signed up on post/page",
      type: "select",
      icon: /* @__PURE__ */ e.jsx($s, { className: "size-4" }),
      options: v,
      operators: I,
      searchable: !0,
      onSearchChange: y,
      searchValue: j,
      isLoading: u,
      placeholder: "Select a post or page...",
      className: "w-64"
    }), z.push({
      group: "Basic",
      fields: P
    }), a.length > 1) {
      const k = [];
      k.push({
        key: "subscribed",
        label: "All newsletters",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(ne, { className: "size-4" }),
        options: rt,
        operators: I,
        searchable: !1
      }), a.forEach(($) => {
        k.push({
          key: `newsletters.${$.slug}`,
          label: $.name,
          type: "select",
          icon: /* @__PURE__ */ e.jsx(Ns, { className: "size-4" }),
          options: [
            { value: "subscribed", label: "Subscribed" },
            { value: "unsubscribed", label: "Unsubscribed" }
          ],
          operators: [{ value: "is", label: "is" }],
          searchable: !1,
          hideOperatorSelect: !0
        });
      }), z.push({
        group: "Newsletters",
        fields: k
      });
    }
    if (n) {
      const k = [];
      l && k.push({
        key: "tier_id",
        label: "Membership tier",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(we, { className: "size-4" }),
        options: i.length > 0 ? i : s.map(($) => ({
          value: $.id,
          label: $.name
        })),
        operators: I,
        searchable: !0,
        onSearchChange: c,
        searchValue: p,
        isLoading: b,
        className: "w-64"
      }), k.push({
        key: "status",
        label: "Member status",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(_s, { className: "size-4" }),
        options: lt,
        operators: I,
        searchable: !1
      }), k.push({
        key: "subscriptions.plan_interval",
        label: "Billing period",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(ks, { className: "size-4" }),
        options: it,
        operators: I,
        searchable: !1
      }), k.push({
        key: "subscriptions.status",
        label: "Stripe subscription status",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(we, { className: "size-4" }),
        options: ot,
        operators: I,
        searchable: !1
      }), k.push({
        key: "subscriptions.start_date",
        label: "Paid start date",
        type: "date",
        icon: /* @__PURE__ */ e.jsx(Ss, { className: "size-4" }),
        operators: H,
        defaultOperator: "is-or-less",
        defaultValue: L,
        className: "w-40"
      }), k.push({
        key: "subscriptions.current_period_end",
        label: "Next billing date",
        type: "date",
        icon: /* @__PURE__ */ e.jsx(Ls, { className: "size-4" }),
        operators: H,
        defaultOperator: "is-or-less",
        defaultValue: L,
        className: "w-40"
      }), w && k.push({
        key: "conversion",
        label: "Subscription started on post/page",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(Cs, { className: "size-4" }),
        options: v,
        operators: I,
        searchable: !0,
        onSearchChange: y,
        searchValue: j,
        isLoading: u,
        placeholder: "Select a post or page...",
        className: "w-64"
      }), x && k.push({
        key: "offer_redemptions",
        label: "Offer",
        type: "multiselect",
        icon: /* @__PURE__ */ e.jsx(Ps, { className: "size-4" }),
        options: d,
        defaultOperator: "is_any_of",
        hideOperatorSelect: !0,
        autoCloseOnSelect: !0,
        searchable: !0,
        className: "w-64"
      }), z.push({
        group: "Subscription",
        fields: k
      });
    }
    if (r) {
      const k = [];
      k.push({
        key: "email_count",
        label: "Emails sent (all time)",
        type: "number",
        icon: /* @__PURE__ */ e.jsx(Ne, { className: "size-4" }),
        operators: re,
        defaultOperator: "is",
        defaultValue: 0,
        min: 0,
        className: "w-24"
      }), k.push({
        key: "email_opened_count",
        label: "Emails opened (all time)",
        type: "number",
        icon: /* @__PURE__ */ e.jsx(_e, { className: "size-4" }),
        operators: re,
        defaultOperator: "is",
        defaultValue: 0,
        min: 0,
        className: "w-24"
      }), g && k.push({
        key: "email_open_rate",
        label: "Open rate (all time)",
        type: "number",
        icon: /* @__PURE__ */ e.jsx(Es, { className: "size-4" }),
        operators: re,
        defaultOperator: "is",
        defaultValue: 0,
        min: 0,
        max: 100,
        suffix: "%",
        className: "w-24"
      }), k.push({
        key: "emails.post_id",
        label: "Sent email",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(Ne, { className: "size-4" }),
        options: f,
        operators: I,
        searchable: !0,
        onSearchChange: m,
        searchValue: h,
        isLoading: N,
        placeholder: "Select an email...",
        className: "w-64"
      }), g && k.push({
        key: "opened_emails.post_id",
        label: "Opened email",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(_e, { className: "size-4" }),
        options: f,
        operators: I,
        searchable: !0,
        onSearchChange: m,
        searchValue: h,
        isLoading: N,
        placeholder: "Select an email...",
        className: "w-64"
      }), _ && k.push({
        key: "clicked_links.post_id",
        label: "Clicked email",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(Ms, { className: "size-4" }),
        options: f,
        operators: I,
        searchable: !0,
        onSearchChange: m,
        searchValue: h,
        isLoading: N,
        placeholder: "Select an email...",
        className: "w-64"
      }), T && k.push({
        key: "newsletter_feedback",
        label: "Responded with feedback",
        type: "select",
        icon: /* @__PURE__ */ e.jsx(cs, { className: "size-4" }),
        options: f,
        operators: ct,
        defaultOperator: "1",
        searchable: !0,
        onSearchChange: m,
        searchValue: h,
        isLoading: N,
        placeholder: "Select an email...",
        className: "w-64"
      }), z.push({
        group: "Email",
        fields: k
      });
    }
    return z;
  }, [
    t,
    s,
    a,
    l,
    n,
    r,
    o,
    i,
    c,
    p,
    b,
    d,
    x,
    v,
    y,
    j,
    u,
    f,
    m,
    h,
    N,
    w,
    g,
    _,
    T,
    B
  ]);
}
const ut = "PagesResponseType", mt = ue({
  dataType: ut,
  path: "/pages/"
});
function Pe(t, s) {
  return s ? `${t}+title:~'${s.replace(/'/g, "\\'")}'` : t;
}
function Ee(t) {
  const [s, a] = S(""), l = t === "post", n = Pe(
    l ? "status:published" : "(status:published,status:sent)+newsletter_id:-null",
    s
  ), { data: r, isLoading: o } = Fs({
    searchParams: {
      filter: n,
      limit: "25",
      fields: "id,title",
      order: "published_at DESC"
    }
  }), { data: i, isLoading: c } = mt({
    searchParams: {
      filter: Pe("status:published", s),
      limit: "25",
      fields: "id,title",
      order: "published_at DESC"
    },
    enabled: l
  }), p = F(() => {
    const d = (r == null ? void 0 : r.posts) || [];
    if (!l)
      return d.map((y) => ({
        value: y.id,
        label: y.title
      }));
    const x = (i == null ? void 0 : i.pages) || [], v = [];
    for (const y of d)
      v.push({ value: y.id, label: y.title });
    for (const y of x)
      v.push({ value: y.id, label: y.title, detail: "Page" });
    return v;
  }, [r, i, l]), b = C((d) => {
    a(d);
  }, []);
  return {
    options: p,
    isLoading: o || l && c,
    searchValue: s,
    onSearchChange: b
  };
}
function pt(t) {
  const s = /* @__PURE__ */ new Map(), a = [], l = [];
  for (const n of t)
    n.redemption_type === "retention" && (n.cadence === "month" ? a.push(n.id) : n.cadence === "year" && l.push(n.id));
  return a.length > 0 && s.set("retention:month", a), l.length > 0 && s.set("retention:year", l), s;
}
function ft(t, s, a) {
  const l = [];
  for (const n of t)
    s && n.redemption_type === "retention" || l.push({ value: n.id, label: n.name });
  return s && (a.has("retention:month") && l.push({ value: "retention:month", label: "Monthly Retention" }), a.has("retention:year") && l.push({ value: "retention:year", label: "Yearly Retention" })), l;
}
const Me = ({
  filters: t,
  onFiltersChange: s
}) => {
  var A, V, he, be, ge;
  const { data: a } = Be({ searchParams: { limit: "100" } }), { data: l } = at({ searchParams: { limit: "100" } }), { data: n } = Ds({}), { data: r } = Ve({ searchParams: { limit: "100" } }), { data: o } = Ts({}), { data: i } = De({}), c = (o == null ? void 0 : o.settings) || [], p = G(c, "paid_members_enabled") === !0, b = ((A = i == null ? void 0 : i.config) == null ? void 0 : A.emailAnalytics) === !0, d = G(c, "members_track_sources") === !0, x = G(c, "email_track_opens") === !0, v = G(c, "email_track_clicks") === !0, y = ((he = (V = i == null ? void 0 : i.config) == null ? void 0 : V.labs) == null ? void 0 : he.audienceFeedback) === !0, j = ((ge = (be = i == null ? void 0 : i.config) == null ? void 0 : be.labs) == null ? void 0 : ge.retentionOffers) === !0, u = Os(c), f = (a == null ? void 0 : a.labels) || [], m = (l == null ? void 0 : l.tiers) || [], h = (r == null ? void 0 : r.newsletters) || [], N = (n == null ? void 0 : n.offers) || [], w = m.filter((E) => E.type === "paid" && E.active), g = w.length > 1, _ = F(() => j ? pt(N) : /* @__PURE__ */ new Map(), [N, j]), T = F(() => ft(N, j, _), [N, j, _]), B = F(() => _.size === 0 ? t : t.map((E) => {
    if (E.field !== "offer_redemptions")
      return E;
    const Q = [...E.values], R = [], K = /* @__PURE__ */ new Set();
    for (const [U, Y] of _)
      Y.length > 0 && Y.every((le) => Q.includes(le)) && (R.push(U), Y.forEach((le) => K.add(le)));
    for (const U of Q)
      K.has(U) || R.push(U);
    return { ...E, values: R };
  }), [t, _]), z = C((E) => {
    if (_.size === 0) {
      s(E);
      return;
    }
    const Q = E.map((R) => {
      if (R.field !== "offer_redemptions")
        return R;
      const K = [];
      for (const U of R.values) {
        const Y = _.get(U);
        Y ? K.push(...Y) : K.push(U);
      }
      return { ...R, values: [...new Set(K)] };
    });
    s(Q);
  }, [s, _]), L = Ee("post"), P = Ee("email"), k = dt({
    labels: f,
    tiers: w,
    newsletters: h.filter((E) => E.status === "active"),
    hasMultipleTiers: g,
    paidMembersEnabled: p,
    emailAnalyticsEnabled: b,
    labelsOptions: f.map((E) => ({ value: E.slug, label: E.name })),
    tiersOptions: w.map((E) => ({ value: E.id, label: E.name })),
    offersOptions: T,
    hasOffers: N.length > 0,
    postResourceOptions: L.options,
    onPostResourceSearchChange: L.onSearchChange,
    postResourceSearchValue: L.searchValue,
    postResourceLoading: L.isLoading,
    emailResourceOptions: P.options,
    onEmailResourceSearchChange: P.onSearchChange,
    emailResourceSearchValue: P.searchValue,
    emailResourceLoading: P.isLoading,
    membersTrackSources: d,
    emailTrackOpens: x,
    emailTrackClicks: v,
    audienceFeedbackEnabled: y,
    siteTimezone: u
  }), $ = t.length > 0;
  return /* @__PURE__ */ e.jsx(
    ls,
    {
      addButtonIcon: $ ? /* @__PURE__ */ e.jsx(ds, {}) : /* @__PURE__ */ e.jsx(us, {}),
      addButtonText: $ ? "Add filter" : "Filter",
      allowMultiple: !0,
      className: `[&>button]:order-last ${$ ? "[&>button]:border-none" : "w-auto"}`,
      clearButtonClassName: "font-normal text-muted-foreground",
      clearButtonIcon: /* @__PURE__ */ e.jsx(ie, {}),
      clearButtonText: "Clear",
      fields: k,
      filters: B,
      keyboardShortcut: "f",
      popoverAlign: $ ? "start" : "end",
      showClearButton: $,
      showSearchInput: !1,
      onChange: z
    }
  );
}, ht = ({
  children: t,
  totalMembers: s,
  isLoading: a
}) => /* @__PURE__ */ e.jsxs(J, { className: "pb-6! relative md:sticky", variant: "inline-nav", children: [
  /* @__PURE__ */ e.jsxs(J.Title, { children: [
    "Members ",
    !a && /* @__PURE__ */ e.jsx("span", { className: "font-normal text-muted-foreground", children: s.toLocaleString() })
  ] }),
  t
] }), bt = ({ children: t }) => /* @__PURE__ */ e.jsx("div", { className: "size-full", children: /* @__PURE__ */ e.jsx("div", { className: "relative flex size-full flex-col", children: /* @__PURE__ */ e.jsx("div", { className: "grid w-full grow", children: /* @__PURE__ */ e.jsx("div", { className: "flex h-full flex-col", "data-testid": "members-page", children: t }) }) }) });
function gt(t) {
  if (!t)
    return { text: "Unknown", isKnown: !1 };
  try {
    const s = JSON.parse(t);
    return s.country ? s.country_code === "US" && s.region ? { text: `${s.region}, US`, isKnown: !0 } : { text: s.country, isKnown: !0 } : { text: "Unknown", isKnown: !1 };
  } catch {
    return { text: "Unknown", isKnown: !1 };
  }
}
function xt(t) {
  switch (t) {
    case "paid":
      return "Paid";
    case "comped":
      return "Complimentary";
    default:
      return "Free";
  }
}
function vt({ item: t }) {
  return /* @__PURE__ */ e.jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ e.jsx(
      Je,
      {
        avatarImage: t.avatar_image,
        className: "size-10 min-w-10 md:size-10 md:min-w-10",
        memberId: t.id
      }
    ),
    /* @__PURE__ */ e.jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ e.jsx("div", { className: "truncate font-medium", children: t.name || t.email || "Anonymous" }),
      t.name && t.email && /* @__PURE__ */ e.jsx("div", { className: "truncate text-sm text-muted-foreground", "data-testid": "member-email", children: t.email })
    ] })
  ] });
}
function jt({ status: t, tiers: s }) {
  const a = s == null ? void 0 : s.map((l) => l.name).join(", ");
  return /* @__PURE__ */ e.jsx("div", { className: "flex justify-end lg:justify-start", children: /* @__PURE__ */ e.jsxs("div", { className: "min-w-0", children: [
    /* @__PURE__ */ e.jsx("div", { className: "text-sm", children: xt(t) }),
    a && /* @__PURE__ */ e.jsx("div", { className: "truncate text-xs text-muted-foreground", children: a })
  ] }) });
}
function yt({ emailOpenRate: t }) {
  const s = t != null;
  return /* @__PURE__ */ e.jsx("div", { className: `hidden text-sm lg:block ${s ? "text-foreground" : "text-muted-foreground"}`, children: s ? `${Math.round(t)}%` : "N/A" });
}
function wt({ geolocation: t }) {
  const s = gt(t);
  return /* @__PURE__ */ e.jsx("div", { className: `hidden truncate text-sm lg:block ${s.isKnown ? "text-foreground" : "text-muted-foreground"}`, children: s.text });
}
function Nt({ createdAt: t }) {
  return /* @__PURE__ */ e.jsxs("div", { className: "hidden lg:block", children: [
    /* @__PURE__ */ e.jsx("div", { className: "text-sm", children: xe.utc(t).format("D MMM YYYY") }),
    /* @__PURE__ */ e.jsx("div", { className: "text-xs text-muted-foreground", children: xe.utc(t).fromNow() })
  ] });
}
function _t({ item: t, gridCols: s, showEmailOpenRate: a, onClick: l, ...n }) {
  return /* @__PURE__ */ e.jsxs(
    "div",
    {
      ...n,
      className: `hover:bg-muted/50 grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_7rem] items-center gap-2 border-b px-4 py-3 lg:gap-4 ${s}`,
      "data-testid": "members-list-item",
      onClick: () => l(t.id),
      children: [
        /* @__PURE__ */ e.jsx(vt, { item: t }),
        /* @__PURE__ */ e.jsx(jt, { status: t.status, tiers: t.tiers }),
        a && /* @__PURE__ */ e.jsx(yt, { emailOpenRate: t.email_open_rate }),
        /* @__PURE__ */ e.jsx(wt, { geolocation: t.geolocation }),
        /* @__PURE__ */ e.jsx(Nt, { createdAt: t.created_at })
      ]
    }
  );
}
const Te = ({ height: t }) => /* @__PURE__ */ e.jsx("div", { "aria-hidden": "true", className: "flex", children: /* @__PURE__ */ e.jsx("div", { className: "flex", style: { height: t } }) }), kt = We(function(s, a) {
  return /* @__PURE__ */ e.jsx(
    "div",
    {
      ref: a,
      ...s,
      "aria-hidden": "true",
      className: "relative flex flex-col",
      children: /* @__PURE__ */ e.jsx("div", { className: "relative z-10 h-[72px] animate-pulse", children: /* @__PURE__ */ e.jsx("div", { className: "h-full rounded-md bg-muted", "data-testid": "loading-placeholder" }) })
    }
  );
});
function St({
  items: t,
  totalItems: s,
  hasNextPage: a,
  isFetchingNextPage: l,
  fetchNextPage: n,
  isLoading: r,
  showEmailOpenRate: o = !0,
  onRowClick: i
}) {
  const c = D(null);
  Ze({ parentRef: c, isLoading: r });
  const { visibleItems: p, spaceBefore: b, spaceAfter: d } = Is({
    items: t,
    totalItems: s,
    hasNextPage: a,
    isFetchingNextPage: l,
    fetchNextPage: n,
    parentRef: c,
    estimateSize: () => 72
    // Approximate row height
  }), x = (u) => {
    i ? i(u) : window.location.hash = `/members/${u}`;
  }, j = o ? "lg:grid-cols-[3fr_1fr_1fr_1.5fr_1.5fr]" : "lg:grid-cols-[3fr_1fr_1.5fr_1.5fr]";
  return /* @__PURE__ */ e.jsx("div", { ref: c, className: "overflow-hidden", children: /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col", "data-testid": "members-list", children: [
    /* @__PURE__ */ e.jsxs("div", { className: `sticky top-0 z-10 hidden border-b bg-background lg:grid lg:gap-4 lg:px-4 lg:py-3 ${j}`, children: [
      /* @__PURE__ */ e.jsx("div", { className: "text-xs font-medium uppercase tracking-wide text-gray-700", children: "Member" }),
      /* @__PURE__ */ e.jsx("div", { className: "text-xs font-medium uppercase tracking-wide text-gray-700", children: "Status" }),
      o && /* @__PURE__ */ e.jsx("div", { className: "text-xs font-medium uppercase tracking-wide text-gray-700", children: "Open rate" }),
      /* @__PURE__ */ e.jsx("div", { className: "text-xs font-medium uppercase tracking-wide text-gray-700", children: "Location" }),
      /* @__PURE__ */ e.jsx("div", { className: "text-xs font-medium uppercase tracking-wide text-gray-700", children: "Created" })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ e.jsx(Te, { height: b }),
      p.map(({ key: u, virtualItem: f, item: m, props: h }) => f.index > t.length - 1 ? /* @__PURE__ */ e.jsx(kt, { ...h }, u) : /* @__PURE__ */ e.jsx(
        _t,
        {
          ...h,
          gridCols: j,
          item: m,
          showEmailOpenRate: o,
          onClick: x
        },
        u
      )),
      /* @__PURE__ */ e.jsx(Te, { height: d })
    ] })
  ] }) });
}
const Lt = [
  // Basic filters
  "name",
  "email",
  "label",
  "subscribed",
  "last_seen_at",
  "created_at",
  "signup",
  // Newsletter filters (dynamic, prefixed with newsletters.slug:)
  "newsletters",
  // Subscription filters
  "tier_id",
  "status",
  "subscriptions.plan_interval",
  "subscriptions.status",
  "subscriptions.start_date",
  "subscriptions.current_period_end",
  "conversion",
  // Email filters
  "email_count",
  "email_opened_count",
  "email_open_rate",
  "emails.post_id",
  "opened_emails.post_id",
  "clicked_links.post_id",
  "newsletter_feedback",
  // Optional
  "offer_redemptions"
], Ke = /* @__PURE__ */ new Set(["label", "offer_redemptions"]);
function Ct(t) {
  return "'" + t.replace(/'/g, "\\'") + "'";
}
function Pt(t) {
  return {
    "is-less": "<",
    "is-or-less": "<=",
    is: "",
    "is-not": "-",
    "is-greater": ">",
    "is-or-greater": ">=",
    contains: "~",
    "does-not-contain": "-~",
    "starts-with": "~^",
    "ends-with": "~$",
    // Shade filter operators (mapped to our internal names)
    before: "<",
    after: ">",
    is_not: "-",
    is_any_of: "",
    is_not_any_of: "-",
    greater_than: ">",
    less_than: "<",
    equals: "",
    not_equals: "-"
  }[t] ?? "";
}
function Et(t) {
  const s = [];
  for (const a of t) {
    if (!a.values[0] && a.values[0] !== 0)
      continue;
    const l = a.field, n = a.operator, r = a.values[0], o = Pt(n);
    if (l.startsWith("newsletters.")) {
      const i = l.replace("newsletters.", "");
      String(r) === "subscribed" ? s.push(`(newsletters.slug:${i}+email_disabled:0)`) : s.push(`(newsletters.slug:-${i},email_disabled:1)`);
      continue;
    }
    switch (l) {
      case "name":
      case "email": {
        const i = Ct(String(r));
        s.push(`${l}:${o}${i}`);
        break;
      }
      case "label":
      case "tier_id":
      case "offer_redemptions": {
        if (Array.isArray(a.values) && a.values.length > 0) {
          const i = "[" + a.values.join(",") + "]";
          s.push(`${l}:${o}${i}`);
        } else r && s.push(`${l}:${o}${r}`);
        break;
      }
      case "status": {
        s.push(`status:${o}${r}`);
        break;
      }
      case "subscribed": {
        r === "email-disabled" ? n === "is" ? s.push("(email_disabled:1)") : s.push("(email_disabled:0)") : n === "is" || n === "is_any_of" ? r === "subscribed" ? s.push("(subscribed:true+email_disabled:0)") : s.push("(subscribed:false+email_disabled:0)") : r === "subscribed" ? s.push("(subscribed:false,email_disabled:1)") : s.push("(subscribed:true,email_disabled:1)");
        break;
      }
      case "newsletters": {
        const [i, c] = String(r).split(":");
        c === "subscribed" || n === "is" && c !== "unsubscribed" ? s.push(`(newsletters.slug:${i}+email_disabled:0)`) : s.push(`(newsletters.slug:-${i},email_disabled:1)`);
        break;
      }
      case "last_seen_at":
      case "created_at":
      case "subscriptions.start_date":
      case "subscriptions.current_period_end": {
        const i = String(r);
        s.push(`${l}:${o}'${i}'`);
        break;
      }
      case "email_count":
      case "email_opened_count":
      case "email_open_rate": {
        s.push(`${l}:${o}${r}`);
        break;
      }
      case "subscriptions.plan_interval": {
        s.push(`subscriptions.plan_interval:${o}${r}`);
        break;
      }
      case "subscriptions.status": {
        s.push(`subscriptions.status:${o}${r}`);
        break;
      }
      case "signup":
      case "conversion":
      case "emails.post_id":
      case "opened_emails.post_id":
      case "clicked_links.post_id": {
        s.push(`${l}:${o}'${r}'`);
        break;
      }
      case "newsletter_feedback": {
        const i = n;
        s.push(`(feedback.post_id:'${r}'+feedback.score:${i})`);
        break;
      }
      default:
        typeof r == "string" && r.includes(" ") ? s.push(`${l}:${o}'${r}'`) : s.push(`${l}:${o}${r}`);
    }
  }
  return s.length ? s.join("+") : void 0;
}
function Mt(t) {
  if (!t)
    return null;
  const s = t.indexOf(":");
  return s <= 0 ? null : {
    operator: t.substring(0, s),
    value: t.substring(s + 1)
  };
}
function Tt(t) {
  const s = [];
  for (const [a, l] of t.entries()) {
    if (a === "search" || !a.startsWith("newsletters.") && !Lt.includes(a) || !l)
      continue;
    const r = Mt(l);
    if (r) {
      const o = Ke.has(a) ? r.value ? r.value.split(",") : [] : [r.value];
      s.push({
        id: a,
        field: a,
        operator: r.operator,
        values: o
      });
    }
  }
  return s;
}
function $e(t, s) {
  const a = new URLSearchParams();
  for (const l of t) {
    const n = l.field;
    if (Ke.has(n)) {
      const r = l.values.length > 0 ? l.values.map((o) => String(o)).join(",") : "";
      a.set(n, `${l.operator}:${r}`);
      continue;
    }
    if (l.values[0] !== void 0) {
      const r = `${l.operator}:${String(l.values[0])}`;
      a.set(n, r);
    }
  }
  return s && a.set("search", s), a;
}
function $t() {
  const [t, s] = Qe(), a = F(() => Tt(t), [t]), l = F(() => t.get("search") ?? "", [t]), n = C((p, b = {}) => {
    const d = typeof p == "function" ? p(a) : p, x = t.get("search") ?? void 0, v = $e(d, x), y = b.replace ?? !0;
    s(v, { replace: y });
  }, [a, t, s]), r = C((p, b = {}) => {
    const d = $e(a, p || void 0), x = b.replace ?? !0;
    s(d, { replace: x });
  }, [a, s]), o = C(({ replace: p = !0 } = {}) => {
    s(new URLSearchParams(), { replace: p });
  }, [s]), i = F(() => Et(a), [a]), c = a.length > 0 || l.length > 0;
  return { filters: a, nql: i, search: l, setFilters: n, setSearch: r, clearFilters: o, isFiltered: c };
}
const Ot = [
  "subscriptions.plan_interval",
  "subscriptions.status",
  "subscriptions.start_date",
  "subscriptions.current_period_end",
  "conversion",
  "offer_redemptions"
], Jt = () => {
  var N, w, g;
  const { filters: t, nql: s, setFilters: a, isFiltered: l, clearFilters: n } = $t(), { data: r } = De(), o = ((N = r == null ? void 0 : r.config) == null ? void 0 : N.emailAnalytics) === !0, i = F(() => !t.some((_) => Ot.includes(_.field)), [t]), c = F(() => {
    if (s)
      return {
        include: "labels,tiers",
        limit: "50",
        order: "created_at desc",
        filter: s
      };
  }, [s]), {
    data: p,
    isError: b,
    isFetching: d,
    isFetchingNextPage: x,
    isRefetching: v,
    fetchNextPage: y,
    hasNextPage: j
  } = qe({
    searchParams: c,
    keepPreviousData: !0
  }), u = d && !x && !v, f = ((g = (w = p == null ? void 0 : p.meta) == null ? void 0 : w.pagination) == null ? void 0 : g.total) ?? 0, m = t.length > 0, h = Oe(
    "flex flex-row",
    !m && "items-center gap-2",
    m && "col-span-full row-start-4 pt-5"
  );
  return /* @__PURE__ */ e.jsxs(bt, { children: [
    /* @__PURE__ */ e.jsxs(
      ht,
      {
        isLoading: u,
        totalMembers: f,
        children: [
          /* @__PURE__ */ e.jsx(J.Actions, { children: /* @__PURE__ */ e.jsxs(J.ActionGroup, { children: [
            !m && /* @__PURE__ */ e.jsx(
              Me,
              {
                filters: t,
                onFiltersChange: a
              }
            ),
            /* @__PURE__ */ e.jsx(
              et,
              {
                canBulkDelete: i,
                isFiltered: l,
                memberCount: f,
                nql: s
              }
            )
          ] }) }),
          m && /* @__PURE__ */ e.jsx("div", { className: h, children: /* @__PURE__ */ e.jsx(
            Me,
            {
              filters: t,
              onFiltersChange: a
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ e.jsx(st, { children: u ? /* @__PURE__ */ e.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ e.jsx(zs, { size: "lg" }) }) : b ? /* @__PURE__ */ e.jsxs("div", { className: "mb-16 flex h-full flex-col items-center justify-center", children: [
      /* @__PURE__ */ e.jsx("h2", { className: "mb-2 text-xl font-medium", children: "Error loading members" }),
      /* @__PURE__ */ e.jsx("p", { className: "mb-4 text-muted-foreground", children: "Please reload the page to try again" }),
      /* @__PURE__ */ e.jsx(M, { onClick: () => window.location.reload(), children: "Reload page" })
    ] }) : p != null && p.members.length ? /* @__PURE__ */ e.jsx(
      St,
      {
        fetchNextPage: y,
        hasNextPage: j,
        isFetchingNextPage: x,
        isLoading: d && !x,
        items: p.members,
        showEmailOpenRate: o,
        totalItems: f
      }
    ) : /* @__PURE__ */ e.jsx("div", { className: "flex h-full flex-col items-center justify-center", children: l ? /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
      /* @__PURE__ */ e.jsx(Se, { title: "No members match the current filter", children: /* @__PURE__ */ e.jsx(ke, {}) }),
      /* @__PURE__ */ e.jsx(
        M,
        {
          className: "mt-4",
          variant: "outline",
          onClick: () => n({ replace: !1 }),
          children: "Show all members"
        }
      )
    ] }) : /* @__PURE__ */ e.jsx(Se, { title: "No members yet", children: /* @__PURE__ */ e.jsx(ke, {}) }) }) })
  ] });
};
export {
  Jt as default
};
//# sourceMappingURL=members-Dq2RcxuX.mjs.map

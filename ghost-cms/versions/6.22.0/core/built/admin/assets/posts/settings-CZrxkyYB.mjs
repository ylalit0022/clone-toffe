import { a as s } from "./hooks-BQt0oM3N.mjs";
const o = "ConfigResponseType", l = s({
  dataType: o,
  path: "/config/"
}), r = "SettingsResponseType", p = s({
  dataType: r,
  path: "/settings/",
  defaultSearchParams: {
    group: "site,theme,private,members,portal,newsletter,email,labs,slack,unsplash,views,firstpromoter,editor,comments,analytics,announcement,pintura,donations,security,social_web,explore,transistor"
  }
});
function u(e, a) {
  if (!e)
    return null;
  const t = e.find((n) => n.key === a);
  return (t == null ? void 0 : t.value) || null;
}
export {
  p as a,
  u as g,
  l as u
};
//# sourceMappingURL=settings-CZrxkyYB.mjs.map

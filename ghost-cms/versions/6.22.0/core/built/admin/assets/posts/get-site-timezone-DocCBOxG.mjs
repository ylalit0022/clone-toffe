import { i } from "./heading-BU5ZMUV_.mjs";
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const o = [
  ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7", key: "132q7q" }],
  ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2", key: "izxlao" }]
], c = i("mail", o);
/**
 * @license lucide-react v0.553.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const r = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "19", x2: "19", y1: "8", y2: "14", key: "1bvyxn" }],
  ["line", { x1: "22", x2: "16", y1: "11", y2: "11", key: "1shjgl" }]
], y = i("user-plus", r), a = (n) => {
  for (const e of n)
    if (e.key === "timezone") {
      const t = e.value;
      if (typeof t != "string")
        throw new TypeError("Site timezone setting is not a string");
      return t;
    }
  return "Etc/UTC";
};
export {
  c as M,
  y as U,
  a as g
};
//# sourceMappingURL=get-site-timezone-DocCBOxG.mjs.map

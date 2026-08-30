/* Sample inspector output.
 *
 * Each element carries its full ancestor chain (root → target). Nodes keep
 * every id / class as authored, hashes included — the canonical builder is
 * what decides which tokens survive.
 *
 * Swap this module for a live inspector bridge; nothing downstream depends
 * on where the elements come from. */

export const ELEMENTS = [
  {
    tag: "div",
    label: "Review Insights & Actions",
    path: ["main", "div.workspace", "div:nth-of-type(1)", "div:nth-of-type(3)", "div"],
    xpath: "/html/body/main/div[1]/div[3]/div",
    chain: [
      { tag: "main", id: null, classes: ["app-shell"], testid: null, index: 1, total: 1 },
      { tag: "div", id: null, classes: ["workspace", "css-1x9kd2"], testid: "workspace", index: 1, total: 1 },
      { tag: "div", id: null, classes: ["sc-fBkgHu"], testid: null, index: 1, total: 2 },
      { tag: "section", id: "ember1421", classes: ["jsx-2839172", "right-rail"], testid: null, index: 3, total: 4 },
      { tag: "div", id: "insights-panel", classes: ["insights-panel"], testid: "review-actions", index: 1, total: 3 },
    ],
    attrs: {
      testid: "review-actions",
      id: "insights-panel",
      role: "region",
      name: null,
      cls: "insights-panel",
      text: "Review Insights & Actions",
    },
    siblings: 4,
  },
  {
    tag: "button",
    label: "Send prompt",
    path: ["main", "form.composer", "div:nth-of-type(2)", "button:nth-of-type(1)"],
    xpath: "/html/body/main/form/div[2]/button[1]",
    chain: [
      { tag: "main", id: null, classes: ["app-shell"], testid: null, index: 1, total: 1 },
      { tag: "form", id: null, classes: ["composer", "css-9d2k1a"], testid: "composer", index: 1, total: 1 },
      { tag: "div", id: null, classes: ["composer__row"], testid: null, index: 2, total: 3 },
      { tag: "button", id: null, classes: ["btn", "btn-primary", "sc-JkLmNo"], testid: "composer-send", index: 1, total: 3 },
    ],
    attrs: {
      testid: "composer-send",
      id: null,
      role: "button",
      name: null,
      cls: "btn btn-primary",
      text: "Send",
    },
    siblings: 3,
  },
  {
    tag: "input",
    label: "Target files field",
    path: ["main", "form.config", "div:nth-of-type(1)", "input"],
    xpath: "/html/body/main/form/div[1]/input",
    chain: [
      { tag: "main", id: null, classes: ["app-shell"], testid: null, index: 1, total: 1 },
      { tag: "form", id: null, classes: ["config-form", "emotion-8f3a21"], testid: null, index: 2, total: 2 },
      { tag: "div", id: "radix-3021", classes: ["_field_1x9k2"], testid: null, index: 1, total: 4 },
      { tag: "input", id: "target-files", classes: ["input", "input--wide"], testid: null, index: 1, total: 1 },
    ],
    attrs: {
      testid: null,
      id: "target-files",
      role: "textbox",
      name: "targetFiles",
      cls: "input input--wide",
      text: null,
      labelText: "Target files",
    },
    siblings: 2,
  },
];

export default ELEMENTS;

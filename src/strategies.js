import { buildCanonical } from "./anchoring.js";
import { assertElement } from "./validate.js";

/* ------------------------------------------------------------------ */
/*  Strategy registry                                                  */
/*                                                                     */
/*  One entry per way of addressing an element. Adding a strategy is    */
/*  an entry here plus a handler in whichever formats can express it —  */
/*  formats that cannot simply omit the handler and the UI renders      */
/*  "not expressible in this format".                                   */
/* ------------------------------------------------------------------ */

export const STRATEGY_META = {
  "test-id": { why: "Contract-owned hook. Immune to copy, layout and styling churn." },
  canonical: {
    why: "Full ancestor path, each hop anchored on the most stable token available (data-testid › non-hash id › non-hash class), positional only where nothing stable exists.",
  },
  id: { why: "Unique and short, but ids are sometimes generated per build." },
  role: { why: "Mirrors the accessibility tree — the way a user finds it." },
  label: { why: "Bound to the visible label; survives markup refactors." },
  text: { why: "Breaks on copy edits and i18n. Fine for smoke tests." },
  attribute: { why: "Stable while the form field name stays part of the API." },
  structural: { why: "Positional path — any sibling insert silently repoints it." },
};

/** Declaration order doubles as the default strategy priority. */
export const STRATEGIES = [
  {
    key: "testid",
    strategy: "test-id",
    score: 96,
    applies: (el) => Boolean(el.attrs.testid),
    build: (el) => ({ value: el.attrs.testid, matches: 1 }),
  },
  {
    key: "id",
    strategy: "id",
    score: 88,
    applies: (el) => Boolean(el.attrs.id),
    build: (el) => ({ value: el.attrs.id, matches: 1 }),
  },
  {
    key: "label",
    strategy: "label",
    score: 84,
    applies: (el) => Boolean(el.attrs.labelText),
    build: (el) => ({ value: el.attrs.labelText, matches: 1 }),
  },
  {
    key: "role",
    strategy: "role",
    score: 81,
    applies: (el) => Boolean(el.attrs.role && (el.attrs.text || el.attrs.labelText)),
    build: (el) => ({
      value: el.attrs.role,
      matches: 1,
      name: el.attrs.text || el.attrs.labelText,
      fromLabel: !el.attrs.text && Boolean(el.attrs.labelText),
    }),
  },
  {
    key: "canonical",
    strategy: "canonical",
    applies: (el) => Boolean(el.chain && el.chain.length),
    build: (el) => {
      const canon = buildCanonical(el);
      return { value: null, matches: 1, canon, score: canon.score };
    },
  },
  {
    key: "attr",
    strategy: "attribute",
    score: 74,
    applies: (el) => Boolean(el.attrs.name),
    build: (el) => ({ value: el.attrs.name, matches: 1 }),
  },
  {
    key: "text",
    strategy: "text",
    score: 63,
    applies: (el) => Boolean(el.attrs.text),
    build: (el) => ({ value: el.attrs.text, matches: el.siblings > 3 ? 2 : 1 }),
  },
  {
    key: "structural",
    strategy: "structural",
    score: 22,
    applies: () => true,
    build: (el) => ({ value: el.path.slice(-3).join(" > "), matches: el.siblings }),
  },
];

/** Strategy names in priority order — drives the rail's priority list. */
export const STRATEGY_PRIORITY = STRATEGIES.map((s) => s.strategy);

/**
 * Every candidate locator that applies to an element, in priority order.
 *
 * @param {import("../types/element.js").LocatorElement} element
 * @returns {object[]} One entry per applicable strategy; never throws for a
 *   sparse element — a missing attribute just means that strategy is skipped.
 */
export function buildCandidates(element) {
  assertElement(element);

  return STRATEGIES.filter((s) => s.applies(element)).map((s) => ({
    key: s.key,
    strategy: s.strategy,
    score: s.score,
    ...s.build(element),
  }));
}

/* Public surface of the locator domain. Nothing in `src/components` should
 * import from a deeper path than this. */

export { HASH_PATTERNS, isHashed } from "./hash.js";
export { ANCHOR_ORDER, anchorNode, buildCanonical } from "./anchoring.js";
export {
  canonicalCss,
  canonicalXPath,
  cssFragment,
  labelXPath,
  roleXPath,
  segmentCss,
  segmentXPath,
  textXPath,
} from "./fragments.js";
export {
  STRATEGIES,
  STRATEGY_META,
  STRATEGY_PRIORITY,
  buildCandidates,
} from "./strategies.js";
export {
  DEFAULT_FORMAT,
  FORMATS,
  FORMAT_BY_ID,
  FORMAT_LIST,
  renderCandidate,
} from "./formats/index.js";
export { DEFAULT_RANKING, RANKERS, RANKING_MODES } from "./ranking.js";
export { QUOTE_STYLES, innerQuote, outerQuote, quoteContext, wrap } from "./quoting.js";
export { TIERS, healthOf, tierOf } from "./scoring.js";
export { bestRowKey, buildRows } from "./rows.js";
export { assertElement } from "./validate.js";

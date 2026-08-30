import cssFormat from "./css.js";
import xpathFormat from "./xpath.js";
import playwrightFormat from "./playwright.js";
import cypressFormat from "./cypress.js";
import seleniumFormat from "./selenium.js";
import { quoteContext } from "../quoting.js";

/* ------------------------------------------------------------------ */
/*  Format registry                                                    */
/*                                                                     */
/*  Supporting a new runner = one module in this folder + one line      */
/*  here. Nothing in the component tree changes.                        */
/* ------------------------------------------------------------------ */

export const FORMAT_LIST = [
  cssFormat,
  xpathFormat,
  playwrightFormat,
  cypressFormat,
  seleniumFormat,
];

export const FORMATS = FORMAT_LIST.map((f) => f.id);

export const FORMAT_BY_ID = Object.fromEntries(FORMAT_LIST.map((f) => [f.id, f]));

export const DEFAULT_FORMAT = FORMATS[0];

/**
 * Render one candidate into one format.
 *
 * Deliberately does **not** call `assertElement`: it receives an element that
 * `buildRows` has already validated, and it runs once per candidate per format.
 * Validating here would re-report the same fault many times over. This omission
 * is intentional — do not "fix" it.
 *
 * @param {object} candidate  One entry from `buildCandidates`.
 * @param {import("../../types/element.js").LocatorElement} element
 * @param {string} formatId  An id from `FORMATS`.
 * @param {{quote?: string, strictXPath?: boolean}} [options]
 * @returns {string|null} null when the format cannot express that strategy.
 */
export function renderCandidate(candidate, element, formatId, options = {}) {
  const format = FORMAT_BY_ID[formatId];
  const handler = format?.handlers[candidate.key];
  if (!handler) return null;
  return handler(candidate, element, quoteContext(options.quote, options));
}

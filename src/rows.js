import { buildCandidates } from "./strategies.js";
import { renderCandidate } from "./formats/index.js";
import { RANKERS } from "./ranking.js";
import { assertElement } from "./validate.js";

/**
 * Build the rendered, ranked candidate rows for one element.
 * Pure — the React layer only supplies settings and memoises the result.
 *
 * The result is **unfiltered**: every candidate that applies is returned, and
 * rows a format cannot express carry `text: null`. Deciding which of them a
 * user is currently looking at is the caller's job, not the domain's.
 *
 * @param {import("../types/element.js").LocatorElement} element
 * @param {object} settings  Generation parameters **only** — `format`, `quote`,
 *   `ranking` and `strictXPath`. View filtering is the caller's responsibility;
 *   any other key here is ignored.
 * @returns {{candidate: object, text: string|null}[]}
 */
export function buildRows(element, settings) {
  assertElement(element);

  const { format, quote, ranking, strictXPath = false } = settings;

  const rank = RANKERS[ranking] ?? RANKERS["test-id first"];

  return buildCandidates(element)
    .map((candidate) => ({
      candidate,
      text: renderCandidate(candidate, element, format, { quote, strictXPath }),
    }))
    .sort((a, b) => rank(b.candidate, b.text) - rank(a.candidate, a.text));
}

/** Key of the highest-ranked row the active format can actually express. */
export const bestRowKey = (rows) => rows.find((r) => r.text)?.candidate.key;

/* Ranking strategies for the candidate list. Each ranker scores a rendered
 * candidate; the list is sorted descending. */

const SEMANTIC_WEIGHT = {
  role: 99,
  label: 96,
  text: 90,
  "test-id": 78,
  id: 70,
  attribute: 66,
  canonical: 40,
  structural: 10,
};

export const RANKERS = {
  "test-id first": (candidate) => candidate.score,
  "semantic first": (candidate) => SEMANTIC_WEIGHT[candidate.strategy] ?? candidate.score,
  shortest: (candidate, text) => 100 - Math.min(90, (text || "").length),
};

export const RANKING_MODES = Object.keys(RANKERS);

export const DEFAULT_RANKING = RANKING_MODES[0];

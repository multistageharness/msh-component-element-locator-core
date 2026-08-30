/* Health scoring. */

export const TIERS = ["robust", "decent", "brittle"];

export const tierOf = (score) => (score >= 85 ? "robust" : score >= 60 ? "decent" : "brittle");

/** Best score among the locators a runner can actually express. */
export const healthOf = (rows) =>
  rows.filter((r) => r.text).reduce((best, r) => Math.max(best, r.candidate.score), 0);

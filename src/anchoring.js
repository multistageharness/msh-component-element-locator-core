import { isHashed } from "./hash.js";
import { assertElement } from "./validate.js";

/* Canonical path construction.
 *
 * Anchor order per hop: data-testid › non-hash id › non-hash class › nth-of-type. */

export const ANCHOR_ORDER = ["test-id", "id", "class", "position"];

/** Anchor one node of the ancestor chain on the best stable token available. */
export function anchorNode(node) {
  const rejected = [
    ...(node.id && isHashed(node.id) ? [`#${node.id}`] : []),
    ...node.classes.filter(isHashed).map((c) => `.${c}`),
  ];
  const stableClasses = node.classes.filter((c) => !isHashed(c));
  const base = { tag: node.tag, index: node.index, total: node.total, rejected };

  if (node.testid) return { ...base, kind: "test-id", token: node.testid };
  if (node.id && !isHashed(node.id)) return { ...base, kind: "id", token: node.id };
  if (stableClasses.length) return { ...base, kind: "class", token: stableClasses[0] };
  return { ...base, kind: "position", token: null };
}

/**
 * Anchor every hop of an element's chain and score the result.
 *
 * @param {import("../types/element.js").LocatorElement} element  `chain` is
 *   optional: absent or empty yields a result scoring the floor (28), not an error.
 * @returns {{segments: object[], anchored: number, ratio: number, score: number, rejected: string[]}}
 */
export function buildCanonical(element) {
  assertElement(element);

  const segments = (element.chain || []).map(anchorNode);
  const anchored = segments.filter((s) => s.kind !== "position").length;
  const ratio = segments.length ? anchored / segments.length : 0;
  const targetAnchored = segments.length
    ? segments[segments.length - 1].kind !== "position"
    : false;
  const score = Math.min(82, 28 + Math.round(46 * ratio) + (targetAnchored ? 8 : 0));

  return {
    segments,
    anchored,
    ratio,
    score,
    rejected: segments.flatMap((s) => s.rejected),
  };
}

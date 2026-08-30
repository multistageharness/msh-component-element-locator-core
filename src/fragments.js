/* Selector fragments.
 *
 * Format-agnostic string builders. Every one takes the quote character it
 * should use, so the same fragment can be emitted raw (outer quotes) or
 * embedded inside a wrapped code snippet (inner quotes). */

/* ---- canonical path segments ------------------------------------- */

export const segmentCss = (seg, ch) => {
  switch (seg.kind) {
    case "test-id":
      return `${seg.tag}[data-testid=${ch}${seg.token}${ch}]`;
    case "id":
      return `${seg.tag}#${seg.token}`;
    case "class":
      return `${seg.tag}.${seg.token}`;
    default:
      return seg.total > 1 ? `${seg.tag}:nth-of-type(${seg.index})` : seg.tag;
  }
};

export const segmentXPath = (seg, ch, strict) => {
  const cls = strict
    ? `contains(concat(${ch} ${ch},normalize-space(@class),${ch} ${ch}),${ch} ${seg.token} ${ch})`
    : `contains(@class,${ch}${seg.token}${ch})`;
  switch (seg.kind) {
    case "test-id":
      return `${seg.tag}[@data-testid=${ch}${seg.token}${ch}]`;
    case "id":
      return `${seg.tag}[@id=${ch}${seg.token}${ch}]`;
    case "class":
      return `${seg.tag}[${cls}]`;
    default:
      return seg.total > 1 ? `${seg.tag}[${seg.index}]` : seg.tag;
  }
};

export const canonicalCss = (segments, ch) =>
  segments.map((s) => segmentCss(s, ch)).join(" > ");

export const canonicalXPath = (segments, ch, strict) =>
  "//" + segments.map((s) => segmentXPath(s, ch, strict)).join("/");

/* ---- plain CSS ---------------------------------------------------- */

/** The bare CSS selector for a candidate, or null when CSS cannot express it. */
export function cssFragment(candidate, element, ch, strict) {
  switch (candidate.key) {
    case "canonical":
      return canonicalCss(candidate.canon.segments, ch);
    case "testid":
      return `[data-testid=${ch}${candidate.value}${ch}]`;
    case "id":
      return `#${candidate.value}`;
    case "attr":
      return `${element.tag}[name=${ch}${candidate.value}${ch}]`;
    case "structural":
      return candidate.value;
    default:
      return null;
  }
}

/* ---- XPath ------------------------------------------------------- */

export const labelXPath = (value, tag, ch) =>
  `//label[normalize-space()=${ch}${value}${ch}]/following::${tag}[1]`;

export const textXPath = (value, tag, ch) =>
  `//${tag}[normalize-space(text())=${ch}${value}${ch}]`;

export const roleXPath = (candidate, ch) =>
  candidate.fromLabel
    ? `//label[normalize-space()=${ch}${candidate.name}${ch}]/following::*[@role=${ch}${candidate.value}${ch}][1]`
    : `//*[@role=${ch}${candidate.value}${ch}][normalize-space()=${ch}${candidate.name}${ch}]`;

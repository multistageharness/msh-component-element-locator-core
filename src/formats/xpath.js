import { canonicalXPath, labelXPath, roleXPath, textXPath } from "../fragments.js";

/* Raw XPath expressions. */
const xpathFormat = {
  id: "XPath",
  language: "xpath",
  handlers: {
    canonical: (c, el, q) => canonicalXPath(c.canon.segments, q.outer, q.strictXPath),
    testid: (c, el, q) => `//*[@data-testid=${q.wrap(c.value)}]`,
    id: (c, el, q) => `//*[@id=${q.wrap(c.value)}]`,
    attr: (c, el, q) => `//${el.tag}[@name=${q.wrap(c.value)}]`,
    label: (c, el, q) => labelXPath(c.value, el.tag, q.outer),
    role: (c, el, q) => roleXPath(c, q.outer),
    text: (c, el, q) => textXPath(c.value, el.tag, q.outer),
    // The recorded absolute path, already positional — no re-derivation.
    structural: (c, el) => el.xpath,
  },
};

export default xpathFormat;

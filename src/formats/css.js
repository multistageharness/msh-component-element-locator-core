import { canonicalCss, cssFragment } from "../fragments.js";

/* Raw CSS selectors. Role, label and text queries have no CSS equivalent,
 * so those handlers are deliberately absent. */
const cssFormat = {
  id: "CSS",
  language: "css",
  handlers: {
    canonical: (c, el, q) => canonicalCss(c.canon.segments, q.outer),
    testid: (c, el, q) => cssFragment(c, el, q.outer),
    id: (c, el, q) => cssFragment(c, el, q.outer),
    attr: (c, el, q) => cssFragment(c, el, q.outer),
    structural: (c, el, q) => cssFragment(c, el, q.outer),
  },
};

export default cssFormat;

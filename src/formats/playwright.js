import { cssFragment } from "../fragments.js";

const locator = (c, el, q) => `page.locator(${q.wrap(cssFragment(c, el, q.inner))})`;

/* Playwright (JS/TS). Prefers the first-class getBy* queries wherever one
 * exists and falls back to a CSS locator otherwise. */
const playwrightFormat = {
  id: "Playwright",
  language: "javascript",
  handlers: {
    canonical: locator,
    id: locator,
    attr: locator,
    structural: locator,
    testid: (c, el, q) => `page.getByTestId(${q.wrap(c.value)})`,
    label: (c, el, q) => `page.getByLabel(${q.wrap(c.value)})`,
    role: (c, el, q) => `page.getByRole(${q.wrap(c.value)}, { name: ${q.wrap(c.name)} })`,
    text: (c, el, q) => `page.getByText(${q.wrap(c.value)}, { exact: true })`,
  },
};

export default playwrightFormat;

import { cssFragment, labelXPath, roleXPath, textXPath } from "../fragments.js";

const byCss = (c, el, q) =>
  `driver.find_element(By.CSS_SELECTOR, ${q.wrap(cssFragment(c, el, q.inner))})`;

const byXPath = (expression, q) => `driver.find_element(By.XPATH, ${q.wrap(expression)})`;

/* Selenium (Python bindings). Translate By.* for other languages. */
const seleniumFormat = {
  id: "Selenium",
  language: "python",
  handlers: {
    canonical: byCss,
    testid: byCss,
    attr: byCss,
    structural: byCss,
    id: (c, el, q) => `driver.find_element(By.ID, ${q.wrap(c.value)})`,
    label: (c, el, q) => byXPath(labelXPath(c.value, el.tag, q.inner), q),
    role: (c, el, q) => byXPath(roleXPath(c, q.inner), q),
    text: (c, el, q) => byXPath(textXPath(c.value, el.tag, q.inner), q),
  },
};

export default seleniumFormat;

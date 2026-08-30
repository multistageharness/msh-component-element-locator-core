import { cssFragment } from "../fragments.js";

const get = (c, el, q) => `cy.get(${q.wrap(cssFragment(c, el, q.inner))})`;

/* Cypress. `cy.findByRole` needs @testing-library/cypress — surfaced in the
 * studio notes rather than silently emitted as a built-in. */
const cypressFormat = {
  id: "Cypress",
  language: "javascript",
  handlers: {
    canonical: get,
    testid: get,
    id: get,
    attr: get,
    structural: get,
    label: (c, el, q) =>
      `cy.contains(${q.wrap("label")}, ${q.wrap(c.value)}).find(${q.wrap(el.tag)})`,
    role: (c, el, q) => `cy.findByRole(${q.wrap(c.value)}, { name: ${q.wrap(c.name)} })`,
    text: (c, el, q) => `cy.contains(${q.wrap(el.tag)}, ${q.wrap(c.value)})`,
  },
};

export default cypressFormat;

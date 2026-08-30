/* Dev-mode input validation.
 *
 * The contract in ../types/element.d.ts is a document; this is the same contract
 * as a runtime check. It exists because the package's most dangerous failure is
 * silent: an element with a stale `path`/`xpath` renders a confidently wrong
 * locator rather than raising anything.
 *
 * No dependencies — an assertion library here would break the package's one
 * structural guarantee. */

/* Off in production.
 *
 * Two signals, because neither alone covers both consumers:
 *
 *   - Node (CLI, tests, SSR) sets `process.env.NODE_ENV`. `process` does not
 *     exist in a browser bundle, so a bare `process.env.NODE_ENV` would throw a
 *     ReferenceError — a worse bug than the one this module prevents. `typeof`
 *     is the only safe first test.
 *   - Bundlers (Vite, and anything honouring `import.meta.env`) set
 *     `import.meta.env.PROD`. This one matters: in a browser production bundle
 *     `process` is undefined, so the Node test alone is false and validation
 *     would stay ON in shipped code — exactly backwards. `?.` keeps it harmless
 *     under plain Node, where `import.meta.env` is undefined.
 */
const nodeProd =
  typeof process !== "undefined" &&
  Boolean(process.env) &&
  process.env.NODE_ENV === "production";

const bundlerProd = import.meta.env?.PROD === true;

const isProd = nodeProd || bundlerProd;

const fail = (path, expected) => {
  throw new TypeError(`locator-core: ${path} must be ${expected}`);
};

const isObject = (v) => typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Assert that `element` satisfies the LocatorElement contract.
 *
 * No-op when `NODE_ENV === "production"`. Throws `TypeError` naming the first
 * offending field path, e.g. `locator-core: element.chain[2].classes must be an array`.
 *
 * @param {unknown} element
 * @param {string} [label]  Root name used in messages; override when the element
 *   arrived from somewhere worth naming.
 * @returns {void}
 */
export function assertElement(element, label = "element") {
  if (isProd) return;

  if (!isObject(element)) fail(label, "a non-null object");

  if (typeof element.tag !== "string" || element.tag === "") {
    fail(`${label}.tag`, "a non-empty string");
  }

  if (!Array.isArray(element.path) || element.path.some((s) => typeof s !== "string")) {
    fail(`${label}.path`, "an array of strings");
  }

  if (typeof element.xpath !== "string") fail(`${label}.xpath`, "a string");

  if (typeof element.siblings !== "number" || Number.isNaN(element.siblings)) {
    fail(`${label}.siblings`, "a number");
  }

  // Every attrs field is optional and nullable — only the container is required.
  if (!isObject(element.attrs)) fail(`${label}.attrs`, "an object");

  // `chain` is optional; when present every hop must be anchorable.
  if (element.chain !== undefined) {
    if (!Array.isArray(element.chain)) fail(`${label}.chain`, "an array");

    element.chain.forEach((node, i) => {
      const at = `${label}.chain[${i}]`;
      if (!isObject(node)) fail(at, "an object");
      if (typeof node.tag !== "string" || node.tag === "") {
        fail(`${at}.tag`, "a non-empty string");
      }
      if (!Array.isArray(node.classes)) fail(`${at}.classes`, "an array");
      if (typeof node.index !== "number" || Number.isNaN(node.index)) {
        fail(`${at}.index`, "a number");
      }
      if (typeof node.total !== "number" || Number.isNaN(node.total)) {
        fail(`${at}.total`, "a number");
      }
    });
  }
}

export default assertElement;

/* Failure modes of the input contract.
 *
 * A validator only ever run on valid input is untested. Every malformed case
 * below is a structured clone of a known-good fixture with exactly one field
 * removed or corrupted, so what is being asserted is unambiguous.
 *
 * Each throwing case asserts on the MESSAGE, not merely that something threw —
 * a validator that throws the wrong field name is barely better than one that
 * does not throw at all. */

import test from "node:test";
import assert from "node:assert/strict";

import { ELEMENTS } from "../fixtures/elements.js";
import { assertElement, buildCandidates, buildCanonical, buildRows } from "../src/index.js";

/** A fixture clone with one field path removed. */
const without = (i, mutate) => {
  const clone = structuredClone(ELEMENTS[i]);
  mutate(clone);
  return clone;
};

const CSS = { format: "CSS", quote: "double", ranking: "test-id first" };

test("every fixture element satisfies the contract", () => {
  ELEMENTS.forEach((el, i) => {
    assert.doesNotThrow(() => assertElement(el), `fixture element ${i} must validate`);
  });
});

test("an empty object is rejected, naming tag", () => {
  assert.throws(
    () => assertElement({}),
    (err) =>
      err instanceof TypeError && err.message === "locator-core: element.tag must be a non-empty string"
  );
});

test("a non-object is rejected, naming the root label", () => {
  assert.throws(
    () => assertElement(null),
    (err) => err.message === "locator-core: element must be a non-null object"
  );
  assert.throws(
    () => assertElement(ELEMENTS, "elements"),
    (err) => err.message === "locator-core: elements must be a non-null object"
  );
});

test("chain is optional — removing it does not throw", () => {
  const noChain = without(0, (el) => delete el.chain);
  assert.doesNotThrow(() => assertElement(noChain));
  // and the package still works on it, minus the canonical strategy
  assert.equal(
    buildCandidates(noChain).some((c) => c.key === "canonical"),
    false
  );
  assert.equal(buildCanonical(noChain).score, 28);
});

test("removing xpath is rejected, naming xpath", () => {
  assert.throws(
    () => assertElement(without(0, (el) => delete el.xpath)),
    (err) => err.message === "locator-core: element.xpath must be a string"
  );
});

test("removing siblings is rejected, naming siblings", () => {
  assert.throws(
    () => assertElement(without(0, (el) => delete el.siblings)),
    (err) => err.message === "locator-core: element.siblings must be a number"
  );
});

test("removing path is rejected, naming path", () => {
  assert.throws(
    () => assertElement(without(0, (el) => delete el.path)),
    (err) => err.message === "locator-core: element.path must be an array of strings"
  );
});

test("removing attrs is rejected, naming attrs", () => {
  assert.throws(
    () => assertElement(without(0, (el) => delete el.attrs)),
    (err) => err.message === "locator-core: element.attrs must be an object"
  );
});

test("a chain node missing classes is rejected, naming its index", () => {
  assert.throws(
    () => assertElement(without(0, (el) => delete el.chain[2].classes)),
    (err) => err.message === "locator-core: element.chain[2].classes must be an array"
  );
});

test("a chain node with a non-numeric index is rejected, naming its index", () => {
  assert.throws(
    () => assertElement(without(0, (el) => (el.chain[1].index = "1"))),
    (err) => err.message === "locator-core: element.chain[1].index must be a number"
  );
});

test("the three public entry points validate before doing any work", () => {
  // Each must report the named field, not a downstream TypeError about `undefined`.
  const named = (err) => /^locator-core: element\./.test(err.message);
  assert.throws(() => buildRows({}, CSS), named);
  assert.throws(() => buildCandidates({}), named);
  assert.throws(() => buildCanonical({}), named);
});

test("validation is off in production", async () => {
  const before = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  try {
    // Fresh module instance so the production guard is evaluated under this env.
    const { assertElement: prodAssert } = await import(`../src/validate.js?prod=${Date.now()}`);
    assert.doesNotThrow(() => prodAssert({}));
    assert.doesNotThrow(() => prodAssert(null));
  } finally {
    if (before === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = before;
  }
});

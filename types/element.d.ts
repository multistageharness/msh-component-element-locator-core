/**
 * The input contract: the shape `@msh/locator-core` reads from one captured element.
 *
 * Optionality here reflects what the *code* tolerates, not what the bundled fixture
 * happens to populate. Every field declared below is read somewhere under `src/`;
 * nothing is declared that the package does not actually consume.
 *
 * An inspector may record more than this. The bundled fixture carries two such
 * fields — `label` and `attrs.cls` — which the package ignores entirely. They are
 * deliberately absent here rather than declared-and-unused, so this file stays an
 * accurate statement of what is read.
 *
 * The practical consequence, in TypeScript: passing recorded data through a
 * variable type-checks (structural assignability ignores extra properties), but
 * writing an element as a fresh object literal with `label` or `cls` inline trips
 * the excess-property check. Assign it to a variable first, or drop the fields the
 * package does not read.
 */

/** One hop of the ancestor chain, as captured by the inspector. */
export interface ChainNode {
  /** Tag name of this ancestor. */
  tag: string;
  /** `id` attribute, or `null` when absent. Hashed ids are rejected as anchors. */
  id: string | null;
  /** Every class on this node. Required — read unguarded, so `[]` not omitted. */
  classes: string[];
  /** `data-testid`, or `null` when absent. The most stable anchor available. */
  testid: string | null;
  /** 1-based position among same-tag siblings; used for `nth-of-type`. */
  index: number;
  /** Count of same-tag siblings. When `> 1`, the position is emitted. */
  total: number;
}

/**
 * The target element's own attributes.
 *
 * Every field is optional and nullable: each strategy guards its read with
 * `Boolean(...)`, so an absent or `null` value simply means that strategy does
 * not apply — never an error.
 */
export interface ElementAttrs {
  /** `data-testid`. Drives the `test-id` strategy (score 96). */
  testid?: string | null;
  /** `id` attribute. Drives the `id` strategy (score 88). */
  id?: string | null;
  /** Text of the associated label. Drives the `label` strategy (score 84). */
  labelText?: string | null;
  /** ARIA role. Drives the `role` strategy (81), which also needs `text` or `labelText`. */
  role?: string | null;
  /** Form field `name`. Drives the `attribute` strategy (score 74). */
  name?: string | null;
  /** Visible text content. Drives the `text` strategy (score 63). */
  text?: string | null;
}

/** One element captured by an inspector, as the package expects to receive it. */
export interface LocatorElement {
  /** Tag name. Emitted directly by the XPath, Cypress and Selenium formats. */
  tag: string;

  /**
   * The CSS path to this element, **as recorded by the inspector**.
   *
   * Not derived. The `structural` strategy returns `path.slice(-3).join(" > ")`
   * verbatim, so a wrong or absent `path` yields a wrong locator, not an error.
   */
  path: string[];

  /**
   * The absolute XPath to this element, **as recorded by the inspector**.
   *
   * Not derived. Under the XPath format the `structural` handler returns this
   * string unchanged.
   */
  xpath: string;

  /** Count of same-tag siblings. Sets `matches` on the `text` and `structural` rows. */
  siblings: number;

  /** The element's own attributes — the input to every non-structural strategy. */
  attrs: ElementAttrs;

  /**
   * Ancestor chain, outermost first, used to build the canonical path.
   *
   * Optional: `buildCanonical` guards with `element.chain || []`. Absent means
   * the `canonical` strategy does not apply; an *empty* chain still produces a
   * result — scoring the floor of 28 — rather than failing.
   */
  chain?: ChainNode[];
}

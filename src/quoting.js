/* Quote helpers.
 *
 * `outer` is the quote a generated snippet is wrapped in; `inner` is the
 * opposite character, used for any quote nested inside that snippet so the
 * output never needs escaping. */

export const QUOTE_STYLES = ["double", "single"];

export const outerQuote = (style) => (style === "single" ? "'" : '"');
export const innerQuote = (style) => (style === "single" ? '"' : "'");

export const wrap = (value, style) => `${outerQuote(style)}${value}${outerQuote(style)}`;

/** Bundle passed to every format handler. */
export function quoteContext(style, options = {}) {
  return {
    style,
    outer: outerQuote(style),
    inner: innerQuote(style),
    wrap: (value) => wrap(value, style),
    strictXPath: Boolean(options.strictXPath),
  };
}

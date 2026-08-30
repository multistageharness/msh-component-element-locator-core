/* Hash filter.
 *
 * Rejects build-generated tokens so the canonical path never anchors on
 * something that changes on the next bundle. */

export const HASH_PATTERNS = [
  /^(css|sc|jsx|emotion|styled|mui|chakra|radix|ant|tw)[-_][A-Za-z0-9]{4,}$/i, // css-in-js runtimes
  /^_{1,2}[A-Za-z][\w-]*_{1,2}[A-Za-z0-9]{4,}$/, // CSS modules: _field_1x9k2
  /^[A-Za-z][\w-]*-[a-f0-9]{6,}$/i, // name-9f2c1b
  /^[A-Za-z]+[-_]?[0-9]{4,}$/, // ember1421, radix-3021
  /^(?=.*\d)[A-Za-z0-9]{8,}$/, // opaque alphanumeric blob
];

/** True when a token looks machine-generated (and so must not be anchored on). */
export function isHashed(token) {
  if (!token) return true;
  if (HASH_PATTERNS.some((r) => r.test(token))) return true;
  const digits = (token.match(/\d/g) || []).length;
  return digits >= 3 && digits / token.length > 0.3;
}

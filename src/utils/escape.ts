// The SPA renders HTML strings with diff-dom's `stringToObj`, not the
// browser's parser. It decodes only `&lt;`, `&gt;` and `&amp;` in text, and
// nothing in attribute values, so escaping has to match that.

/**
 * Escape a value for use as HTML text.
 * @param {unknown} value - The value to escape; it is converted to a string.
 * @returns {string} - The value with `&`, `<` and `>` escaped.
 */
export const escapeText = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

/**
 * Make a value safe inside a double-quoted attribute.
 *
 * diff-dom does not decode entities in attribute values, so the characters
 * that could end the value or the tag are removed instead of escaped.
 * @param {unknown} value - The value; it is converted to a string.
 * @returns {string} - The value without `"`, `<` and `>`.
 */
export const escapeAttribute = (value: unknown): string =>
  String(value ?? '').replace(/["<>]/g, '');

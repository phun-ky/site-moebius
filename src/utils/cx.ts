/**
 * Type for the optional properties object with boolean values.
 */
export type MoebiusSiteCXSecondArgType = undefined | Record<string, boolean>;

/**
 * Type for the first argument of the cx function which can be either a string or `MoebiusSiteCXSecondArgType`.
 */
export type MoebiusSiteCXFirstArgType = string | MoebiusSiteCXSecondArgType;

/**
 * Combines class names and optional properties object into a single string of class names.
 *
 * The `cx` function takes two parameters: `cls` and `cls_obj`.
 * The `cls` parameter can be either a string representing class names or an object with
 * properties set to `true` or `false`. The `cls_obj` parameter is an optional object with
 *  properties set to `true` or `false`, allowing for conditional inclusion of class names.
 *
 * @param {MoebiusSiteCXFirstArgType} cls - The class names as a string or an object with properties set to true or false.
 * @param {MoebiusSiteCXSecondArgType} cls_obj - An optional object with properties set to true or false to conditionally include class names.
 * @returns {string} - Returns a single string containing the combined class names.
 */
export const cx = (
  cls: MoebiusSiteCXFirstArgType,
  cls_obj?: MoebiusSiteCXSecondArgType
): string => {
  if (!cls) return '';

  if (!cls_obj && typeof cls !== 'string') {
    return `${Object.keys(cls)
      .filter((classname) => cls[classname])
      .join(' ')}`.trim();
  }

  return `${(cls as string).trim()} ${
    cls_obj
      ? Object.keys(cls_obj)
        .filter((classname) => cls_obj[classname])
        .join(' ')
      : ''
  }`.trim();
};

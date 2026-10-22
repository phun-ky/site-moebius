/**
 * Copy text to the clipboard.
 * @param {string} string - The text.
 * @returns {Promise<boolean>} Whether it was copied.
 */
export const copy = async (string: string): Promise<boolean> => {
  if (!string) return false;

  try {
    await navigator.clipboard.writeText(string);

    return true;
  } catch (err) {
    // The page has nowhere else to report a failed copy
    // eslint-disable-next-line no-console
    console.error(`Failed to copy: \`${string}\` `, err);

    return false;
  }
};

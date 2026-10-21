export const copy = async (string: string): Promise<void> => {
  if (!string) return;

  try {
    await navigator.clipboard.writeText(string);
  } catch (err) {
    // The page has nowhere else to report a failed copy
    // eslint-disable-next-line no-console
    console.error(`Failed to copy: \`${string}\` `, err);
  }
};

export const copy = async (string: string): Promise<void> => {
  if (!string) return;

  try {
    await navigator.clipboard.writeText(string);
  } catch (err) {
    console.error(`Failed to copy: \`${string}\` `, err);
  }
};

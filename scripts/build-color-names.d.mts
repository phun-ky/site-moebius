// Types for vite.config.ts, which imports the build script's helpers

export declare const toColorNameMap: (
  entries: unknown
) => Record<string, string>;

export declare const colorNameFiles: () => Promise<{
  version: string;
  count: number;
  files: Record<string, string>;
}>;

// Types for vite.config.ts, which imports the build script's helpers

export type Token = { type: string; value: unknown };

export type Tokens = {
  base: Map<string, Token>;
  themes: Record<string, Map<string, Token>>;
  theme: string;
  files: string[];
};

export declare const flatten: (
  group: object,
  path?: string[],
  type?: string
) => Map<string, Token>;

export declare const readTokens: (file?: string) => Promise<Tokens>;

export declare const tokensToCss: (tokens: Tokens) => string;

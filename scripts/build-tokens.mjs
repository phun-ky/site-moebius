// Turn the design tokens in tokens/ into CSS custom properties (#42). The
// tokens are written in the Design Tokens Community Group format 2025.10
// (https://www.designtokens.org/TR/2025.10/), and the resolver document
// lists them: the base set, then the dark or light theme. Each token
// becomes `--moebius-` plus its path joined with hyphens, so `space.4` is
// `--moebius-space-4`. A reference such as `{color.brand}` becomes
// `var(--moebius-color-brand)`, so it follows the theme.
//
// The default theme goes on :root and every other theme on the class
// theme.js sets, such as `:root.theme--light`.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PREFIX = 'moebius';

export const RESOLVER = fileURLToPath(
  new URL('../tokens/moebius.resolver.json', import.meta.url)
);

const REFERENCE = /^\{([^{}]+)\}$/;
const TYPES = [
  'color',
  'dimension',
  'fontFamily',
  'fontWeight',
  'number',
  'shadow'
];
/**
 * Check a token or group name against the format's rules.
 * @param {string} name - The name.
 * @param {string} path - Where it is, for the error.
 * @throws {SyntaxError} If the name starts with `$` or has `{`, `}` or `.`.
 */
const checkName = (name, path) => {
  if (name.startsWith('$') || /[{}.]/.test(name)) {
    throw new SyntaxError(`Token name not allowed: ${path}`);
  }
};

/**
 * Flatten a token file into its tokens, each with the type it has or
 * inherits from its groups.
 * @param {object} group - A token file, or a group in one.
 * @param {string[]} [path] - The group's path.
 * @param {string} [type] - The type the group passes on.
 * @returns {Map<string, { type: string, value: unknown }>} Tokens by path,
 * such as `color.brand`.
 * @throws {TypeError} If a token has no type, or one this site doesn't use.
 */
export const flatten = (group, path = [], type = undefined) => {
  const tokens = new Map();
  const groupType = group.$type ?? type;

  for (const [name, node] of Object.entries(group)) {
    if (name.startsWith('$')) continue;

    const nodePath = [...path, name];

    checkName(name, nodePath.join('.'));

    if (node && typeof node === 'object' && '$value' in node) {
      const tokenType = node.$type ?? groupType;

      if (!TYPES.includes(tokenType)) {
        throw new TypeError(
          `${nodePath.join('.')} has the type ${tokenType}, not one of ${TYPES.join(', ')}`
        );
      }

      tokens.set(nodePath.join('.'), { type: tokenType, value: node.$value });
    } else if (node && typeof node === 'object') {
      for (const [key, token] of flatten(node, nodePath, groupType)) {
        tokens.set(key, token);
      }
    }
  }

  return tokens;
};

/**
 * The CSS custom property for a token path.
 * @param {string} path - Such as `color.text-strong`.
 * @returns {string} Such as `--moebius-color-text-strong`.
 */
export const propertyName = (path) =>
  `--${PREFIX}-${path.replaceAll('.', '-')}`;

/**
 * A token's value as CSS.
 * @param {{ type: string, value: unknown }} token - The token.
 * @returns {string} The CSS value.
 * @throws {TypeError} If the value doesn't fit its type.
 */
export const cssValue = ({ type, value }) => {
  if (typeof value === 'string' && REFERENCE.test(value)) {
    return `var(${propertyName(value.match(REFERENCE)[1])})`;
  }

  if (type === 'color') {
    const { colorSpace, hex, alpha = 1 } = value;

    if (colorSpace !== 'srgb' || !/^#[0-9a-f]{6}$/.test(hex)) {
      throw new TypeError(
        `Colours need the srgb colour space and a 6 digit hex: ${JSON.stringify(value)}`
      );
    }

    if (alpha === 1) return hex;

    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

    return `rgb(${r} ${g} ${b} / ${alpha})`;
  }

  if (type === 'dimension') {
    if (
      !['px', 'rem'].includes(value.unit) ||
      typeof value.value !== 'number'
    ) {
      throw new TypeError(
        `Dimensions are a number of px or rem: ${JSON.stringify(value)}`
      );
    }

    return `${value.value}${value.unit}`;
  }

  if (type === 'shadow') {
    return [value]
      .flat()
      .map((layer) =>
        [
          ...(layer.inset ? ['inset'] : []),
          ...['offsetX', 'offsetY', 'blur', 'spread'].map((key) =>
            cssValue({ type: 'dimension', value: layer[key] })
          ),
          cssValue({ type: 'color', value: layer.color })
        ].join(' ')
      )
      .join(', ');
  }

  if (type === 'fontFamily') {
    return [value]
      .flat()
      .map((family) => (/^[a-z-]+$/i.test(family) ? family : `'${family}'`))
      .join(', ');
  }

  return String(value);
};

/**
 * Check that every reference points at a token.
 * @param {Map<string, { type: string, value: unknown }>} tokens - All tokens
 * that apply together.
 * @throws {ReferenceError} If a reference points at no token, or at itself.
 */
export const checkReferences = (tokens) => {
  for (const [path, { value }] of tokens) {
    const target =
      typeof value === 'string' ? value.match(REFERENCE)?.[1] : undefined;

    if (!target) continue;

    if (!tokens.has(target) || target === path) {
      throw new ReferenceError(
        `${path} refers to ${value}, which is not a token`
      );
    }
  }
};

/**
 * Read a resolver document and the token files it lists.
 * @param {string} [file] - The resolver document.
 * @returns {Promise<{ base: Map, themes: Record<string, Map>, theme: string,
 * files: string[] }>} The base tokens, each theme's tokens, the default
 * theme, and every file read.
 */
export const readTokens = async (file = RESOLVER) => {
  const resolver = JSON.parse(await readFile(file, 'utf8'));
  const files = [file];
  const load = async (sources) => {
    const tokens = new Map();

    for (const { $ref } of sources) {
      const source = join(dirname(file), $ref);

      files.push(source);

      for (const [path, token] of flatten(
        JSON.parse(await readFile(source, 'utf8'))
      )) {
        tokens.set(path, token);
      }
    }

    return tokens;
  };
  const base = new Map();

  for (const { $ref } of resolver.resolutionOrder) {
    const [, kind, name] = $ref.split('/');

    if (kind === 'sets') {
      for (const [path, token] of await load(resolver.sets[name].sources)) {
        base.set(path, token);
      }
    }
  }

  const { contexts, default: theme } = resolver.modifiers.theme;
  const themes = {};

  for (const [name, sources] of Object.entries(contexts)) {
    themes[name] = await load(sources);
    checkReferences(new Map([...base, ...themes[name]]));
  }

  return { base, themes, theme, files };
};

/**
 * The CSS for the tokens.
 * @param {Awaited<ReturnType<typeof readTokens>>} tokens - From readTokens.
 * @returns {string} The custom properties for :root and each other theme.
 */
export const tokensToCss = ({ base, themes, theme }) => {
  const block = (selector, tokens) =>
    `${selector} {\n${[...tokens]
      .map(([path, token]) => `  ${propertyName(path)}: ${cssValue(token)};`)
      .join('\n')}\n}\n`;

  return [
    '/* Made from tokens/ by scripts/build-tokens.mjs: change the tokens, not this */\n',
    block(':root', new Map([...base, ...themes[theme]])),
    ...Object.entries(themes)
      .filter(([name]) => name !== theme)
      .map(([name, tokens]) => block(`:root.theme--${name}`, tokens))
  ].join('\n');
};

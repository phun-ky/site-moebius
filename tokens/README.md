# Design tokens

The colours, fonts, sizes and shadows of moebius.wtf, in the
[Design Tokens Community Group format 2025.10](https://www.designtokens.org/TR/2025.10/).

- [`base.tokens.json`](base.tokens.json): the same in both themes.
- [`theme/dark.tokens.json`](theme/dark.tokens.json) and
  [`theme/light.tokens.json`](theme/light.tokens.json): the colours that change
  with the theme. Both files have the same tokens.
- [`moebius.resolver.json`](moebius.resolver.json): how they combine, the base
  first and then one theme. Dark is the default.

The build turns them into CSS custom properties
([`scripts/build-tokens.mjs`](../scripts/build-tokens.mjs)): the path joined
with hyphens after `--moebius-`, so `space.4` is `--moebius-space-4` and
`color.text-strong` is `--moebius-color-text-strong`. A reference such as
`{color.brand}` becomes `var(--moebius-color-brand)`.

Steps in `space` are quarter rems (`space.4` is 1rem). `font.size` and `radius`
are numbered from small to large. Colours use the `srgb` colour space with a
`hex` value, which the CSS is made from.

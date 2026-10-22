# Logo

The mark is a ring made of a moebius palette: the site's two default colours,
`#003f5c` and `#ff9900`, blended in LCH in seven steps. The band narrows almost
to nothing at the top, where the two ends of the palette meet, like the twist of
a Möbius strip.

| File                                                                  | Use                                                                                                                                 |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [`mark.svg`](mark.svg)                                                | The mark in colour. Inlined in the page it takes the theme's `--moebius-color-logo-*` tokens; on its own it uses the light colours. |
| [`mark-mono.svg`](mark-mono.svg)                                      | One colour (`currentColor`), with gaps between the steps.                                                                           |
| [`logo-text.svg`](../../components/page-section/Header/logo-text.svg) | The wordmark. Set it in `--moebius-color-text-strong` next to the mark, a third of the mark's height away.                          |

## Colours

From the theme tokens in [`tokens/theme`](../../../tokens/theme), `color.logo.1`
to `color.logo.7`:

- Light: `#003f5c` `#354b7f` `#755094` `#b64d90` `#e94f76` `#ff6b4c` `#ff9900`
- Dark: the same blend from a lighter start, `#5c88aa` `#7889c3` `#ac82ca`
  `#e275b8` `#ff6c8f` `#ff7958` `#ff9900`

## Construction

On a 32 by 32 grid:

- Outer edge: a circle of radius 15 around (16, 16).
- Hole: a circle of radius 9 around (16, 11.5), so the band is 1.5 wide at the
  top and 10.5 at the bottom.
- Steps: seven equal angles around the hole's centre, clockwise from the top,
  the first colour right of the top. Each step runs 4 degrees under the next, so
  no seam shows.

## Use

- Smallest size: 16 px.
- Keep at least a quarter of the mark's width clear around it.
- Don't recolour the steps, rotate the mark, or put the colour mark on a busy
  background; use the one-colour mark there.

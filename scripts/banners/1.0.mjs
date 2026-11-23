// Content of the release banners for the site as it is on moebius 2. The site
// has no version of its own, so the pill names the library it is built on.
// Copy this file for the next one (e.g. 2.0.mjs) and run:
// npm run banners -- 2.0
export default {
  slug: 'v1',
  pill: 'Built on moebius 2 · November 2026',
  title: ['Two colors in,', { accent: 'ten palettes out' }],
  body: 'moebius.wtf makes color palettes from two colors you pick, shows how they look to people with color blindness, and gives you the code: CSS, JavaScript or design tokens.',
  // The panel: the band and the palette tiles of the start page, made by
  // moebius from the site's default colors
  colors: { primary: '#003f5c', secondary: '#ff9900' }
};

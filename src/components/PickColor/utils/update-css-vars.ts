export const updateCSSVars = (options) => {
  const { MoebiusColor } = window;
  const primaryColor = new MoebiusColor(options.baseColor);
  const secondaryColor = new MoebiusColor(options.secondaryColor);
  const divergentColor = new MoebiusColor(options.divergentColor);
  const primaryColorHue = primaryColor.toObject('hsl').h;
  const secondaryColorHue = secondaryColor.toObject('hsl').h;
  const divergentColorHue = divergentColor.toObject('hsl').h;
  const divergentColorSaturation = divergentColor.toObject('hsl').s;
  const divergentColorLightness = divergentColor.toObject('hsl').l;

  document.documentElement.style.setProperty(
    '--moebius-primary-hue',
    primaryColorHue
  );
  document.documentElement.style.setProperty(
    '--moebius-secondary-hue',
    secondaryColorHue
  );
  document.documentElement.style.setProperty(
    '--moebius-divergent-hue',
    divergentColorHue
  );
  document.documentElement.style.setProperty(
    '--moebius-divergent-saturation',
    `${divergentColorSaturation}%`
  );
  document.documentElement.style.setProperty(
    '--moebius-divergent-lightness',
    `${divergentColorLightness}%`
  );
};

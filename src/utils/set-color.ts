import { generateSwatch } from 'features/generate-swatch';

export const setColor = (moebius) => {
  console.log(moebius);
  // console.info(
  //   `Moebius: setting primary color to: \`${color}\`, secondary color to: \`${secondaryColor}\` and divergent color to: \`${divergentColor}\``
  // );

  // setMoebiusRingVariables(moebius.colors.monochromatic);
  // updateInputs(color, secondaryColor, divergentColor);

  // createAllColorsMixSVG(moebius.all);
  // generateAccentGradients(moebius.accents);

  const outputIdArray = [
    'interpolate',
    'luminanceShift',
    'monochromatic',
    'complement',
    'split',
    'triadic',
    'tetradic',
    'pentadic',
    'hexadic',
    'analogous'
  ];

  outputIdArray.forEach((id) => {
    generateSwatch(moebius.colors[id], id, moebius);
    /*generatePie(
      moebius.colors[id].map((color) => moebius.monochromatic(color, 3)),
      id
    );
    generatePixels(moebius.colors[id], id);

    generateGradient(moebius.colors[id], id);
    generateAccents(moebius.accents[id], id);
    generateCode(moebius.colors[id], moebius.accents[id], id, moebius);*/
  });

  // colorizeWorldMap([
  //   ...moebius.colors.interpolate,
  //   ...moebius.accents.interpolate
  // ]);

  //Prism.highlightAll();
};

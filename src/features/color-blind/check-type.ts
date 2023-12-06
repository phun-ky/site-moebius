import chroma from 'chroma-js';
import blinder from 'lib/blinder';
// import blinder from 'https://codepen.io/phun-ky/pen/BaMJLyP/2c4b533049234d5746cdb816eb6227ef.js'
import { difference } from './difference.js';

export const checkType = (colors: string[], type: string): boolean => {
  // let ok = 0;
  let notok = 0;

  const ratioThreshold = 5;
  const smallestPerceivableDistance = 9;
  const k = colors.length;

  if (!k) {
    // console.log('no colors', type);
    return true;
  }

  // compute distances between colors
  for (let a = 0; a < k; a++) {
    for (let b = a + 1; b < k; b++) {
      const colorA = chroma(colors[a]);
      const colorB = chroma(colors[b]);
      const distanceNorm = difference(colorA, colorB);

      if (distanceNorm < smallestPerceivableDistance) continue;

      const aSim = blinder[type](colorA.hex());
      const bSim = blinder[type](colorB.hex());
      const distanceSim = difference(aSim, bSim);
      const isNotOk =
        distanceNorm / distanceSim > ratioThreshold &&
        distanceSim < smallestPerceivableDistance;

      if (isNotOk) {
        // console.log(type, colors[a],colors[b],aSim+'',bSim+'', distanceNorm, distanceSim, distanceNorm/distanceSim);
      }

      // count combinations that are problematic
      if (isNotOk) notok++;
      // else ok++;
    }
  }

  // console.log(type, notok/(ok+notok));
  // compute share of problematic colorss
  return notok === 0;
};

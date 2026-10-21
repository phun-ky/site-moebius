/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

declare global {
  // The element that had focus before a render, restored after it

  var activeElement: Element | null;

  interface Window {
    Prism: any;
    MoebiusColor: any;
    MoebiusPalettes: any;
    MoebiusSVGHelper: any;
  }
}

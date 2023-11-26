class MoebiusExport {
  /**
   * Converts an array of main colors and their accent colors to JavaScript code.
   * @param {MoebiusColorValueHexType[]} mainColors - Array of main colors.
   * @param {MoebiusColorValueHexType[][]} accentColors - Array of arrays representing accent colors for each main color.
   * @returns {string} JavaScript code for colors.
   * @example
   * ```ts
   * const colors = [
   *   '#ff0000', // Red
   *   '#00ff00', // Green
   *   // ...
   * ];
   * const accentsRed = [
   *   "#ff9999", // Light Red
   *   // ...
   * ];
   * const accentsGreen = [
   *   "#99ff99", // Light Green
   *   // ...
   * ];
   * ```
   */
  jsColors(
    mainColors: MoebiusColorValueHexType[],
    accentColors: MoebiusColorValueHexType[][]
  ) {
    const colors = mainColors
      .map((color: MoebiusColorValueHexType) => {
        const mColor = new MoebiusColorAbstract(color);
        const hex = mColor.hex;

        return `  '${hex}', // ${camelCase(mColor.name)}`;
      })
      .join(',\n');
    const accents =
      '\n' +
      `${accentColors
        .map((group, index) => {
          const groupName = new MoebiusColorAbstract(mainColors[index]).name;

          return (
            '\n' +
            `const ${camelCase(`accents ${groupName}`)} [\n` +
            `${group
              .map((color: MoebiusColorValueHexType) => {
                const mColor = new MoebiusColorAbstract(color);
                const hex = mColor.hex;

                return `  "${hex}", // ${camelCase(mColor.name)}`;
              })
              .join('\n')}\n` +
            ']'
          );
        })
        .join('\n')}`;

    return 'const colors = [\n' + `${colors}\n` + '];\n' + `${accents}`;
  }
  cssColors(
    mainColors: MoebiusColorValueHexType[],
    accentColors: MoebiusColorValueHexType[][],
    accentType?: string
  ) {
    const colors = mainColors
      .map((color: MoebiusColorValueHexType) => {
        const mColor = new MoebiusColorAbstract(color);
        const hex = mColor.hex;

        return `  --color-${camelCase(mColor.name)}: ${hex};`;
      })
      .join('\n');

    let types = '';

    if (accentType && accentType !== '') {
      types =
        '\n' +
        '/**\n' +
        ' * Inherited\n' +
        ' */\n' +
        `${mainColors
          .map((color: MoebiusColorValueHexType, index: number) => {
            const mColor = new MoebiusColorAbstract(color);

            return `  --color-${camelCase(accentType)}-${
              index + 1
            }: var(--color-${camelCase(mColor.name)});`;
          })
          .join('\n')}`;
    }

    const accents =
      '\n' +
      `${accentColors
        .map((group, index) => {
          const groupName = new MoebiusColorAbstract(mainColors[index]).name;

          return (
            '\n' +
            `.accents-${camelCase(groupName)}` +
            ` {\n ${group
              .map((color: MoebiusColorValueHexType) => {
                const mColor = new MoebiusColorAbstract(color);
                const hex = mColor.hex;

                return `  --color-${camelCase(mColor.name)}: ${hex};`;
              })
              .join('\n')}\n}`
          );
        })
        .join('\n')}`;

    return ':root{\n' + `${colors}${types}\n` + '}\n' + `${accents}`;
  }
}

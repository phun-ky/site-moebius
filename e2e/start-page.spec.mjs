// The start page's main flows: pick colours, change the settings, simulate
// colour blindness, and copy the export code
import { expect, test } from '@playwright/test';

import {
  clipboard,
  hashOptions,
  openStartPage,
  swatchColors
} from './helpers.mjs';

// The palette being shown, in the band at the top (#48)
const band = '.ph.band .ph.swatch .ph.color';

test('typing a hex code makes it the primary color', async ({ page }) => {
  await openStartPage(page);

  const input = page.locator('#color-picker-input-primary-text');

  await input.fill('#ff0000');
  await input.press('Enter');

  await expect
    .poll(() => hashOptions(page))
    .toMatchObject({ baseColor: '#ff0000' });
  await expect(page.locator(band).first()).toHaveAttribute(
    'data-color-hex',
    '#ff0000'
  );
  await expect(
    page.locator('#color-picker-input-primary-color')
  ).toHaveAttribute('aria-label', /^Change the primary color, now \S/);
});

test('clicking a swatch copies its hex code and makes it the primary color', async ({
  page
}) => {
  await openStartPage(page);

  const swatch = page.locator(band).nth(3);
  const hex = await swatch.getAttribute('data-color-hex');

  await swatch.click();

  await expect.poll(() => clipboard(page)).toBe(hex);
  await expect.poll(() => hashOptions(page)).toMatchObject({ baseColor: hex });
});

test('the settings change the palettes and are kept in the link', async ({
  page
}) => {
  await openStartPage(page);

  const before = await swatchColors(page);

  await page.locator('label[for="color-scale-lab"]').click();
  await expect(page.locator('#color-scale-lab')).toBeChecked();
  await page.locator('label[for="bezier"]').click();
  await expect(page.locator('#bezier')).toBeChecked();

  await expect
    .poll(() => hashOptions(page))
    .toMatchObject({
      colorScaleMode: 'lab',
      bezier: true
    });
  await expect.poll(() => swatchColors(page)).not.toEqual(before);
});

test('a palette tile shows its palette, in the band too', async ({ page }) => {
  await openStartPage(page);

  const before = await swatchColors(page);

  await page
    .locator('label.ph.palette-option:has(input[value="complement"])')
    .click();

  await expect(
    page.getByRole('radio', { name: 'Complement', exact: true })
  ).toBeChecked();
  await expect(page.locator('.ph.band')).toHaveAttribute(
    'data-palette',
    'complement'
  );
  await expect
    .poll(() => hashOptions(page))
    .toMatchObject({
      palette: 'complement'
    });
  await expect.poll(() => swatchColors(page)).not.toEqual(before);
});

test('the color blind simulator changes the colors shown, not the palette', async ({
  page
}) => {
  await openStartPage(page);

  const swatches = page.locator(band);
  const hexes = await swatches.evaluateAll((colors) =>
    colors.map((color) => color.dataset.colorHex)
  );
  const before = await swatchColors(page);

  await page.getByLabel('Color blind simulator').selectOption('deuteranopia');

  await expect(page.locator('#color-blind-sim')).toHaveValue('deuteranopia');
  await expect
    .poll(() => hashOptions(page))
    .toMatchObject({
      colorBlindSim: 'deuteranopia'
    });
  await expect.poll(() => swatchColors(page)).not.toEqual(before);
  expect(
    await swatches.evaluateAll((colors) =>
      colors.map((color) => color.dataset.colorHex)
    )
  ).toEqual(hexes);
});

for (const [name, language, pattern] of [
  ['CSS', 'css', /--color-\S+: #[0-9a-f]{6};/],
  ['JavaScript', 'js', /'#[0-9a-f]{6}'/],
  ['Design tokens', 'json', /"colorSpace": "srgb"/]
]) {
  test(`the ${name} code is copied by its copy button`, async ({ page }) => {
    await openStartPage(page);

    await page.getByRole('tab', { name, exact: true }).click();

    const box = page.locator('.ph.code-box');
    const code = box.locator('pre code');

    await expect(code).toContainText(pattern);

    // By class: its name changes to "copied" when clicked
    const button = box.locator('button.ph.copy');

    await button.click();

    await expect(button).toHaveText('copied');
    await expect(box.getByRole('status')).toHaveText(`${language} code copied`);

    const copied = await clipboard(page);

    expect(copied).toBe(await code.textContent());

    if (language === 'json') {
      expect(JSON.parse(copied).interpolate['1'].$value.hex).toBe('#003f5c');
    }

    await expect(button).toHaveText('copy');
  });
}

test('options in a shared link are restored', async ({ page }) => {
  await openStartPage(page, {
    baseColor: '#ff0000',
    colorScaleMode: 'lch',
    colorBlindSim: 'protanopia',
    palette: 'triadic'
  });

  await expect(page.locator('#color-picker-input-primary-text')).toHaveValue(
    /^#ff0000$/i
  );
  await expect(page.locator('#color-scale-lch')).toBeChecked();
  await expect(page.locator('#color-blind-sim')).toHaveValue('protanopia');
  await expect(
    page.getByRole('radio', { name: 'Triadic', exact: true })
  ).toBeChecked();
  await expect(page.locator('.ph.band')).toHaveAttribute(
    'data-palette',
    'triadic'
  );
});

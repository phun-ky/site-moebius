// The start page's main flows: pick colours, change the settings, simulate
// colour blindness, and copy the export code
import { expect, test } from '@playwright/test';

import {
  clipboard,
  hashOptions,
  openStartPage,
  swatchColors
} from './helpers.mjs';

const panel = '[role="tabpanel"]:not([hidden])';

test('typing a hex code makes it the primary color', async ({ page }) => {
  await openStartPage(page);

  const input = page.locator('#color-picker-input-primary-text');

  await input.fill('#ff0000');
  await input.press('Enter');

  await expect
    .poll(() => hashOptions(page))
    .toMatchObject({ baseColor: '#ff0000' });
  await expect(
    page.locator(`${panel} .ph.swatch .ph.color`).first()
  ).toHaveAttribute('data-color-hex', '#ff0000');
  await expect(
    page.locator('#color-picker-input-primary-color')
  ).toHaveAttribute('aria-label', /^Change the primary color, now \S/);
});

test('clicking a swatch copies its hex code and makes it the primary color', async ({
  page
}) => {
  await openStartPage(page);

  const swatch = page.locator(`${panel} .ph.swatch .ph.color`).nth(3);
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

test('a tab shows its own palette', async ({ page }) => {
  await openStartPage(page);

  await page.locator('#tab-complement').click();

  await expect(page.locator('#tab-complement')).toHaveAttribute(
    'aria-selected',
    'true'
  );
  await expect(page.locator('#section-complement')).toBeVisible();
  await expect(page.locator('#section-interpolate')).toBeHidden();
  await expect(
    page.locator('#section-complement .ph.swatch .ph.color').first()
  ).toBeVisible();
});

test('the color blind simulator changes the colors shown, not the palette', async ({
  page
}) => {
  await openStartPage(page);

  const swatches = page.locator(`${panel} .ph.swatch .ph.color`);
  const hexes = await swatches.evaluateAll((colors) =>
    colors.map((color) => color.dataset.colorHex)
  );
  const before = await swatchColors(page);

  // The label's text, as a visitor clicks it (#39)
  await page.locator('label[for="color-blind-sim-deuteranopia"]').click();

  await expect(page.locator('#color-blind-sim-deuteranopia')).toBeChecked();
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

for (const language of ['css', 'js']) {
  test(`the ${language} export code is copied by its copy button`, async ({
    page
  }) => {
    await openStartPage(page);

    await page.locator(`${panel} details.export-code > summary`).click();

    const block = page.locator(`${panel} .ph.code-toolbar`, {
      has: page.locator('.ph.language', {
        hasText: new RegExp(`^${language}$`)
      })
    });
    const code = block.locator('code');

    await expect(code).toContainText(
      language === 'css' ? /--color-\S+: #[0-9a-f]{6};/ : /'#[0-9a-f]{6}'/
    );

    const button = block.locator('button.ph.copy'); // By class: its name changes to "copied" when clicked

    await button.click();

    await expect(button).toHaveText('copied');
    await expect(block.getByRole('status')).toHaveText(
      `${language} code copied`
    );
    expect(await clipboard(page)).toBe(await code.textContent());
    await expect(button).toHaveText('copy');
  });
}

test('options in a shared link are restored', async ({ page }) => {
  await openStartPage(page, {
    baseColor: '#ff0000',
    colorScaleMode: 'lch',
    colorBlindSim: 'protanopia'
  });

  await expect(page.locator('#color-picker-input-primary-text')).toHaveValue(
    /^#ff0000$/i
  );
  await expect(page.locator('#color-scale-lch')).toBeChecked();
  await expect(page.locator('#color-blind-sim-protanopia')).toBeChecked();
});

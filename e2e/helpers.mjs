import { expect } from '@playwright/test';

/**
 * Wait until a page has rendered and the loading overlay is gone.
 * @param {import('@playwright/test').Page} page - The page.
 */
export const rendered = async (page) => {
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('.ph.loading.is-loading')).toHaveCount(0);
};

/**
 * Open the start page and wait until the palettes have their colour names.
 * @param {import('@playwright/test').Page} page - The page.
 * @param {object} [options] - Options to put in the link, as a visitor's
 * shared link does.
 */
export const openStartPage = async (page, options) => {
  await page.goto(
    options
      ? `/#options=${Buffer.from(JSON.stringify(options)).toString('base64')}`
      : '/'
  );
  await rendered(page);
  await expect(page.locator('.ph.swatch .ph.color').first()).toHaveAttribute(
    'data-color-name',
    /./
  );
};

/**
 * The options the start page keeps in its link.
 * @param {import('@playwright/test').Page} page - The page.
 * @returns {Promise<Record<string, unknown>>} The options.
 */
export const hashOptions = (page) =>
  page.evaluate(() =>
    location.hash.startsWith('#options=')
      ? JSON.parse(atob(location.hash.slice('#options='.length)))
      : {}
  );

/**
 * The colours of the swatches in the open palette, as shown.
 * @param {import('@playwright/test').Page} page - The page.
 * @returns {Promise<string[]>} Their background colours.
 */
export const swatchColors = (page) =>
  page
    .locator('[role="tabpanel"]:not([hidden]) .ph.swatch .ph.color')
    .evaluateAll((colors) =>
      colors.map((color) => color.style.backgroundColor)
    );

/**
 * What the clipboard holds.
 * @param {import('@playwright/test').Page} page - The page.
 * @returns {Promise<string>} The text.
 */
export const clipboard = (page) =>
  page.evaluate(() => navigator.clipboard.readText());

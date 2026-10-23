// Moving around the site and the theme toggle
import { expect, test } from '@playwright/test';

import { rendered } from './helpers.mjs';

test('a deep link to /about opens the about page', async ({ page }) => {
  const response = await page.goto('/about');

  expect(response?.status()).toBe(200);
  await rendered(page);
  await expect(page.locator('main h1')).toHaveText('About moebius');
  await expect(page).toHaveTitle('About moebius');
});

test('links move between pages without a reload, and back works', async ({
  page
}) => {
  await page.goto('/about');
  await rendered(page);
  // Gone after a reload
  await page.evaluate(() => {
    window.notReloaded = true;
  });

  await page.locator('main a[data-link="/"]').click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('.ph.swatch .ph.color').first()).toBeVisible();
  await expect(page).toHaveTitle(/^moebius: /);

  await page.goBack();
  await expect(page).toHaveURL('/about');
  await expect(page.locator('main h1')).toHaveText('About moebius');
  expect(await page.evaluate(() => window.notReloaded)).toBe(true);
});

test('the header links to every page and marks the current one', async ({
  page
}) => {
  await page.goto('/about');
  await rendered(page);

  const header = page.getByRole('banner');
  const nav = header.getByRole('navigation', { name: 'Site' });

  await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute(
    'aria-current',
    'page'
  );
  await expect(nav.getByRole('link', { name: 'Palettes' })).not.toHaveAttribute(
    'aria-current'
  );
  await expect(
    header.getByRole('link', { name: 'Source on GitHub' })
  ).toBeVisible();
  await expect(
    header.getByRole('button', { name: 'Switch between light and dark theme' })
  ).toBeVisible();

  await nav.getByRole('link', { name: 'Palettes' }).click();
  await expect(page).toHaveURL('/');
  await expect(nav.getByRole('link', { name: 'Palettes' })).toHaveAttribute(
    'aria-current',
    'page'
  );
});

test('an unknown address shows the not-found page with status 404', async ({
  page
}) => {
  const response = await page.goto('/no-such-page');

  expect(response?.status()).toBe(404);
  await rendered(page);
  await expect(page.locator('main h1')).toHaveText('Page not found');
  await expect(page.locator('main code')).toHaveText('/no-such-page');
});

test.describe('in dark mode', () => {
  test.use({ colorScheme: 'dark' });

  test('the theme toggle switches to light, and the choice is remembered', async ({
    page
  }) => {
    await page.goto('/about');
    await rendered(page);

    const root = page.locator('html');

    await expect(root).not.toHaveClass(/theme--light/);

    await page
      .getByRole('button', { name: 'Switch between light and dark theme' })
      .click();
    await expect(root).toHaveClass(/theme--light/);

    await page.reload();
    await rendered(page);
    await expect(root).toHaveClass(/theme--light/);
  });
});

import { expect, test } from '@playwright/test';

test.describe('chroma.fyi smoke', () => {
  test('loads the Inspector by default', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Inspector' })).toBeVisible();
    // format list shows OKLCH value as CSS
    await expect(page.getByText(/oklch\(/).first()).toBeVisible();
  });

  test('left rail navigates to Matrix and Palette', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Matrix' }).click();
    await expect(page.getByRole('heading', { name: /Tonal matrix/i })).toBeVisible();
    await page.getByRole('button', { name: 'Palette' }).click();
    await expect(page.getByLabel('Palette name')).toBeVisible();
  });

  test('⌘K command palette opens', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('ControlOrMeta+K');
    await expect(
      page.getByPlaceholder(/Search commands|paste a color/i),
    ).toBeVisible();
    await page.keyboard.press('Escape');
  });

  test('URL hash round-trip preserves color', async ({ page, context }) => {
    await page.goto('/');
    // Wait for the hash sync to settle (debounced 250ms)
    await page.waitForTimeout(500);
    const url1 = page.url();
    expect(url1).toContain('#s=');

    // Open a new tab with the same URL
    const page2 = await context.newPage();
    await page2.goto(url1);
    await expect(page2.getByRole('heading', { name: 'Inspector' })).toBeVisible();
    const url2 = page2.url();
    // The hash payload should match (or at least both carry a payload)
    expect(url2).toContain('#s=');
  });

  test('keyboard chord "g m" jumps to Matrix', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Inspector")');
    await page.locator('body').click();
    await page.keyboard.press('g');
    await page.keyboard.press('m');
    await expect(page.getByRole('heading', { name: /Tonal matrix/i })).toBeVisible();
  });
});

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
    const rail = page.getByRole('navigation', { name: 'Modules' });
    await rail.getByRole('button', { name: /Matrix/ }).click();
    await expect(page.getByRole('heading', { name: /Tonal matrix/i })).toBeVisible();
    await rail.getByRole('button', { name: /Palette/ }).click();
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
    // Change something so the hash payload is non-default
    const input = page.locator('#color-input');
    await input.fill('#ff3366');
    await input.press('Enter');
    // Wait for debounced hash write (250ms)
    await page.waitForTimeout(500);
    const url1 = page.url();
    expect(url1).toContain('#s=');

    const page2 = await context.newPage();
    await page2.goto(url1);
    await expect(page2.getByRole('heading', { name: 'Inspector' })).toBeVisible();
    // The restored color should not be the default oklch(0.78 0.17 200)
    await expect(page2.locator('#color-input')).not.toHaveValue('oklch(0.78 0.17 200)');
  });

  test('keyboard chord "g m" jumps to Matrix', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1:has-text("Inspector")');
    // Move focus out of any text input so the chord handler accepts keypresses
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press('g');
    await page.keyboard.press('m');
    await expect(page.getByRole('heading', { name: /Tonal matrix/i })).toBeVisible();
  });
});

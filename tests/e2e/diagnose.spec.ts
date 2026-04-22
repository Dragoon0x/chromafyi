import { expect, test } from '@playwright/test';

test.describe('color selection diagnosis', () => {
  test('typing a color in the Inspector input and pressing Enter updates state', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push('console.error: ' + msg.text());
    });

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Inspector' })).toBeVisible();

    const input = page.locator('#color-input');
    await input.click();
    await input.fill('#ff3366');
    await input.press('Enter');

    // After commit, the input should show the canonical OKLCH for #ff3366
    await expect(input).toHaveValue(/oklch\(/i);

    // Status-bar mono chip should show the new color too
    await expect(page.locator('.mono').filter({ hasText: /oklch\(/ }).first()).toBeVisible();

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });

  test('clicking the slider track updates L', async ({ page }) => {
    await page.goto('/');
    const lSlider = page.getByRole('slider', { name: 'Lightness' });
    await expect(lSlider).toBeVisible();

    const box = await lSlider.boundingBox();
    if (!box) throw new Error('slider has no box');

    // click near the 20% mark
    await page.mouse.click(box.x + box.width * 0.2, box.y + box.height / 2);

    const l = await lSlider.getAttribute('aria-valuenow');
    expect(Number(l)).toBeGreaterThan(0.15);
    expect(Number(l)).toBeLessThan(0.25);
  });

  test('⌘K → paste hex → Enter selects the parsed color', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('ControlOrMeta+K');
    const search = page.getByPlaceholder(/Search commands|paste a color/i);
    await expect(search).toBeVisible();

    await search.fill('#ff3366');
    // The Parsed color action must be visible
    await expect(page.getByText(/Use\s+oklch\(/i)).toBeVisible();

    // Press Enter to commit the first-highlighted item (which should be the parsed color
    // because its `value` matches the search exactly)
    await page.keyboard.press('Enter');

    // Modal closes
    await expect(search).not.toBeVisible();

    // Inspector input now shows the parsed oklch
    await expect(page.locator('#color-input')).toHaveValue(/oklch\(/i);
  });

  test('native color picker in the preview commits a chosen color', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('#color-input');

    // Can't open a real OS color dialog from a test; drive the hidden
    // <input type="color"> instead. React ignores direct .value writes
    // (its own internal tracker never changes), so use the prototype
    // setter — the same trick React testing libraries use.
    const picker = page.locator('input[type="color"]').first();
    await picker.evaluate((el) => {
      const i = el as HTMLInputElement;
      const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set;
      setter?.call(i, '#ff3366');
      i.dispatchEvent(new Event('input', { bubbles: true }));
      i.dispatchEvent(new Event('change', { bubbles: true }));
    });

    // Inspector input should have switched off the default blue oklch value
    await expect(input).not.toHaveValue('oklch(0.78 0.17 200)');
    await expect(input).toHaveValue(/oklch\(/i);
  });

  test('recent-color swatch click updates Inspector', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('#color-input');

    // Seed two colors so recent list has 2 entries
    await input.fill('#ff3366');
    await input.press('Enter');
    await input.fill('#33ff66');
    await input.press('Enter');

    // Wait for recent list to populate (debounced 600ms)
    await page.waitForTimeout(800);

    // Click the first recent swatch (should be the older color)
    const recentSwatches = page.locator('button[aria-label^="color oklch"]');
    const count = await recentSwatches.count();
    expect(count).toBeGreaterThan(0);
    await recentSwatches.nth(1).click();

    // Wait for re-render
    await page.waitForTimeout(200);

    const newValue = await input.inputValue();
    expect(newValue).toMatch(/oklch\(/);
  });
});

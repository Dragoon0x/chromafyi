import { expect, test } from '@playwright/test';

// Drives the actual deployed production URL, no local server.
// Captures console errors and screenshots of failures.
const LIVE = 'https://chromafyi.vercel.app/';

test.use({ baseURL: LIVE });

test.describe('live: what actually happens', () => {
  test('loads, no console errors, baseline screenshot', async ({ page }, info) => {
    const errors: string[] = [];
    const logs: string[] = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push('console.error: ' + m.text());
      logs.push(`[${m.type()}] ${m.text()}`);
    });

    await page.goto('/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: info.outputPath('01-initial.png'), fullPage: true });

    // Dump what we found
    console.log('ERRORS:', JSON.stringify(errors, null, 2));
    console.log('LOG TAIL:', logs.slice(-20).join('\n'));

    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('color preview click: does the native picker open?', async ({ page }, info) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const preview = page.getByRole('button', { name: 'Open native color picker' }).first();
    await expect(preview).toBeVisible();
    // Check the hidden <input type="color"> exists and has a value
    const hidden = page.locator('input[type="color"]').first();
    const before = await hidden.inputValue();
    console.log('input[type=color] before:', before);
    // Click the preview button. Native picker dialogs can't be inspected from
    // Playwright, but we can check whether the input's "click dispatched"
    // event fires by attaching a listener.
    const sawClick = await page.evaluate(() => {
      const inp = document.querySelector<HTMLInputElement>('input[type="color"]');
      if (!inp) return 'no-input';
      let fired = false;
      inp.addEventListener('click', () => {
        fired = true;
      });
      const btn = document.querySelector<HTMLButtonElement>(
        'button[aria-label="Open native color picker"]',
      );
      if (!btn) return 'no-btn';
      btn.click();
      return fired ? 'click-fired' : 'no-event';
    });
    console.log('native-picker click flow:', sawClick);
    await page.screenshot({ path: info.outputPath('02-after-preview-click.png'), fullPage: true });
    expect(sawClick).toBe('click-fired');
  });

  test('slider drag changes lightness', async ({ page }, info) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const l = page.getByRole('slider', { name: 'Lightness' });
    const before = await l.getAttribute('aria-valuenow');
    const box = (await l.boundingBox())!;
    await page.mouse.click(box.x + box.width * 0.25, box.y + box.height / 2);
    await page.waitForTimeout(120);
    const after = await l.getAttribute('aria-valuenow');
    console.log('L:', before, '->', after);
    await page.screenshot({ path: info.outputPath('03-after-slider.png'), fullPage: true });
    expect(Number(after)).not.toBe(Number(before));
  });

  test('⌘K paste hex and pick', async ({ page }, info) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.keyboard.press('ControlOrMeta+K');
    const search = page.getByPlaceholder(/Search commands|paste a color/i);
    await expect(search).toBeVisible();
    await search.fill('#ff3366');
    await page.screenshot({ path: info.outputPath('04-cmdk-open.png'), fullPage: true });
    // The parsed item must be visible after my fix
    await expect(page.getByText(/Use\s+oklch\(/i)).toBeVisible();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(120);
    const v = await page.locator('#color-input').inputValue();
    console.log('after cmdk paste, input:', v);
    await page.screenshot({ path: info.outputPath('05-cmdk-after.png'), fullPage: true });
    expect(v).not.toBe('oklch(0.78 0.17 200)');
  });
});

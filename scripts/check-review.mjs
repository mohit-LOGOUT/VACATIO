import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const browser = await chromium.launch();
try {
  await mkdir('artifacts', { recursive: true });
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    const page = await browser.newPage({ viewport });
    await page.goto(process.env.REVIEW_TEST_URL || 'http://localhost:5173/review.html');
    await page.getByRole('button', { name: 'Try sample reviews' }).click();
    await expect(page.getByRole('status')).toContainText('not saved to Convex');
    await expect(page.getByRole('heading', { name: 'Aarav Shah' })).toBeVisible();
    await page.getByRole('button', { name: 'Reject & queue replacement' }).click();
    await expect(page.getByRole('alert')).toContainText('Add a review note');
    await page.getByLabel('Review note').fill('Please upload a clearer image with all details visible.');
    await page.getByRole('button', { name: 'Reject & queue replacement' }).click();
    await expect(page.getByRole('heading', { name: 'Meera Shah' })).toBeVisible();
    await page.getByRole('button', { name: 'Approve ID', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Kabir Rao' })).toBeVisible();
    await page.screenshot({ path: `artifacts/document-review-${viewport.width}.png`, fullPage: true });
    await page.getByRole('button', { name: 'Approved', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Meera Shah' })).toBeVisible();
    await page.getByRole('button', { name: 'Rejected', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Aarav Shah' })).toBeVisible();
    await expect(page.getByText('Please upload a clearer image with all details visible.', { exact: true })).toBeVisible();
    const overflows = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(overflows).toBe(false);
    await page.getByRole('button', { name: 'Lock reviews' }).click();
    await expect(page.getByRole('heading', { name: 'Open your review queue' })).toBeVisible();
    await page.close();
  }
  console.log('Sample approve/reject flow passed on desktop and phone. This does not prove live Convex saves.');
} finally { await browser.close(); }

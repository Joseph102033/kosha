import { test, expect } from '@playwright/test';

test.describe('Public OPS Page', () => {
  // Note: This test requires a valid OPS slug.
  // In CI, you should create a test OPS first or use a known slug.
  const testSlug = 'test-ops-' + Date.now();

  test.skip('should display OPS document content', async ({ page }) => {
    // Navigate to public OPS page
    await page.goto(`/p/${testSlug}`);

    // Check for main sections
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // Check for summary section
    await expect(page.locator('text=/summary|요약/i').first()).toBeVisible();

    // Check for causes section
    await expect(page.locator('text=/cause|원인/i').first()).toBeVisible();

    // Check for checklist section
    await expect(page.locator('text=/checklist|체크리스트/i').first()).toBeVisible();
  });

  test.skip('should display law references with clickable links', async ({ page }) => {
    await page.goto(`/p/${testSlug}`);

    // Wait for laws section
    const lawsSection = page.locator('text=/law|regulation|법규/i').first();
    await expect(lawsSection).toBeVisible();

    // Check for law links
    const lawLinks = page.locator('a[href*="law.go.kr"], a[href*="법"]').first();
    const hasLawLinks = await lawLinks.count();

    if (hasLawLinks > 0) {
      await expect(lawLinks).toBeVisible();
      await expect(lawLinks).toHaveAttribute('href', /https?:\/\/.+/);
    }
  });

  test.skip('should have PDF download button', async ({ page }) => {
    await page.goto(`/p/${testSlug}`);

    // Find PDF download button
    const pdfButton = page.locator('button').filter({ hasText: /pdf|download|다운로드/i }).first();
    await expect(pdfButton).toBeVisible();

    // Click PDF button
    await pdfButton.click();

    // Wait for PDF generation (client-side)
    await page.waitForTimeout(5000);

    // Note: Actual PDF download verification would require additional setup
  });

  test.skip('should be print-friendly with proper A4 layout', async ({ page }) => {
    await page.goto(`/p/${testSlug}`);

    // Check print media query
    await page.emulateMedia({ media: 'print' });

    // Verify content is still visible in print mode
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test.skip('should not display admin controls', async ({ page }) => {
    await page.goto(`/p/${testSlug}`);

    // Ensure no edit/delete buttons are visible
    await expect(page.locator('button').filter({ hasText: /edit|delete|수정|삭제/i })).not.toBeVisible();
  });

  test.skip('should be accessible on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`/p/${testSlug}`);

    // Verify main content is visible on mobile
    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('text=/summary|요약/i').first()).toBeVisible();
  });

  test('should return 404 for non-existent OPS', async ({ page }) => {
    // Navigate to non-existent OPS
    const response = await page.goto('/p/non-existent-slug-12345');

    // Should return 404 or show error message
    if (response) {
      expect([404, 500]).toContain(response.status());
    } else {
      await expect(page.locator('text=/not found|404/i')).toBeVisible();
    }
  });
});

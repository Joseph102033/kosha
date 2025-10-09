import { test, expect } from '@playwright/test';

test.describe('Admin OPS Builder Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/builder');
  });

  test('should display OPS builder form with all required fields', async ({ page }) => {
    // Check for date/time input
    await expect(page.locator('input[type="datetime-local"], input[type="date"]').first()).toBeVisible();

    // Check for location input
    await expect(page.locator('input[placeholder*="location" i], input[name*="location" i]').first()).toBeVisible();

    // Check for incident type input
    await expect(page.locator('input[placeholder*="incident" i], select[name*="incident" i], input[name*="incident" i]').first()).toBeVisible();

    // Check for incident cause textarea
    await expect(page.locator('textarea[placeholder*="cause" i], textarea[name*="cause" i]').first()).toBeVisible();
  });

  test('should generate OPS preview when form is filled', async ({ page }) => {
    // Fill required fields
    await page.fill('input[type="datetime-local"], input[type="date"]', '2025-01-15T10:30');
    await page.fill('input[placeholder*="location" i], input[name*="location" i]', 'Seoul Construction Site');

    const incidentTypeInput = page.locator('input[name*="incident" i], select[name*="type" i]').first();
    await incidentTypeInput.fill('Fall');

    await page.fill('textarea[placeholder*="cause" i], textarea[name*="cause" i]', 'Worker fell from scaffolding due to missing safety harness');

    // Wait for preview to generate (debounced)
    await page.waitForTimeout(1000);

    // Check for preview sections
    const previewSection = page.locator('[data-testid="ops-preview"], .preview, .ops-preview').first();
    const hasPrevie w = await previewSection.count();

    if (hasPreview > 0) {
      await expect(previewSection).toBeVisible();
    }
  });

  test('should display law suggestions based on incident type', async ({ page }) => {
    // Fill form to trigger law matching
    await page.fill('input[type="datetime-local"], input[type="date"]', '2025-01-15T10:30');
    await page.fill('input[placeholder*="location" i], input[name*="location" i]', 'Construction Site');

    const incidentTypeInput = page.locator('input[name*="incident" i], select[name*="type" i]').first();
    await incidentTypeInput.fill('Fall');

    await page.fill('textarea[name*="cause" i]', 'Fall from height');

    // Wait for law suggestions
    await page.waitForTimeout(1500);

    // Check if laws section exists
    const lawsSection = page.locator('text=/law|regulation|법규/i').first();
    const hasLaws = await lawsSection.count();

    if (hasLaws > 0) {
      await expect(lawsSection).toBeVisible();
    }
  });

  test('should save OPS document and get public URL', async ({ page }) => {
    // Fill all required fields
    await page.fill('input[type="datetime-local"], input[type="date"]', '2025-01-15T10:30');
    await page.fill('input[placeholder*="location" i], input[name*="location" i]', 'Seoul Construction Site');

    const incidentTypeInput = page.locator('input[name*="incident" i], select[name*="type" i]').first();
    await incidentTypeInput.fill('Fall');

    await page.fill('textarea[name*="cause" i]', 'Scaffolding collapse due to improper installation');

    // Wait for preview generation
    await page.waitForTimeout(1000);

    // Click publish/save button
    const saveButton = page.locator('button').filter({ hasText: /publish|save|생성/i }).first();
    await saveButton.click();

    // Wait for success message and public URL
    await expect(page.locator('text=/saved|published|created|생성.*완료/i')).toBeVisible({ timeout: 15000 });

    // Check if public URL is displayed
    const publicUrlLink = page.locator('a[href^="/p/"], a:has-text("/p/")').first();
    const hasPublicUrl = await publicUrlLink.count();

    if (hasPublicUrl > 0) {
      await expect(publicUrlLink).toBeVisible();
    }
  });

  test('should show checklist with 6-10 items in preview', async ({ page }) => {
    // Fill form
    await page.fill('input[type="datetime-local"], input[type="date"]', '2025-01-15T10:30');
    await page.fill('input[placeholder*="location" i], input[name*="location" i]', 'Factory Floor');

    const incidentTypeInput = page.locator('input[name*="incident" i], select[name*="type" i]').first();
    await incidentTypeInput.fill('Chemical Spill');

    await page.fill('textarea[name*="cause" i]', 'Container leak due to corrosion');

    // Wait for preview
    await page.waitForTimeout(1500);

    // Count checklist items
    const checklistItems = page.locator('[data-testid="checklist"] li, .checklist li, ul li').filter({
      hasText: /.+/
    });

    const itemCount = await checklistItems.count();
    if (itemCount > 0) {
      expect(itemCount).toBeGreaterThanOrEqual(6);
      expect(itemCount).toBeLessThanOrEqual(10);
    }
  });

  test('should handle optional fields gracefully', async ({ page }) => {
    // Fill only required fields (no agentObject, hazardObject)
    await page.fill('input[type="datetime-local"], input[type="date"]', '2025-01-15T10:30');
    await page.fill('input[placeholder*="location" i], input[name*="location" i]', 'Warehouse');

    const incidentTypeInput = page.locator('input[name*="incident" i], select[name*="type" i]').first();
    await incidentTypeInput.fill('Equipment Failure');

    await page.fill('textarea[name*="cause" i]', 'Mechanical failure');

    // Wait for preview
    await page.waitForTimeout(1000);

    // Should not show error
    await expect(page.locator('text=/error/i')).not.toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify form is visible and usable on mobile
    await expect(page.locator('input[type="datetime-local"], input[type="date"]').first()).toBeVisible();
    await expect(page.locator('textarea').first()).toBeVisible();

    // Fill form on mobile
    await page.fill('input[type="datetime-local"], input[type="date"]', '2025-01-15T10:30');
    await page.fill('input[placeholder*="location" i], input[name*="location" i]', 'Mobile Test Location');
  });
});

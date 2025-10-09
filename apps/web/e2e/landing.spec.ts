import { test, expect } from '@playwright/test';

test.describe('Landing Page - Email Subscription Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page with subscription form', async ({ page }) => {
    // Check for headline
    await expect(page.locator('h1')).toBeVisible();

    // Check for email input field
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Check for subscribe button
    const subscribeButton = page.locator('button').filter({ hasText: /subscribe/i });
    await expect(subscribeButton).toBeVisible();
  });

  test('should successfully subscribe with valid email', async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`;

    // Fill email input
    await page.fill('input[type="email"]', testEmail);

    // Click subscribe button
    await page.click('button:has-text("Subscribe")');

    // Wait for success message
    await expect(page.locator('text=/subscribed/i')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for invalid email format', async ({ page }) => {
    // Fill invalid email
    await page.fill('input[type="email"]', 'invalid-email');

    // Click subscribe button
    await page.click('button:has-text("Subscribe")');

    // Wait for error message
    await expect(page.locator('text=/invalid.*email/i')).toBeVisible({ timeout: 10000 });
  });

  test('should handle duplicate email gracefully', async ({ page }) => {
    const testEmail = `duplicate-${Date.now()}@example.com`;

    // First subscription
    await page.fill('input[type="email"]', testEmail);
    await page.click('button:has-text("Subscribe")');
    await expect(page.locator('text=/subscribed/i')).toBeVisible({ timeout: 10000 });

    // Reload page
    await page.reload();

    // Second subscription with same email
    await page.fill('input[type="email"]', testEmail);
    await page.click('button:has-text("Subscribe")');

    // Should show already subscribed or success message
    await expect(
      page.locator('text=/already.*subscribed|subscribed/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display latest OPS cards', async ({ page }) => {
    // Check if OPS cards section exists
    const opsSection = page.locator('[data-testid="ops-list"], .ops-list, section').filter({
      has: page.locator('text=/recent|latest|ops/i'),
    }).first();

    // If OPS section exists, verify cards are visible
    const count = await opsSection.count();
    if (count > 0) {
      await expect(opsSection).toBeVisible();
    }
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    // Tab to email input
    await page.keyboard.press('Tab');
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();

    // Tab to subscribe button
    await page.keyboard.press('Tab');
    const subscribeButton = page.locator('button').filter({ hasText: /subscribe/i });
    await expect(subscribeButton).toBeFocused();
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify key elements are visible on mobile
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button').filter({ hasText: /subscribe/i })).toBeVisible();
  });
});

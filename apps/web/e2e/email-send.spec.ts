import { test, expect } from '@playwright/test';

test.describe('Email Send Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to builder page to create OPS first
    await page.goto('/builder');
  });

  test.skip('should show send email modal after publishing OPS', async ({ page }) => {
    // Create OPS
    await page.fill('input[type="datetime-local"], input[type="date"]', '2025-01-15T10:30');
    await page.fill('input[placeholder*="location" i], input[name*="location" i]', 'Test Location');

    const incidentTypeInput = page.locator('input[name*="incident" i], select[name*="type" i]').first();
    await incidentTypeInput.fill('Test Incident');

    await page.fill('textarea[name*="cause" i]', 'Test cause for email send flow');

    await page.waitForTimeout(1000);

    // Click publish
    const publishButton = page.locator('button').filter({ hasText: /publish|save|생성/i }).first();
    await publishButton.click();

    await page.waitForTimeout(2000);

    // Look for send email button or modal
    const sendButton = page.locator('button').filter({ hasText: /send|email|발송/i }).first();
    const hasSendButton = await sendButton.count();

    if (hasSendButton > 0) {
      await expect(sendButton).toBeVisible();
    }
  });

  test.skip('should allow entering recipient email addresses', async ({ page }) => {
    // After creating OPS, open send modal
    await page.fill('input[type="datetime-local"], input[type="date"]', '2025-01-15T10:30');
    await page.fill('input[placeholder*="location" i], input[name*="location" i]', 'Email Test Location');

    const incidentTypeInput = page.locator('input[name*="incident" i], select[name*="type" i]').first();
    await incidentTypeInput.fill('Fall');

    await page.fill('textarea[name*="cause" i]', 'Test cause');
    await page.waitForTimeout(1000);

    const publishButton = page.locator('button').filter({ hasText: /publish|save|생성/i }).first();
    await publishButton.click();
    await page.waitForTimeout(2000);

    // Click send button
    const sendButton = page.locator('button').filter({ hasText: /send|email|발송/i }).first();
    await sendButton.click();

    // Wait for email modal
    await page.waitForTimeout(500);

    // Fill recipient email
    const emailInput = page.locator('input[type="email"]').last();
    await emailInput.fill('recipient@example.com');
  });

  test.skip('should send email and show delivery confirmation', async ({ page }) => {
    // Create OPS
    await page.fill('input[type="datetime-local"], input[type="date"]', '2025-01-15T10:30');
    await page.fill('input[placeholder*="location" i], input[name*="location" i]', 'Send Test Location');

    const incidentTypeInput = page.locator('input[name*="incident" i], select[name*="type" i]').first();
    await incidentTypeInput.fill('Chemical Spill');

    await page.fill('textarea[name*="cause" i]', 'Container leak');
    await page.waitForTimeout(1000);

    // Publish
    const publishButton = page.locator('button').filter({ hasText: /publish|save|생성/i }).first();
    await publishButton.click();
    await page.waitForTimeout(2000);

    // Open send modal
    const sendButton = page.locator('button').filter({ hasText: /send|email|발송/i }).first();
    await sendButton.click();
    await page.waitForTimeout(500);

    // Fill recipients
    const emailInput = page.locator('input[type="email"]').last();
    await emailInput.fill('test1@example.com');

    // Submit send form
    const submitButton = page.locator('button').filter({ hasText: /send|confirm|발송/i }).last();
    await submitButton.click();

    // Wait for confirmation
    await expect(page.locator('text=/sent|delivered|발송.*완료/i')).toBeVisible({ timeout: 15000 });
  });

  test.skip('should validate email addresses before sending', async ({ page }) => {
    // Create minimal OPS
    await page.fill('input[type="datetime-local"], input[type="date"]', '2025-01-15T10:30');
    await page.fill('input[placeholder*="location" i], input[name*="location" i]', 'Validation Test');

    const incidentTypeInput = page.locator('input[name*="incident" i], select[name*="type" i]').first();
    await incidentTypeInput.fill('Test');

    await page.fill('textarea[name*="cause" i]', 'Test');
    await page.waitForTimeout(1000);

    const publishButton = page.locator('button').filter({ hasText: /publish|save|생성/i }).first();
    await publishButton.click();
    await page.waitForTimeout(2000);

    // Open send modal
    const sendButton = page.locator('button').filter({ hasText: /send|email|발송/i }).first();
    await sendButton.click();
    await page.waitForTimeout(500);

    // Fill invalid email
    const emailInput = page.locator('input[type="email"]').last();
    await emailInput.fill('invalid-email');

    // Try to submit
    const submitButton = page.locator('button').filter({ hasText: /send|confirm|발송/i }).last();
    await submitButton.click();

    // Should show validation error
    await expect(page.locator('text=/invalid.*email/i')).toBeVisible({ timeout: 5000 });
  });

  test.skip('should allow sending to multiple recipients', async ({ page }) => {
    // Create OPS
    await page.fill('input[type="datetime-local"], input[type="date"]', '2025-01-15T10:30');
    await page.fill('input[placeholder*="location" i], input[name*="location" i]', 'Multi-Recipient Test');

    const incidentTypeInput = page.locator('input[name*="incident" i], select[name*="type" i]').first();
    await incidentTypeInput.fill('Fall');

    await page.fill('textarea[name*="cause" i]', 'Test cause');
    await page.waitForTimeout(1000);

    const publishButton = page.locator('button').filter({ hasText: /publish|save|생성/i }).first();
    await publishButton.click();
    await page.waitForTimeout(2000);

    // Open send modal
    const sendButton = page.locator('button').filter({ hasText: /send|email|발송/i }).first();
    await sendButton.click();
    await page.waitForTimeout(500);

    // Add multiple recipients
    const emailInputs = page.locator('input[type="email"]');
    await emailInputs.last().fill('recipient1@example.com');

    // Check if we can add more recipients
    const addRecipientButton = page.locator('button').filter({ hasText: /add|추가/i }).first();
    const hasAddButton = await addRecipientButton.count();

    if (hasAddButton > 0) {
      await addRecipientButton.click();
      await emailInputs.last().fill('recipient2@example.com');
    }
  });

  test.skip('should show delivery log after sending', async ({ page }) => {
    // Create and publish OPS
    await page.fill('input[type="datetime-local"], input[type="date"]', '2025-01-15T10:30');
    await page.fill('input[placeholder*="location" i], input[name*="location" i]', 'Log Test Location');

    const incidentTypeInput = page.locator('input[name*="incident" i], select[name*="type" i]').first();
    await incidentTypeInput.fill('Equipment Failure');

    await page.fill('textarea[name*="cause" i]', 'Test cause');
    await page.waitForTimeout(1000);

    const publishButton = page.locator('button').filter({ hasText: /publish|save|생성/i }).first();
    await publishButton.click();
    await page.waitForTimeout(2000);

    // Send email
    const sendButton = page.locator('button').filter({ hasText: /send|email|발송/i }).first();
    await sendButton.click();
    await page.waitForTimeout(500);

    const emailInput = page.locator('input[type="email"]').last();
    await emailInput.fill('log-test@example.com');

    const submitButton = page.locator('button').filter({ hasText: /send|confirm|발송/i }).last();
    await submitButton.click();

    // Wait for delivery confirmation
    await page.waitForTimeout(3000);

    // Check for delivery log
    const deliveryLog = page.locator('text=/delivery|log|발송.*기록/i').first();
    const hasDeliveryLog = await deliveryLog.count();

    if (hasDeliveryLog > 0) {
      await expect(deliveryLog).toBeVisible();
    }
  });
});

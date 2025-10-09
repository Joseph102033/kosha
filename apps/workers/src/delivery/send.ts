/**
 * POST /api/send Handler
 * Sends email with OPS link to recipients and logs delivery
 */

import type { Env } from '../index';
import type { SendEmailRequest, SendEmailResponse } from './models';

/**
 * Generate unique delivery ID
 */
function generateDeliveryId(): string {
  return `delivery-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate email address format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate send request
 */
function validateSendRequest(data: any): data is SendEmailRequest {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!data.opsId || typeof data.opsId !== 'string') {
    return false;
  }

  if (!data.publicUrl || typeof data.publicUrl !== 'string') {
    return false;
  }

  if (!Array.isArray(data.recipients) || data.recipients.length === 0) {
    return false;
  }

  // Validate all email addresses
  for (const email of data.recipients) {
    if (!isValidEmail(email)) {
      return false;
    }
  }

  return true;
}

/**
 * Send email via Resend API (mock for now, will integrate real API)
 */
async function sendEmailViaProvider(
  to: string,
  opsTitle: string,
  publicUrl: string,
  apiKey?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // If no API key, simulate queued status
  if (!apiKey) {
    return { success: true, messageId: `mock-${Date.now()}` };
  }

  // TODO: Implement real Resend API call
  // For now, simulate success
  return { success: true, messageId: `mock-${Date.now()}` };
}

/**
 * Handle POST /api/send
 */
export async function handleSend(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json(
      { success: false, error: 'Method not allowed' } as SendEmailResponse,
      { status: 405 }
    );
  }

  try {
    const body = await request.json();

    if (!validateSendRequest(body)) {
      // Determine specific validation error
      if (!body.opsId) {
        return Response.json(
          { success: false, error: 'Missing required field: opsId' } as SendEmailResponse,
          { status: 400 }
        );
      }
      if (!body.publicUrl) {
        return Response.json(
          { success: false, error: 'Missing required field: publicUrl' } as SendEmailResponse,
          { status: 400 }
        );
      }
      if (!Array.isArray(body.recipients) || body.recipients.length === 0) {
        return Response.json(
          { success: false, error: 'Missing or empty recipients array' } as SendEmailResponse,
          { status: 400 }
        );
      }
      // Check for invalid emails
      for (const email of body.recipients) {
        if (!isValidEmail(email)) {
          return Response.json(
            { success: false, error: `Invalid email address: ${email}` } as SendEmailResponse,
            { status: 400 }
          );
        }
      }
      return Response.json(
        { success: false, error: 'Invalid request data' } as SendEmailResponse,
        { status: 400 }
      );
    }

    // Deduplicate recipients
    const uniqueRecipients = Array.from(new Set(body.recipients));

    const deliveryIds: string[] = [];
    let sentCount = 0;
    let failedCount = 0;

    // Fan-out: send to each recipient
    for (const recipient of uniqueRecipients) {
      const deliveryId = generateDeliveryId();
      const sentAt = new Date().toISOString();

      // Send email
      const result = await sendEmailViaProvider(
        recipient,
        body.opsId,
        body.publicUrl,
        env.EMAIL_API_KEY
      );

      const status = result.success ? 'sent' : 'failed';
      if (result.success) {
        sentCount++;
      } else {
        failedCount++;
      }

      // Log to D1
      await env.DB.prepare(
        `INSERT INTO deliveries (id, ops_id, to_email, provider_msg_id, status, sent_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          deliveryId,
          body.opsId,
          recipient,
          result.messageId || null,
          status,
          sentAt,
          sentAt
        )
        .run();

      deliveryIds.push(deliveryId);
    }

    return Response.json({
      success: true,
      data: {
        sent: sentCount,
        failed: failedCount,
        deliveryIds,
      },
    } as SendEmailResponse);
  } catch (error) {
    console.error('Error sending emails:', error);
    return Response.json(
      { success: false, error: 'Failed to send emails' } as SendEmailResponse,
      { status: 500 }
    );
  }
}

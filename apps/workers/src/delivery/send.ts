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
 * Send email via Resend API
 */
async function sendEmailViaProvider(
  to: string,
  opsTitle: string,
  publicUrl: string,
  apiKey?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // If no API key, simulate queued status (for development)
  if (!apiKey) {
    console.log('No EMAIL_API_KEY configured, using mock mode');
    return { success: true, messageId: `mock-${Date.now()}` };
  }

  try {
    // Resend API call
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'KOSHA OPS Studio <onboarding@resend.dev>', // Resend의 기본 테스트 발신자
        to: [to],
        subject: `[KOSHA OPS] ${opsTitle} - 안전 보건 자료 공유`,
        html: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KOSHA OPS 안전 보건 자료</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans KR', sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🏗️ KOSHA OPS Studio</h1>
              <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">산업 안전 보건 정보 공유</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 20px; font-weight: 600;">안전 보건 자료가 공유되었습니다</h2>

              <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                새로운 OPS(Operational Safety) 자료가 작성되어 공유되었습니다.
              </p>

              <div style="background-color: #f9fafb; border-left: 4px solid #667eea; padding: 16px 20px; margin: 0 0 30px; border-radius: 4px;">
                <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 600;">📄 ${opsTitle}</p>
              </div>

              <p style="margin: 0 0 30px; color: #6b7280; font-size: 14px; line-height: 1.6;">
                아래 버튼을 클릭하여 자세한 내용을 확인하실 수 있습니다.<br>
                재해 개요, 원인 분석, 예방 체크리스트 등의 정보가 포함되어 있습니다.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px;">
                    <a href="${publicUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                      OPS 자료 확인하기 →
                    </a>
                  </td>
                </tr>
              </table>

              <div style="background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 6px; padding: 16px 20px; margin: 0 0 20px;">
                <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                  <strong>💡 참고사항:</strong><br>
                  • 이 자료는 안전 보건 교육 목적으로 공유되었습니다<br>
                  • 링크는 발송일로부터 영구적으로 접근 가능합니다<br>
                  • PDF 다운로드 및 인쇄가 가능합니다
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 13px; line-height: 1.5;">
                이 이메일은 <strong>KOSHA OPS Studio</strong>에서 발송되었습니다.<br>
                산업 안전 보건 정보를 효율적으로 관리하고 공유하는 플랫폼입니다.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2025 KOSHA OPS Studio. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Resend API error:', errorData);
      return {
        success: false,
        error: `Resend API error: ${response.status} ${errorData}`
      };
    }

    const data = await response.json() as { id: string };
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
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

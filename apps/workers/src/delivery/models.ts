/**
 * Delivery domain models and types
 */

export interface SendEmailRequest {
  opsId: string;
  recipients: string[];
  publicUrl: string;
}

export interface SendEmailResponse {
  success: boolean;
  data?: {
    sent: number;
    failed: number;
    deliveryIds: string[];
  };
  error?: string;
}

export interface DeliveryRecord {
  id: string;
  ops_id: string;
  to_email: string;
  provider_msg_id: string | null;
  status: 'queued' | 'sent' | 'failed';
  sent_at: string;
}

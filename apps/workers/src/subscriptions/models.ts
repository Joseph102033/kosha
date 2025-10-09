/**
 * Subscription domain models and types
 */

export interface SubscribeRequest {
  email: string;
}

export interface SubscribeResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  status: 'pending' | 'active' | 'unsub';
  created_at: string;
}

export type SubscriberStatus = Subscriber['status'];

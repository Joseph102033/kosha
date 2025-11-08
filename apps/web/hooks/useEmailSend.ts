import { useState } from 'react';
import { fetchWithAuth } from '../lib/auth';

interface Subscriber {
  id: string;
  email: string;
}

interface EmailSendResult {
  sent: number;
  failed: number;
}

/**
 * Custom hook for email sending functionality
 *
 * Handles:
 * - Loading subscriber list from API
 * - Managing subscriber selection (individual and bulk)
 * - Sending emails to selected subscribers and manual recipients
 * - Email validation and error handling
 * - Resetting email state
 *
 * @param apiUrl - The API base URL for making requests
 * @param onAuthRequired - Callback function when authentication is needed (401 response)
 * @returns Email state, subscriber management, and send handlers
 */
export function useEmailSend(apiUrl: string, onAuthRequired: () => void) {
  // Email sending state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSendResult, setEmailSendResult] = useState<EmailSendResult | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Subscriber list state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);

  const loadSubscribers = async () => {
    setIsLoadingSubscribers(true);
    try {
      const response = await fetchWithAuth(`${apiUrl}/api/subscribers`, {
        method: 'GET',
      });

      if (response.status === 401) {
        setEmailError('인증 오류: 액세스 키를 확인해주세요');
        onAuthRequired();
        return;
      }

      const data = await response.json();

      if (data.success && data.data && data.data.subscribers) {
        setSubscribers(data.data.subscribers);
      } else {
        setEmailError('구독자 목록을 불러올 수 없습니다');
      }
    } catch (err) {
      setEmailError('네트워크 오류: 구독자 목록을 불러올 수 없습니다');
    } finally {
      setIsLoadingSubscribers(false);
    }
  };

  const toggleSubscriber = (email: string) => {
    const newSelected = new Set(selectedSubscribers);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedSubscribers(newSelected);
  };

  const toggleAllSubscribers = () => {
    if (selectedSubscribers.size === subscribers.length) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(subscribers.map(s => s.email)));
    }
  };

  const handleSendEmail = async (publishedUrl: string | null, publishedOpsId: string | null) => {
    if (!publishedUrl || !publishedOpsId) {
      setEmailError('발행된 OPS 문서가 없습니다');
      return;
    }

    // Combine selected subscribers + manual input emails
    const manualEmails = emailRecipients
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const emails = [
      ...Array.from(selectedSubscribers),
      ...manualEmails,
    ];

    // Remove duplicates
    const uniqueEmails = Array.from(new Set(emails));

    if (uniqueEmails.length === 0) {
      setEmailError('이메일 주소를 입력하거나 구독자를 선택해주세요');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = uniqueEmails.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      setEmailError(`잘못된 이메일 주소: ${invalidEmails.join(', ')}`);
      return;
    }

    setIsSendingEmail(true);
    setEmailError(null);
    setEmailSendResult(null);

    try {
      // Validate and normalize the public URL
      // Workers now returns frontend URL directly (e.g., https://kosha-8ad.pages.dev/p/...)
      let fullUrl: string;

      // Case 1: Absolute URL (starting with http:// or https://)
      if (publishedUrl.startsWith('http://') || publishedUrl.startsWith('https://')) {
        try {
          // Validate URL format
          const urlObj = new URL(publishedUrl);
          fullUrl = publishedUrl;
        } catch (e) {
          // Invalid URL format, try to extract path and reconstruct
          const pathMatch = publishedUrl.match(/\/p\/[a-z0-9-]+/);
          if (pathMatch) {
            fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}${pathMatch[0]}`;
          } else {
            setEmailError('잘못된 URL 형식입니다');
            return;
          }
        }
      }
      // Case 2: Relative path (starting with /)
      else if (publishedUrl.startsWith('/')) {
        fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}${publishedUrl}`;
      }
      // Case 3: Invalid format (e.g., malformed URL like "https//...")
      else {
        // Try to extract path pattern and reconstruct
        const pathMatch = publishedUrl.match(/\/p\/[a-z0-9-]+/);
        if (pathMatch) {
          fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}${pathMatch[0]}`;
        } else {
          setEmailError('잘못된 URL 형식입니다');
          return;
        }
      }

      const response = await fetchWithAuth(`${apiUrl}/api/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opsId: publishedOpsId,
          publicUrl: fullUrl,
          recipients: uniqueEmails,
        }),
      });

      if (response.status === 401) {
        setEmailError('인증 오류: 액세스 키를 확인해주세요');
        onAuthRequired();
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        setEmailSendResult({
          sent: data.data.sent,
          failed: data.data.failed,
        });
        setEmailRecipients(''); // Clear input on success
      } else {
        setEmailError(data.error || '이메일 발송 실패');
      }
    } catch (err) {
      setEmailError('네트워크 오류: 이메일을 발송할 수 없습니다');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const resetEmailState = () => {
    setShowEmailModal(false);
    setEmailRecipients('');
    setEmailError(null);
    setEmailSendResult(null);
    setSelectedSubscribers(new Set());
    setSubscribers([]);
  };

  return {
    // Modal state
    showEmailModal,
    setShowEmailModal,

    // Email input state
    emailRecipients,
    setEmailRecipients,

    // Send state
    isSendingEmail,
    emailSendResult,
    emailError,

    // Subscriber state
    subscribers,
    selectedSubscribers,
    isLoadingSubscribers,

    // Functions
    loadSubscribers,
    toggleSubscriber,
    toggleAllSubscribers,
    handleSendEmail,
    resetEmailState,
  };
}

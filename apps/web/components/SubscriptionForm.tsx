/**
 * Email Subscription Form Component
 *
 * Features:
 * - Client-side email validation
 * - Loading states
 * - Success/error messaging
 * - Responsive design
 */

import { useState, FormEvent } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://safe-ops-studio-workers.yosep102033.workers.dev';

interface SubscriptionFormProps {
  workerUrl?: string; // Cloudflare Worker URL (default: /api/subscribe)
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function SubscriptionForm({ workerUrl = `${API_URL}/api/subscribe` }: SubscriptionFormProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return email.length > 0 && email.length <= 254 && emailRegex.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Reset previous messages
    setMessage('');

    // Client-side validation
    if (!isValidEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail(''); // Clear input on success
      } else {
        setStatus('error');
        setMessage(data.error || 'Subscription failed. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
      console.error('Subscription error:', error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={status === 'loading'}
            className={`
              flex-1 px-4 py-3 rounded-lg border-2
              focus:outline-none focus:ring-2 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                status === 'error'
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }
            `}
            required
            aria-label="Email address"
            aria-invalid={status === 'error'}
            aria-describedby={message ? 'form-message' : undefined}
          />
          <button
            type="submit"
            disabled={status === 'loading' || !email}
            className={`
              px-6 py-3 rounded-lg font-semibold
              transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                status === 'loading'
                  ? 'bg-blue-400 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }
              text-white shadow-md hover:shadow-lg
            `}
            aria-label="Subscribe"
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Subscribing...
              </span>
            ) : (
              'Subscribe'
            )}
          </button>
        </div>

        {message && (
          <div
            id="form-message"
            role="alert"
            className={`
              p-4 rounded-lg text-sm font-medium
              ${
                status === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }
            `}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getAccessKey, setAccessKey } from '../lib/auth';

/**
 * Custom hook for managing authentication state and access key
 */
export function useAuth() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [hasAccessKey, setHasAccessKey] = useState(false);

  // Check for access key on mount
  useEffect(() => {
    setHasAccessKey(!!getAccessKey());
  }, []);

  const handleSaveAccessKey = () => {
    if (accessKeyInput.trim()) {
      setAccessKey(accessKeyInput.trim());
      setHasAccessKey(true);
      setShowAuthModal(false);
      setAccessKeyInput('');
    }
  };

  return {
    showAuthModal,
    setShowAuthModal,
    accessKeyInput,
    setAccessKeyInput,
    hasAccessKey,
    handleSaveAccessKey,
  };
}

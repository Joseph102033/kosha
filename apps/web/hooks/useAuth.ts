import { useState, useEffect } from 'react';
import { getAccessKey, setAccessKey } from '../lib/auth';

/**
 * Custom hook for managing authentication state and access key
 */
export function useAuth() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [hasAccessKey, setHasAccessKey] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Check for access key on mount
  // IMPORTANT: Use isMounted flag to prevent React Error #418 (Hydration Mismatch)
  // Server renders with hasAccessKey=false, client hydrates with actual localStorage value
  useEffect(() => {
    setIsMounted(true);
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
    isMounted,
    handleSaveAccessKey,
  };
}

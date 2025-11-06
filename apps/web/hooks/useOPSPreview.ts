import { useState, useEffect, useRef } from 'react';
import type { OPSFormData, OPSDocument } from '../lib/schemas/ops';
import { isFormReadyForPreview, validateOPSDocument } from '../lib/schemas/ops';
import { generateDummyOPS } from '../lib/dummy-ops';
import type { PreviewState } from '../components/Preview';

/**
 * Custom hook for OPS preview generation with multi-stage state machine
 *
 * Preview state flow: idle → skeleton → dummy → generating → ready/error
 *
 * Implements a sophisticated preview strategy:
 * 1. Shows skeleton UI immediately when form is ready
 * 2. Shows dummy data after 300ms for fast feedback
 * 3. Fetches real data from API after 1 second debounce
 * 4. Falls back to dummy data on errors
 *
 * IMPORTANT: This hook contains complex timer logic with proper cleanup
 *
 * @param formData - The OPS form data to generate preview from
 * @param apiUrl - The API base URL for making requests
 * @returns Preview state, data, error, and active tab controls
 */
export function useOPSPreview(formData: Partial<OPSFormData>, apiUrl: string) {
  // Preview state machine: idle → skeleton → dummy → generating → ready/error
  const [previewState, setPreviewState] = useState<PreviewState>('idle');
  const [preview, setPreview] = useState<OPSDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'causes' | 'checklist' | 'laws'>('summary');

  // Debounce timer refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dummyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Preview generation with skeleton → dummy → real data flow
  useEffect(() => {
    // Clear existing timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (dummyTimerRef.current) {
      clearTimeout(dummyTimerRef.current);
    }

    // Check if form is ready for preview
    if (!isFormReadyForPreview(formData)) {
      setPreviewState('idle');
      setPreview(null);
      setError(null);
      return;
    }

    // Step 1: Show skeleton immediately
    setPreviewState('skeleton');
    setError(null);

    // Step 2: Show dummy data after 300ms (fast feedback)
    dummyTimerRef.current = setTimeout(() => {
      const dummyData = generateDummyOPS(formData);
      setPreview(dummyData);
      setPreviewState('dummy');
    }, 300);

    // Step 3: Generate real data after 1 second debounce
    debounceTimerRef.current = setTimeout(async () => {
      setPreviewState('generating');

      try {
        const response = await fetch(`${apiUrl}/api/ops/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.success && data.data) {
          // Validate with Zod schema
          const validation = validateOPSDocument(data.data);
          if (validation.success) {
            setPreview(validation.data);
            setPreviewState('ready');
            setError(null);
          } else {
            const errorMessage = 'error' in validation ? validation.error : 'Validation failed';
            console.error('OPS validation failed:', errorMessage);
            // Fall back to dummy data on validation error
            setPreviewState('dummy');
            setError('Data validation warning: ' + String(errorMessage));
          }
        } else {
          // API error: keep dummy data and show error
          setError(data.error || 'Failed to generate preview');
          setPreviewState('dummy');
        }
      } catch (err) {
        console.error('Preview generation error:', err);
        // Network error: keep dummy data as fallback
        setError('Network error: Using offline preview');
        setPreviewState('dummy');
      }
    }, 1000);

    // Cleanup timers
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (dummyTimerRef.current) {
        clearTimeout(dummyTimerRef.current);
      }
    };
  }, [formData, apiUrl]);

  return {
    previewState,
    preview,
    error,
    activeTab,
    setActiveTab,
  };
}

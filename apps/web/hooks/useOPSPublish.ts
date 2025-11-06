import { useState } from 'react';
import { fetchWithAuth } from '../lib/auth';
import type { OPSDocument, OPSFormData } from '../lib/schemas/ops';

/**
 * Custom hook for publishing OPS documents
 *
 * Handles the publish workflow including:
 * - Publishing OPS documents to the server
 * - Managing publish state and errors
 * - Copying public URLs to clipboard
 * - Resetting publish state
 *
 * @param apiUrl - The API base URL for making requests
 * @param onAuthRequired - Callback function when authentication is needed (401 response)
 * @returns Publish state, handlers, and utility functions
 */
export function useOPSPublish(apiUrl: string, onAuthRequired: () => void) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishedOpsId, setPublishedOpsId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const handlePublish = async (
    preview: OPSDocument | null,
    formData: Partial<OPSFormData>
  ) => {
    if (!preview) {
      setPublishError('Please wait for preview to generate');
      return;
    }

    if (!formData.title || !formData.title.trim()) {
      setPublishError('Please enter a title for this OPS document');
      return;
    }

    // Ensure all required fields are present
    if (!formData.incidentDate || !formData.location || !formData.incidentType || !formData.incidentCause) {
      setPublishError('Please fill all required fields');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    try {
      const response = await fetchWithAuth(`${apiUrl}/api/ops/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          incidentDate: formData.incidentDate,
          location: formData.location,
          agentObject: formData.agentObject || '',
          hazardObject: formData.hazardObject || '',
          incidentType: formData.incidentType,
          incidentCause: formData.incidentCause,
          opsDocument: preview,
        }),
      });

      if (response.status === 401) {
        setPublishError('Unauthorized: Please enter your access key');
        onAuthRequired();
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        setPublishedUrl(data.data.publicUrl);
        setPublishedOpsId(data.data.opsId);
      } else {
        setPublishError(data.error || 'Failed to publish OPS document');
      }
    } catch (err) {
      setPublishError('Network error: Unable to publish OPS document');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyPublicUrl = () => {
    if (publishedUrl) {
      const fullUrl = `${window.location.origin}${publishedUrl}`;
      navigator.clipboard.writeText(fullUrl);
    }
  };

  const resetPublishState = () => {
    setPublishedUrl(null);
    setPublishedOpsId(null);
    setPublishError(null);
  };

  return {
    isPublishing,
    publishedUrl,
    publishedOpsId,
    publishError,
    handlePublish,
    copyPublicUrl,
    resetPublishState,
  };
}

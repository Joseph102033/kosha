/**
 * Law Feedback System
 * Stores anonymous user feedback on law suggestions in Cloudflare KV
 * NO PII - only document hash, selections, and feedback reasons
 */

import { generateDocumentHash } from '../utils/hash';

interface LawSelection {
  law_id: string;
  included: boolean;
  order: number;
  feedback_reason?: string; // Optional: why included/excluded
}

interface FeedbackData {
  document_hash: string;
  incident_context: {
    summary?: string;
    incident_type?: string;
    causative_object?: string;
    work_process?: string;
  };
  selections: LawSelection[];
  submitted_at: string;
  version: string;
}

interface StoredFeedback {
  document_hash: string;
  selections: LawSelection[];
  submitted_at: string;
  version: string;
  // Note: incident_context NOT stored (no PII)
}

/**
 * Save user feedback on law selections
 */
export async function saveLawFeedback(
  kv: KVNamespace,
  params: {
    summary?: string;
    incident_type?: string;
    causative_object?: string;
    work_process?: string;
    selections: LawSelection[];
  }
): Promise<{
  success: boolean;
  document_hash: string;
  message: string;
}> {
  try {
    // Generate document hash (deterministic)
    const documentHash = await generateDocumentHash({
      summary: params.summary,
      incident_type: params.incident_type,
      causative_object: params.causative_object,
      work_process: params.work_process,
    });

    // Prepare feedback data (exclude PII from storage)
    const storedData: StoredFeedback = {
      document_hash: documentHash,
      selections: params.selections.map((sel) => ({
        law_id: sel.law_id,
        included: sel.included,
        order: sel.order,
        feedback_reason: sel.feedback_reason,
      })),
      submitted_at: new Date().toISOString(),
      version: '1.0.0',
    };

    // Store in KV with hash as key
    const kvKey = `law_feedback:${documentHash}`;
    await kv.put(kvKey, JSON.stringify(storedData), {
      expirationTtl: 60 * 60 * 24 * 365, // 1 year retention
    });

    return {
      success: true,
      document_hash: documentHash,
      message: 'Feedback saved successfully',
    };
  } catch (error) {
    console.error('[Law Feedback] Save error:', error);
    throw new Error('Failed to save feedback');
  }
}

/**
 * Retrieve stored feedback for a document hash
 */
export async function getLawFeedback(
  kv: KVNamespace,
  documentHash: string
): Promise<StoredFeedback | null> {
  try {
    const kvKey = `law_feedback:${documentHash}`;
    const stored = await kv.get(kvKey, 'text');

    if (!stored) {
      return null;
    }

    const feedback = JSON.parse(stored) as StoredFeedback;
    return feedback;
  } catch (error) {
    console.error('[Law Feedback] Retrieve error:', error);
    return null;
  }
}

/**
 * Check if feedback exists for a document hash
 */
export async function hasFeedback(
  kv: KVNamespace,
  documentHash: string
): Promise<boolean> {
  try {
    const kvKey = `law_feedback:${documentHash}`;
    const exists = await kv.get(kvKey, 'text');
    return exists !== null;
  } catch (error) {
    console.error('[Law Feedback] Check error:', error);
    return false;
  }
}

/**
 * Delete feedback for a document hash (admin/testing only)
 */
export async function deleteLawFeedback(
  kv: KVNamespace,
  documentHash: string
): Promise<boolean> {
  try {
    const kvKey = `law_feedback:${documentHash}`;
    await kv.delete(kvKey);
    return true;
  } catch (error) {
    console.error('[Law Feedback] Delete error:', error);
    return false;
  }
}

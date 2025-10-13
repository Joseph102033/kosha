/**
 * Shared types for OPS document exporters
 */

export interface OPSExportData {
  // Metadata
  title: string;
  incident_date: string;
  location: string;
  created_at: string;
  document_hash: string;

  // Incident details
  agent_object: string; // 기인물
  hazard_object: string; // 가해물
  incident_type: string; // 사고형태
  incident_cause: string; // 발생개요

  // AI-generated content
  summary: string;
  root_causes: string[];
  prevention_checklist: string[];

  // Law suggestions (optional)
  suggested_laws?: Array<{
    law_title: string;
    article_no: string;
    text: string;
    confidence?: number;
    confidence_level?: 'high' | 'medium' | 'low';
  }>;
}

export interface ExportOptions {
  includeWatermark?: boolean;
  includeHash?: boolean;
  toolName?: string;
  appendix?: boolean; // Include laws appendix
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  includeWatermark: true,
  includeHash: true,
  toolName: 'Safe OPS Studio',
  appendix: true,
};

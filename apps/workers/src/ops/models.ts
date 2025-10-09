/**
 * OPS Domain Models
 */

export interface OPSInput {
  incidentDate: string; // ISO 8601 date-time
  location: string;
  agentObject?: string; // Optional
  hazardObject?: string; // Optional
  incidentType: string;
  incidentCause: string; // Free-text
}

export interface LawReference {
  title: string;
  url: string;
}

export interface OPSDocument {
  summary: string; // 4-6 lines
  causes: {
    direct: string[];
    indirect: string[];
  };
  checklist: string[]; // 6-10 prevention items
  laws: LawReference[];
  imageMeta?: {
    type: 'placeholder' | 'generated';
    url?: string;
  };
}

export interface GenerateOPSRequest {
  incidentDate: string;
  location: string;
  agentObject?: string;
  hazardObject?: string;
  incidentType: string;
  incidentCause: string;
}

export interface GenerateOPSResponse {
  success: boolean;
  data?: OPSDocument;
  error?: string;
}

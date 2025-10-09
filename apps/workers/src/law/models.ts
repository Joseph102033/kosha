/**
 * Law Domain Models
 */

export interface LawRule {
  id: string;
  keyword: string;
  law_title: string;
  url: string;
  created_at: string;
}

export interface CreateLawRuleRequest {
  keyword: string;
  lawTitle: string;
  url: string;
}

export interface UpdateLawRuleRequest {
  keyword?: string;
  lawTitle?: string;
  url?: string;
}

export interface LawRulesResponse {
  success: boolean;
  data?: LawRule[];
  error?: string;
}

export interface LawRuleResponse {
  success: boolean;
  data?: LawRule;
  error?: string;
}

export interface DeleteLawRuleResponse {
  success: boolean;
  message?: string;
  error?: string;
}

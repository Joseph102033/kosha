/**
 * OPS Composer - Generates OPS document sections
 * Rules-first approach with optional AI fallback
 */

import type { OPSInput, OPSDocument, LawReference } from './models';

/**
 * Generate a summary (4-6 lines) based on incident input
 */
export function generateSummary(input: OPSInput): string {
  const lines: string[] = [];

  // Line 1: Incident type and date
  const date = new Date(input.incidentDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  lines.push(`${input.incidentType} incident occurred on ${date}.`);

  // Line 2: Location
  lines.push(`Location: ${input.location}.`);

  // Line 3: Objects involved (if any)
  if (input.agentObject || input.hazardObject) {
    const objects = [input.agentObject, input.hazardObject].filter(Boolean).join(' and ');
    lines.push(`Involved: ${objects}.`);
  }

  // Line 4: Primary cause
  lines.push(`Primary cause: ${input.incidentCause}.`);

  // Line 5: Severity assessment (generic)
  lines.push(`This incident requires immediate investigation and preventive measures.`);

  // Line 6: Action required (if less than 6 lines)
  if (lines.length < 6) {
    lines.push(`All relevant stakeholders must review this OPS brief.`);
  }

  return lines.join('\n');
}

/**
 * Extract direct causes from incident data
 */
export function extractDirectCauses(input: OPSInput): string[] {
  const causes: string[] = [];

  // Primary cause from input
  causes.push(input.incidentCause);

  // Infer additional direct causes based on incident type
  const type = input.incidentType.toLowerCase();

  if (type.includes('fall')) {
    causes.push('Inadequate fall protection measures');
    if (input.hazardObject?.toLowerCase().includes('scaffold')) {
      causes.push('Scaffolding structural failure or instability');
    }
  } else if (type.includes('chemical')) {
    causes.push('Improper chemical storage or handling');
  } else if (type.includes('fire') || type.includes('explosion')) {
    causes.push('Ignition source exposure to flammable materials');
  }

  return causes.slice(0, 3); // Limit to 3 direct causes
}

/**
 * Extract indirect causes (root causes)
 */
export function extractIndirectCauses(input: OPSInput): string[] {
  const causes: string[] = [];

  // Generic indirect causes
  causes.push('Insufficient safety training or awareness');
  causes.push('Inadequate risk assessment procedures');

  // Type-specific indirect causes
  const type = input.incidentType.toLowerCase();

  if (type.includes('fall')) {
    causes.push('Lack of regular safety equipment inspections');
    causes.push('Inadequate supervision of high-risk work');
  } else if (type.includes('chemical')) {
    causes.push('Missing or outdated Material Safety Data Sheets');
    causes.push('Insufficient ventilation system maintenance');
  } else {
    causes.push('Gaps in standard operating procedures');
  }

  return causes.slice(0, 4); // Limit to 4 indirect causes
}

/**
 * Generate prevention checklist (6-10 items)
 */
export function generateChecklist(input: OPSInput): string[] {
  const checklist: string[] = [];

  // Universal safety checks
  checklist.push('Conduct comprehensive risk assessment before work begins');
  checklist.push('Ensure all workers have completed required safety training');
  checklist.push('Verify all safety equipment is available and in good condition');
  checklist.push('Establish clear communication protocols for emergency situations');

  // Type-specific checks
  const type = input.incidentType.toLowerCase();

  if (type.includes('fall')) {
    checklist.push('Inspect all fall protection systems and anchor points');
    checklist.push('Confirm proper use of personal fall arrest systems');
    checklist.push('Verify guardrails and safety barriers are securely installed');
    checklist.push('Ensure adequate lighting in elevated work areas');
  } else if (type.includes('chemical')) {
    checklist.push('Review Material Safety Data Sheets with all workers');
    checklist.push('Ensure proper personal protective equipment is worn');
    checklist.push('Verify chemical storage containers are properly labeled');
    checklist.push('Confirm ventilation systems are operational');
  } else {
    checklist.push('Review standard operating procedures with all team members');
    checklist.push('Inspect work area for potential hazards');
    checklist.push('Establish emergency evacuation routes');
    checklist.push('Assign designated safety observer for high-risk tasks');
  }

  // Limit to 6-10 items
  return checklist.slice(0, 10);
}

/**
 * Compose full OPS document from input
 */
export function composeOPS(input: OPSInput, laws: LawReference[]): OPSDocument {
  return {
    summary: generateSummary(input),
    causes: {
      direct: extractDirectCauses(input),
      indirect: extractIndirectCauses(input),
    },
    checklist: generateChecklist(input),
    laws,
    imageMeta: {
      type: 'placeholder',
    },
  };
}

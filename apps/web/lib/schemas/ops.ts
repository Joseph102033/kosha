/**
 * Zod schemas for OPS document structure validation
 * Ensures type-safe data flow from form → preview → API
 */

import { z } from 'zod';

/**
 * Law reference schema
 */
export const LawReferenceSchema = z.object({
  title: z.string().min(1, 'Law title is required'),
  url: z.string().url('Invalid URL format'),
});

export type LawReference = z.infer<typeof LawReferenceSchema>;

/**
 * Causes structure schema
 */
export const CausesSchema = z.object({
  direct: z.array(z.string().min(1)).min(1, 'At least one direct cause required').max(5),
  indirect: z.array(z.string().min(1)).min(1, 'At least one indirect cause required').max(6),
});

export type Causes = z.infer<typeof CausesSchema>;

/**
 * Image metadata schema
 */
export const ImageMetaSchema = z.object({
  type: z.enum(['placeholder', 'generated']),
  url: z.string().url().optional(),
});

export type ImageMeta = z.infer<typeof ImageMetaSchema>;

/**
 * Complete OPS document schema
 */
export const OPSDocumentSchema = z.object({
  summary: z.string().min(10, 'Summary too short').max(1000, 'Summary too long'),
  causes: CausesSchema,
  checklist: z.array(z.string().min(1)).min(4, 'At least 4 checklist items required').max(12),
  laws: z.array(LawReferenceSchema).min(0).max(10),
  imageMeta: ImageMetaSchema.optional(),
});

export type OPSDocument = z.infer<typeof OPSDocumentSchema>;

/**
 * Form data schema for input validation
 */
export const OPSFormDataSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  incidentDate: z.string().min(1, 'Incident date is required'),
  location: z.string().min(1, 'Location is required').max(200),
  agentObject: z.string().max(100).optional(),
  hazardObject: z.string().max(100).optional(),
  incidentType: z.string().min(1, 'Incident type is required'),
  incidentCause: z.string().min(10, 'Incident cause must be at least 10 characters').max(2000),
});

export type OPSFormData = z.infer<typeof OPSFormDataSchema>;

/**
 * Validation helper functions
 */
export function validateOPSDocument(data: unknown): { success: true; data: OPSDocument } | { success: false; error: string } {
  try {
    const validated = OPSDocumentSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = (error as z.ZodError).issues[0];
      return {
        success: false,
        error: `${firstError.path.join('.')}: ${firstError.message}`
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

export function validateOPSFormData(data: unknown): { success: true; data: OPSFormData } | { success: false; error: string } {
  try {
    const validated = OPSFormDataSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = (error as z.ZodError).issues[0];
      return {
        success: false,
        error: `${firstError.path.join('.')}: ${firstError.message}`
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

/**
 * Check if form data is complete enough to generate preview
 */
export function isFormReadyForPreview(data: Partial<OPSFormData>): boolean {
  return !!(
    data.incidentDate &&
    data.location &&
    data.incidentType &&
    data.incidentCause &&
    data.incidentCause.length >= 10
  );
}

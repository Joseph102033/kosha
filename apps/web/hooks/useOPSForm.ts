import { useState, Dispatch, SetStateAction } from 'react';
import type { OPSFormData } from '../lib/schemas/ops';
import { demoSamples } from '../lib/demo-samples';

/**
 * Custom hook for managing OPS form state
 */
export function useOPSForm() {
  const [formData, setFormData] = useState<Partial<OPSFormData>>({
    title: '',
    incidentDate: '',
    location: '',
    agentObject: '',
    hazardObject: '',
    incidentType: '',
    incidentCause: '',
  });

  const handleInputChange = (field: keyof OPSFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadDemoSample = (sampleId: string) => {
    const sample = demoSamples.find(s => s.id === sampleId);
    if (sample) {
      setFormData(sample.formData);
    }
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    loadDemoSample,
  };
}

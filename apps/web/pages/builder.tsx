import { useState, useEffect } from 'react';
import Head from 'next/head';
import { fetchWithAuth, getAccessKey, setAccessKey } from '../lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';

interface OPSFormData {
  title: string;
  incidentDate: string;
  location: string;
  agentObject: string;
  hazardObject: string;
  incidentType: string;
  incidentCause: string;
}

interface LawReference {
  title: string;
  url: string;
}

interface OPSDocument {
  summary: string;
  causes: {
    direct: string[];
    indirect: string[];
  };
  checklist: string[];
  laws: LawReference[];
  imageMeta?: {
    type: 'placeholder' | 'generated';
    url?: string;
  };
}

export default function Builder() {
  const [formData, setFormData] = useState<OPSFormData>({
    title: '',
    incidentDate: '',
    location: '',
    agentObject: '',
    hazardObject: '',
    incidentType: '',
    incidentCause: '',
  });

  const [preview, setPreview] = useState<OPSDocument | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'causes' | 'checklist' | 'laws'>('summary');

  // Publish state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Auth state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [hasAccessKey, setHasAccessKey] = useState(false);

  // Check for access key on mount
  useEffect(() => {
    setHasAccessKey(!!getAccessKey());
  }, []);

  // Debounced preview generation
  useEffect(() => {
    const generatePreview = async () => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await fetchWithAuth(`${API_URL}/api/ops/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.status === 401) {
          setError('Unauthorized: Please enter your access key');
          setShowAuthModal(true);
          return;
        }

        const data = await response.json();

        if (data.success && data.data) {
          setPreview(data.data);
        } else {
          setError(data.error || 'Failed to generate preview');
        }
      } catch (err) {
        setError('Network error: Unable to connect to API');
      } finally {
        setIsGenerating(false);
      }
    };

    const timer = setTimeout(() => {
      if (formData.incidentDate && formData.location && formData.incidentType && formData.incidentCause) {
        generatePreview();
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [formData]);

  const handleInputChange = (field: keyof OPSFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePublish = async () => {
    if (!preview) {
      setPublishError('Please wait for preview to generate');
      return;
    }

    if (!formData.title.trim()) {
      setPublishError('Please enter a title for this OPS document');
      return;
    }

    setIsPublishing(true);
    setPublishError(null);

    try {
      const response = await fetchWithAuth(`${API_URL}/api/ops/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          incidentDate: formData.incidentDate,
          location: formData.location,
          agentObject: formData.agentObject,
          hazardObject: formData.hazardObject,
          incidentType: formData.incidentType,
          incidentCause: formData.incidentCause,
          opsDocument: preview,
        }),
      });

      if (response.status === 401) {
        setPublishError('Unauthorized: Please enter your access key');
        setShowAuthModal(true);
        return;
      }

      const data = await response.json();

      if (data.success && data.data) {
        setPublishedUrl(data.data.publicUrl);
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

  const handleSaveAccessKey = () => {
    if (accessKeyInput.trim()) {
      setAccessKey(accessKeyInput.trim());
      setHasAccessKey(true);
      setShowAuthModal(false);
      setAccessKeyInput('');
    }
  };

  return (
    <>
      <Head>
        <title>OPS Builder | Safe OPS Studio</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">OPS Builder</h1>
                <p className="text-sm text-gray-600 mt-1">Create operational safety briefs from incident data</p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {hasAccessKey ? '🔑 Update Key' : '🔑 Enter Access Key'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Input Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Incident Details</h2>

              <form className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Fall from Scaffolding - January 2025"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Incident Date */}
                <div>
                  <label htmlFor="incidentDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="incidentDate"
                    value={formData.incidentDate}
                    onChange={(e) => handleInputChange('incidentDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Seoul Construction Site, Building A"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Agent Object (Optional) */}
                <div>
                  <label htmlFor="agentObject" className="block text-sm font-medium text-gray-700 mb-1">
                    Agent Object <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="agentObject"
                    value={formData.agentObject}
                    onChange={(e) => handleInputChange('agentObject', e.target.value)}
                    placeholder="e.g., Worker, Machine Operator"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Hazard Object (Optional) */}
                <div>
                  <label htmlFor="hazardObject" className="block text-sm font-medium text-gray-700 mb-1">
                    Hazard Object <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="hazardObject"
                    value={formData.hazardObject}
                    onChange={(e) => handleInputChange('hazardObject', e.target.value)}
                    placeholder="e.g., Scaffolding, Chemical Container"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Incident Type */}
                <div>
                  <label htmlFor="incidentType" className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="incidentType"
                    value={formData.incidentType}
                    onChange={(e) => handleInputChange('incidentType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select incident type</option>
                    <option value="Fall">Fall</option>
                    <option value="Chemical Spill">Chemical Spill</option>
                    <option value="Fire">Fire</option>
                    <option value="Explosion">Explosion</option>
                    <option value="Equipment Failure">Equipment Failure</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Incident Cause */}
                <div>
                  <label htmlFor="incidentCause" className="block text-sm font-medium text-gray-700 mb-1">
                    Incident Cause <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="incidentCause"
                    value={formData.incidentCause}
                    onChange={(e) => handleInputChange('incidentCause', e.target.value)}
                    placeholder="Describe the primary cause of the incident..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 text-sm">
                  {isGenerating && (
                    <span className="text-blue-600">⏳ Generating preview...</span>
                  )}
                  {error && (
                    <span className="text-red-600">⚠️ {error}</span>
                  )}
                  {preview && !isGenerating && !error && (
                    <span className="text-green-600">✓ Preview updated</span>
                  )}
                </div>

                {/* Publish Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing || !preview || !formData.title.trim()}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {isPublishing ? '📤 Publishing...' : '📤 Publish OPS Document'}
                  </button>
                  {publishError && (
                    <p className="text-red-600 text-sm mt-2">⚠️ {publishError}</p>
                  )}
                </div>
              </form>
            </div>

            {/* Right: Live Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h2>

              {!preview && (
                <div className="text-center py-12 text-gray-400">
                  <p>Fill in the form to see a live preview</p>
                </div>
              )}

              {preview && (
                <div>
                  {/* Tabs */}
                  <div className="border-b border-gray-200 mb-4">
                    <nav className="flex -mb-px space-x-4">
                      {(['summary', 'causes', 'checklist', 'laws'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`py-2 px-3 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="prose prose-sm max-w-none">
                    {activeTab === 'summary' && (
                      <div>
                        <h3 className="text-base font-semibold mb-2">Summary</h3>
                        <p className="whitespace-pre-line text-gray-700">{preview.summary}</p>
                      </div>
                    )}

                    {activeTab === 'causes' && (
                      <div>
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Direct Causes</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {preview.causes.direct.map((cause, idx) => (
                              <li key={idx} className="text-gray-700">{cause}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Indirect Causes</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {preview.causes.indirect.map((cause, idx) => (
                              <li key={idx} className="text-gray-700">{cause}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeTab === 'checklist' && (
                      <div>
                        <h3 className="text-base font-semibold mb-2">Prevention Checklist</h3>
                        <ul className="space-y-2">
                          {preview.checklist.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <input type="checkbox" className="mt-1" disabled />
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {activeTab === 'laws' && (
                      <div>
                        <h3 className="text-base font-semibold mb-2">Related Laws & Regulations</h3>
                        <ul className="space-y-2">
                          {preview.laws.map((law, idx) => (
                            <li key={idx} className="border-l-2 border-blue-500 pl-3">
                              <a
                                href={law.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline font-medium"
                              >
                                {law.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🔑 Access Key Required</h3>
              <p className="text-gray-600 mb-6">
                Please enter your access key to use admin features (generate and publish OPS documents).
              </p>
              <input
                type="password"
                value={accessKeyInput}
                onChange={(e) => setAccessKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAccessKey()}
                placeholder="Enter your access key"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAccessKey}
                  disabled={!accessKeyInput.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Save Key
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false);
                    setAccessKeyInput('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                💡 Your access key is stored locally in your browser and never sent to our servers except for authentication.
              </p>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {publishedUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">✅ OPS Document Published!</h3>
              <p className="text-gray-600 mb-6">
                Your OPS document has been successfully published and is now accessible via the public URL below.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Public URL:</p>
                <p className="text-blue-600 break-all">{window.location.origin}{publishedUrl}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={copyPublicUrl}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  📋 Copy Link
                </button>
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
                >
                  👁️ View Page
                </a>
              </div>
              <button
                onClick={() => setPublishedUrl(null)}
                className="w-full mt-3 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

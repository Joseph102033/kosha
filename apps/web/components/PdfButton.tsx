import { useState } from 'react';

interface PdfButtonProps {
  targetElementId: string;
  filename?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function PdfButton({
  targetElementId,
  filename = 'ops-document.pdf',
  className = '',
  children = '📄 Download PDF',
}: PdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Dynamic import to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;

      const element = document.getElementById(targetElementId);
      if (!element) {
        throw new Error(`Element with id "${targetElementId}" not found`);
      }

      // Configure html2pdf options for A4 size
      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number], // top, right, bottom, left in mm
        filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      // Generate and download PDF
      await html2pdf().set(options).from(element).save();
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className={`${className} ${
          isGenerating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isGenerating ? '⏳ Generating PDF...' : children}
      </button>
      {error && (
        <p className="text-red-600 text-sm mt-2">⚠️ {error}</p>
      )}
    </div>
  );
}

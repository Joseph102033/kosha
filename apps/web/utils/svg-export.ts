/**
 * SVG to PNG export utility
 * Converts SVG elements to PNG with transparent background
 */

/**
 * Convert SVG element to PNG blob
 * @param svgElement - The SVG DOM element to convert
 * @param width - Output width in pixels
 * @param height - Output height in pixels
 * @returns Promise resolving to PNG blob with alpha channel
 */
export async function svgToPng(
  svgElement: SVGSVGElement,
  width: number = 800,
  height: number = 800
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

      // Serialize SVG to string
      const svgString = new XMLSerializer().serializeToString(clonedSvg);

      // Create blob from SVG string
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Create image element
      const img = new Image();
      img.width = width;
      img.height = height;

      img.onload = () => {
        // Create canvas with transparency support
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Clear canvas (transparent background)
        ctx.clearRect(0, 0, width, height);

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to PNG blob
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create PNG blob'));
            }
          },
          'image/png',
          1.0 // Maximum quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };

      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Download blob as file
 * @param blob - The blob to download
 * @param filename - Desired filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export SVG element as PNG file
 * @param svgElement - The SVG DOM element to export
 * @param filename - Desired filename (without extension)
 * @param width - Output width in pixels
 * @param height - Output height in pixels
 */
export async function exportSvgAsPng(
  svgElement: SVGSVGElement,
  filename: string,
  width: number = 800,
  height: number = 800
): Promise<void> {
  try {
    const blob = await svgToPng(svgElement, width, height);
    downloadBlob(blob, `${filename}.png`);
  } catch (error) {
    console.error('Failed to export SVG as PNG:', error);
    throw error;
  }
}

/**
 * Get SVG as data URL (for preview or embedding)
 * @param svgElement - The SVG DOM element
 * @returns Data URL string
 */
export function svgToDataUrl(svgElement: SVGSVGElement): string {
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const base64 = btoa(unescape(encodeURIComponent(svgString)));
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Convert PNG blob to data URL
 * @param blob - PNG blob
 * @returns Promise resolving to data URL
 */
export async function pngBlobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read blob as data URL'));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

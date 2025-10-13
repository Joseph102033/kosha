/**
 * Docx Exporter using docx library
 * Generates .docx file with Korean HWP-compatible style names
 */

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  convertInchesToTwip,
  PageBreak,
  BorderStyle,
} from 'docx';
import { OPSExportData, ExportOptions, DEFAULT_EXPORT_OPTIONS } from './types';

// HWP-compatible style names (한글 스타일 이름)
const STYLES = {
  title: '제목',
  heading1: '제목1',
  heading2: '제목2',
  body: '본문',
  listItem: '항목',
};

export function generateDocx(data: OPSExportData, options: ExportOptions = {}): Document {
  const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };

  const sections: Paragraph[] = [];

  // Title
  sections.push(
    new Paragraph({
      text: data.title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Metadata section
  sections.push(
    new Paragraph({
      text: '사고 정보',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '발생일시: ', bold: true }),
        new TextRun({ text: data.incident_date }),
      ],
      spacing: { after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '발생장소: ', bold: true }),
        new TextRun({ text: data.location }),
      ],
      spacing: { after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '기인물: ', bold: true }),
        new TextRun({ text: data.agent_object }),
      ],
      spacing: { after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '가해물: ', bold: true }),
        new TextRun({ text: data.hazard_object }),
      ],
      spacing: { after: 100 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({ text: '사고형태: ', bold: true }),
        new TextRun({ text: data.incident_type }),
      ],
      spacing: { after: 200 },
    })
  );

  // Incident cause
  sections.push(
    new Paragraph({
      text: '발생개요',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      text: data.incident_cause,
      spacing: { after: 400 },
    })
  );

  // Summary
  sections.push(
    new Paragraph({
      text: '사고 요약',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      text: data.summary,
      spacing: { after: 400 },
    })
  );

  // Root causes
  sections.push(
    new Paragraph({
      text: '근본 원인 분석',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  data.root_causes.forEach((cause, index) => {
    sections.push(
      new Paragraph({
        text: `${index + 1}. ${cause}`,
        spacing: { after: 100 },
      })
    );
  });

  sections.push(
    new Paragraph({
      text: '',
      spacing: { after: 200 },
    })
  );

  // Prevention checklist
  sections.push(
    new Paragraph({
      text: '재발 방지 체크리스트',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  data.prevention_checklist.forEach((item) => {
    sections.push(
      new Paragraph({
        text: `☐ ${item}`,
        spacing: { after: 100 },
      })
    );
  });

  sections.push(
    new Paragraph({
      text: '',
      spacing: { after: 400 },
    })
  );

  // Laws appendix (if enabled and available)
  if (opts.appendix && data.suggested_laws && data.suggested_laws.length > 0) {
    // Page break before appendix
    sections.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    sections.push(
      new Paragraph({
        text: '부록: 관련 법령',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    data.suggested_laws.forEach((law, index) => {
      sections.push(
        new Paragraph({
          text: `${index + 1}. ${law.law_title} ${law.article_no}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
        })
      );

      if (law.confidence && law.confidence_level) {
        const badge =
          law.confidence_level === 'high'
            ? '✓ 추천'
            : law.confidence_level === 'medium'
            ? '⚠ 검토요망'
            : '• 보류';
        sections.push(
          new Paragraph({
            children: [
              new TextRun({ text: '신뢰도: ', bold: true }),
              new TextRun({ text: `${badge} (${law.confidence}%)` }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      sections.push(
        new Paragraph({
          text: law.text,
          spacing: { after: 200 },
        })
      );
    });
  }

  // Horizontal line separator
  sections.push(
    new Paragraph({
      text: '',
      border: {
        top: {
          color: 'CCCCCC',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: { before: 400, after: 200 },
    })
  );

  // Watermark and hash
  if (opts.includeWatermark && opts.toolName) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated by ${opts.toolName}`,
            italics: true,
            size: 16, // 8pt = 16 half-points
            color: '808080',
          }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  if (opts.includeHash) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Document Hash: ${data.document_hash}`,
            size: 16, // 8pt
            color: '808080',
          }),
        ],
        spacing: { after: 100 },
      })
    );
  }

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${new Date(data.created_at).toLocaleString('ko-KR')}`,
          size: 16, // 8pt
          color: '808080',
        }),
      ],
    })
  );

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
            },
          },
        },
        children: sections,
      },
    ],
  });

  return doc;
}

export async function downloadDocx(
  data: OPSExportData,
  filename?: string,
  options?: ExportOptions
): Promise<void> {
  const doc = generateDocx(data, options);

  // Import Packer dynamically (only available in docx)
  const { Packer } = await import('docx');

  const blob = await Packer.toBlob(doc);

  const defaultFilename = `OPS_${data.incident_date.replace(/[/:]/g, '-')}_${data.document_hash.substring(0, 8)}.docx`;
  const finalFilename = filename || defaultFilename;

  // Create download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

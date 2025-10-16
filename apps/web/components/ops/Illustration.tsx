/**
 * OPS Illustration component
 * Generates deterministic SVG illustrations based on accident scenario
 * Features: inline SVG render + PNG download button
 */

import { useRef } from 'react';
import {
  FallIcon,
  CaughtIcon,
  ElectricIcon,
  FireIcon,
  ChemicalIcon,
  ExplosionIcon,
  CollapseIcon,
  ACCIDENT_TYPE_MAP,
  type AccidentType,
} from './icons';
import { exportSvgAsPng } from '../../utils/svg-export';

export interface IllustrationScenario {
  incidentType: string; // 사고 형태 (추락, 끼임, 감전 등)
  location?: string; // 장소
  hazardObject?: string; // 기인물
  agentObject?: string; // 가해물
  ppe?: string[]; // 보호구 (Personal Protective Equipment)
}

interface IllustrationProps {
  scenario: IllustrationScenario;
  width?: number;
  height?: number;
  showDownloadButton?: boolean;
}

/**
 * Wrap text to fit within specified width (max 2 lines)
 */
function wrapText(text: string, maxLength: number = 20): string[] {
  if (text.length <= maxLength) return [text];

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxLength) {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= 1) break; // Max 2 lines
    }
  }

  if (currentLine && lines.length < 2) {
    lines.push(currentLine);
  }

  return lines.slice(0, 2); // Enforce max 2 lines
}

/**
 * Get icon component based on accident type
 */
function getIconComponent(incidentType: string) {
  // Normalize incident type (remove spaces, convert to matching key)
  const normalizedType = incidentType.trim();

  // Check direct match first
  if (normalizedType in ACCIDENT_TYPE_MAP) {
    const iconName = ACCIDENT_TYPE_MAP[normalizedType as AccidentType];
    switch (iconName) {
      case 'FallIcon':
        return FallIcon;
      case 'CaughtIcon':
        return CaughtIcon;
      case 'ElectricIcon':
        return ElectricIcon;
      case 'FireIcon':
        return FireIcon;
      case 'ChemicalIcon':
        return ChemicalIcon;
      case 'ExplosionIcon':
        return ExplosionIcon;
      case 'CollapseIcon':
        return CollapseIcon;
    }
  }

  // Fuzzy match based on keywords
  if (normalizedType.includes('추락') || normalizedType.includes('낙하')) return FallIcon;
  if (normalizedType.includes('끼임') || normalizedType.includes('협착')) return CaughtIcon;
  if (normalizedType.includes('감전') || normalizedType.includes('전기')) return ElectricIcon;
  if (normalizedType.includes('화재') || normalizedType.includes('화상')) return FireIcon;
  if (normalizedType.includes('화학') || normalizedType.includes('누출')) return ChemicalIcon;
  if (normalizedType.includes('폭발') || normalizedType.includes('파열')) return ExplosionIcon;
  if (normalizedType.includes('전도') || normalizedType.includes('붕괴') || normalizedType.includes('낙상')) return CollapseIcon;

  // Default fallback
  return FallIcon;
}

export default function Illustration({
  scenario,
  width = 600,
  height = 400,
  showDownloadButton = true,
}: IllustrationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const IconComponent = getIconComponent(scenario.incidentType);

  // Generate deterministic filename
  const generateFilename = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const typeSlug = scenario.incidentType.replace(/\s+/g, '_');
    return `ops_illustration_${typeSlug}_${timestamp}`;
  };

  const handleDownload = async () => {
    if (!svgRef.current) return;

    try {
      await exportSvgAsPng(svgRef.current, generateFilename(), width * 2, height * 2);
    } catch (error) {
      console.error('Failed to download illustration:', error);
      alert('그림 다운로드에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // Prepare text labels (max 2 lines each)
  const locationLines = scenario.location ? wrapText(scenario.location, 25) : [];
  const hazardLines = scenario.hazardObject ? wrapText(`기인물: ${scenario.hazardObject}`, 25) : [];
  const agentLines = scenario.agentObject ? wrapText(`가해물: ${scenario.agentObject}`, 25) : [];

  return (
    <div className="space-y-3">
      {/* SVG Illustration */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <svg
          ref={svgRef}
          viewBox="0 0 600 400"
          width={width}
          height={height}
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          {/* Background */}
          <rect width="600" height="400" fill="white" />

          {/* Main illustration (centered) */}
          <g transform="translate(250, 100)">
            <IconComponent className="w-full h-full" />
          </g>

          {/* Top label: Incident Type */}
          <g>
            <rect x="10" y="10" width="200" height="35" fill="#EF4444" rx="4" />
            <text
              x="110"
              y="32"
              textAnchor="middle"
              fill="white"
              fontSize="18"
              fontWeight="bold"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {scenario.incidentType}
            </text>
          </g>

          {/* Left panel: Location & Details */}
          {(locationLines.length > 0 || hazardLines.length > 0 || agentLines.length > 0) && (
            <g>
              <rect x="10" y="60" width="220" height="280" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" rx="4" />

              {/* Location */}
              {locationLines.length > 0 && (
                <g>
                  <text x="20" y="80" fill="#374151" fontSize="12" fontWeight="bold" fontFamily="system-ui">
                    📍 발생 장소
                  </text>
                  {locationLines.map((line, idx) => (
                    <text
                      key={idx}
                      x="20"
                      y={95 + idx * 16}
                      fill="#1F2937"
                      fontSize="13"
                      fontFamily="system-ui"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              )}

              {/* Hazard Object */}
              {hazardLines.length > 0 && (
                <g>
                  <text
                    x="20"
                    y={140 + (locationLines.length > 0 ? locationLines.length * 16 : 0)}
                    fill="#374151"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="system-ui"
                  >
                    ⚠️ {hazardLines[0]}
                  </text>
                  {hazardLines.slice(1).map((line, idx) => (
                    <text
                      key={idx}
                      x="20"
                      y={155 + (locationLines.length > 0 ? locationLines.length * 16 : 0) + idx * 16}
                      fill="#1F2937"
                      fontSize="13"
                      fontFamily="system-ui"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              )}

              {/* Agent Object */}
              {agentLines.length > 0 && (
                <g>
                  <text
                    x="20"
                    y={200 + (locationLines.length + hazardLines.length) * 16}
                    fill="#374151"
                    fontSize="12"
                    fontWeight="bold"
                    fontFamily="system-ui"
                  >
                    🔧 {agentLines[0]}
                  </text>
                  {agentLines.slice(1).map((line, idx) => (
                    <text
                      key={idx}
                      x="20"
                      y={215 + (locationLines.length + hazardLines.length) * 16 + idx * 16}
                      fill="#1F2937"
                      fontSize="13"
                      fontFamily="system-ui"
                    >
                      {line}
                    </text>
                  ))}
                </g>
              )}

              {/* PPE (if any) */}
              {scenario.ppe && scenario.ppe.length > 0 && (
                <g>
                  <text
                    x="20"
                    y={270}
                    fill="#374151"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="system-ui"
                  >
                    🛡️ 필수 보호구
                  </text>
                  {scenario.ppe.slice(0, 3).map((item, idx) => (
                    <text
                      key={idx}
                      x="25"
                      y={285 + idx * 14}
                      fill="#1F2937"
                      fontSize="11"
                      fontFamily="system-ui"
                    >
                      • {item}
                    </text>
                  ))}
                </g>
              )}
            </g>
          )}

          {/* Watermark */}
          <g opacity="0.6">
            <text
              x="300"
              y="390"
              textAnchor="middle"
              fill="#9CA3AF"
              fontSize="10"
              fontFamily="system-ui"
            >
              Generated by Safe OPS Studio
            </text>
          </g>

          {/* Consistency badge */}
          <g>
            <rect x="440" y="15" width="150" height="25" fill="#10B981" opacity="0.1" rx="3" />
            <text
              x="515"
              y="31"
              textAnchor="middle"
              fill="#059669"
              fontSize="10"
              fontWeight="600"
              fontFamily="system-ui"
            >
              ✓ 그림 일관성 보장
            </text>
          </g>
        </svg>
      </div>

      {/* Download button */}
      {showDownloadButton && (
        <button
          onClick={handleDownload}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          📥 PNG로 다운로드 (투명 배경)
        </button>
      )}

      {/* Info text */}
      <p className="text-xs text-gray-500 text-center">
        동일한 입력 → 동일한 그림 (100% 결정론적 생성)
      </p>
    </div>
  );
}

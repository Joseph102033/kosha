/**
 * SVG Chart Generator for Evaluation Metrics Trend
 *
 * 룰셋 버전별 메트릭 추세를 SVG 차트로 시각화
 */

export interface DataPoint {
  version: string;
  date: string;
  value: number;
}

export interface ChartConfig {
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  lineColor?: string;
  pointColor?: string;
  gridColor?: string;
  textColor?: string;
}

const DEFAULT_CONFIG: Required<ChartConfig> = {
  width: 600,
  height: 300,
  margin: { top: 20, right: 30, bottom: 50, left: 50 },
  lineColor: '#3b82f6',
  pointColor: '#2563eb',
  gridColor: '#e5e7eb',
  textColor: '#6b7280',
};

/**
 * 선형 스케일 생성 (domain → range)
 */
function createScale(
  domain: [number, number],
  range: [number, number]
): (value: number) => number {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const slope = (r1 - r0) / (d1 - d0);

  return (value: number) => r0 + slope * (value - d0);
}

/**
 * 메트릭 추세 라인 차트 생성
 *
 * @param data - 버전별 데이터 포인트
 * @param metricName - 메트릭 이름 (예: "Precision@3")
 * @param config - 차트 설정
 * @returns SVG 문자열
 */
export function generateTrendChart(
  data: DataPoint[],
  metricName: string,
  config: ChartConfig = {}
): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const { width, height, margin, lineColor, pointColor, gridColor, textColor } = cfg;

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  if (data.length === 0) {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="${textColor}">
          데이터 없음
        </text>
      </svg>
    `;
  }

  // 스케일 생성
  const xScale = createScale([0, data.length - 1], [0, chartWidth]);
  const yScale = createScale([0, 1], [chartHeight, 0]); // Y축 반전 (SVG 좌표계)

  // 그리드 라인 생성 (0.2 간격)
  const gridLines: string[] = [];
  for (let y = 0; y <= 1; y += 0.2) {
    const yPos = margin.top + yScale(y);
    gridLines.push(
      `<line x1="${margin.left}" y1="${yPos}" x2="${margin.left + chartWidth}" y2="${yPos}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="4,4"/>`
    );
    gridLines.push(
      `<text x="${margin.left - 10}" y="${yPos + 5}" text-anchor="end" font-size="12" fill="${textColor}">${y.toFixed(1)}</text>`
    );
  }

  // 라인 경로 생성
  const pathPoints = data.map((point, index) => {
    const x = margin.left + xScale(index);
    const y = margin.top + yScale(point.value);
    return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
  }).join(' ');

  // 포인트 마커 생성
  const points = data.map((point, index) => {
    const x = margin.left + xScale(index);
    const y = margin.top + yScale(point.value);
    return `
      <circle cx="${x}" cy="${y}" r="4" fill="${pointColor}"/>
      <text x="${x}" y="${y - 10}" text-anchor="middle" font-size="11" fill="${textColor}" font-weight="600">
        ${(point.value * 100).toFixed(1)}%
      </text>
    `;
  }).join('');

  // X축 레이블 (버전 & 날짜)
  const xLabels = data.map((point, index) => {
    const x = margin.left + xScale(index);
    const y = height - margin.bottom + 20;
    return `
      <g>
        <text x="${x}" y="${y}" text-anchor="middle" font-size="11" fill="${textColor}" font-weight="600">
          ${point.version}
        </text>
        <text x="${x}" y="${y + 15}" text-anchor="middle" font-size="9" fill="${textColor}">
          ${point.date}
        </text>
      </g>
    `;
  }).join('');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- 제목 -->
      <text x="${width / 2}" y="15" text-anchor="middle" font-size="14" font-weight="700" fill="#111827">
        ${metricName} 추세
      </text>

      <!-- 그리드 라인 -->
      ${gridLines.join('\n')}

      <!-- Y축 라인 -->
      <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartHeight}" stroke="${textColor}" stroke-width="2"/>

      <!-- X축 라인 -->
      <line x1="${margin.left}" y1="${margin.top + chartHeight}" x2="${margin.left + chartWidth}" y2="${margin.top + chartHeight}" stroke="${textColor}" stroke-width="2"/>

      <!-- 데이터 라인 -->
      <path d="${pathPoints}" fill="none" stroke="${lineColor}" stroke-width="2"/>

      <!-- 데이터 포인트 -->
      ${points}

      <!-- X축 레이블 -->
      ${xLabels}

      <!-- Y축 제목 -->
      <text x="${margin.left - 35}" y="${margin.top + chartHeight / 2}" text-anchor="middle" font-size="12" fill="${textColor}" transform="rotate(-90, ${margin.left - 35}, ${margin.top + chartHeight / 2})">
        점수
      </text>

      <!-- X축 제목 -->
      <text x="${margin.left + chartWidth / 2}" y="${height - 5}" text-anchor="middle" font-size="12" fill="${textColor}">
        룰셋 버전
      </text>
    </svg>
  `;
}

/**
 * 여러 메트릭을 한 차트에 표시 (멀티 라인)
 */
export interface MultiLineData {
  [metricName: string]: DataPoint[];
}

export function generateMultiLineChart(
  data: MultiLineData,
  config: ChartConfig = {}
): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const { width, height, margin, gridColor, textColor } = cfg;

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const metricNames = Object.keys(data);
  if (metricNames.length === 0) {
    return generateTrendChart([], '데이터 없음', config);
  }

  // 색상 팔레트
  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
  ];

  // 최대 데이터 길이 확인
  const maxLength = Math.max(...metricNames.map(name => data[name].length));
  if (maxLength === 0) {
    return generateTrendChart([], '데이터 없음', config);
  }

  // 스케일 생성
  const xScale = createScale([0, maxLength - 1], [0, chartWidth]);
  const yScale = createScale([0, 1], [chartHeight, 0]);

  // 그리드 라인
  const gridLines: string[] = [];
  for (let y = 0; y <= 1; y += 0.2) {
    const yPos = margin.top + yScale(y);
    gridLines.push(
      `<line x1="${margin.left}" y1="${yPos}" x2="${margin.left + chartWidth}" y2="${yPos}" stroke="${gridColor}" stroke-width="1" stroke-dasharray="4,4"/>`
    );
    gridLines.push(
      `<text x="${margin.left - 10}" y="${yPos + 5}" text-anchor="end" font-size="12" fill="${textColor}">${y.toFixed(1)}</text>`
    );
  }

  // 각 메트릭별 라인 생성
  const lines = metricNames.map((metricName, metricIndex) => {
    const points = data[metricName];
    const color = colors[metricIndex % colors.length];

    if (points.length === 0) return '';

    const pathPoints = points.map((point, index) => {
      const x = margin.left + xScale(index);
      const y = margin.top + yScale(point.value);
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    }).join(' ');

    const pointMarkers = points.map((point, index) => {
      const x = margin.left + xScale(index);
      const y = margin.top + yScale(point.value);
      return `<circle cx="${x}" cy="${y}" r="3" fill="${color}"/>`;
    }).join('');

    return `
      <path d="${pathPoints}" fill="none" stroke="${color}" stroke-width="2"/>
      ${pointMarkers}
    `;
  }).join('');

  // X축 레이블 (첫 번째 메트릭 기준)
  const firstMetric = data[metricNames[0]];
  const xLabels = firstMetric.map((point, index) => {
    const x = margin.left + xScale(index);
    const y = height - margin.bottom + 20;
    return `
      <g>
        <text x="${x}" y="${y}" text-anchor="middle" font-size="11" fill="${textColor}" font-weight="600">
          ${point.version}
        </text>
        <text x="${x}" y="${y + 15}" text-anchor="middle" font-size="9" fill="${textColor}">
          ${point.date}
        </text>
      </g>
    `;
  }).join('');

  // 범례 생성
  const legend = metricNames.map((name, index) => {
    const color = colors[index % colors.length];
    const x = margin.left + (index * 120);
    const y = height - 10;
    return `
      <g>
        <line x1="${x}" y1="${y}" x2="${x + 20}" y2="${y}" stroke="${color}" stroke-width="2"/>
        <text x="${x + 25}" y="${y + 4}" font-size="11" fill="${textColor}">${name}</text>
      </g>
    `;
  }).join('');

  return `
    <svg width="${width}" height="${height + 30}" xmlns="http://www.w3.org/2000/svg">
      <!-- 제목 -->
      <text x="${width / 2}" y="15" text-anchor="middle" font-size="14" font-weight="700" fill="#111827">
        메트릭 종합 추세
      </text>

      <!-- 그리드 -->
      ${gridLines.join('\n')}

      <!-- 축 -->
      <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + chartHeight}" stroke="${textColor}" stroke-width="2"/>
      <line x1="${margin.left}" y1="${margin.top + chartHeight}" x2="${margin.left + chartWidth}" y2="${margin.top + chartHeight}" stroke="${textColor}" stroke-width="2"/>

      <!-- 라인 -->
      ${lines}

      <!-- X축 레이블 -->
      ${xLabels}

      <!-- 범례 -->
      ${legend}

      <!-- 축 제목 -->
      <text x="${margin.left - 35}" y="${margin.top + chartHeight / 2}" text-anchor="middle" font-size="12" fill="${textColor}" transform="rotate(-90, ${margin.left - 35}, ${margin.top + chartHeight / 2})">
        점수
      </text>
      <text x="${margin.left + chartWidth / 2}" y="${height - 25}" text-anchor="middle" font-size="12" fill="${textColor}">
        룰셋 버전
      </text>
    </svg>
  `;
}

/**
 * Reference Image Analysis Script
 * Analyzes KOSHA safety illustration references using Gemini Vision API
 */

import * as fs from 'fs';
import * as path from 'path';

interface AnalysisResult {
  filename: string;
  analysis: string;
}

/**
 * Call Gemini API with image
 */
async function analyzeImageWithGemini(
  imageBase64: string,
  filename: string,
  apiKey: string
): Promise<string> {
  const prompt = `당신은 산업안전보건 삽화 전문가입니다. 이 KOSHA 안전 삽화 이미지를 상세히 분석하세요.

다음 항목을 구체적으로 분석하세요:

1. **시각적 스타일**
   - 일러스트 스타일 (realistic/cartoon/technical)
   - 선의 두께와 스타일 (outline, shading)
   - 색상 팔레트 (주요 색상과 용도)
   - 음영 처리 방식

2. **구도와 시점**
   - 카메라 각도 (isometric/side view/bird's eye)
   - 초점 요소 (위험 지점, 작업자, 장비)
   - 배경 처리 (단순/상세)

3. **위험 요소 표현**
   - 위험 지점 강조 방법 (색상, 마크, 화살표)
   - 움직임/충격 표현 (구름, 라인, 별)
   - 안전 장비 시각화

4. **캐릭터 스타일**
   - 인물 비율 (realistic/deformed)
   - 얼굴 표현 정도 (detailed/simple)
   - 작업복 디테일

5. **텍스트/라벨**
   - 텍스트 사용 여부 및 위치
   - 라벨 스타일

**출력 형식**: 구체적이고 객관적으로 작성 (주관적 평가 X)`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/png',
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4, // Low temperature for consistent analysis
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

/**
 * Main analysis function
 */
async function analyzeReferences() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable not set');
    console.log('Set it with: export GEMINI_API_KEY=your_key_here');
    process.exit(1);
  }

  const referencesDir = path.join(__dirname, '..', 'references');
  const files = fs.readdirSync(referencesDir);

  const imageFiles = files.filter(f =>
    f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.jfif')
  );

  console.log(`\n📊 Analyzing ${imageFiles.length} reference images...\n`);

  const results: AnalysisResult[] = [];

  for (const filename of imageFiles) {
    const filepath = path.join(referencesDir, filename);
    const imageBuffer = fs.readFileSync(filepath);
    const imageBase64 = imageBuffer.toString('base64');

    console.log(`🔍 Analyzing: ${filename}...`);

    try {
      const analysis = await analyzeImageWithGemini(imageBase64, filename, GEMINI_API_KEY);
      results.push({ filename, analysis });
      console.log(`✅ Completed: ${filename}\n`);

      // Rate limiting: wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error analyzing ${filename}:`, error);
    }
  }

  // Save results to file
  const outputPath = path.join(__dirname, '..', 'references', 'analysis-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Analysis results saved to: ${outputPath}`);

  // Generate style guide
  console.log('\n📝 Generating style guide...');
  const styleGuide = generateStyleGuide(results);

  const guideOutputPath = path.join(__dirname, '..', 'references', 'style-guide.md');
  fs.writeFileSync(guideOutputPath, styleGuide);
  console.log(`✅ Style guide saved to: ${guideOutputPath}`);

  console.log('\n🎉 Analysis complete!');
}

/**
 * Generate consolidated style guide from analysis results
 */
function generateStyleGuide(results: AnalysisResult[]): string {
  let guide = `# KOSHA Safety Illustration Style Guide

Generated from ${results.length} reference images
Date: ${new Date().toISOString()}

---

## Individual Image Analysis

`;

  // Add individual analyses
  for (const result of results) {
    guide += `### ${result.filename}\n\n`;
    guide += `${result.analysis}\n\n`;
    guide += `---\n\n`;
  }

  guide += `
## Consolidated Style Requirements

Based on the analysis above, follow these guidelines for AI image generation:

### Visual Style
- **Art Style**: Semi-realistic cartoon with clear outlines
- **Line Weight**: Bold black outlines (2-3px) for all objects
- **Color Palette**:
  - Background: Light gray (#E8E8E8) or light blue (#D0E8F0)
  - Safety equipment: Yellow (#FFD700) helmets, high-vis vests
  - Worker clothing: Blue/Gray industrial colors
  - Danger markers: Red (#FF0000) for hazard points
  - Impact effects: White cloud shapes

### Composition
- **Viewpoint**: Side view or isometric 3/4 angle
- **Focus**: Single hazard moment frozen in time
- **Background**: Simplified architectural elements (buildings, structures)
- **Foreground**: Detailed hazard elements and worker

### Character Design
- **Proportions**: Slightly cartoonish (larger head, simplified body)
- **Facial Features**: Simple but expressive (visible emotion)
- **Clothing**: Clearly defined work gear with safety equipment
- **Poses**: Dynamic, showing moment of danger

### Hazard Visualization
- **Impact Points**: Red star/burst marks
- **Motion**: White cloud puffs, motion lines
- **Falling Objects**: Clear trajectory with motion blur
- **Danger Zones**: Yellow/black striped tape or barriers

### Text & Labels
- **Korean Text**: Present in some images for context
- **Placement**: Top or bottom as title/description
- **Style**: Clear sans-serif font
- **For AI Generation**: Include descriptive Korean text areas

---

## Prompt Template for AI Generation

\`\`\`
Professional KOSHA-style safety illustration:

VISUAL STYLE:
- Semi-realistic cartoon with bold black outlines
- Light gray/blue gradient background
- Limited color palette (gray, yellow, blue, red accents)
- Clean, educational illustration quality

COMPOSITION:
- [Specify: side view / isometric 3/4 view / bird's eye]
- Single focal point on hazard moment
- Simplified architectural background

CHARACTER:
- Worker in [color] clothing
- Yellow safety helmet
- [Describe pose and action]
- Visible facial expression showing [emotion]

HAZARD ELEMENTS:
- [Specific hazard description]
- Red star marks at impact points
- White cloud motion effects
- [Any falling/moving objects]

SCENE DESCRIPTION:
[Detailed incident scenario]

REQUIREMENTS:
- Korean text area at [top/bottom]: "[Text content]"
- Educational clarity over artistic detail
- Clear cause-and-effect visualization
\`\`\`

---

## Implementation Notes

1. **For FLUX Model**: Focus on English descriptions of visual elements
2. **For Style Consistency**: Reference "KOSHA safety manual illustration style"
3. **Key Emphasis**: Educational clarity > artistic realism
4. **Avoid**: Photo-realistic rendering, complex shadows, busy backgrounds
`;

  return guide;
}

// Run analysis
analyzeReferences().catch(console.error);

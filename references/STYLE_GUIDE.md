# KOSHA Safety Illustration Style Guide

**Generated from**: 6 reference images (fall_1-4, chemical_1, machine_1)
**Purpose**: Ensure AI-generated safety illustrations match KOSHA manual style
**Last Updated**: 2025-10-12

---

## 🎨 Core Visual Style

### Art Style
- **Type**: Semi-realistic cartoon / Educational illustration
- **Rendering**: Flat colors with minimal shading
- **Outlines**: Bold black lines (2-3px weight) around all objects
- **Overall Feel**: Clear, educational, immediately understandable

### Color Palette

**Primary Colors:**
- **Background**: Light gray (#E5E5E5) or light blue (#D8E8F5)
- **Safety Yellow**: #FFD700 (helmets, high-vis vests, caution tape)
- **Worker Blue**: #4A90E2 (work clothes, overalls)
- **Worker Gray**: #7F8C8D (alternative work clothes)
- **Danger Red**: #FF0000 (hazard markers, impact points)

**Accent Colors:**
- **Impact Effects**: White (#FFFFFF) cloud puffs
- **Structures**: Gray tones (#95A5A6, #BDC3C7)
- **Scaffolding**: Orange (#FF8C00) poles

**Never Use:**
- Neon colors
- Gradients (except subtle background)
- Photo-realistic textures

---

## 📐 Composition Rules

### Viewpoint
1. **Side View** (70% of references):
   - Worker profile visible
   - Clear horizontal/vertical reference
   - Good for fall/collision incidents

2. **Isometric 3/4 View** (20%):
   - Showing spatial relationships
   - Multiple elevation levels
   - Good for scaffolding/structure incidents

3. **Cross-Section** (10%):
   - Internal view of containers/equipment
   - Chemical exposure scenarios

### Layout
```
┌─────────────────────────┐
│   [Korean Title Text]   │  ← Top 15% (optional)
├─────────────────────────┤
│                         │
│    [Main Illustration]  │  ← Central 70%
│                         │
│   [Focal Point: Hazard] │
│                         │
├─────────────────────────┤
│  [Description Text]     │  ← Bottom 15% (optional)
└─────────────────────────┘
```

**Focal Point**: Center or slightly off-center (rule of thirds)
**Depth**: 2-3 depth layers maximum (background, midground, foreground)

---

## 👷 Character Design

### Body Proportions
- **Head**: Slightly larger than realistic (1:6 ratio instead of 1:7)
- **Eyes**: Simple but expressive (2 dots or simple shapes)
- **Mouth**: Visible emotion (open for shock, closed for concentration)
- **Limbs**: Simplified, no individual fingers (mitten style)

### Clothing
- **Safety Helmet**: Always yellow, prominent
- **Work Clothes**: Blue or gray, simple solid colors
- **Safety Vest**: High-vis yellow with reflective strips
- **Boots**: Dark brown or black, simple shape

### Poses & Expressions
- **Falling**: Arms outstretched, body tilted, eyes wide
- **Impact Moment**: Body compressed, cloud effects
- **Shocked**: Hands raised, mouth open, exclamation marks

---

## ⚠️ Hazard Visualization

### Danger Markers
```
Impact Point:     ⭐ Red 6-point star burst
Motion Lines:     ═══> Horizontal lines showing direction
Fall Trajectory:  ↓↓↓ Dotted arc line
Cloud Puff:       ☁️ White rounded cloud shape
```

### Hazard Indicators
1. **Red Star Burst**: At contact/impact points
2. **Yellow/Black Tape**: Striped caution barriers (45° angle)
3. **Motion Blur**: White cloud puffs at limb ends
4. **Exclamation Marks**: "!" or "!!" near hazard

### Falling Objects
- **Trajectory**: Curved dotted line showing path
- **Motion**: 2-3 motion blur copies
- **Color**: Same as object but slightly faded

---

## 🏗️ Environmental Elements

### Structures
- **Buildings**: Simple rectangular shapes, windows as grid
- **Scaffolding**: Orange/yellow poles, white platforms
- **Ladders**: Orange A-frame or vertical, clear rungs
- **Floors**: Gray with simple tile pattern or solid

### Depth & Perspective
- **Background**: Very light colors, simplified shapes
- **Midground**: Medium colors, main action area
- **Foreground**: Darkest colors, highest detail

---

## 📝 Text & Labels (Korean)

### Text Placement
- **Title**: Top center, 1-2 lines
- **Description**: Bottom center, 2-3 lines
- **Font**: Sans-serif, bold, black color
- **Size**: Large enough to read (min 16pt equivalent)

### Common Text Patterns
```
상단: "[재해유형] 적재작업 중 떨어짐"
하단: "지상 3층 높이에서 [장비명]를 작업하던 중
      [원인]로 인해 떨어져 사고 발생"
```

**For AI Generation**: Request text areas but leave blank (add text post-processing)

---

## 🚫 What to AVOID

### Visual Don'ts
- ❌ Photo-realistic rendering
- ❌ Complex shadows and lighting
- ❌ Detailed facial features (eyes, nose, wrinkles)
- ❌ Busy backgrounds
- ❌ Too many objects/people (max 3 people)
- ❌ Text within the main illustration area
- ❌ Gradient fills on objects
- ❌ Artistic effects (lens flare, bokeh, etc.)

### Composition Don'ts
- ❌ Unclear hazard point
- ❌ Multiple simultaneous incidents
- ❌ Overly dramatic angles (extreme low/high angle)
- ❌ Hidden critical elements

---

## ✅ AI Prompt Template

### For FLUX-1-Schnell (Current Implementation)

```
KOSHA safety manual illustration, educational poster style:

VISUAL STYLE:
- Semi-realistic cartoon with bold black outlines (2-3px)
- Flat colors, minimal shading
- Light [gray/blue] background
- Clean vector-art quality

COMPOSITION:
- [Side view / Isometric 3/4 view]
- Single focal point at [describe hazard moment]
- [Simple background description]

CHARACTER:
- Worker wearing yellow safety helmet
- [Blue/Gray] work clothes
- [Describe specific pose]
- Simple facial expression showing [emotion]
- Mitten-style hands (no individual fingers)

HAZARD VISUALIZATION:
- [Specific incident description]
- Red star burst at impact point
- White cloud motion effects
- [Falling object] with dotted trajectory line

SPECIFIC SCENE:
[Detailed incident scenario from input]

COLOR PALETTE:
- Background: Light gray (#E5E5E5)
- Worker clothing: Blue (#4A90E2)
- Safety helmet: Yellow (#FFD700)
- Danger markers: Red (#FF0000)
- Impact effects: White clouds

REQUIREMENTS:
- Bold black outlines around all objects
- Educational clarity over artistic detail
- No text, no labels, no Korean characters
- No photo-realistic rendering
- No complex shadows
```

### For Gemini Vision (Scene Analysis)

```
당신은 KOSHA 안전 삽화 전문가입니다.

다음 재해 정보를 KOSHA 스타일 삽화로 표현하기 위한
구체적인 장면 설명을 영문으로 작성하세요:

재해 정보:
- 유형: [incidentType]
- 장소: [location]
- 원인: [incidentCause]

스타일 요구사항:
1. Semi-realistic cartoon (not photo-realistic)
2. Bold black outlines (2-3px)
3. Limited color palette (gray, yellow, blue, red)
4. Side view or isometric 3/4 view
5. Single clear hazard moment
6. Simple background
7. Cartoonish character proportions
8. Red star at impact point
9. White cloud motion effects

출력: 400자 이내 영문 장면 설명 (FLUX 모델용)
```

---

## 📊 Reference Image Breakdown

| Image | Type | View | Key Features |
|-------|------|------|--------------|
| fall_1.jfif | 추락 | Side | Impact clouds, yellow helmet |
| fall_2.png | 추락 | Side | Deck railing, cartoon style |
| fall_3.png | 추락 | Side | Scaffolding text, simple character |
| fall_4.png | 추락 | Isometric | Collapsing scaffold, multiple impact points |
| chemical_1.png | 화학 | Cross-section | Transparent container, vapor waves |
| machine_1.png | 기계 | Side | Red star hazard marker, two workers |

---

## 🎯 Implementation Priority

### Phase 1: Immediate (Style Guide Integration)
1. ✅ Add this style guide to codebase
2. ⬜ Update `illustration.ts` prompt generation
3. ⬜ Test with 3 sample incidents

### Phase 2: Quality Enhancement (Next Week)
1. ⬜ Add Gemini Vision validation loop
2. ⬜ Implement style consistency scoring
3. ⬜ A/B test with users

### Phase 3: Advanced (Future)
1. ⬜ Fine-tune custom FLUX LoRA model
2. ⬜ Implement img2img with reference composition
3. ⬜ Multi-stage generation (sketch → render)

---

**Next Step**: Integrate this guide into `apps/workers/src/ops/illustration.ts`

# Law Suggestion System

## Overview

The Law Suggestion System provides intelligent, relevant law recommendations based on incident data using a hybrid scoring approach that combines full-text search (BM25) with rule-based keyword/regex matching.

## API Endpoint

### POST /api/laws/suggest

Suggests relevant laws based on incident information.

**Request Body:**
```json
{
  "summary": "3층 건물 외벽 작업 중 안전대 미착용으로 추락",
  "incident_type": "추락",
  "causative_object": "안전대",
  "work_process": "외벽 작업",
  "limit": 12
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "law": {
          "id": "LAW-001",
          "law_title": "산업안전보건법",
          "article_no": "제38조",
          "text": "사업주는 근로자가 추락하거나...",
          "keywords": "추락,안전대,안전난간",
          "source_url": "https://..."
        },
        "total_score": 0.85,
        "bm25_score": 0.75,
        "rule_score": 0.95,
        "matched_rules": [
          {
            "accident_type": "추락",
            "matches": [
              {
                "type": "keyword",
                "pattern": "추락",
                "matches": ["추락", "추락"]
              }
            ]
          }
        ]
      }
    ],
    "metadata": {
      "version": "1.0.0",
      "updated_at": "2025-01-15T00:00:00Z",
      "alpha": 0.6,
      "beta": 0.4,
      "total_candidates": 42
    }
  }
}
```

## Scoring Formula

The system uses a weighted hybrid scoring approach:

```
total_score = α × bm25_score + β × rule_score
```

### Default Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| **α (alpha)** | 0.6 | BM25 weight - emphasizes statistical relevance |
| **β (beta)** | 0.4 | Rule-based weight - emphasizes domain expertise |

### BM25 Scoring

- Uses SQLite FTS5 full-text search with BM25 ranking algorithm
- Searches across: `law_title`, `article_no`, `text`, `keywords`
- Normalized to [0, 1] range

### Rule-Based Scoring

Scores based on pattern matching in 15 accident categories:

**Keyword Matching:**
- Both law + input match: **+1.0 × weight**
- Law only matches: **+0.3 × weight**

**Regex Matching:**
- Both law + input match: **+1.5 × weight**
- Law only matches: **+0.5 × weight**

**Accident Categories:**
1. 추락 (Fall)
2. 끼임 (Caught-in)
3. 감전 (Electrocution)
4. 화재 (Fire)
5. 화학물질 (Chemical)
6. 폭발 (Explosion)
7. 전도붕괴 (Collapse)
8. 중장비 (Heavy Equipment)
9. 밀폐공간 (Confined Space)
10. 안전교육 (Safety Training)
11. 작업환경측정 (Workplace Measurement)
12. 건강검진 (Health Checkup)
13. 안전보건관리책임자 (Safety Manager)
14. 유해위험방지계획서 (Hazard Prevention Plan)
15. 위험성평가 (Risk Assessment)

## Confidence-Based Re-ranking

After hybrid scoring, the system applies a second layer of ranking to calculate confidence scores (0-100) and generate evidence summaries.

### Confidence Formula

```
confidence = base_score × coverage_factor × specificity_factor × recency_factor
```

**Where:**
- **base_score**: Normalized total_score from hybrid scorer (0-100 scale)
- **coverage_factor**: How many search terms are covered in the law text (0.5-1.2)
- **specificity_factor**: Length and detail of matched law text (0.8-1.15)
- **recency_factor**: Law effective date bonus for newer laws (0.95-1.05)

### Confidence Factors

#### 1. Coverage Factor (0.5-1.2×)

Measures how many user input terms appear in the law text:

| Coverage Ratio | Factor | Interpretation |
|----------------|--------|----------------|
| ≥80% | 1.2× | Excellent coverage |
| 60-79% | 1.1× | Good coverage |
| 40-59% | 1.0× | Fair coverage |
| 20-39% | 0.85× | Partial coverage |
| <20% | 0.7× | Poor coverage |

#### 2. Specificity Factor (0.8-1.15×)

Evaluates the detail and precision of the law:

**Text Length:**
- >500 chars: +0.1 (very detailed)
- 200-500 chars: +0.05 (moderately detailed)
- <100 chars: -0.1 (too short/vague)

**Rule Match Count:**
- ≥5 matches: +0.1 (strong rule alignment)
- 3-4 matches: +0.05 (good rule alignment)
- 0 matches: -0.15 (BM25 only, no rule match)

**Keyword Density:**
- ≥5 keywords: +0.05 (well-tagged)
- ≤2 keywords: -0.05 (poorly tagged)

#### 3. Recency Factor (0.95-1.05×)

Gives slight bonus to newer laws:

| Law Age | Factor | Interpretation |
|---------|--------|----------------|
| ≤2 years | 1.05× | Recent law (+5% bonus) |
| 2-5 years | 1.0× | Neutral |
| 5-10 years | 0.98× | Slightly old (-2% penalty) |
| >10 years | 0.95× | Old law (-5% penalty) |

### Confidence Levels and UI Badges

| Confidence Score | Level | Badge | Icon | Meaning |
|------------------|-------|-------|------|---------|
| ≥70% | **high** | 🟢 추천 | ✓ | Highly recommended |
| 40-69% | **medium** | 🟡 검토요망 | ⚠ | Review required |
| <40% | **low** | ⚪ 보류 | • | Consider deferring |

### Evidence Summary

Each law includes a human-readable evidence summary explaining why it was matched:

**Format:** `[Rule matches] · [BM25 strength] · [Rule strength]`

**Examples:**
- "추락, 끼임 유형 매칭 (5개 규칙) · 강한 텍스트 유사도 · 강한 규칙 매칭"
- "감전 유형 매칭 (3개 규칙) · 중간 텍스트 유사도"
- "텍스트 검색 결과" (fallback when no rule matches)

### Deterministic Re-ranking

The re-ranking process is fully deterministic:

1. **Confidence calculation** uses only mathematical operations (no randomness)
2. **Sort by confidence** (descending)
3. **Tie-breaker:** Sort by `law.id` (ascending) when confidence scores are equal (within 0.01)
4. **No external API calls** (no LLM re-ranking in current version)

### Response Structure with Confidence

```json
{
  "law": {...},
  "total_score": 0.85,
  "bm25_score": 0.75,
  "rule_score": 0.95,
  "confidence": 78,
  "confidence_level": "high",
  "evidence_summary": "추락 유형 매칭 (5개 규칙) · 강한 텍스트 유사도 · 강한 규칙 매칭",
  "ranking_factors": {
    "base_score": 85.0,
    "coverage_factor": 1.2,
    "specificity_factor": 1.1,
    "recency_factor": 1.05
  },
  "matched_rules": [...]
}
```

### Future Enhancement: LLM Re-ranking

The system includes an interface for future LLM-based re-ranking:

```typescript
// Interface defined but not implemented
export async function llmRerank(
  rankedLaws: RankedLaw[],
  context: { summary, incident_type, industry, company_size }
): Promise<RankedLaw[]>
```

**Potential benefits:**
- Semantic similarity beyond keyword matching
- Contextual relevance (industry-specific interpretation)
- Legal precedence understanding
- Natural language reasoning

**Current status:** Not implemented (time-saving, rule-based ranking sufficient for MVP)

## Rule Configuration

Rules are defined in `/apps/workers/rules/law_rules.json`:

```json
{
  "version": "1.0.0",
  "updated_at": "2025-01-15T00:00:00Z",
  "description": "Law matching rules for Korean occupational safety incidents",
  "rules": {
    "추락": {
      "keywords": ["추락", "안전난간", "안전대", "사다리"],
      "regex": ["(?:높이|고소)\\s*\\d+\\s*[mM미터]"],
      "weight": 1.0
    }
  },
  "scoring_parameters": {
    "alpha": 0.6,
    "beta": 0.4,
    "description": "Hybrid scoring formula: score = alpha * bm25_score + beta * rule_score"
  }
}
```

## Deterministic Behavior

The system guarantees deterministic results:

1. **Sort by total score** (descending)
2. **Tie-breaker:** Sort by `law.id` (ascending) when scores are equal (within 0.0001)
3. **Consistent pattern matching:** Always processes patterns in the same order
4. **No randomness:** No probabilistic algorithms or random sampling

## Usage Example

### Frontend Integration

```typescript
import LawSuggestPanel from '@/components/ops/LawSuggestPanel';

<LawSuggestPanel
  summary="3층 건물 외벽 작업 중 추락"
  incidentType="추락"
  causativeObject="안전대"
  workProcess="외벽 작업"
  limit={12}
/>
```

### Direct API Call

```bash
curl -X POST "https://safe-ops-studio-workers.yosep102033.workers.dev/api/laws/suggest" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "summary": "3층 건물 외벽 작업 중 안전대 미착용으로 추락",
    "incident_type": "추락",
    "causative_object": "안전대",
    "work_process": "외벽 작업",
    "limit": 3
  }'
```

## Text Highlighting

The UI component highlights matched patterns in law text:

- **Yellow background:** Matched keywords or regex patterns
- **Tooltip:** Shows match type (keyword/regex) and pattern
- **Evidence section:** Expandable "근거 보기" shows all matched rules

## Performance

- **Expected response time:** 100-200ms
- **FTS5 candidate retrieval:** Fetches 5× the requested limit (e.g., 50 for top 12)
- **Rule scoring:** Processes all 15 accident categories per candidate
- **Caching:** Rules JSON loaded once per Worker instance

## Maintenance

### Updating Rules

1. Edit `/apps/workers/rules/law_rules.json`
2. Increment `version` field
3. Update `updated_at` timestamp
4. Deploy Workers: `npm run deploy`

### Tuning Scoring Parameters

To adjust α and β values:

1. Edit `scoring_parameters.alpha` and `scoring_parameters.beta` in rules JSON
2. Ensure `alpha + beta = 1.0` for normalized scoring
3. Test with sample queries
4. Deploy changes

**Recommendations:**
- Higher α: Emphasize statistical relevance (good for diverse queries)
- Higher β: Emphasize domain expertise (good for specific accident types)

## Files

| File | Purpose |
|------|---------|
| `apps/workers/src/law/suggest.ts` | Core hybrid scoring algorithm |
| `apps/workers/rules/law_rules.json` | Rule configuration and parameters |
| `apps/web/components/ops/LawSuggestPanel.tsx` | UI component |
| `apps/web/utils/highlight.ts` | Text highlighting utilities |
| `docs/LAW_SUGGESTION_SYSTEM.md` | Detailed technical documentation |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2025-10-14 | Added confidence-based re-ranking with multi-factor scoring |
| 1.0.0 | 2025-01-15 | Initial release with 15 accident categories |

## Testing

### Test with curl (Note: Windows MINGW has UTF-8 issues, use browser or Python)

```python
import requests
response = requests.post(
    "https://safe-ops-studio-workers.yosep102033.workers.dev/api/laws/suggest",
    json={
        "summary": "추락 사고",
        "incident_type": "추락",
        "limit": 3
    }
)
print(response.json())
```

### Verify Rule Version

```bash
curl "https://safe-ops-studio-workers.yosep102033.workers.dev/api/laws/rule-version"
```

## Troubleshooting

**No suggestions returned:**
- Verify input text is not empty
- Check FTS5 index has laws: `SELECT COUNT(*) FROM laws_fts`
- Review rule patterns in JSON

**Unexpected scores:**
- Review matched_rules in response
- Verify α and β sum to desired weight distribution
- Check for special characters in regex patterns

**Performance issues:**
- Reduce candidate limit (5× multiplier)
- Optimize regex patterns (avoid backtracking)
- Consider caching frequent queries

## License

This system is part of the Safe OPS Studio project.

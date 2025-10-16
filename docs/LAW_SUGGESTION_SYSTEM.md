# Law Suggestion System - Technical Documentation

## Overview

The Law Suggestion System uses a hybrid scoring algorithm to recommend relevant Korean occupational safety laws based on incident data. It combines two complementary approaches:

1. **BM25 Full-Text Search (FTS5)**: Statistical relevance scoring based on term frequency
2. **Rule-Based Pattern Matching**: Domain-specific keyword and regex matching

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
├─────────────────────────────────────────────────────────────┤
│  LawSuggestPanel.tsx                                         │
│  - Displays suggested laws with scores                       │
│  - Shows evidence (matched keywords/regex)                   │
│  - Highlights matched text                                   │
│                                                              │
│  utils/highlight.ts                                          │
│  - Text highlighting utilities                               │
│  - Deterministic pattern matching                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
                         HTTP POST
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Workers API (Cloudflare)                   │
├─────────────────────────────────────────────────────────────┤
│  POST /api/laws/suggest                                      │
│  - Accepts incident data                                     │
│  - Returns top N scored laws                                 │
│                                                              │
│  law/suggest.ts                                              │
│  - Hybrid scoring implementation                             │
│  - BM25 + Rule-based fusion                                  │
│                                                              │
│  rules/law_rules.json                                        │
│  - 15 accident type rules                                    │
│  - Keywords + Regex patterns                                 │
│  - Weights and scoring parameters                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
                      D1 Database (SQLite + FTS5)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    laws + laws_fts tables                    │
│  - 42 sample law articles                                    │
│  - FTS5 with unicode61 tokenizer                             │
│  - BM25 ranking function                                     │
└─────────────────────────────────────────────────────────────┘
```

## Hybrid Scoring Algorithm

### Formula

```
total_score = α × bm25_score + β × rule_score
```

**Default Parameters** (defined in `rules/law_rules.json`):
- **α (alpha)**: `0.6` - Weight for BM25 full-text search score
- **β (beta)**: `0.4` - Weight for rule-based matching score

Both `bm25_score` and `rule_score` are normalized to the range [0, 1].

### BM25 Score Component

**Source**: FTS5 `bm25(laws_fts)` rank function

**Process**:
1. Combine all input text (summary, incident_type, causative_object, work_process)
2. Query FTS5 with `MATCH` operator: `WHERE laws_fts MATCH ?`
3. Retrieve raw BM25 ranks (negative values, more negative = better match)
4. Normalize to [0, 1] using min-max scaling:
   ```
   normalized_bm25 = (max_rank - law_rank) / (max_rank - min_rank)
   ```

**Characteristics**:
- **Pros**: Language-agnostic, fast, handles synonyms and partial matches
- **Cons**: No domain knowledge, may miss context-specific relationships

### Rule-Based Score Component

**Source**: Pattern matching against `rules/law_rules.json`

**Process**:
1. For each accident type rule (15 types):
   - **Keyword Matching** (case-insensitive):
     - Both law and input contain keyword: `+1.0 × weight`
     - Only law contains keyword: `+0.3 × weight`

   - **Regex Matching**:
     - Both law and input match pattern: `+1.5 × weight`
     - Only law matches pattern: `+0.5 × weight`

2. Sum all rule scores
3. Normalize to [0, 1]:
   ```
   max_possible_score = num_rules × (10 × 1.0 + 5 × 1.5)
   normalized_rule_score = min(1.0, total_rule_score / max_possible_score)
   ```

**Characteristics**:
- **Pros**: Domain-specific, captures expert knowledge, explainable
- **Cons**: Requires manual maintenance, may miss novel patterns

## Rule Configuration

### File: `apps/workers/rules/law_rules.json`

**Structure**:
```json
{
  "version": "1.0.0",
  "updated_at": "2025-01-15T00:00:00Z",
  "description": "...",
  "rules": {
    "추락": {
      "keywords": ["추락", "안전난간", "안전대", ...],
      "regex": ["(?:높이|고소)\\s*\\d+\\s*[mM미터]", ...],
      "weight": 1.0
    },
    "감전": { ... },
    ...
  },
  "scoring_parameters": {
    "alpha": 0.6,
    "beta": 0.4,
    "description": "Hybrid scoring formula..."
  }
}
```

### Accident Types (15 Rules)

1. **추락 (Fall)**: Fall prevention, guardrails, safety harnesses
2. **끼임 (Caught)**: Rotating machinery, guards, emergency stops
3. **감전 (Electric Shock)**: Electrical safety, grounding, insulation
4. **화재 (Fire)**: Fire prevention, extinguishers, flammable materials
5. **화학물질 (Chemical)**: Hazardous substances, MSDS, ventilation
6. **폭발 (Explosion)**: Explosive atmospheres, ignition sources
7. **전도붕괴 (Collapse)**: Excavation, shoring, ground stability
8. **중장비 (Heavy Equipment)**: Cranes, forklifts, rated loads
9. **밀폐공간 (Confined Space)**: Oxygen levels, gas monitoring
10. **안전교육 (Safety Training)**: Required training, hours
11. **작업환경측정 (Work Environment)**: Measurement frequency, hazards
12. **건강검진 (Health Examination)**: Medical examinations, schedules
13. **안전보건관리책임자 (Safety Manager)**: Manager qualifications, duties
14. **유해위험방지계획서 (Hazard Prevention Plan)**: Plan submission, reviews
15. **위험성평가 (Risk Assessment)**: Assessment methods, timing

### Rule Weight Guidelines

- **1.0**: Primary accident types (추락, 끼임, 감전, 화재, etc.)
- **0.8**: Supporting requirements (교육, 측정, 검진)
- **0.7**: Administrative requirements (관리자, 계획서, 평가)

## API Specification

### POST `/api/laws/suggest`

**Request Body**:
```json
{
  "summary": "3층 건물 외벽 작업 중 추락",
  "incident_type": "추락",
  "causative_object": "비계",
  "work_process": "외벽 도장 작업",
  "limit": 12
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "law": {
          "id": "law-001",
          "law_title": "산업안전보건법",
          "article_no": "제38조",
          "clause_no": "제1항",
          "text": "사업주는 근로자가 추락하거나...",
          "effective_date": "2024-01-01",
          "keywords": "추락,안전난간,울타리",
          "source_url": "https://..."
        },
        "total_score": 0.8742,
        "bm25_score": 0.9120,
        "rule_score": 0.8140,
        "matched_rules": [
          {
            "accident_type": "추락",
            "matches": [
              {
                "type": "keyword",
                "pattern": "추락",
                "matches": ["추락하거나", "추락"]
              },
              {
                "type": "regex",
                "pattern": "안전난간.*(?:설치|구조)",
                "matches": ["안전난간 설치"]
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
      "total_candidates": 50
    }
  }
}
```

### GET `/api/laws/rule-version`

Returns current rule version metadata.

**Response**:
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "updated_at": "2025-01-15T00:00:00Z"
  }
}
```

## Frontend Components

### LawSuggestPanel Component

**Location**: `apps/web/components/ops/LawSuggestPanel.tsx`

**Props**:
```typescript
interface LawSuggestPanelProps {
  summary: string;
  incidentType: string;
  causativeObject: string;
  workProcess: string;
  limit?: number;  // Default: 12
}
```

**Features**:
- Automatic fetching on prop changes
- Loading states and error handling
- Score visualization (percentage badges)
- Keyword/regex highlighting in law text
- Expandable evidence sections with "근거 보기" toggle
- Rule version badge
- Score breakdown (BM25 + Rule percentages)

**Usage Example**:
```tsx
import LawSuggestPanel from '@/components/ops/LawSuggestPanel';

<LawSuggestPanel
  summary={formData.summary}
  incidentType={formData.incidentType}
  causativeObject={formData.causativeObject}
  workProcess={formData.workProcess}
  limit={12}
/>
```

### Highlight Utilities

**Location**: `apps/web/utils/highlight.ts`

**Functions**:

1. **`highlightText(text, patterns, isRegex)`**
   - Highlights single pattern type (keyword or regex)
   - Returns array of `HighlightSegment` objects

2. **`highlightMultipleTypes(text, keywords, regexPatterns)`**
   - Highlights both keywords and regex simultaneously
   - Handles overlapping matches deterministically
   - Used by LawSuggestPanel for law text highlighting

3. **`getMatchedPatterns(text, keywords, regexPatterns)`**
   - Returns summary of matched patterns with counts
   - Useful for debugging and analytics

**Deterministic Ordering**:
- Matches sorted by start position
- Equal start positions: longer match first
- Overlapping matches merged left-to-right
- Result: same input always produces same output

## Deterministic Behavior

### Requirement
> "동일 입력→항상 동일 후보 리스트(결정론)"

### Implementation

1. **FTS5 Determinism**:
   - BM25 ranking is deterministic for identical corpus
   - `ORDER BY rank` ensures consistent ordering

2. **Rule Matching Determinism**:
   - Iteration order: Rules processed in JSON key order
   - Pattern matching: Regular expressions with fixed flags (`gi`)
   - Score accumulation: Floating-point arithmetic is deterministic

3. **Final Sorting**:
   ```typescript
   scoredLaws.sort((a, b) => {
     if (Math.abs(a.total_score - b.total_score) < 0.0001) {
       // Tie-breaker: sort by law ID
       return a.law.id.localeCompare(b.law.id);
     }
     return b.total_score - a.total_score;
   });
   ```
   - Primary sort: total_score (descending)
   - Tie-breaker: law ID (alphabetical)
   - Ensures identical scores have consistent ordering

4. **Floating-Point Tolerance**:
   - Use epsilon comparison: `Math.abs(a - b) < 0.0001`
   - Prevents spurious differences from rounding errors

## Performance Characteristics

### Query Performance

**Step 1: FTS5 Query**
- Retrieves 5× candidates: `LIMIT 50` for top 12 suggestions
- Typical query time: 10-50ms (depends on database size)
- Indexed search: O(log n) lookup

**Step 2: Rule Scoring**
- Per-candidate scoring: ~1-2ms × 50 = 50-100ms
- Regex compilation cached by JavaScript engine
- Total pattern matches: 15 rules × (10 keywords + 5 regex) = 225 patterns

**Step 3: Sorting and Filtering**
- Sorting: O(n log n) = O(50 log 50) ≈ 280 comparisons
- Slice top 12: O(1)

**Total Latency**: ~100-200ms for typical request

### Optimization Opportunities

1. **Caching**:
   - Cache rule JSON in memory (avoid repeated parsing)
   - Cache compiled regex objects
   - Implement query result caching for identical inputs

2. **Parallelization**:
   - Score candidates in parallel (Workers isolates)
   - Use `Promise.all()` for independent operations

3. **Index Optimization**:
   - Create additional FTS5 indexes for frequently searched fields
   - Consider custom tokenizers for Korean text

## Testing

### Unit Tests (Recommended)

```typescript
// apps/workers/tests/law-suggest.test.ts
import { suggestLaws } from '../src/law/suggest';

describe('Law Suggestion System', () => {
  it('returns deterministic results for identical input', async () => {
    const params = {
      summary: '추락 사고',
      incident_type: '추락',
      limit: 5,
    };

    const result1 = await suggestLaws(db, params);
    const result2 = await suggestLaws(db, params);

    expect(result1.suggestions).toEqual(result2.suggestions);
  });

  it('normalizes scores to [0, 1] range', async () => {
    const result = await suggestLaws(db, { summary: '감전 사고' });

    for (const scored of result.suggestions) {
      expect(scored.bm25_score).toBeGreaterThanOrEqual(0);
      expect(scored.bm25_score).toBeLessThanOrEqual(1);
      expect(scored.rule_score).toBeGreaterThanOrEqual(0);
      expect(scored.rule_score).toBeLessThanOrEqual(1);
      expect(scored.total_score).toBeGreaterThanOrEqual(0);
      expect(scored.total_score).toBeLessThanOrEqual(1);
    }
  });
});
```

### Integration Tests

```bash
# Test API endpoint
curl -X POST http://localhost:8787/api/laws/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "3층 건물 외벽 작업 중 추락",
    "incident_type": "추락",
    "limit": 5
  }'
```

## Maintenance

### Updating Rules

1. **Edit `apps/workers/rules/law_rules.json`**:
   - Add new accident types
   - Update keywords and regex patterns
   - Adjust weights based on domain expertise

2. **Increment Version**:
   ```json
   {
     "version": "1.1.0",
     "updated_at": "2025-02-01T00:00:00Z",
     ...
   }
   ```

3. **Test Changes**:
   - Verify determinism still holds
   - Check score distributions
   - Validate regex patterns

4. **Deploy**:
   ```bash
   cd apps/workers
   npx wrangler deploy
   ```

### Tuning Alpha and Beta

**Current Values**: α=0.6, β=0.4

**Adjust Based On**:
- **Increase α** (BM25 weight): If suggestions are too narrow, missing relevant laws
- **Increase β** (rule weight): If suggestions lack domain specificity

**Validation Method**:
1. Create test set of 20-30 incident descriptions
2. Have domain experts rate top-5 suggestions (1-5 scale)
3. Compute Mean Average Precision (MAP)
4. Adjust α/β to maximize MAP
5. Use grid search: α ∈ {0.3, 0.4, 0.5, 0.6, 0.7}, β = 1 - α

## Future Enhancements

1. **Machine Learning Integration**:
   - Train embedding model on law corpus
   - Use semantic similarity instead of keyword matching
   - Combine with current hybrid approach (3-way fusion)

2. **User Feedback Loop**:
   - Track which suggested laws are selected by users
   - Use implicit feedback to adjust weights
   - Implement personalized ranking

3. **Multilingual Support**:
   - Add English translations for laws
   - Support bilingual search
   - Cross-language similarity matching

4. **Contextual Reranking**:
   - Consider user's industry sector
   - Factor in company size and history
   - Time-based relevance (recent law changes prioritized)

5. **Explanation Generation**:
   - Auto-generate natural language explanations for scores
   - "This law was suggested because it mentions '추락' (3 times) and matches the pattern '높이.*미터'"

## Scoring Parameter Reference

| Parameter | Value | Description |
|-----------|-------|-------------|
| **α (alpha)** | 0.6 | Weight for BM25 full-text search score |
| **β (beta)** | 0.4 | Weight for rule-based matching score |
| **FTS5 Candidate Multiplier** | 5× | Fetch 5× candidates before rule filtering |
| **Default Result Limit** | 12 | Number of suggestions returned |
| **Score Normalization Range** | [0, 1] | All component scores normalized to unit interval |
| **Floating-Point Epsilon** | 0.0001 | Tolerance for score equality comparison |
| **Keyword Match Score (Both)** | 1.0 × weight | Score when keyword appears in both law and input |
| **Keyword Match Score (Law Only)** | 0.3 × weight | Score when keyword appears only in law |
| **Regex Match Score (Both)** | 1.5 × weight | Score when regex matches both law and input |
| **Regex Match Score (Law Only)** | 0.5 × weight | Score when regex matches only law |

## File Reference

| File | Purpose |
|------|---------|
| `apps/workers/rules/law_rules.json` | Rule definitions and scoring parameters |
| `apps/workers/src/law/suggest.ts` | Hybrid scoring implementation |
| `apps/workers/src/index.ts` | API endpoint routing |
| `apps/web/components/ops/LawSuggestPanel.tsx` | UI component for displaying suggestions |
| `apps/web/utils/highlight.ts` | Text highlighting utilities |
| `docs/LAW_SUGGESTION_SYSTEM.md` | This documentation file |

---

**Version**: 1.0
**Last Updated**: 2025-01-15
**Author**: Safe OPS Studio Development Team

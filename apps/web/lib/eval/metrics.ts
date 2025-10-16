/**
 * Information Retrieval Evaluation Metrics
 *
 * 법령 추천 시스템의 정확도를 평가하기 위한 메트릭 함수들
 */

/**
 * Precision@K: 상위 K개 추천 중 정답 비율
 *
 * @param predicted - 추천된 법령 ID 목록 (순서 있음)
 * @param relevant - 정답 법령 ID 목록 (순서 무관)
 * @param k - 평가할 상위 K개
 * @returns 0~1 사이의 정밀도 점수
 *
 * @example
 * precisionAtK(['A', 'B', 'C'], ['A', 'D'], 3) // 1/3 = 0.333
 * precisionAtK(['A', 'D', 'E'], ['A', 'D'], 2) // 2/2 = 1.0
 */
export function precisionAtK(
  predicted: string[],
  relevant: string[],
  k: number
): number {
  if (k <= 0 || predicted.length === 0) return 0;

  const topK = predicted.slice(0, k);
  const relevantSet = new Set(relevant);

  const correctCount = topK.filter(id => relevantSet.has(id)).length;

  return correctCount / topK.length;
}

/**
 * Recall@K: 전체 정답 중 상위 K개에서 찾은 비율
 *
 * @param predicted - 추천된 법령 ID 목록 (순서 있음)
 * @param relevant - 정답 법령 ID 목록 (순서 무관)
 * @param k - 평가할 상위 K개
 * @returns 0~1 사이의 재현율 점수
 *
 * @example
 * recallAtK(['A', 'B', 'C'], ['A', 'D'], 3) // 1/2 = 0.5
 * recallAtK(['A', 'D', 'E'], ['A', 'D'], 2) // 2/2 = 1.0
 */
export function recallAtK(
  predicted: string[],
  relevant: string[],
  k: number
): number {
  if (relevant.length === 0) return 1; // No relevant items = perfect recall
  if (k <= 0 || predicted.length === 0) return 0;

  const topK = predicted.slice(0, k);
  const relevantSet = new Set(relevant);

  const foundCount = topK.filter(id => relevantSet.has(id)).length;

  return foundCount / relevant.length;
}

/**
 * F1@K: Precision@K와 Recall@K의 조화평균
 *
 * @param predicted - 추천된 법령 ID 목록
 * @param relevant - 정답 법령 ID 목록
 * @param k - 평가할 상위 K개
 * @returns 0~1 사이의 F1 점수
 */
export function f1AtK(
  predicted: string[],
  relevant: string[],
  k: number
): number {
  const precision = precisionAtK(predicted, relevant, k);
  const recall = recallAtK(predicted, relevant, k);

  if (precision + recall === 0) return 0;

  return (2 * precision * recall) / (precision + recall);
}

/**
 * Mean Reciprocal Rank (MRR): 첫 번째 정답의 평균 역순위
 *
 * @param predicted - 추천된 법령 ID 목록 (순서 있음)
 * @param relevant - 정답 법령 ID 목록 (순서 무관)
 * @returns 0~1 사이의 MRR 점수 (높을수록 좋음)
 *
 * @example
 * meanReciprocalRank(['A', 'B', 'C'], ['B', 'D']) // 1/2 = 0.5 (B가 2번째)
 * meanReciprocalRank(['A', 'B', 'C'], ['A', 'D']) // 1/1 = 1.0 (A가 1번째)
 * meanReciprocalRank(['A', 'B', 'C'], ['D', 'E']) // 0 (정답 없음)
 */
export function meanReciprocalRank(
  predicted: string[],
  relevant: string[]
): number {
  if (relevant.length === 0 || predicted.length === 0) return 0;

  const relevantSet = new Set(relevant);

  for (let i = 0; i < predicted.length; i++) {
    if (relevantSet.has(predicted[i])) {
      return 1 / (i + 1); // Rank starts at 1, not 0
    }
  }

  return 0; // No relevant item found
}

/**
 * Normalized Discounted Cumulative Gain (NDCG)
 * 순서를 고려한 추천 품질 평가 (상위일수록 가중치 높음)
 *
 * @param predicted - 추천된 법령 ID 목록 (순서 있음)
 * @param relevant - 정답 법령 ID 목록 (순서 무관)
 * @param k - 평가할 상위 K개
 * @returns 0~1 사이의 NDCG 점수 (1 = 완벽한 순서)
 *
 * @example
 * ndcgAtK(['A', 'B', 'C'], ['A', 'B'], 3) // ~0.95 (완벽에 가까움)
 * ndcgAtK(['C', 'A', 'B'], ['A', 'B'], 3) // ~0.76 (순서가 바뀜)
 */
export function ndcgAtK(
  predicted: string[],
  relevant: string[],
  k: number
): number {
  if (relevant.length === 0) return 1; // No relevant items = perfect NDCG
  if (k <= 0 || predicted.length === 0) return 0;

  const topK = predicted.slice(0, k);
  const relevantSet = new Set(relevant);

  // DCG: 실제 추천 순서의 점수
  let dcg = 0;
  for (let i = 0; i < topK.length; i++) {
    if (relevantSet.has(topK[i])) {
      // Binary relevance: relevant = 1, not relevant = 0
      dcg += 1 / Math.log2(i + 2); // i+2 because log2(1) = 0
    }
  }

  // IDCG: 이상적인 순서의 점수 (모든 정답이 상위에 있을 때)
  let idcg = 0;
  const idealK = Math.min(relevant.length, k);
  for (let i = 0; i < idealK; i++) {
    idcg += 1 / Math.log2(i + 2);
  }

  return idcg === 0 ? 0 : dcg / idcg;
}

/**
 * 여러 테스트 케이스의 평균 메트릭 계산
 */
export interface EvaluationResult {
  precision_at_3: number;
  precision_at_5: number;
  recall_at_3: number;
  recall_at_5: number;
  f1_at_3: number;
  f1_at_5: number;
  mrr: number;
  ndcg_at_5: number;
  total_cases: number;
}

export interface TestCase {
  id: string;
  description: string;
  incidentType: string;
  incidentCause: string;
  predicted: string[]; // 추천된 법령 ID
  relevant: string[];  // 정답 법령 ID
}

/**
 * 여러 테스트 케이스에 대한 평균 메트릭 계산
 */
export function evaluateTestCases(testCases: TestCase[]): EvaluationResult {
  if (testCases.length === 0) {
    return {
      precision_at_3: 0,
      precision_at_5: 0,
      recall_at_3: 0,
      recall_at_5: 0,
      f1_at_3: 0,
      f1_at_5: 0,
      mrr: 0,
      ndcg_at_5: 0,
      total_cases: 0,
    };
  }

  let sumP3 = 0, sumP5 = 0;
  let sumR3 = 0, sumR5 = 0;
  let sumF1_3 = 0, sumF1_5 = 0;
  let sumMRR = 0, sumNDCG = 0;

  for (const testCase of testCases) {
    const { predicted, relevant } = testCase;

    sumP3 += precisionAtK(predicted, relevant, 3);
    sumP5 += precisionAtK(predicted, relevant, 5);
    sumR3 += recallAtK(predicted, relevant, 3);
    sumR5 += recallAtK(predicted, relevant, 5);
    sumF1_3 += f1AtK(predicted, relevant, 3);
    sumF1_5 += f1AtK(predicted, relevant, 5);
    sumMRR += meanReciprocalRank(predicted, relevant);
    sumNDCG += ndcgAtK(predicted, relevant, 5);
  }

  const n = testCases.length;

  return {
    precision_at_3: sumP3 / n,
    precision_at_5: sumP5 / n,
    recall_at_3: sumR3 / n,
    recall_at_5: sumR5 / n,
    f1_at_3: sumF1_3 / n,
    f1_at_5: sumF1_5 / n,
    mrr: sumMRR / n,
    ndcg_at_5: sumNDCG / n,
    total_cases: n,
  };
}

/**
 * 단일 테스트 케이스에 대한 상세 메트릭
 */
export interface DetailedMetrics {
  precision_at_3: number;
  precision_at_5: number;
  recall_at_3: number;
  recall_at_5: number;
  f1_at_3: number;
  f1_at_5: number;
  mrr: number;
  ndcg_at_5: number;
  matched_laws: string[];
  missed_laws: string[];
}

export function evaluateSingleCase(
  predicted: string[],
  relevant: string[]
): DetailedMetrics {
  const relevantSet = new Set(relevant);
  const matched = predicted.filter(id => relevantSet.has(id));
  const missed = relevant.filter(id => !predicted.includes(id));

  return {
    precision_at_3: precisionAtK(predicted, relevant, 3),
    precision_at_5: precisionAtK(predicted, relevant, 5),
    recall_at_3: recallAtK(predicted, relevant, 3),
    recall_at_5: recallAtK(predicted, relevant, 5),
    f1_at_3: f1AtK(predicted, relevant, 3),
    f1_at_5: f1AtK(predicted, relevant, 5),
    mrr: meanReciprocalRank(predicted, relevant),
    ndcg_at_5: ndcgAtK(predicted, relevant, 5),
    matched_laws: matched,
    missed_laws: missed,
  };
}

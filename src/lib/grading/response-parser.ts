import { GradingResult } from '@/types/grading';

export function parseGradingResponse(raw: string, maxScore: number): GradingResult {
  try {
    // LLMs often disobey instruction and wrap json in markdown fences. Clean them robustly.
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
    
    if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
    
    cleaned = cleaned.trim();
    
    const parsed = JSON.parse(cleaned);

    let score = typeof parsed.score === 'number' ? parsed.score : 0;
    
    // Clamp score securely against injection or hallucination bounds
    if (score < 0) score = 0;
    if (score > maxScore) score = maxScore;

    return {
      score,
      feedback: parsed.feedback || 'No feedback provided.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      areasForImprovement: Array.isArray(parsed.areasForImprovement) ? parsed.areasForImprovement : [],
      rawResponse: raw,
    };
  } catch (error) {
    return {
      score: 0,
      feedback: 'Failed to process AI response due to unrecognized output formatting.',
      strengths: [],
      areasForImprovement: [],
      rawResponse: raw,
    };
  }
}

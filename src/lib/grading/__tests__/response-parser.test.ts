import { describe, it, expect } from 'vitest';
import { parseGradingResponse } from '../response-parser';

describe('response-parser logic constraints', () => {
  it('parses standardized conforming unformatted output safely', () => {
    const raw = `{"score": 85, "feedback": "Good job", "strengths": ["A"], "areasForImprovement": ["B"]}`;
    const result = parseGradingResponse(raw, 100);
    expect(result.score).toBe(85);
    expect(result.feedback).toBe('Good job');
  });

  it('strips markdown code blocks frequently injected by autonomous models', () => {
    const raw = `\`\`\`json
{"score": 90, "feedback": "Fixed", "strengths": [], "areasForImprovement": []}
\`\`\``;
    const result = parseGradingResponse(raw, 100);
    expect(result.score).toBe(90); 
    expect(result.feedback).toBe('Fixed');
  });
  
  it('clamps hallucinated scores bypassing configured maxes natively', () => {
    const raw = `{"score": 150, "feedback": "Fantastic!", "strengths": [], "areasForImprovement": []}`;
    const result = parseGradingResponse(raw, 100);
    // Should clamp the 150 score securely back to the cap
    expect(result.score).toBe(100);
  });

  it('handles wildly malformed structures avoiding runtime crashes entirely', () => {
    const raw = `As an AI language model, I prefer not to grade logic essays.`;
    const result = parseGradingResponse(raw, 100);
    expect(result.score).toBe(0);
    expect(result.feedback).toContain('Failed to process AI response');
  });
});

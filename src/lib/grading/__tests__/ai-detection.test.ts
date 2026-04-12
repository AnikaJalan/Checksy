import { describe, it, expect } from 'vitest';
import { buildAiDetectionPrompt, parseAiDetectionResponse } from '../ai-detection';

describe('ai-detection utilities', () => {
  it('buildAiDetectionPrompt injects the exact submission string explicitly', () => {
    const prompt = buildAiDetectionPrompt('This is my homework.');
    expect(prompt).toContain('This is my homework.');
    expect(prompt).toContain('percentage');
  });

  it('parseAiDetectionResponse resolves strict JSON safely', () => {
    const raw = `{"percentage": 85, "flags": ["too perfect"], "confidence": "high"}`;
    const result = parseAiDetectionResponse(raw);
    expect(result.percentage).toBe(85);
    expect(result.flags[0]).toBe('too perfect');
    expect(result.confidence).toBe('high');
  });

  it('parseAiDetectionResponse limits LLM hallucinations stripping outer markdown correctly', () => {
    const raw = `\`\`\`json\n{"percentage": 105, "flags": [], "confidence": "HIGH"}\n\`\`\``;
    const result = parseAiDetectionResponse(raw);
    expect(result.percentage).toBe(100); // Clamped successfully
    expect(result.confidence).toBe('high'); // Lowercased safely
  });

  it('parseAiDetectionResponse falls back gracefully when format collapses', () => {
    const raw = `I don't think this is AI.`;
    const result = parseAiDetectionResponse(raw);
    expect(result.percentage).toBe(0);
    expect(result.error).toBe('Parse failure');
  });
});

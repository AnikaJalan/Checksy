import { describe, it, expect } from 'vitest';
import { buildGradingPrompt } from '../prompt-builder';
import { GradingConfig } from '@/types/grading';

describe('prompt-builder', () => {
  const baseConfig: GradingConfig = {
    subject: 'Biology',
    strictness: 'moderate',
    maxScore: 100,
    feedbackTone: 'encouraging',
  };

  it('includes core strictness and tone parameters', () => {
    const prompt = buildGradingPrompt(baseConfig, 'My essay.', 'Evaluate the scientific method.');
    expect(prompt).toContain('Biology');
    expect(prompt).toContain('encouraging, supportive');
    expect(prompt).toContain('Grade moderately');
    expect(prompt).toContain('Evaluate the scientific method');
  });

  it('injects custom instructions dynamically', () => {
    const prompt = buildGradingPrompt(
      { ...baseConfig, customInstructions: 'Always penalize typos.' }, 
      'My essay.'
    );
    expect(prompt).toContain('TEACHER INSTRUCTIONS:');
    expect(prompt).toContain('Always penalize typos.');
  });
  
  it('injects dynamically requested custom rules', () => {
    const prompt = buildGradingPrompt(
      { ...baseConfig, customRules: [{ id: '1', instruction: 'Must include citations' }] }, 
      'My essay.'
    );
    expect(prompt).toContain('CUSTOM RULES TO ENFORCE:');
    expect(prompt).toContain('- Must include citations');
  });
});

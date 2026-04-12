import { GradingConfig } from '@/types/grading';

export function buildGradingPrompt(config: GradingConfig, submissionText: string, specificContext: string = ''): string {
  const customRulesStr = config.customRules && config.customRules.length > 0
    ? `\nCUSTOM RULES TO ENFORCE:\n${config.customRules.map(r => `- ${r.instruction}`).join('\n')}`
    : '';

  const toneContext = config.feedbackTone === 'encouraging' 
    ? 'Ensure all feedback uses an encouraging, supportive tone.'
    : config.feedbackTone === 'academic'
      ? 'Ensure feedback uses a strict, formal, academic tone.'
      : 'Provide neutral, direct feedback.';

  const strictnessContext = config.strictness === 'lenient'
    ? 'Grade leniently, focusing heavily on effort and general concepts rather than minor mistakes.'
    : config.strictness === 'strict'
      ? 'Grade strictly. Deduct points for minor errors and hold the student to a rigorous standard.'
      : 'Grade moderately. Balance accuracy with overall comprehension.';

  return `You are an expert AI grader specializing in ${config.subject}.
${specificContext}

GRADING PARAMETERS:
- Strictness: ${config.strictness}
- Max Score: ${config.maxScore}
${strictnessContext}
${toneContext}

${config.customInstructions ? `TEACHER INSTRUCTIONS:\n${config.customInstructions}\n` : ''}${customRulesStr}

Evaluate the following student submission and provide a JSON response. 
The JSON must perfectly conform to this schema:
{
  "score": number (between 0 and ${config.maxScore}),
  "feedback": string (markdown formatting allowed),
  "strengths": string[] (list of 2-3 things the student did well),
  "areasForImprovement": string[] (list of 2-3 specific areas to improve)
}

Ensure your entire returned output is exclusively valid JSON, wrapped in standard curly braces, with no markdown code block fences before or after.

STUDENT SUBMISSION:
"""
${submissionText}
"""
`;
}

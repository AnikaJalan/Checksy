import { GradingConfig, SubjectAdapter } from '@/types/grading';

export const mathAdapter: SubjectAdapter = {
  id: 'math',
  getPromptContext: (config: GradingConfig) => {
    return `As a Mathematics expert, evaluate the submission focusing intently on logic.
CRITERIA TO EVALUATE:
1. Problem-solving methodology
2. Correctness of mathematical steps
3. Final accuracy
If the final answer is wrong but the methodology is mostly correct, award partial credit based on the strictness parameter.`;
  }
  // Note: Wolfram Alpha verification can augment the processSubmission hook in the future
};

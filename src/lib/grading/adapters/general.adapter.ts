import { GradingConfig, SubjectAdapter } from '@/types/grading';

export const generalAdapter: SubjectAdapter = {
  id: 'general',
  getPromptContext: (config: GradingConfig) => {
    return `Evaluate the submission objectively. Focus on general comprehension, clarity of thought, and adherence to the prompt.`;
  }
};

import { GradingConfig, SubjectAdapter } from '@/types/grading';

export const englishAdapter: SubjectAdapter = {
  id: 'english',
  getPromptContext: (config: GradingConfig) => {
    return `As an English Literature expert, critically evaluate the submission.
CRITERIA TO EVALUATE:
1. Thesis clarity and strength
2. Quality of textual evidence and analysis
3. Grammatical correctness and vocabulary usage
4. Structural flow, transitions, and stylistic cohesion.`;
  }
};

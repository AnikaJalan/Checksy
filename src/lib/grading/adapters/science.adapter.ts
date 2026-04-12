import { GradingConfig, SubjectAdapter } from '@/types/grading';

export const scienceAdapter: SubjectAdapter = {
  id: 'science',
  getPromptContext: (config: GradingConfig) => {
    return `As a Science expert, evaluate the scientific methodology and rigor.
CRITERIA TO EVALUATE:
1. Application of scientific principles
2. Proper use of data and unit measurements
3. Logic of hypothesis testing and conclusions drawn
Check for factual inaccuracies rigorously.`;
  }
};

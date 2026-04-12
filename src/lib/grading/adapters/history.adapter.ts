import { GradingConfig, SubjectAdapter } from '@/types/grading';

export const historyAdapter: SubjectAdapter = {
  id: 'history',
  getPromptContext: (config: GradingConfig) => {
    return `As a History expert, evaluate the historical recounting and analysis.
CRITERIA TO EVALUATE:
1. Accuracy of historical facts, dates, and figures
2. Depth of contextual analysis
3. Recognition of multiple viewpoints or historical biases
Ensure the student supports their historical claims with accurate evidence.`;
  }
};

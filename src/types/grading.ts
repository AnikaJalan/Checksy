export interface GradingConfig {
  subject: string;
  strictness: 'lenient' | 'moderate' | 'strict';
  maxScore: number;
  feedbackTone: 'encouraging' | 'neutral' | 'academic';
  customInstructions?: string;
  customRules?: Array<{ id: string; instruction: string }>;
  enableAiDetection?: boolean;
}

export interface GradingResult {
  score: number;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  grammarIssues?: string[];
  plagiarismFlag?: boolean;
  rawResponse?: string;
}

export interface SubjectAdapter {
  id: string;
  getPromptContext(config: GradingConfig): string;
  processSubmission?(submissionText: string): Promise<string> | string;
  buildCustomSystemPrompt?(config: GradingConfig): string | null;
}

export interface GradeSubmissionInput {
  submissionText: string;
  config: GradingConfig;
  studentName: string;
}

import { GradingConfig } from '@/types/grading';

export type Events = {
  'grading/session.start': {
    data: {
      sessionId: string;
      teacherId: string;
      config: GradingConfig;
      files: Array<{
        fileName: string;
        studentName: string;
        textContent: string;
      }>;
    };
  };
  'grading/session.completed': {
    data: {
      sessionId: string;
      teacherId: string;
    };
  };
};

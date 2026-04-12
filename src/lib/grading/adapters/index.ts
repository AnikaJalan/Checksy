import { SubjectAdapter } from '@/types/grading';
import { generalAdapter } from './general.adapter';
import { englishAdapter } from './english.adapter';
import { mathAdapter } from './math.adapter';
import { scienceAdapter } from './science.adapter';
import { historyAdapter } from './history.adapter';

const adapters: Record<string, SubjectAdapter> = {
  general: generalAdapter,
  english: englishAdapter,
  math: mathAdapter,
  science: scienceAdapter,
  history: historyAdapter,
};

export function getAdapter(subject: string): SubjectAdapter {
  const normalized = subject.toLowerCase().trim();
  return adapters[normalized] || generalAdapter;
}

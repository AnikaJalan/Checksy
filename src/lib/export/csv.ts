export interface CsvResult {
  studentName: string;
  score: number | null;
  feedback: string | null;
  strengths: string[];
  areasForImprovement: string[];
  grammarIssues: string[];
  aiScore: number | null;
  isFlagged: boolean;
}

export function generateCsv(results: CsvResult[]): string {
  const headers = [
    'Student Name',
    'Score',
    'Feedback',
    'Strengths',
    'Areas for Improvement',
    'AI Content %',
    'Flagged'
  ];

  const escapeCell = (field: string | null | undefined | number | boolean) => {
    if (field === null || field === undefined) return '""';
    const stringField = String(field);
    // Explicitly escape constraints handling multi-line outputs or natively escaped commas.
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const rows = results.map(r => {
    return [
      escapeCell(r.studentName),
      escapeCell(r.score),
      escapeCell(r.feedback),
      escapeCell(r.strengths.join('; ')),
      escapeCell(r.areasForImprovement.join('; ')),
      escapeCell(r.aiScore),
      escapeCell(r.isFlagged ? 'High Risk' : 'Low/None')
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

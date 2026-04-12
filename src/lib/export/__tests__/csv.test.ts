import { describe, it, expect } from 'vitest';
import { generateCsv } from '../csv';

describe('CSV Export Module', () => {
  it('generates completely valid headers seamlessly matching expectations', () => {
    const csv = generateCsv([]);
    expect(csv).toContain('Student Name,Score,Feedback');
    expect(csv).toContain('Flagged');
  });

  it('escapes standard matrix cells specifically mitigating comma or newline corruption internally', () => {
    const csv = generateCsv([{
      studentName: 'John, Doe',
      score: 95,
      feedback: 'Great "job"\nKeep it up',
      strengths: ['Logic', 'Writing'],
      areasForImprovement: [],
      grammarIssues: [],
      aiScore: null,
      isFlagged: false
    }]);
    
    // Verifies commas are encapsulated properly
    expect(csv).toContain('"John, Doe"'); 
    
    // Verifies internal quotes get correctly duplicate-escaped according to RFC4180
    expect(csv).toContain('"Great ""job""\nKeep it up"');

    // Verifies array joining mechanism logic works gracefully
    expect(csv).toContain('Logic; Writing');
  });
});

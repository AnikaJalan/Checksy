import { describe, it, expect } from 'vitest';
import { parseStudentName } from '../name-parser';

describe('name-parser utilities', () => {
  it('cleans typical underscore separated names removing the extension', () => {
    expect(parseStudentName('John_Doe_Essay.docx')).toBe('John Doe Essay');
  });

  it('removes leading and trailing sequence numbers', () => {
    expect(parseStudentName('123_student_work_99.docx')).toBe('student work');
  });

  it('splits CamelCase and PascalCase appropriately', () => {
    expect(parseStudentName('JohnDoeAssignment.docx')).toBe('John Doe Assignment');
  });
  
  it('handles empty or malformed names gracefully', () => {
    expect(parseStudentName('')).toBe('Unknown Student');
  });
});

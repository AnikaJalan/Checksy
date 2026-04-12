import { describe, it, expect } from 'vitest';
import { teachers } from '../schema/teachers';

describe('Database Schema', () => {
  it('should define the teachers table with correct columns', () => {
    expect(teachers.id).toBeDefined();
    expect(teachers.clerkId).toBeDefined();
    expect(teachers.email).toBeDefined();
    expect(teachers.firstName).toBeDefined();
    expect(teachers.lastName).toBeDefined();
    expect(teachers.school).toBeDefined();
    expect(teachers.subjectsTaught).toBeDefined();
    expect(teachers.createdAt).toBeDefined();
    expect(teachers.updatedAt).toBeDefined();
  });
});

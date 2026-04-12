import { db } from '@/lib/db';
import { gradingSessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { GradingConfig } from '@/types/grading';

export async function createSession(teacherId: string, name: string, config: GradingConfig) {
  const [session] = await db.insert(gradingSessions)
    .values({
      teacherId,
      name,
      status: 'pending',
      totalFiles: 0,
      config: config as any,
    })
    .returning();
  return session;
}

export async function getSession(sessionId: string, teacherId: string) {
  const [session] = await db.select()
    .from(gradingSessions)
    .where(and(eq(gradingSessions.id, sessionId), eq(gradingSessions.teacherId, teacherId)))
    .limit(1);
  return session;
}

export async function updateSessionStatus(
  sessionId: string, 
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial',
  totalFiles?: number
) {
  const updates: any = { status, updatedAt: new Date() };
  if (typeof totalFiles === 'number') updates.totalFiles = totalFiles;
  
  await db.update(gradingSessions)
    .set(updates)
    .where(eq(gradingSessions.id, sessionId));
}

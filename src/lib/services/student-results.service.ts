import { db } from '@/lib/db';
import { studentResults, gradingSessions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getResultsBySession(sessionId: string, teacherId: string) {
  // Enforce session ownership verification explicitly ensuring zero leakage.
  const [session] = await db.select().from(gradingSessions)
    .where(and(eq(gradingSessions.id, sessionId), eq(gradingSessions.teacherId, teacherId)))
    .limit(1);

  if (!session) throw new Error('Unauthorized access or disconnected session pointer');

  return db.select().from(studentResults).where(eq(studentResults.sessionId, sessionId));
}

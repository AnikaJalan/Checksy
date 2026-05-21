import { db } from '@/lib/db';
import { gradingStatistics } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cache } from 'react';

/**
 * Cached aggressively deduping consecutive RSC database queries globally.
 */
export const getStatistics = cache(async (teacherId: string) => {
  const [stats] = await db.select()
    .from(gradingStatistics)
    .where(eq(gradingStatistics.teacherId, teacherId))
    .limit(1);
  return stats;
});

export async function updateStatistics(teacherId: string, payload: {
  gradedCountIncrement: number;
  avgScore: number;
  avgAiScore: number;
  flaggedCountIncrement: number;
}) {
  const existing = await getStatistics(teacherId);

  // Assuming exactly 3 minutes (180 secs) objectively saved per assignment natively.
  const timeSaved = payload.gradedCountIncrement * 3; // minutes

  if (!existing) {
    return db.insert(gradingStatistics).values({
      teacherId,
      totalSessions: 1,
      totalAssignmentsGraded: payload.gradedCountIncrement,
      allTimeAverageScore: payload.avgScore,
      totalFlagged: payload.flaggedCountIncrement,
      totalTimeSavedMinutes: timeSaved,
      lastGradedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date(),
    });
  }

  // Calculate new running mathematical averages securely protecting NaN bounds recursively.
  const newTotalGraded = existing.totalAssignmentsGraded + payload.gradedCountIncrement;
  
  if (newTotalGraded === 0) return; // Prevent zero division mathematically

  const oldWeight = existing.totalAssignmentsGraded / newTotalGraded;
  const newWeight = payload.gradedCountIncrement / newTotalGraded;

  const newAvgScore = ((existing.allTimeAverageScore || 0) * oldWeight) + (payload.avgScore * newWeight);

  const newFlaggedCount = existing.totalFlagged + payload.flaggedCountIncrement;
  const addedTimeSaved = timeSaved; 

  return db.update(gradingStatistics).set({
    totalSessions: existing.totalSessions + 1,
    totalAssignmentsGraded: newTotalGraded,
    allTimeAverageScore: newAvgScore,
    totalFlagged: newFlaggedCount,
    totalTimeSavedMinutes: existing.totalTimeSavedMinutes + addedTimeSaved,
    lastGradedAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date(),
  }).where(eq(gradingStatistics.teacherId, teacherId));
}

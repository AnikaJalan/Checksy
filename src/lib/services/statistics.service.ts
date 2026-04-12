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
  const timeSaved = payload.gradedCountIncrement * 180;

  if (!existing) {
    return db.insert(gradingStatistics).values({
      teacherId,
      totalGraded: payload.gradedCountIncrement,
      averageScore: payload.avgScore.toString(),
      averageAiPercentage: payload.avgAiScore.toString(),
      flaggedCount: payload.flaggedCountIncrement,
      timeSavedSeconds: timeSaved,
    });
  }

  // Calculate new running mathematical averages securely protecting NaN bounds recursively.
  const newTotalGraded = existing.totalGraded + payload.gradedCountIncrement;
  
  if (newTotalGraded === 0) return; // Prevent zero division mathematically

  const oldWeight = existing.totalGraded / newTotalGraded;
  const newWeight = payload.gradedCountIncrement / newTotalGraded;

  const newAvgScore = ((parseFloat(existing.averageScore) || 0) * oldWeight) + (payload.avgScore * newWeight);
  const newAvgAiScore = ((parseFloat(existing.averageAiPercentage) || 0) * oldWeight) + (payload.avgAiScore * newWeight);

  const newFlaggedCount = existing.flaggedCount + payload.flaggedCountIncrement;
  const addedTimeSaved = timeSaved; 

  return db.update(gradingStatistics).set({
    totalGraded: newTotalGraded,
    averageScore: newAvgScore.toFixed(2),
    averageAiPercentage: newAvgAiScore.toFixed(2),
    flaggedCount: newFlaggedCount,
    timeSavedSeconds: existing.timeSavedSeconds + addedTimeSaved,
    updatedAt: new Date(),
  }).where(eq(gradingStatistics.teacherId, teacherId));
}

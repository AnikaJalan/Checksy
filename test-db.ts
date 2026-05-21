import { db } from './src/lib/db';
import { studentResults, gradingSessions } from './src/lib/db/schema';
import { desc } from 'drizzle-orm';

async function main() {
  const sessions = await db.select().from(gradingSessions).orderBy(desc(gradingSessions.createdAt)).limit(1);
  const latestSession = sessions[0];
  console.log("Latest Session:", latestSession);
  if (latestSession) {
    const results = await db.select().from(studentResults).where(require('drizzle-orm').eq(studentResults.sessionId, latestSession.id));
    console.log("Results for session:", results.length, "items");
    console.log(results);
  }
}
main();

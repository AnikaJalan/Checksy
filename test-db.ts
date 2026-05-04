import { db } from './src/lib/db';
import { studentResults, gradingSessions } from './src/lib/db/schema';
import { desc } from 'drizzle-orm';

async function main() {
  const sessions = await db.select().from(gradingSessions).orderBy(desc(gradingSessions.createdAt)).limit(1);
  console.log("Latest Session:", sessions[0]);
  if (sessions.length > 0) {
    const results = await db.select().from(studentResults).where(require('drizzle-orm').eq(studentResults.sessionId, sessions[0].id));
    console.log("Results for session:", results.length, "items");
    console.log(results);
  }
}
main();

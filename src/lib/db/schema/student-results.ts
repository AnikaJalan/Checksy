import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  real,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { gradingSessions } from './grading-sessions'

export const studentResults = pgTable(
  'student_results',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => gradingSessions.id, { onDelete: 'cascade' }),
    studentName: varchar('student_name', { length: 255 }).notNull(),
    fileName: varchar('file_name', { length: 500 }).notNull(),
    score: real('score'),
    feedback: text('feedback'),
    strengths: text('strengths'),
    areasForImprovement: text('areas_for_improvement'),
    aiContentPercentage: real('ai_content_percentage'),
    isFlagged: boolean('is_flagged').notNull().default(false),
    flagReason: varchar('flag_reason', { length: 255 }),
    mathVerified: boolean('math_verified'),
    wolframDetails: text('wolfram_details'),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    errorMessage: text('error_message'),
    gradedAt: timestamp('graded_at'),
  },
  (table) => ({
    sessionIdx: index('idx_results_session').on(table.sessionId),
  })
)

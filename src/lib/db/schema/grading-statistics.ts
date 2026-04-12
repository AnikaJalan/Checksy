import {
  pgTable,
  uuid,
  integer,
  real,
  timestamp,
  date,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { teachers } from './teachers'

export const gradingStatistics = pgTable(
  'grading_statistics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: uuid('teacher_id')
      .notNull()
      .unique()
      .references(() => teachers.id, { onDelete: 'cascade' }),
    totalSessions: integer('total_sessions').notNull().default(0),
    totalAssignmentsGraded: integer('total_assignments_graded')
      .notNull()
      .default(0),
    allTimeAverageScore: real('all_time_average_score'),
    totalFlagged: integer('total_flagged').notNull().default(0),
    totalTimeSavedMinutes: integer('total_time_saved_minutes')
      .notNull()
      .default(0),
    lastGradedAt: date('last_graded_at'),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    teacherIdx: uniqueIndex('idx_stats_teacher').on(table.teacherId),
  })
)

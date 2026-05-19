import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  real,
  timestamp,
  index,
} from 'drizzle-orm/pg-core'
import { teachers } from './teachers'
import { gradingTemplates } from './grading-templates'

export const gradingSessions = pgTable(
  'grading_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: uuid('teacher_id')
      .notNull()
      .references(() => teachers.id, { onDelete: 'cascade' }),
    templateId: uuid('template_id').references(() => gradingTemplates.id, {
      onDelete: 'set null',
    }),
    subject: varchar('subject', { length: 50 }).notNull(),
    name: varchar('name', { length: 255 }).default('Untitled Session'),
    strictness: varchar('strictness', { length: 20 }).notNull(),
    customInstructions: text('custom_instructions'),
    aiDetectionEnabled: boolean('ai_detection_enabled').notNull().default(true),
    maxScore: integer('max_score').notNull().default(100),
    llmProvider: varchar('llm_provider', { length: 20 }).notNull(),
    llmModel: varchar('llm_model', { length: 100 }).notNull(),
    totalFiles: integer('total_files').notNull().default(0),
    gradedCount: integer('graded_count').notNull().default(0),
    failedCount: integer('failed_count').notNull().default(0),
    status: varchar('status', { length: 20 }).notNull().default('pending'),
    averageScore: real('average_score'),
    avgAiPercentage: real('avg_ai_percentage'),
    flaggedCount: integer('flagged_count').notNull().default(0),
    totalTokensUsed: integer('total_tokens_used'),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    teacherIdx: index('idx_sessions_teacher').on(table.teacherId),
    statusIdx: index('idx_sessions_status').on(table.teacherId, table.status),
    createdIdx: index('idx_sessions_created').on(
      table.teacherId,
      table.createdAt
    ),
  })
)

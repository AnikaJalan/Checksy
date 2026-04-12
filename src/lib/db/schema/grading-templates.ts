import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { teachers } from './teachers'

export const gradingTemplates = pgTable(
  'grading_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: uuid('teacher_id')
      .notNull()
      .references(() => teachers.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    subject: varchar('subject', { length: 50 }).notNull(),
    strictness: varchar('strictness', { length: 20 })
      .notNull()
      .default('moderate'),
    customInstructions: text('custom_instructions'),
    aiDetectionEnabled: boolean('ai_detection_enabled').notNull().default(true),
    maxScore: integer('max_score').notNull().default(100),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    teacherNameIdx: uniqueIndex('idx_templates_teacher_name').on(
      table.teacherId,
      table.name
    ),
  })
)

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { teachers } from './teachers'

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    teacherId: uuid('teacher_id')
      .notNull()
      .references(() => teachers.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 20 }).notNull(),
    encryptedKey: text('encrypted_key').notNull(),
    iv: text('iv').notNull(),
    authTag: text('auth_tag').notNull(),
    keyHint: varchar('key_hint', { length: 8 }).notNull(),
    isValid: boolean('is_valid').notNull().default(true),
    lastValidatedAt: timestamp('last_validated_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    teacherProviderIdx: uniqueIndex('idx_api_keys_teacher_provider').on(
      table.teacherId,
      table.provider
    ),
    teacherIdx: index('idx_api_keys_teacher').on(table.teacherId),
  })
)

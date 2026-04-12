import {
  pgTable,
  uuid,
  varchar,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { teachers } from "./teachers";

export const teacherPreferences = pgTable("teacher_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  teacherId: uuid("teacher_id").notNull().unique()
    .references(() => teachers.id, { onDelete: "cascade" }),
  defaultSubject: varchar("default_subject", { length: 50 }).default("general"),
  defaultStrictness: varchar("default_strictness", { length: 20 }).default("moderate"),
  aiDetectionEnabled: boolean("ai_detection_enabled").notNull().default(true),
  defaultMaxScore: integer("default_max_score").notNull().default(100),
  feedbackTone: varchar("feedback_tone", { length: 20 }).default("neutral"),
  preferredLlmProvider: varchar("preferred_llm_provider", { length: 20 }),
  preferredLlmModel: varchar("preferred_llm_model", { length: 100 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

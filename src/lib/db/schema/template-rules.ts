import {
  pgTable,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { gradingTemplates } from "./grading-templates";
import { customRules } from "./custom-rules";

export const templateRules = pgTable("template_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  templateId: uuid("template_id").notNull()
    .references(() => gradingTemplates.id, { onDelete: "cascade" }),
  ruleId: uuid("rule_id").notNull()
    .references(() => customRules.id, { onDelete: "cascade" }),
}, (table) => ({
  uniquePair: uniqueIndex("idx_template_rules_unique")
    .on(table.templateId, table.ruleId),
}));

import { db } from '@/lib/db'
import { templateRules } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function setTemplateRules(templateId: string, ruleIds: string[]) {
  // Clear existing
  await db.delete(templateRules).where(eq(templateRules.templateId, templateId))

  if (ruleIds.length === 0) return []

  // Insert new rules mapping
  const values = ruleIds.map((ruleId) => ({ templateId, ruleId }))
  return db.insert(templateRules).values(values).returning()
}

export async function getTemplateRules(templateId: string) {
  return db
    .select()
    .from(templateRules)
    .where(eq(templateRules.templateId, templateId))
}

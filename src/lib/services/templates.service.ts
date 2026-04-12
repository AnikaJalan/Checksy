import { db } from '@/lib/db'
import { gradingTemplates } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function createTemplate(teacherId: string, data: any) {
  const [template] = await db
    .insert(gradingTemplates)
    .values({ teacherId, ...data })
    .returning()
  return template
}

export async function getTemplates(teacherId: string) {
  return db
    .select()
    .from(gradingTemplates)
    .where(eq(gradingTemplates.teacherId, teacherId))
}

export async function getTemplateById(id: string, teacherId: string) {
  const [template] = await db
    .select()
    .from(gradingTemplates)
    .where(
      and(
        eq(gradingTemplates.id, id),
        eq(gradingTemplates.teacherId, teacherId)
      )
    )
    .limit(1)
  return template
}

export async function updateTemplate(id: string, teacherId: string, data: any) {
  const [template] = await db
    .update(gradingTemplates)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(gradingTemplates.id, id),
        eq(gradingTemplates.teacherId, teacherId)
      )
    )
    .returning()
  return template
}

export async function deleteTemplate(id: string, teacherId: string) {
  const [template] = await db
    .delete(gradingTemplates)
    .where(
      and(
        eq(gradingTemplates.id, id),
        eq(gradingTemplates.teacherId, teacherId)
      )
    )
    .returning()
  return template
}

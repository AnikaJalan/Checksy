import { db } from '@/lib/db'
import { customRules } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function createRule(teacherId: string, data: any) {
  const [rule] = await db
    .insert(customRules)
    .values({ teacherId, ...data })
    .returning()
  return rule
}

export async function getRules(teacherId: string) {
  return db
    .select()
    .from(customRules)
    .where(eq(customRules.teacherId, teacherId))
}

export async function updateRule(id: string, teacherId: string, data: any) {
  const [rule] = await db
    .update(customRules)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(customRules.id, id), eq(customRules.teacherId, teacherId)))
    .returning()
  return rule
}

export async function deleteRule(id: string, teacherId: string) {
  const [rule] = await db
    .delete(customRules)
    .where(and(eq(customRules.id, id), eq(customRules.teacherId, teacherId)))
    .returning()
  return rule
}

import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { teachers } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import React from 'react'

export const getTeacher = React.cache(async () => {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  const [teacher] = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(eq(teachers.clerkId, userId))
    .limit(1)

  if (teacher) return teacher

  // JIT Component-level Provisioning mapping missing local environment Webhooks
  const clerkUser = await currentUser()
  if (!clerkUser) return null;

  const [newTeacher] = await db.insert(teachers).values({
    clerkId: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress || 'no-email@local.com',
    firstName: clerkUser.firstName || '',
    lastName: clerkUser.lastName || '',
  }).returning({ id: teachers.id });

  return newTeacher || null;
})

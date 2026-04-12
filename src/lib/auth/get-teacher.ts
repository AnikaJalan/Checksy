import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { teachers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import React from 'react';

export const getTeacher = React.cache(async () => {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const [teacher] = await db
    .select({ id: teachers.id })
    .from(teachers)
    .where(eq(teachers.clerkId, userId))
    .limit(1);

  return teacher || null;
});

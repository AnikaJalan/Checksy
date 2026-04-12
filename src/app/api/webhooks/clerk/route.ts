import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { env } from '@/lib/env';
import { db } from '@/lib/db';
import { teachers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const primaryEmail = email_addresses.find(
      (email: any) => email.id === evt.data.primary_email_address_id
    )?.email_address || email_addresses[0]?.email_address;

    if (!primaryEmail) {
       return new Response('No email address provided', { status: 400 });
    }

    const teacherData = {
      clerkId: id,
      email: primaryEmail,
      firstName: first_name || 'Teacher',
      lastName: last_name || '',
    };

    if (eventType === 'user.created') {
       await db.insert(teachers).values(teacherData);
    } else {
       await db.update(teachers).set(teacherData).where(eq(teachers.clerkId, id));
    }
  }

  return new Response('Success', { status: 200 });
}

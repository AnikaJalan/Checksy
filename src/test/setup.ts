import '@testing-library/jest-dom'

process.env.DATABASE_URL = 'postgresql://local';
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test';
process.env.CLERK_SECRET_KEY = 'sk_test';
process.env.CLERK_WEBHOOK_SECRET = 'whsec_test';
process.env.ENCRYPTION_SECRET = '01234567890123456789012345678902';

import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the root of the backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('24h'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('4000'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:5174'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(_env.error.format(), null, 2));
  process.exit(1);
}

export const env = _env.data;

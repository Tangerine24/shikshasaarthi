import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? '5000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtAccessSecret: requireEnv('JWT_ACCESS_SECRET', 'dev-access-secret-change-in-prod'),
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-in-prod'),
  jwtAccessExpiry: '15m',
  jwtRefreshExpiry: '7d',
  bcryptRounds: 12,
  uploadDir: process.env.UPLOAD_DIR ?? './uploads',
  jagoApiKey: process.env.JAGO_API_KEY ?? '',
  jagoModel: process.env.JAGO_MODEL ?? 'gemini-2.0-flash',
  corsOrigin: process.env.CORS_ORIGIN === '*' ? '*' : (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : 'http://localhost:5173'),
};

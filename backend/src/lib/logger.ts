const SENSITIVE_KEYS = ['password', 'passwordHash', 'token', 'accessToken', 'refreshToken', 'category', 'annualFamilyIncome', 'hasDisability'];

function sanitize(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) return obj;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    result[key] = SENSITIVE_KEYS.includes(key) ? '[REDACTED]' : sanitize(value);
  }
  return result;
}

export const logger = {
  info: (message: string, data?: unknown) => console.log(JSON.stringify({ level: 'info', message, data: sanitize(data), timestamp: new Date().toISOString() })),
  error: (message: string, error?: unknown) => console.error(JSON.stringify({ level: 'error', message, error: error instanceof Error ? { message: error.message, name: error.name } : String(error), timestamp: new Date().toISOString() })),
  warn: (message: string, data?: unknown) => console.warn(JSON.stringify({ level: 'warn', message, data: sanitize(data), timestamp: new Date().toISOString() })),
};

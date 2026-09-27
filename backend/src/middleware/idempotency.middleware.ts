import { Request, Response, NextFunction } from 'express';

const idempotencyCache = new Map<string, { statusCode: number; body: any; timestamp: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of idempotencyCache.entries()) {
    if (now - value.timestamp > 24 * 60 * 60 * 1000) {
      idempotencyCache.delete(key);
    }
  }
}, 60 * 60 * 1000);

export const idempotencyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['idempotency-key'] as string;
  
  if (!key) {
    return next();
  }

  const cached = idempotencyCache.get(key);
  if (cached && (Date.now() - cached.timestamp <= 24 * 60 * 60 * 1000)) {
    return res.status(cached.statusCode).json(cached.body);
  }

  const originalJson = res.json.bind(res);
  
  res.json = (body: any) => {
    idempotencyCache.set(key, {
      statusCode: res.statusCode,
      body,
      timestamp: Date.now()
    });
    return originalJson(body);
  };

  next();
};

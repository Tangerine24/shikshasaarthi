import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled error', err);
  const status = err.status || 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  res.status(status).json({ success: false, message, requestId: req.requestId });
}

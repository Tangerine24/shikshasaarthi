import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const reqId = uuidv4();
  req.requestId = reqId;
  res.setHeader('X-Request-ID', reqId);
  next();
}

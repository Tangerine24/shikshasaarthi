import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export function verifyToken(token: string) {
  return jwt.verify(token, config.jwtAccessSecret) as { id: string; email: string; role: string };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized', requestId: req.requestId });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token', requestId: req.requestId });
  }
}

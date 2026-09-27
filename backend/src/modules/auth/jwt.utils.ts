import jwt from 'jsonwebtoken';
import { config } from '../../config';

export function generateAccessToken(user: { id: string; email: string; role: string }) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtAccessSecret, { expiresIn: '15m' });
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ id: userId }, config.jwtRefreshSecret, { expiresIn: '7d' });
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, config.jwtRefreshSecret) as { id: string };
}

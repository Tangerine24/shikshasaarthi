import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

export const AuthController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  },
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body.email, req.body.password);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
};

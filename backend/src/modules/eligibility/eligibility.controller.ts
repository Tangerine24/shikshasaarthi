import { Request, Response, NextFunction } from 'express';
import { EligibilityService } from './eligibility.service';

export const EligibilityController = {
  async check(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await EligibilityService.evaluateEligibility(req.user!.id, req.body.scholarshipId);
      res.json({ success: true, data: result });
    } catch (err) { next(err); }
  }
};

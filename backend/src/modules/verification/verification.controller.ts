import { Request, Response } from 'express';
import { VerificationService } from './verification.service';

export const VerificationController = {
  async listExceptions(req: Request, res: Response) {
    try {
      const result = await VerificationService.getExceptionCases();
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getException(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await VerificationService.getExceptionCase(id);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async resolveException(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const result = await VerificationService.resolveException(id, { status, note });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async listForApplication(req: Request, res: Response) {
    try {
      const { applicationId } = req.params;
      const result = await VerificationService.getVerificationRequests(applicationId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // NEW Student Verification Endpoints
  async getOverview(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await VerificationService.getStudentVerificationOverview(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async verifyItem(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { itemType, source, consentGranted } = req.body;
      const result = await VerificationService.runVerification({
        userId,
        itemType,
        source,
        consentGranted: Boolean(consentGranted),
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async submitManualReview(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { itemType, reason } = req.body;
      const result = await VerificationService.requestManualReview({
        userId,
        itemType,
        reason: reason || 'Name variation clarification',
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  async getReadiness(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await VerificationService.getApplicationReadiness(userId);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

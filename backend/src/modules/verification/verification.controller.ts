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
  }
};

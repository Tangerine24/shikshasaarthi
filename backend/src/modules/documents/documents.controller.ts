import { Request, Response, NextFunction } from 'express';
import { DocumentService } from './documents.service';

export const DocumentController = {
  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new Error('File missing');
      const userId = (req as any).user.id;
      const doc = await DocumentService.uploadDocument(
        userId,
        req.file,
        req.body.documentType,
        req.body.expiryDate ? new Date(req.body.expiryDate) : undefined
      );
      res.json({ success: true, data: doc });
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const docs = await DocumentService.getDocuments(userId);
      res.json({ success: true, data: docs });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await DocumentService.deleteDocument(req.params.id, userId);
      res.json({ success: true, message: 'Document deleted' });
    } catch (err) { next(err); }
  },

  async getReadiness(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { scholarshipId } = req.params;
      const readiness = await DocumentService.getDocumentReadiness(userId, scholarshipId);
      res.json({ success: true, data: readiness });
    } catch (err) { next(err); }
  },

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const actorId = (req as any).user.id;
      const { id } = req.params;
      const { state, notes } = req.body;
      const doc = await DocumentService.verifyDocument(id, state, notes, actorId);
      res.json({ success: true, data: doc });
    } catch (err) { next(err); }
  },
};

import { Request, Response } from 'express';
import { JagoService } from './jago.service';

export const JagoController = {
  async chat(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { message, conversationId, language } = req.body;
      if (!message || typeof message !== 'string') {
        res.status(400).json({ success: false, error: 'Message is required' });
        return;
      }

      const result = await JagoService.handleChat(userId, message.trim(), conversationId, language);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async listConversations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const conversations = await JagoService.getConversations(userId);
      res.json({ success: true, data: conversations });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getConversation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;
      const conversation = await JagoService.getConversation(id, userId);
      if (!conversation) {
        res.status(404).json({ success: false, error: 'Conversation not found' });
        return;
      }
      res.json({ success: true, data: conversation });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

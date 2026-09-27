import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';

export interface AuditLogEntry {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  sensitiveFieldAccessed?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  requestId?: string;
}

export const AuditService = {
  async log(entry: AuditLogEntry) {
    try {
      return await prisma.auditLog.create({
        data: {
          actorId: entry.actorId,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          sensitiveFieldAccessed: entry.sensitiveFieldAccessed,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
          ipAddress: entry.ipAddress,
          requestId: entry.requestId,
        }
      });
    } catch (err) {
      logger.error('Failed to write audit log', err);
      return null;
    }
  },

  async getLogs(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [total, logs] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { id: true, email: true, role: true } } }
      })
    ]);
    return { total, page, pageSize, logs };
  }
};

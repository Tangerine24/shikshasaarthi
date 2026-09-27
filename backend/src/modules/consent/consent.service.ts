import { prisma } from '../../lib/prisma';

export const ConsentService = {
  async getConsents(userId: string) {
    return prisma.consentRecord.findMany({
      where: { userId },
      orderBy: { grantedAt: 'desc' }
    });
  },

  async grantConsent(userId: string, purpose: string, scope?: string) {
    return prisma.consentRecord.create({
      data: {
        userId,
        purpose,
        scope,
        consentVersion: 'v1.0',
        grantedAt: new Date()
      }
    });
  },

  async revokeConsent(userId: string, consentId: string) {
    const record = await prisma.consentRecord.findFirst({
      where: { id: consentId, userId }
    });
    if (!record) {
      throw new Error('Consent record not found');
    }
    return prisma.consentRecord.update({
      where: { id: consentId },
      data: { revokedAt: new Date() }
    });
  }
};

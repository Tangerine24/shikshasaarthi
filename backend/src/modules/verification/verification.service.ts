import { prisma } from '../../lib/prisma';

export const VerificationService = {
  async getExceptionCases(filters?: { status?: string }) {
    const whereClause = filters?.status ? { status: filters.status } : {};
    return prisma.exceptionCase.findMany({
      where: whereClause,
      include: {
        application: true,
        verificationRequest: true
      }
    });
  },

  async getExceptionCase(id: string) {
    return prisma.exceptionCase.findUnique({
      where: { id },
      include: {
        application: true,
        verificationRequest: true
      }
    });
  },

  async resolveException(id: string, resolution: { status: 'RESOLVED' | 'REJECTED', note: string }) {
    return prisma.exceptionCase.update({
      where: { id },
      data: {
        status: resolution.status,
        resolutionNote: resolution.note,
        resolvedAt: new Date()
      }
    });
  },

  async getVerificationRequests(applicationId: string) {
    return prisma.verificationRequest.findMany({
      where: { applicationId },
      include: {
        results: true
      }
    });
  }
};

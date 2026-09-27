import { prisma } from '../../lib/prisma';
import { AuditService } from '../audit/audit.service';

export const AdminService = {
  async getStats() {
    const [
      totalUsers,
      totalStudents,
      totalProviders,
      totalScholarships,
      totalApplications,
      pendingProviders,
      appsByStatus,
      openExceptions,
      activeRiskSignals,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.studentProfile.count(),
      prisma.providerProfile.count(),
      prisma.scholarship.count(),
      prisma.application.count(),
      prisma.providerProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.application.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.exceptionCase.count({ where: { status: 'OPEN' } }),
      prisma.riskSignal.count({ where: { status: 'ACTIVE' } }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const group of appsByStatus) {
      statusCounts[group.status] = group._count.id;
    }

    return {
      totalUsers,
      totalStudents,
      totalProviders,
      totalScholarships,
      totalApplications,
      pendingProviders,
      statusCounts,
      openExceptions,
      activeRiskSignals,
    };
  },

  async getPendingProviders() {
    return prisma.providerProfile.findMany({
      where: { verificationStatus: 'PENDING' },
      include: {
        user: { select: { email: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async verifyProvider(providerId: string, status: 'VERIFIED' | 'REJECTED', actorId: string) {
    const provider = await prisma.providerProfile.update({
      where: { id: providerId },
      data: {
        verificationStatus: status,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
      },
    });

    await AuditService.log({
      actorId,
      action: status === 'VERIFIED' ? 'APPROVE_PROVIDER' : 'REJECT_PROVIDER',
      entityType: 'ProviderProfile',
      entityId: providerId,
    });

    return provider;
  },

  async getAuditLogs(page = 1, pageSize = 20) {
    return AuditService.getLogs(page, pageSize);
  },

  async getReachAnalytics() {
    // Eligible-but-unreached ST cohort analysis by district
    const stStudents = await prisma.studentProfile.findMany({
      where: { category: 'ST' },
      select: { id: true, district: true, state: true },
    });

    const applicants = await prisma.application.findMany({
      select: { studentId: true },
    });
    const applicantIds = new Set(applicants.map(a => a.studentId));

    const districtMap: Record<string, { total: number; applied: number; unreached: number }> = {};
    for (const s of stStudents) {
      const dist = s.district || 'Unknown';
      if (!districtMap[dist]) districtMap[dist] = { total: 0, applied: 0, unreached: 0 };
      districtMap[dist].total++;
      if (applicantIds.has(s.id)) {
        districtMap[dist].applied++;
      } else {
        districtMap[dist].unreached++;
      }
    }

    const districts = Object.entries(districtMap).map(([name, data]) => ({
      district: name,
      ...data,
      reachPercent: data.total > 0 ? Math.round((data.applied / data.total) * 100) : 0,
    }));

    return {
      totalSTStudents: stStudents.length,
      totalApplied: applicantIds.size,
      totalUnreached: stStudents.length - applicantIds.size,
      overallReachPercent: stStudents.length > 0
        ? Math.round((applicantIds.size / stStudents.length) * 100)
        : 0,
      districts,
    };
  },

  async getPaymentMetrics() {
    const payments = await prisma.paymentEvent.groupBy({
      by: ['dbtStatus'],
      _count: { id: true },
      _sum: { amount: true },
    });

    const metrics = payments.map(p => ({
      status: p.dbtStatus,
      count: p._count.id,
      totalAmount: p._sum.amount || 0,
    }));

    const failedPayments = await prisma.paymentEvent.findMany({
      where: { dbtStatus: 'FAILED' },
      include: {
        application: {
          include: { student: { select: { fullName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return { metrics, failedPayments };
  },
};


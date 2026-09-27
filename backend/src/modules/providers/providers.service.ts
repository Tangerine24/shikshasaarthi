import { prisma } from '../../lib/prisma';

export const ProviderService = {
  async getDashboard(userId: string) {
    const provider = await prisma.providerProfile.findUnique({ where: { userId } });
    if (!provider) throw new Error('Provider profile not found');

    const [scholarships, applications] = await Promise.all([
      prisma.scholarship.findMany({
        where: { providerId: provider.id },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.application.findMany({
        where: { scholarship: { providerId: provider.id } },
        include: {
          scholarship: { select: { title: true } },
          student: { select: { fullName: true, state: true, educationLevel: true, course: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const pendingReview = applications.filter(a => a.status === 'UNDER_VERIFICATION' || a.status === 'SUBMITTED');
    const correctionRequired = applications.filter(a => a.status === 'CORRECTION_REQUIRED');
    const verified = applications.filter(a => a.status === 'VERIFIED');
    const approved = applications.filter(a => a.status === 'APPROVED');

    return {
      provider,
      stats: {
        totalScholarships: scholarships.length,
        totalApplications: applications.length,
        pendingReviewCount: pendingReview.length,
        correctionRequiredCount: correctionRequired.length,
        verifiedCount: verified.length,
        approvedCount: approved.length,
      },
      scholarships,
      recentApplications: applications.slice(0, 10),
    };
  },
};

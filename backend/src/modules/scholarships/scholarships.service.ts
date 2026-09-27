import { prisma } from '../../lib/prisma';

export function calculateDeadlineStatus(deadline: Date): { status: 'NORMAL' | 'UPCOMING' | 'URGENT' | 'CRITICAL' | 'EXPIRED'; daysLeft: number } {
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { status: 'EXPIRED', daysLeft: 0 };
  if (daysLeft <= 2) return { status: 'CRITICAL', daysLeft };
  if (daysLeft <= 6) return { status: 'URGENT', daysLeft };
  if (daysLeft <= 14) return { status: 'UPCOMING', daysLeft };
  return { status: 'NORMAL', daysLeft };
}

export const ScholarshipService = {
  async listPublished(filters?: { search?: string; state?: string; education?: string; sort?: string }) {
    const where: any = { status: 'PUBLISHED' };

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
        { targetGroup: { contains: filters.search } },
      ];
    }

    let orderBy: any = { deadline: 'asc' };
    if (filters?.sort === 'benefit_desc') orderBy = { benefit: 'desc' };
    if (filters?.sort === 'benefit_asc') orderBy = { benefit: 'asc' };
    if (filters?.sort === 'deadline_desc') orderBy = { deadline: 'desc' };

    const scholarships = await prisma.scholarship.findMany({
      where,
      orderBy,
      include: {
        provider: { select: { organizationName: true, verificationStatus: true } },
        eligibilityRules: true,
        documentRequirements: true,
        _count: { select: { applications: true } },
      },
    });

    return scholarships.map(s => ({
      ...s,
      deadlineInfo: calculateDeadlineStatus(s.deadline),
    }));
  },

  async getOne(id: string) {
    const s = await prisma.scholarship.findUnique({
      where: { id },
      include: {
        provider: { select: { id: true, organizationName: true, verificationStatus: true, organizationType: true } },
        eligibilityRules: true,
        documentRequirements: true,
        _count: { select: { applications: true } },
      },
    });
    if (!s) return null;
    return {
      ...s,
      deadlineInfo: calculateDeadlineStatus(s.deadline),
    };
  },

  async listByProvider(providerUserId: string) {
    const provider = await prisma.providerProfile.findUnique({ where: { userId: providerUserId } });
    if (!provider) throw new Error('Provider profile not found');

    const scholarships = await prisma.scholarship.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' },
      include: {
        eligibilityRules: true,
        documentRequirements: true,
        _count: { select: { applications: true } },
      },
    });

    return scholarships.map(s => ({
      ...s,
      deadlineInfo: calculateDeadlineStatus(s.deadline),
    }));
  },

  async create(providerUserId: string, data: {
    title: string;
    description: string;
    benefit: number;
    benefitDescription?: string;
    deadline: string | Date;
    targetGroup?: string;
    applicationProcess?: string;
    status?: string;
    rules?: Array<{ field: string; operator: string; value: string; description: string; isRequired?: boolean }>;
    documents?: Array<{ documentType: string; description?: string; isRequired?: boolean }>;
  }) {
    const provider = await prisma.providerProfile.findUnique({ where: { userId: providerUserId } });
    if (!provider) throw new Error('Provider profile not found');

    const scholarship = await prisma.scholarship.create({
      data: {
        providerId: provider.id,
        title: data.title,
        description: data.description,
        benefit: data.benefit,
        benefitDescription: data.benefitDescription,
        deadline: new Date(data.deadline),
        targetGroup: data.targetGroup,
        applicationProcess: data.applicationProcess,
        status: data.status || 'PUBLISHED',
        isDemo: true,
        eligibilityRules: {
          create: (data.rules || []).map(r => ({
            field: r.field,
            operator: r.operator,
            value: r.value,
            description: r.description,
            isRequired: r.isRequired ?? true,
          })),
        },
        documentRequirements: {
          create: (data.documents || []).map(d => ({
            documentType: d.documentType,
            description: d.description,
            isRequired: d.isRequired ?? true,
          })),
        },
      },
      include: {
        eligibilityRules: true,
        documentRequirements: true,
      },
    });

    return scholarship;
  },

  async update(id: string, providerUserId: string, data: any) {
    const provider = await prisma.providerProfile.findUnique({ where: { userId: providerUserId } });
    if (!provider) throw new Error('Provider profile not found');

    const existing = await prisma.scholarship.findUnique({ where: { id } });
    if (!existing || existing.providerId !== provider.id) {
      throw new Error('Unauthorized to modify this scholarship');
    }

    return prisma.scholarship.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        benefit: data.benefit,
        benefitDescription: data.benefitDescription,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        status: data.status,
        targetGroup: data.targetGroup,
      },
    });
  },
};

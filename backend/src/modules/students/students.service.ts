import { prisma } from '../../lib/prisma';
import { logger } from '../../lib/logger';
import { AuditService } from '../audit/audit.service';

export const StudentService = {
  calculateProfileCompletion(data: any): number {
    const fields = [
      'fullName',
      'state',
      'district',
      'category',
      'annualFamilyIncome',
      'educationLevel',
      'institution',
      'course',
      'yearOfStudy',
      'academicPercentage',
      'hasBankAccount',
    ];
    let filled = 0;
    for (const f of fields) {
      if (data[f] !== null && data[f] !== undefined && data[f] !== '') {
        filled++;
      }
    }
    return Math.round((filled / fields.length) * 100);
  },

  async getProfile(userId: string, actorId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, preferredLanguage: true, role: true } },
        documents: true,
        applications: {
          include: {
            scholarship: { select: { id: true, title: true, benefit: true } },
          },
        },
      },
    });

    if (profile && actorId !== userId) {
      await AuditService.log({
        actorId,
        action: 'READ_SENSITIVE_FIELD',
        entityType: 'StudentProfile',
        entityId: profile.id,
        sensitiveFieldAccessed: 'category,annualFamilyIncome,hasDisability',
      });
    }

    return profile;
  },

  async updateProfile(userId: string, data: any) {
    if (data.preferredLanguage) {
      await prisma.user.update({
        where: { id: userId },
        data: { preferredLanguage: data.preferredLanguage },
      });
    }

    const current = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!current) throw new Error('Student profile not found');

    const merged = { ...current, ...data };
    const profileCompletePercent = this.calculateProfileCompletion(merged);

    const updated = await prisma.studentProfile.update({
      where: { userId },
      data: {
        fullName: data.fullName !== undefined ? data.fullName : current.fullName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : current.dateOfBirth,
        gender: data.gender !== undefined ? data.gender : current.gender,
        state: data.state !== undefined ? data.state : current.state,
        district: data.district !== undefined ? data.district : current.district,
        category: data.category !== undefined ? data.category : current.category,
        annualFamilyIncome: data.annualFamilyIncome !== undefined && data.annualFamilyIncome !== null ? parseFloat(data.annualFamilyIncome) : current.annualFamilyIncome,
        educationLevel: data.educationLevel !== undefined ? data.educationLevel : current.educationLevel,
        institution: data.institution !== undefined ? data.institution : current.institution,
        course: data.course !== undefined ? data.course : current.course,
        yearOfStudy: data.yearOfStudy !== undefined && data.yearOfStudy !== null ? parseInt(data.yearOfStudy, 10) : current.yearOfStudy,
        academicPercentage: data.academicPercentage !== undefined && data.academicPercentage !== null ? parseFloat(data.academicPercentage) : current.academicPercentage,
        isHosteller: data.isHosteller !== undefined ? Boolean(data.isHosteller) : current.isHosteller,
        hasDisability: data.hasDisability !== undefined ? Boolean(data.hasDisability) : current.hasDisability,
        hasBankAccount: data.hasBankAccount !== undefined ? Boolean(data.hasBankAccount) : current.hasBankAccount,
        previousScholarship: data.previousScholarship !== undefined ? data.previousScholarship : current.previousScholarship,
        profileCompletePercent,
      },
      include: {
        user: { select: { email: true, preferredLanguage: true, role: true } },
      },
    });

    return updated;
  },
};

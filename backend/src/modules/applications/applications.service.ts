import { prisma } from '../../lib/prisma';
import { ApplicationStatus } from '../../types';
import { isValidTransition } from './state-machine';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notifications/notifications.service';

export const ApplicationService = {
  async getStudentProfileByUserId(userId: string) {
    const student = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw new Error('Student profile not found');
    return student;
  },

  async createOrGetDraft(userId: string, scholarshipId: string) {
    const student = await this.getStudentProfileByUserId(userId);

    let app = await prisma.application.findUnique({
      where: { studentId_scholarshipId: { studentId: student.id, scholarshipId } },
      include: {
        scholarship: { include: { documentRequirements: true } },
        applicationDocuments: { include: { document: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!app) {
      app = await prisma.application.create({
        data: {
          studentId: student.id,
          scholarshipId,
          status: ApplicationStatus.DRAFT,
          statusHistory: {
            create: { toStatus: ApplicationStatus.DRAFT, actorId: userId, note: 'Draft application initialized' },
          },
        },
        include: {
          scholarship: { include: { documentRequirements: true } },
          applicationDocuments: { include: { document: true } },
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });
    }

    return app;
  },

  async attachDocument(applicationId: string, documentId: string, userId: string) {
    const student = await this.getStudentProfileByUserId(userId);
    const app = await prisma.application.findFirst({
      where: { id: applicationId, studentId: student.id },
    });
    if (!app) throw new Error('Application not found');
    if (app.status !== ApplicationStatus.DRAFT && app.status !== ApplicationStatus.CORRECTION_REQUIRED) {
      throw new Error('Documents can only be attached to draft or correction-required applications');
    }

    // Check existing
    const existing = await prisma.applicationDocument.findFirst({
      where: { applicationId, documentId },
    });
    if (existing) return existing;

    return prisma.applicationDocument.create({
      data: { applicationId, documentId },
      include: { document: true },
    });
  },

  async submitApplication(applicationId: string, userId: string) {
    const student = await this.getStudentProfileByUserId(userId);
    const app = await prisma.application.findFirst({
      where: { id: applicationId, studentId: student.id },
      include: {
        scholarship: { include: { documentRequirements: true } },
        applicationDocuments: { include: { document: true } },
      },
    });
    if (!app) throw new Error('Application not found');

    const fromStatus = app.status as ApplicationStatus;
    const toStatus = ApplicationStatus.SUBMITTED;
    if (!isValidTransition(fromStatus, toStatus)) {
      throw new Error(`Cannot transition application from ${fromStatus} to ${toStatus}`);
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: toStatus,
        submittedAt: new Date(),
        correctionNote: null,
        statusHistory: {
          create: { fromStatus, toStatus, actorId: userId, note: 'Application submitted by student' },
        },
      },
      include: {
        scholarship: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    await NotificationService.create({
      userId,
      type: 'APPLICATION_SUBMITTED',
      title: 'Application Submitted',
      body: `Your application for "${app.scholarship.title}" was submitted successfully.`,
      metadata: { applicationId },
    });

    return updated;
  },

  async listStudentApplications(userId: string) {
    const student = await this.getStudentProfileByUserId(userId);
    return prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        scholarship: {
          include: { provider: { select: { organizationName: true } } },
        },
        applicationDocuments: { include: { document: true } },
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async listProviderApplications(providerUserId: string, status?: string) {
    const provider = await prisma.providerProfile.findUnique({ where: { userId: providerUserId } });
    if (!provider) throw new Error('Provider profile not found');

    const where: any = {
      scholarship: { providerId: provider.id },
    };
    if (status) where.status = status;

    return prisma.application.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            state: true,
            district: true,
            educationLevel: true,
            institution: true,
            course: true,
            category: true,
            annualFamilyIncome: true,
            academicPercentage: true,
          },
        },
        scholarship: { select: { id: true, title: true, benefit: true } },
        applicationDocuments: { include: { document: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async getApplication(id: string, userId: string, role: string) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        student: true,
        scholarship: {
          include: {
            provider: { select: { id: true, userId: true, organizationName: true } },
            documentRequirements: true,
          },
        },
        applicationDocuments: { include: { document: true } },
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!app) return null;

    // Check permissions
    if (role === 'STUDENT') {
      const student = await this.getStudentProfileByUserId(userId);
      if (app.studentId !== student.id) throw new Error('Forbidden');
    } else if (role === 'PROVIDER') {
      const provider = await prisma.providerProfile.findUnique({ where: { userId } });
      if (!provider || app.scholarship.provider.id !== provider.id) throw new Error('Forbidden');

      // Audit read of sensitive fields per PRIVACY_BY_DESIGN
      await AuditService.log({
        actorId: userId,
        action: 'READ_SENSITIVE_FIELD',
        entityType: 'StudentProfile',
        entityId: app.studentId,
        sensitiveFieldAccessed: 'category,annualFamilyIncome,hasDisability',
      });
    }

    return app;
  },

  async transitionStatus(applicationId: string, toStatus: ApplicationStatus, actorId: string, note?: string) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { student: { select: { userId: true } }, scholarship: true },
    });
    if (!app) throw new Error('Application not found');
    const fromStatus = app.status as ApplicationStatus;
    if (!isValidTransition(fromStatus, toStatus)) {
      throw new Error(`Invalid transition from ${fromStatus} to ${toStatus}`);
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: toStatus,
        correctionNote: toStatus === ApplicationStatus.CORRECTION_REQUIRED ? note : null,
        rejectionReason: toStatus === ApplicationStatus.REJECTED ? note : null,
        statusHistory: {
          create: { fromStatus, toStatus, actorId, note },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });

    // Notify student
    let notifTitle = 'Application Status Updated';
    let notifBody = `Your application for "${app.scholarship.title}" is now ${toStatus}.`;
    if (toStatus === ApplicationStatus.CORRECTION_REQUIRED) {
      notifTitle = 'Correction Requested';
      notifBody = `The provider requested corrections: "${note || 'Please review your application.'}"`;
    } else if (toStatus === ApplicationStatus.APPROVED) {
      notifTitle = 'Application Approved! 🎉';
      notifBody = `Congratulations! Your scholarship application for "${app.scholarship.title}" has been approved.`;
    }

    await NotificationService.create({
      userId: app.student.userId,
      type: 'VERIFICATION_UPDATE',
      title: notifTitle,
      body: notifBody,
      metadata: { applicationId },
    });

    return updated;
  },
};

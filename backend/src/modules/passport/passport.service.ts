import { prisma } from '../../lib/prisma';

export const PassportService = {
  async getPassport(userId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        enrolledInstitution: true,
        documents: true,
        applications: {
          include: {
            scholarship: true,
            paymentEvents: true,
          }
        },
        user: {
          include: {
            consentRecords: true,
          }
        }
      }
    });

    if (!student) throw new Error('Student profile not found');

    const documents = student.documents.map((doc: any) => {
      let daysUntilExpiry = null;
      let healthStatus = 'HEALTHY';
      
      if (doc.expiryDate) {
        const now = new Date();
        const expiry = new Date(doc.expiryDate);
        const diffTime = expiry.getTime() - now.getTime();
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) {
          healthStatus = 'EXPIRED';
        } else if (daysUntilExpiry <= 30) {
          healthStatus = 'EXPIRING_SOON';
        }
      }
      
      return {
        ...doc,
        daysUntilExpiry,
        healthStatus
      };
    });

    return {
      profile: {
        id: student.id,
        fullName: student.fullName,
        category: student.category,
        state: student.state,
        district: student.district,
        annualFamilyIncome: student.annualFamilyIncome,
        educationLevel: student.educationLevel,
        course: student.course,
        yearOfStudy: student.yearOfStudy,
        academicPercentage: student.academicPercentage,
        institution: student.institution,
        enrolledInstitution: student.enrolledInstitution,
        profileCompletePercent: student.profileCompletePercent,
        hasBankAccount: student.hasBankAccount,
      },
      documents,
      applications: student.applications,
      consents: student.user.consentRecords
    };
  }
};

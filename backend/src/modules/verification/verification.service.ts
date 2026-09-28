import { prisma } from '../../lib/prisma';
import { VerificationItemType, VerificationSource, VerificationResult } from './adapters/types';
import { DigiLockerAdapter } from './adapters/digilocker.adapter';
import { ApaarAdapter } from './adapters/apaar.adapter';
import { StateEDistrictAdapter } from './adapters/edistrict.adapter';
import { AisheAdapter } from './adapters/aishe.adapter';
import { InstitutionAdapter, UdiseAdapter } from './adapters/institution.adapter';

// In-memory persistent verification store for current session/demo
const studentVerificationState = new Map<string, Record<string, VerificationResult>>();

export const VerificationService = {
  // Existing Exception Case methods preserved
  async getExceptionCases(filters?: { status?: string }) {
    const whereClause = filters?.status ? { status: filters.status } : {};
    return prisma.exceptionCase.findMany({
      where: whereClause,
      include: {
        application: true,
        verificationRequest: true,
      },
    });
  },

  async getExceptionCase(id: string) {
    return prisma.exceptionCase.findUnique({
      where: { id },
      include: {
        application: true,
        verificationRequest: true,
      },
    });
  },

  async resolveException(id: string, resolution: { status: 'RESOLVED' | 'REJECTED'; note: string }) {
    return prisma.exceptionCase.update({
      where: { id },
      data: {
        status: resolution.status,
        resolutionNote: resolution.note,
        resolvedAt: new Date(),
      },
    });
  },

  async getVerificationRequests(applicationId: string) {
    return prisma.verificationRequest.findMany({
      where: { applicationId },
      include: {
        results: true,
      },
    });
  },

  // NEW: Unified Student Verification Center Service
  async getStudentVerificationOverview(userId: string) {
    const student = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { user: true, documents: true },
    });

    const defaultRecords: Record<string, VerificationResult> = {
      IDENTITY: {
        status: 'VERIFIED',
        source: 'DigiLocker',
        verifiedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        certificateNumber: 'DL-AADHAAR-89218201',
        dataPayload: {
          fullName: student?.fullName || 'Ramesh Kumar',
          maskedAadhaar: 'XXXX-XXXX-8921',
          digitalSignature: 'SHA256withRSA/CCA-GOV-INDIA',
        },
        notes: 'Aadhaar identity verified via DigiLocker. Lifetime valid.',
      },
      ST_PVTG_STATUS: {
        status: 'VERIFIED',
        source: 'State e-District',
        verifiedAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
        certificateNumber: `${student?.state === 'Karnataka' ? 'KA' : 'JH'}/CAST/2023/84920`,
        dataPayload: {
          category: student?.category || 'ST',
          subCaste: student?.state === 'Karnataka' ? 'Naikda' : 'Santhal',
          issuingAuthority: `Sub-Divisional Officer, ${student?.district || 'Ranchi'}`,
        },
        notes: 'Scheduled Tribe status certified by State Revenue Department.',
      },
      ACADEMIC_RECORDS: {
        status: 'VERIFIED',
        source: 'APAAR',
        verifiedAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
        certificateNumber: 'APAAR-ABC-908129841',
        dataPayload: {
          course: student?.course || 'B.Tech Computer Science',
          cgpa: student?.academicPercentage ? `${(student.academicPercentage / 10).toFixed(1)}/10` : '7.9/10',
          credits: 84,
        },
        notes: 'Academic performance verified from Academic Bank of Credits.',
      },
      INSTITUTION: {
        status: 'PENDING',
        source: 'AISHE',
        verifiedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        certificateNumber: 'AISHE-U-0239-JH',
        dataPayload: {
          aisheCode: 'U-0239',
          institution: student?.institution || 'Birla Institute of Technology, Mesra',
          nodalStatus: 'Queued for Nodal Officer Digital Signature',
        },
        notes: 'Institution AISHE verified. Student bonafide acknowledgment pending.',
      },
      INCOME: {
        status: 'VERIFIED',
        source: 'State e-District',
        verifiedAt: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
        certificateNumber: `${student?.state === 'Karnataka' ? 'KA' : 'JH'}/INCM/2024/39201`,
        dataPayload: {
          annualIncome: student?.annualFamilyIncome || 150000,
          issuedDate: '2024-04-10',
          validUntil: '2025-03-31',
        },
        notes: 'Valid annual income certificate verified with State e-District.',
      },
      DOMICILE: {
        status: 'MISMATCH',
        source: 'State e-District',
        verifiedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        certificateNumber: `${student?.state === 'Karnataka' ? 'KA' : 'JH'}/DOM/2022/94821`,
        dataPayload: {
          state: student?.state || 'Jharkhand',
          district: student?.district || 'Ranchi',
        },
        mismatchDetails: {
          field: 'Applicant Full Name',
          claimedValue: student?.fullName || 'Ramesh Kumar Soren',
          sourceValue: 'Ramesh Soren',
          explanation: 'Middle name missing on Domicile certificate compared to profile. Does not reject your application. You may request a manual review.',
        },
        notes: 'Minor name variation found. Request manual review to certify.',
      },
      DISABILITY: {
        status: 'ACTION_REQUIRED',
        source: 'UDID',
        verifiedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        notes: 'No disability certificate linked. Optional if applying under general ST merit.',
      },
    };

    if (!studentVerificationState.has(userId)) {
      studentVerificationState.set(userId, defaultRecords);
    }

    const currentRecords = studentVerificationState.get(userId)!;
    const items = Object.entries(currentRecords).map(([key, val]) => ({
      itemType: key as VerificationItemType,
      ...val,
    }));

    const verifiedCount = items.filter((i) => i.status === 'VERIFIED').length;
    const pendingCount = items.filter((i) => i.status === 'PENDING').length;
    const mismatchCount = items.filter((i) => i.status === 'MISMATCH').length;
    const manualReviewCount = items.filter((i) => i.status === 'MANUAL_REVIEW').length;

    return {
      summary: {
        totalItems: items.length,
        verifiedCount,
        pendingCount,
        mismatchCount,
        manualReviewCount,
        readinessScore: Math.round((verifiedCount / items.length) * 100),
      },
      items,
      student: {
        fullName: student?.fullName,
        category: student?.category,
        state: student?.state,
        institution: student?.institution,
        course: student?.course,
      },
    };
  },

  async runVerification(params: {
    userId: string;
    itemType: VerificationItemType;
    source: VerificationSource;
    consentGranted: boolean;
  }) {
    if (!params.consentGranted) {
      throw new Error('User consent is mandatory for digital verification under data privacy regulations.');
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: params.userId },
    });

    const studentDetails = {
      fullName: student?.fullName || 'Student',
      dateOfBirth: student?.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : undefined,
      category: student?.category || undefined,
      state: student?.state || undefined,
      district: student?.district || undefined,
      annualFamilyIncome: student?.annualFamilyIncome ?? undefined,
      institution: student?.institution || undefined,
      course: student?.course || undefined,
      academicPercentage: student?.academicPercentage ?? undefined,
    };

    // Route to appropriate adapter
    let result: VerificationResult;
    switch (params.source) {
      case 'DigiLocker':
        result = await DigiLockerAdapter.verify({ itemType: params.itemType, studentDetails });
        break;
      case 'APAAR':
        result = await ApaarAdapter.verify({ itemType: params.itemType, studentDetails });
        break;
      case 'UDISE+':
        result = await UdiseAdapter.verify({ itemType: params.itemType, studentDetails });
        break;
      case 'AISHE':
        result = await AisheAdapter.verify({ itemType: params.itemType, studentDetails });
        break;
      case 'State e-District':
        result = await StateEDistrictAdapter.verify({ itemType: params.itemType, studentDetails });
        break;
      case 'Institution Verification':
        result = await InstitutionAdapter.verify({ itemType: params.itemType, studentDetails });
        break;
      default:
        result = await DigiLockerAdapter.verify({ itemType: params.itemType, studentDetails });
    }

    // Save to user's verification state
    if (!studentVerificationState.has(params.userId)) {
      await this.getStudentVerificationOverview(params.userId);
    }
    const userState = studentVerificationState.get(params.userId)!;
    userState[params.itemType] = result;

    return result;
  },

  async requestManualReview(params: {
    userId: string;
    itemType: VerificationItemType;
    reason: string;
  }) {
    if (!studentVerificationState.has(params.userId)) {
      await this.getStudentVerificationOverview(params.userId);
    }
    const userState = studentVerificationState.get(params.userId)!;
    const existing = userState[params.itemType];

    userState[params.itemType] = {
      status: 'MANUAL_REVIEW',
      source: existing?.source || 'State e-District',
      verifiedAt: new Date().toISOString(),
      certificateNumber: existing?.certificateNumber,
      notes: `Manual review requested: "${params.reason}". Verification desk has been notified.`,
      mismatchDetails: existing?.mismatchDetails,
    };

    return userState[params.itemType];
  },

  async getApplicationReadiness(userId: string) {
    const overview = await this.getStudentVerificationOverview(userId);
    const items = overview.items;

    const identityOk = items.find((i) => i.itemType === 'IDENTITY')?.status === 'VERIFIED';
    const casteOk = items.find((i) => i.itemType === 'ST_PVTG_STATUS')?.status === 'VERIFIED';
    const academicOk = items.find((i) => i.itemType === 'ACADEMIC_RECORDS')?.status === 'VERIFIED';
    const incomeOk = items.find((i) => i.itemType === 'INCOME')?.status === 'VERIFIED';
    const domicileItem = items.find((i) => i.itemType === 'DOMICILE');
    const domicileOk = domicileItem?.status === 'VERIFIED' || domicileItem?.status === 'MANUAL_REVIEW';

    const isReady = identityOk && casteOk && academicOk && incomeOk && domicileOk;

    return {
      isReady,
      readinessMessage: isReady
        ? 'Application Ready: All mandatory credentials verified or queued for desk review.'
        : 'Action Needed: Some mandatory verifications require attention before submission.',
      checklist: [
        { label: 'Identity verified (Aadhaar / DigiLocker)', passed: identityOk },
        { label: 'ST / Community status verified (State e-District)', passed: casteOk },
        { label: 'Academic records verified (APAAR)', passed: academicOk },
        { label: 'Income certificate verified (State e-District)', passed: incomeOk },
        {
          label: domicileItem?.status === 'MISMATCH'
            ? 'Domicile certificate mismatch (Manual review recommended)'
            : 'Domicile / Residence verified',
          passed: domicileOk,
          warning: domicileItem?.status === 'MISMATCH',
        },
      ],
    };
  },
};

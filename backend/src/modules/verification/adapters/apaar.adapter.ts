import { VerificationAdapter, VerificationResult } from './types';

export const ApaarAdapter: VerificationAdapter = {
  sourceName: 'APAAR',

  async verify({ studentDetails }): Promise<VerificationResult> {
    await new Promise((r) => setTimeout(r, 500));

    return {
      status: 'VERIFIED',
      source: 'APAAR',
      verifiedAt: new Date().toISOString(),
      certificateNumber: `APAAR-ABC-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      dataPayload: {
        apaarId: '8910-2345-6712',
        institution: studentDetails.institution || 'Birla Institute of Technology, Mesra',
        course: studentDetails.course || 'B.Tech Computer Science',
        cgpa: studentDetails.academicPercentage ? (studentDetails.academicPercentage / 10).toFixed(2) : '7.85',
        academicCreditsEarned: 84,
      },
      notes: 'Academic bank of credits authenticated via National Academic Depository (APAAR).',
    };
  },
};

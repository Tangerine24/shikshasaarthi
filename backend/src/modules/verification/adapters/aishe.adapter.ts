import { VerificationAdapter, VerificationResult } from './types';

export const AisheAdapter: VerificationAdapter = {
  sourceName: 'AISHE',

  async verify({ studentDetails }): Promise<VerificationResult> {
    await new Promise((r) => setTimeout(r, 600));

    // Realistic demo scenario: Institution Record -> Pending approval from Nodal Officer
    return {
      status: 'PENDING',
      source: 'AISHE',
      verifiedAt: new Date().toISOString(),
      certificateNumber: 'AISHE-U-0205-JH',
      dataPayload: {
        aisheCode: 'C-41289',
        institutionName: studentDetails.institution || 'Birla Institute of Technology, Mesra',
        affiliatedUniversity: 'Birla Institute of Technology (Deemed to be University)',
        nodalOfficerStatus: 'Pending Verification by College Scholarship Incharge',
        courseApprovalStatus: 'Approved by AICTE/UGC',
      },
      notes: 'Institution AISHE code validated. Bonafide student confirmation queued with institution nodal officer.',
    };
  },
};

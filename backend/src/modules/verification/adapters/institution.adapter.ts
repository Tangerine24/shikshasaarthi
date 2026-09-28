import { VerificationAdapter, VerificationResult } from './types';

export const InstitutionAdapter: VerificationAdapter = {
  sourceName: 'Institution Verification',

  async verify({ studentDetails }): Promise<VerificationResult> {
    await new Promise((r) => setTimeout(r, 600));

    return {
      status: 'PENDING',
      source: 'Institution Verification',
      verifiedAt: new Date().toISOString(),
      certificateNumber: `INST-VERIF-${Math.floor(100000 + Math.random() * 900000)}`,
      dataPayload: {
        institution: studentDetails.institution || 'Birla Institute of Technology, Mesra',
        studentRollNo: 'BTECH/CS/2022/084',
        currentSemester: '5th Semester',
        attendancePercentage: '86%',
        disciplinaryClearance: 'CLEAR',
      },
      notes: 'Institution portal record received. Awaiting digital sign-off from Registrar / Scholarship Desk.',
    };
  },
};

export const UdiseAdapter: VerificationAdapter = {
  sourceName: 'UDISE+',

  async verify({ studentDetails }): Promise<VerificationResult> {
    await new Promise((r) => setTimeout(r, 500));

    return {
      status: 'VERIFIED',
      source: 'UDISE+',
      verifiedAt: new Date().toISOString(),
      certificateNumber: `UDISE-${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      dataPayload: {
        schoolName: 'Govt. Tribal High School, Ranchi',
        udiseCode: '20140100201',
        academicYear: '2019-2020',
        standardPassed: 'Class 10 (Secondary)',
      },
      notes: 'School enrollment history confirmed on Unified District Information System for Education (UDISE+).',
    };
  },
};

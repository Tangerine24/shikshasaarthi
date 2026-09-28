import { VerificationAdapter, VerificationResult, VerificationItemType } from './types';

export const DigiLockerAdapter: VerificationAdapter = {
  sourceName: 'DigiLocker',

  async verify({ itemType, studentDetails }): Promise<VerificationResult> {
    // Simulated realistic delay of government API latency
    await new Promise((r) => setTimeout(r, 600));

    if (itemType === 'IDENTITY') {
      return {
        status: 'VERIFIED',
        source: 'DigiLocker',
        verifiedAt: new Date().toISOString(),
        certificateNumber: `DL-AADHAAR-${Math.floor(10000000 + Math.random() * 90000000)}`,
        dataPayload: {
          fullName: studentDetails.fullName,
          maskedAadhaar: 'XXXX-XXXX-8921',
          gender: 'MALE',
          dob: studentDetails.dateOfBirth || '2003-04-12',
          digitalSignature: 'SHA256withRSA/CCA-GOV-INDIA',
        },
        notes: 'Identity authenticated via DigiLocker UIDAI verified credential.',
      };
    }

    if (itemType === 'ACADEMIC_RECORDS') {
      return {
        status: 'VERIFIED',
        source: 'DigiLocker',
        verifiedAt: new Date().toISOString(),
        certificateNumber: `DL-CBSE-12TH-${Math.floor(100000 + Math.random() * 900000)}`,
        dataPayload: {
          examRollNo: '24182901',
          board: 'Central Board of Secondary Education',
          yearOfPassing: 2022,
          marksObtained: `${studentDetails.academicPercentage || 78.5}%`,
        },
        notes: 'Class 12th marksheet authenticated from Digilocker Academic Depository.',
      };
    }

    return {
      status: 'VERIFIED',
      source: 'DigiLocker',
      verifiedAt: new Date().toISOString(),
      notes: 'Document cryptographically verified via DigiLocker.',
    };
  },
};

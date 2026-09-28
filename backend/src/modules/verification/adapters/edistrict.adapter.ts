import { VerificationAdapter, VerificationResult, VerificationItemType } from './types';

export const StateEDistrictAdapter: VerificationAdapter = {
  sourceName: 'State e-District',

  async verify({ itemType, studentDetails }): Promise<VerificationResult> {
    await new Promise((r) => setTimeout(r, 700));

    const stateCode = (studentDetails.state || 'JH').substring(0, 2).toUpperCase();

    if (itemType === 'ST_PVTG_STATUS') {
      return {
        status: 'VERIFIED',
        source: 'State e-District',
        verifiedAt: new Date().toISOString(),
        certificateNumber: `${stateCode}/CAST/2023/${Math.floor(10000 + Math.random() * 90000)}`,
        dataPayload: {
          category: 'ST',
          subCaste: 'Santhal',
          issuingAuthority: `Sub-Divisional Officer (SDO), ${studentDetails.district || 'Ranchi'}`,
          issuanceDate: '2023-08-14',
          validity: 'LIFETIME',
        },
        notes: 'Scheduled Tribe certificate verified against State Revenue Department registry.',
      };
    }

    if (itemType === 'INCOME') {
      return {
        status: 'VERIFIED',
        source: 'State e-District',
        verifiedAt: new Date().toISOString(),
        certificateNumber: `${stateCode}/INCM/2024/${Math.floor(10000 + Math.random() * 90000)}`,
        dataPayload: {
          annualFamilyIncome: studentDetails.annualFamilyIncome || 150000,
          issuedTo: `Parent / Guardian of ${studentDetails.fullName}`,
          issuingAuthority: `Tehsildar / Revenue Circle Officer, ${studentDetails.district || 'Ranchi'}`,
          issuanceDate: '2024-04-10',
          expiryDate: '2025-03-31',
        },
        notes: 'Income certificate verified. Annual income within eligible limit.',
      };
    }

    if (itemType === 'DOMICILE') {
      // Realistic demo scenario specified by user: "Domicile -> Mismatch"
      // Shows: name slight discrepancy between Aadhaar and Domicile, providing "Review Information" and "Request Manual Review" without rejecting!
      return {
        status: 'MISMATCH',
        source: 'State e-District',
        verifiedAt: new Date().toISOString(),
        certificateNumber: `${stateCode}/DOM/2022/${Math.floor(10000 + Math.random() * 90000)}`,
        dataPayload: {
          state: studentDetails.state || 'Jharkhand',
          district: studentDetails.district || 'Ranchi',
          residenceYears: 'Permanent Resident (Over 15 Years)',
          applicantNameOnCertificate: `${studentDetails.fullName?.split(' ')[0]} Soren`,
        },
        mismatchDetails: {
          field: 'Applicant Name',
          claimedValue: studentDetails.fullName || 'Ramesh Kumar Soren',
          sourceValue: `${studentDetails.fullName?.split(' ')[0] || 'Ramesh'} Soren`,
          explanation: 'Middle name missing on Domicile certificate compared to student profile. Does not invalidate eligibility; manual review or affidavit recommended.',
        },
        notes: 'Minor name variation detected between profile and state domicile registry record.',
      };
    }

    return {
      status: 'VERIFIED',
      source: 'State e-District',
      verifiedAt: new Date().toISOString(),
      notes: 'Record verified via State e-District Portal.',
    };
  },
};

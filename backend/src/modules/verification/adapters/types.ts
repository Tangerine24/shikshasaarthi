export type VerificationItemType = 
  | 'IDENTITY'
  | 'ST_PVTG_STATUS'
  | 'ACADEMIC_RECORDS'
  | 'INSTITUTION'
  | 'INCOME'
  | 'DOMICILE'
  | 'DISABILITY';

export type VerificationStatus = 
  | 'VERIFIED'
  | 'PENDING'
  | 'MISMATCH'
  | 'ACTION_REQUIRED'
  | 'MANUAL_REVIEW';

export type VerificationSource = 
  | 'DigiLocker'
  | 'APAAR'
  | 'UDISE+'
  | 'AISHE'
  | 'State e-District'
  | 'Institution Verification'
  | 'UDID';

export interface VerificationResult {
  status: VerificationStatus;
  source: VerificationSource;
  verifiedAt: string;
  certificateNumber?: string;
  dataPayload?: Record<string, any>;
  mismatchDetails?: {
    field: string;
    claimedValue: string;
    sourceValue: string;
    explanation: string;
  };
  notes?: string;
}

export interface VerificationAdapter {
  sourceName: VerificationSource;
  verify(params: {
    itemType: VerificationItemType;
    studentDetails: {
      fullName: string;
      dateOfBirth?: string;
      category?: string;
      state?: string;
      district?: string;
      annualFamilyIncome?: number;
      institution?: string;
      course?: string;
      academicPercentage?: number;
    };
    sourceSpecificData?: Record<string, any>;
  }): Promise<VerificationResult>;
}

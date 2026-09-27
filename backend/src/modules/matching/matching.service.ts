import { EligibilityResult } from '../eligibility/eligibility.types';

export interface MatchProfile {
  label: 'STRONG_MATCH' | 'GOOD_MATCH' | 'NEEDS_INFORMATION' | 'NOT_ELIGIBLE';
  educationMatch: boolean;
  incomeMatch: boolean;
  locationMatch: boolean;
  academicMatch: boolean;
  documentReadiness: 'READY' | 'PARTIAL' | 'MISSING';
  explanation: string;
}

export const MatchingService = {
  computeMatchProfile(
    eligibilityResult: EligibilityResult,
    studentProfile: any,
    scholarship: any,
    uploadedDocCount = 0
  ): MatchProfile {
    const requiredDocs = scholarship.documentRequirements || [];
    let documentReadiness: 'READY' | 'PARTIAL' | 'MISSING' = 'READY';
    if (requiredDocs.length > 0) {
      if (uploadedDocCount === 0) documentReadiness = 'MISSING';
      else if (uploadedDocCount < requiredDocs.length) documentReadiness = 'PARTIAL';
      else documentReadiness = 'READY';
    }

    const educationMatch = eligibilityResult.passedCriteria.some(c => c.field === 'educationLevel' || c.field === 'course') ||
      !eligibilityResult.failedCriteria.some(c => c.field === 'educationLevel' || c.field === 'course');

    const incomeMatch = !eligibilityResult.failedCriteria.some(c => c.field === 'annualFamilyIncome');
    const locationMatch = !eligibilityResult.failedCriteria.some(c => c.field === 'state' || c.field === 'district');
    const academicMatch = !eligibilityResult.failedCriteria.some(c => c.field === 'academicPercentage');

    if (eligibilityResult.status === 'NOT_ELIGIBLE') {
      const failedFields = eligibilityResult.failedCriteria.map(c => c.description).join(', ');
      return {
        label: 'NOT_ELIGIBLE',
        educationMatch,
        incomeMatch,
        locationMatch,
        academicMatch,
        documentReadiness,
        explanation: `Does not meet current criteria: ${failedFields}`,
      };
    }

    if (eligibilityResult.status === 'NEEDS_INFORMATION') {
      const missingFields = eligibilityResult.missingCriteria.map(c => c.description).join(', ');
      return {
        label: 'NEEDS_INFORMATION',
        educationMatch,
        incomeMatch,
        locationMatch,
        academicMatch,
        documentReadiness,
        explanation: `Complete your profile to verify: ${missingFields}`,
      };
    }

    // ELIGIBLE
    const isHighAcademic = (studentProfile.academicPercentage || 0) >= 75;
    const isDocReady = documentReadiness === 'READY' || documentReadiness === 'PARTIAL';

    if (isHighAcademic && isDocReady) {
      return {
        label: 'STRONG_MATCH',
        educationMatch: true,
        incomeMatch: true,
        locationMatch: true,
        academicMatch: true,
        documentReadiness,
        explanation: 'Strong match across all criteria with high academic standing.',
      };
    }

    return {
      label: 'GOOD_MATCH',
      educationMatch: true,
      incomeMatch: true,
      locationMatch: true,
      academicMatch: true,
      documentReadiness,
      explanation: 'Eligible for all core requirements.',
    };
  },

  computeMatchLabel(eligibilityResult: EligibilityResult, studentProfile: any, scholarship: any) {
    const profile = this.computeMatchProfile(eligibilityResult, studentProfile, scholarship);
    return profile.label;
  },
};

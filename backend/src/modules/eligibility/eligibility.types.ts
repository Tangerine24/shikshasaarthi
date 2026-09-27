export type EligibilityStatus = 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFORMATION';

export interface CriterionResult {
  field: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'MISSING';
  studentValue: string | null;
  requiredValue: string;
  explanation: string;
}

export interface EligibilityResult {
  status: EligibilityStatus;
  passedCriteria: CriterionResult[];
  failedCriteria: CriterionResult[];
  missingCriteria: CriterionResult[];
  summary: string;
}

import { ApplicationStatus } from '../../types';

export const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.DRAFT]: [ApplicationStatus.SUBMITTED],
  [ApplicationStatus.SUBMITTED]: [ApplicationStatus.UNDER_VERIFICATION],
  [ApplicationStatus.UNDER_VERIFICATION]: [ApplicationStatus.DOCUMENT_DEFICIENCY, ApplicationStatus.CORRECTION_REQUIRED, ApplicationStatus.VERIFIED],
  [ApplicationStatus.DOCUMENT_DEFICIENCY]: [ApplicationStatus.SUBMITTED],
  [ApplicationStatus.CORRECTION_REQUIRED]: [ApplicationStatus.SUBMITTED],
  [ApplicationStatus.VERIFIED]: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED],
  [ApplicationStatus.APPROVED]: [ApplicationStatus.DISBURSEMENT_PENDING],
  [ApplicationStatus.REJECTED]: [],
  [ApplicationStatus.DISBURSEMENT_PENDING]: [ApplicationStatus.DISBURSED],
  [ApplicationStatus.DISBURSED]: [],
};

export function isValidTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

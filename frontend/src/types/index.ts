export type Role = 'STUDENT' | 'PROVIDER' | 'ADMIN';
export type Language = 'EN' | 'HI';

export interface User {
  id: string;
  email: string;
  role: Role;
  preferredLanguage?: Language;
  createdAt?: string;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_VERIFICATION'
  | 'DOCUMENT_DEFICIENCY'
  | 'CORRECTION_REQUIRED'
  | 'VERIFIED'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISBURSEMENT_PENDING'
  | 'DISBURSED';

export type MatchLevel = 'STRONG_MATCH' | 'GOOD_MATCH' | 'NEEDS_INFORMATION' | 'NOT_ELIGIBLE';

export type DeadlineUrgency = 'NORMAL' | 'UPCOMING' | 'URGENT' | 'CRITICAL' | 'EXPIRED';

export interface DeadlineInfo {
  status: DeadlineUrgency;
  daysLeft: number;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: string;
  state?: string;
  district?: string;
  category?: string;
  annualFamilyIncome?: number;
  educationLevel?: string;
  institution?: string;
  course?: string;
  yearOfStudy?: number;
  academicPercentage?: number;
  isHosteller?: boolean;
  hasDisability?: boolean;
  hasBankAccount?: boolean;
  previousScholarship?: string;
  profileCompletePercent: number;
  user?: User;
  documents?: StudentDocument[];
  applications?: Application[];
}

export interface ProviderProfile {
  id: string;
  userId: string;
  organizationName: string;
  organizationType?: string;
  contactPerson?: string;
  phone?: string;
  website?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt?: string;
}

export interface EligibilityRule {
  id: string;
  scholarshipId: string;
  field: string;
  operator: string;
  value: string;
  description: string;
  isRequired: boolean;
}

export interface ScholarshipDocumentRequirement {
  id: string;
  scholarshipId: string;
  documentType: string;
  description?: string;
  isRequired: boolean;
}

export interface Scholarship {
  id: string;
  providerId: string;
  provider?: {
    id?: string;
    organizationName: string;
    organizationType?: string;
    verificationStatus?: string;
  };
  title: string;
  description: string;
  benefit: number;
  benefitDescription?: string;
  deadline: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  targetGroup?: string;
  applicationProcess?: string;
  isDemo?: boolean;
  deadlineInfo?: DeadlineInfo;
  eligibilityRules?: EligibilityRule[];
  documentRequirements?: ScholarshipDocumentRequirement[];
  _count?: { applications: number };
}

export interface StudentDocument {
  id: string;
  studentId: string;
  documentType: string;
  fileName: string;
  originalName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  verificationState: 'UPLOADED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';
  expiryDate?: string;
  notes?: string;
  url?: string;
  createdAt: string;
}

export interface ApplicationStatusHistory {
  id: string;
  applicationId: string;
  fromStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  actorId?: string;
  note?: string;
  createdAt: string;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentId: string;
  document: StudentDocument;
  createdAt: string;
}

export interface Application {
  id: string;
  studentId: string;
  scholarshipId: string;
  status: ApplicationStatus;
  submittedAt?: string;
  correctionNote?: string;
  rejectionReason?: string;
  student?: StudentProfile;
  scholarship: Scholarship;
  applicationDocuments?: ApplicationDocument[];
  statusHistory?: ApplicationStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata?: string;
  createdAt: string;
}

export interface CriterionResult {
  field: string;
  description: string;
  status: 'PASS' | 'FAIL' | 'MISSING';
  studentValue: string | null;
  requiredValue: string;
  explanation: string;
}

export interface MatchProfile {
  label: MatchLevel;
  educationMatch: boolean;
  incomeMatch: boolean;
  locationMatch: boolean;
  academicMatch: boolean;
  documentReadiness: 'READY' | 'PARTIAL' | 'MISSING';
  explanation: string;
}

export interface EligibilityResult {
  status: 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_INFORMATION';
  passedCriteria: CriterionResult[];
  failedCriteria: CriterionResult[];
  missingCriteria: CriterionResult[];
  summary: string;
  matchProfile?: MatchProfile;
}

export type ComprehensiveEligibilityResult = EligibilityResult;

export interface JagoMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  createdAt: string;
}

export interface JagoConversation {
  id: string;
  userId: string;
  title?: string;
  messages: JagoMessage[];
  updatedAt: string;
}

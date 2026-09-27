import React from 'react';
import { Badge } from './Badge';
import { ApplicationStatus } from '../../types';

export const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
  const map: Record<ApplicationStatus, { variant: any, label: string }> = {
    DRAFT: { variant: 'muted', label: 'Draft' },
    SUBMITTED: { variant: 'info', label: 'Submitted' },
    UNDER_VERIFICATION: { variant: 'warning', label: 'Under Verification' },
    DOCUMENT_DEFICIENCY: { variant: 'danger', label: 'Documents Missing' },
    CORRECTION_REQUIRED: { variant: 'danger', label: 'Correction Required' },
    VERIFIED: { variant: 'success', label: 'Verified' },
    APPROVED: { variant: 'success', label: 'Approved' },
    REJECTED: { variant: 'danger', label: 'Rejected' },
    DISBURSEMENT_PENDING: { variant: 'info', label: 'Disbursement Pending' },
    DISBURSED: { variant: 'success', label: 'Disbursed' }
  };
  const { variant, label } = map[status] || { variant: 'neutral', label: status };
  return <Badge variant={variant}>{label}</Badge>;
};

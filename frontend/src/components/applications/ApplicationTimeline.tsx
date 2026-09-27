import React from 'react';
import { useTranslation } from 'react-i18next';
import { ApplicationStatus, ApplicationStatusHistory } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface Props {
  currentStatus: ApplicationStatus;
  history?: ApplicationStatusHistory[];
}

export const ApplicationTimeline: React.FC<Props> = ({ currentStatus, history = [] }) => {
  const { t } = useTranslation();

  const standardSteps: Array<{ key: ApplicationStatus; label: string }> = [
    { key: 'DRAFT', label: t('status.DRAFT', 'Draft') },
    { key: 'SUBMITTED', label: t('status.SUBMITTED', 'Submitted') },
    { key: 'UNDER_VERIFICATION', label: t('status.UNDER_VERIFICATION', 'Verification') },
    { key: 'VERIFIED', label: t('status.VERIFIED', 'Verified') },
    { key: 'APPROVED', label: t('status.APPROVED', 'Approved') },
    { key: 'DISBURSED', label: t('status.DISBURSED', 'Disbursed') },
  ];

  const getStepIndex = (status: ApplicationStatus) => {
    switch (status) {
      case 'DRAFT': return 0;
      case 'SUBMITTED': return 1;
      case 'UNDER_VERIFICATION':
      case 'DOCUMENT_DEFICIENCY':
      case 'CORRECTION_REQUIRED': return 2;
      case 'VERIFIED': return 3;
      case 'APPROVED':
      case 'DISBURSEMENT_PENDING': return 4;
      case 'DISBURSED': return 5;
      case 'REJECTED': return -1;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isRejected = currentStatus === 'REJECTED';
  const isCorrection = currentStatus === 'CORRECTION_REQUIRED' || currentStatus === 'DOCUMENT_DEFICIENCY';

  return (
    <div className="bg-surface rounded-card border border-border p-6 shadow-sm space-y-6">
      <h4 className="font-heading font-bold text-base text-text-primary">
        {t('applications.timeline', 'Application Progress')}
      </h4>

      {/* Progress Stepper */}
      <div className="relative">
        <div className="hidden md:flex items-center justify-between relative">
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-stone-200 -z-0" />
          <div
            className="absolute top-4 left-6 h-0.5 bg-primary transition-all duration-500 -z-0"
            style={{ width: `${Math.max(0, Math.min(100, (currentIndex / (standardSteps.length - 1)) * 100))}%` }}
          />

          {standardSteps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div key={step.key} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    isCompleted
                      ? 'bg-primary text-surface'
                      : isCurrent
                      ? isCorrection
                        ? 'bg-amber-500 text-surface ring-4 ring-amber-100'
                        : 'bg-primary text-surface ring-4 ring-emerald-100'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isCurrent ? 'text-primary font-bold' : isCompleted ? 'text-text-primary' : 'text-text-muted'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Rejection / Correction Banner */}
        {isCorrection && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold text-amber-900">
                {t('applications.correction_needed', 'Action Required')}
              </span>
              <p className="text-xs text-amber-800 mt-0.5">
                {t('applications.correction_desc', 'The scholarship provider has requested a correction on your application.')}
              </p>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold text-red-900">{t('status.REJECTED', 'Application Not Approved')}</span>
              <p className="text-xs text-red-800 mt-0.5">
                Review the rejection feedback or contact the scholarship desk.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Audit History Log */}
      {history.length > 0 && (
        <div className="border-t border-border pt-4">
          <h5 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
            Detailed Activity Log
          </h5>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-text-primary">
                      {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : h.toStatus}
                    </span>
                    <span className="text-text-muted">
                      {new Date(h.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {h.note && <p className="text-text-secondary mt-0.5 italic">"{h.note}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

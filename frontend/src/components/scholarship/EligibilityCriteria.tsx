import React from 'react';
import { useTranslation } from 'react-i18next';
import { EligibilityResult } from '../../types';
import { CheckCircle2, XCircle, HelpCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  result: EligibilityResult;
  onAskJago?: () => void;
}

export const EligibilityCriteria: React.FC<Props> = ({ result, onAskJago }) => {
  const { t } = useTranslation();

  const isEligible = result.status === 'ELIGIBLE';
  const needsInfo = result.status === 'NEEDS_INFORMATION';

  return (
    <div className="bg-surface rounded-card border border-border p-6 shadow-sm space-y-6">
      {/* Banner */}
      <div
        className={`p-4 rounded-lg flex items-start gap-3 border ${
          isEligible
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : needsInfo
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}
      >
        {isEligible ? (
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        ) : needsInfo ? (
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        ) : (
          <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h4 className="font-heading font-bold text-base">
            {isEligible
              ? t('eligibility.eligible', 'You are Eligible')
              : needsInfo
              ? t('eligibility.needs_information', 'More Information Needed')
              : t('eligibility.not_eligible', 'Not Eligible')}
          </h4>
          <p className="text-sm mt-1 opacity-90">
            {isEligible
              ? t('eligibility.eligible_desc', 'Your profile meets all the eligibility criteria for this scholarship.')
              : needsInfo
              ? t('eligibility.needs_info_desc', 'Some information is missing from your profile. Complete your profile for full verification.')
              : t('eligibility.not_eligible_desc', 'Your profile does not meet one or more eligibility criteria.')}
          </p>
        </div>
      </div>

      {/* Criteria Breakdown */}
      <div className="space-y-4">
        <h5 className="font-semibold text-text-primary text-sm tracking-wide uppercase">
          {t('eligibility.title', 'Eligibility Criteria Breakdown')}
        </h5>

        {/* Passed Criteria */}
        {result.passedCriteria.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t('eligibility.passed_criteria', 'Criteria Met')} ({result.passedCriteria.length})
            </div>
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-stone-50/50">
              {result.passedCriteria.map((c, idx) => (
                <div key={idx} className="p-3 text-sm flex items-center justify-between gap-4">
                  <div>
                    <span className="font-medium text-text-primary">{c.description}</span>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Your profile: <span className="font-semibold">{c.studentValue}</span>
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {t('eligibility.status_pass', 'Met')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Criteria */}
        {result.missingCriteria.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              {t('eligibility.missing_criteria', 'Information Needed')} ({result.missingCriteria.length})
            </div>
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-amber-50/30">
              {result.missingCriteria.map((c, idx) => (
                <div key={idx} className="p-3 text-sm flex items-center justify-between gap-4">
                  <div>
                    <span className="font-medium text-text-primary">{c.description}</span>
                    <p className="text-xs text-amber-700 mt-0.5">{c.explanation}</p>
                  </div>
                  <Link
                    to="/student/profile"
                    className="text-xs font-medium text-primary hover:underline whitespace-nowrap bg-surface border border-border px-2.5 py-1 rounded"
                  >
                    {t('profile.save_changes', 'Update Profile')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed Criteria */}
        {result.failedCriteria.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-red-800 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-600" />
              {t('eligibility.failed_criteria', 'Criteria Not Met')} ({result.failedCriteria.length})
            </div>
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-red-50/30">
              {result.failedCriteria.map((c, idx) => (
                <div key={idx} className="p-3 text-sm flex items-center justify-between gap-4">
                  <div>
                    <span className="font-medium text-text-primary">{c.description}</span>
                    <p className="text-xs text-red-700 mt-0.5">{c.explanation}</p>
                  </div>
                  <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    {t('eligibility.status_fail', 'Not met')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ask JAGO Guidance button */}
      <div className="pt-2 flex items-center justify-between border-t border-border">
        <p className="text-xs text-text-muted">
          {t('jago.identity_note', 'Deterministic check grounded in platform rules. Contact provider for special appeals.')}
        </p>
        {onAskJago && (
          <button
            onClick={onAskJago}
            className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 hover:underline"
          >
            Ask JAGO about eligibility →
          </button>
        )}
      </div>
    </div>
  );
};

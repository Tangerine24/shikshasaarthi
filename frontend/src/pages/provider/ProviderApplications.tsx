import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { applicationApi } from '../../api';
import { Application, ApplicationStatus } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { getTranslatedScholarshipTitle } from '../../utils/scholarshipI18n';
import { getTranslatedDocType } from '../../utils/documentI18n';
import {
  FileCheck2,
  FileText,
  ExternalLink,
} from 'lucide-react';

export const ProviderApplications: React.FC = () => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [actionType, setActionType] = useState<'VERIFY' | 'CORRECTION' | 'APPROVE' | 'REJECT' | null>(null);
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await applicationApi.listProvider(statusFilter || undefined);
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error('Failed to load provider applications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleExecuteAction = async () => {
    if (!selectedApp || !actionType) return;
    setActionLoading(true);

    let targetStatus: ApplicationStatus = 'VERIFIED';
    if (actionType === 'CORRECTION') targetStatus = 'CORRECTION_REQUIRED';
    if (actionType === 'APPROVE') targetStatus = 'APPROVED';
    if (actionType === 'REJECT') targetStatus = 'REJECTED';

    try {
      const res = await applicationApi.transition(selectedApp.id, targetStatus, note);
      if (res.success) {
        setSelectedApp(null);
        setActionType(null);
        setNote('');
        fetchApplications();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-body pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-card border border-border shadow-xs">
        <div>
          <h1 className="font-heading font-bold text-2xl text-primary-dark">
            {t('nav.applicant_review', 'Applicant Verification Queue')}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t('provider.verification_note')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-text-secondary uppercase">{t('common.filter')}:</label>
          <select
            className="border border-border rounded-input px-3 py-1.5 text-xs bg-surface focus:border-primary outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{t('common.see_all')}</option>
            <option value="UNDER_VERIFICATION">{t('status.UNDER_VERIFICATION')}</option>
            <option value="SUBMITTED">{t('status.SUBMITTED')}</option>
            <option value="CORRECTION_REQUIRED">{t('status.CORRECTION_REQUIRED')}</option>
            <option value="VERIFIED">{t('status.VERIFIED')}</option>
            <option value="APPROVED">{t('status.APPROVED')}</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 text-center text-text-muted">{t('common.loading')}</div>
      ) : applications.length === 0 ? (
        <div className="bg-surface p-12 text-center rounded-card border border-border shadow-xs">
          <FileCheck2 className="w-12 h-12 text-text-muted mx-auto mb-2 opacity-40" />
          <p className="text-sm text-text-muted">{t('applications.no_applications')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-surface p-6 rounded-card border border-border shadow-xs space-y-4 hover:border-primary/40 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-bold text-lg text-text-primary">
                      {app.student?.fullName || 'Student Applicant'}
                    </h3>
                    <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2 py-0.5 rounded">
                      {app.student?.category || 'ST'}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-text-secondary">
                    {app.student?.course} • {app.student?.institution || app.student?.state} ({t('passport.overall_score')}: {app.student?.academicPercentage}%)
                  </p>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-xs font-semibold text-primary block">
                    {getTranslatedScholarshipTitle(app.scholarship?.title)}
                  </span>
                  <span className="text-[11px] text-text-muted">
                    {t('landing_extra.annual_benefit_label')}: ₹{app.scholarship?.benefit?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Attached Documents for Verifier */}
              <div className="pt-3 border-t border-border">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-2">
                  {t('scholarships.required_documents')} ({app.applicationDocuments?.length || 0})
                </span>
                <div className="flex flex-wrap gap-2">
                  {app.applicationDocuments?.map((ad) => (
                    <div
                      key={ad.id}
                      className="flex items-center gap-2 p-2 bg-stone-50 border border-border rounded text-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-text-secondary" />
                      <span className="font-medium">{getTranslatedDocType(ad.document?.documentType)}</span>
                      {ad.document?.url && (
                        <a
                          href={ad.document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-text-muted">
                  {app.correctionNote && (
                    <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                      {t('dashboard_extra.correction_note')} "{app.correctionNote}"
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Under Verification actions */}
                  {(app.status === 'UNDER_VERIFICATION' || app.status === 'SUBMITTED') && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setActionType('CORRECTION');
                          setNote('Please upload updated income certificate for current financial year.');
                        }}
                        className="text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded transition"
                      >
                        {t('provider.request_correction')}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setActionType('VERIFY');
                          setNote('All documents verified against departmental registry.');
                        }}
                        className="text-xs font-semibold text-surface bg-primary hover:bg-primary-dark px-3 py-1.5 rounded transition"
                      >
                        {t('provider.verify')}
                      </button>
                    </>
                  )}

                  {/* Verified actions: Approve or Reject */}
                  {app.status === 'VERIFIED' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setActionType('REJECT');
                          setNote('Application does not meet specific departmental quota.');
                        }}
                        className="text-xs font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-300 px-3 py-1.5 rounded transition"
                      >
                        {t('provider.reject')}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApp(app);
                          setActionType('APPROVE');
                          setNote('Approved for DBT payment disbursement.');
                        }}
                        className="text-xs font-semibold text-surface bg-emerald-700 hover:bg-emerald-800 px-4 py-1.5 rounded transition"
                      >
                        {t('provider.approve')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation & Note Action Modal */}
      {selectedApp && actionType && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-card p-6 border border-border shadow-xl max-w-md w-full space-y-4">
            <h3 className="font-heading font-bold text-lg text-primary-dark">
              {actionType === 'CORRECTION' && t('provider.request_correction')}
              {actionType === 'VERIFY' && t('provider.verify')}
              {actionType === 'APPROVE' && t('provider.approve')}
              {actionType === 'REJECT' && t('provider.reject')}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('provider.correction_note')}
              </label>
              <textarea
                rows={3}
                className="w-full border border-border rounded-input p-3 text-xs outline-none focus:border-primary"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('provider.correction_placeholder')}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedApp(null);
                  setActionType(null);
                }}
                className="px-4 py-2 border border-border rounded-input text-xs font-semibold text-text-secondary hover:bg-stone-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleExecuteAction}
                className={`px-5 py-2 rounded-input text-xs font-semibold text-surface transition ${
                  actionType === 'REJECT'
                    ? 'bg-red-700 hover:bg-red-800'
                    : actionType === 'APPROVE'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-primary hover:bg-primary-dark'
                }`}
              >
                {actionLoading ? t('common.loading') : t('common.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderApplications;

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { applicationApi } from '../../api';
import { Application } from '../../types';
import { getTranslatedScholarshipTitle } from '../../utils/scholarshipI18n';
import { getTranslatedDocType } from '../../utils/documentI18n';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ApplicationTimeline } from '../../components/applications/ApplicationTimeline';
import {
  ArrowLeft,
  Building2,
  FileText,
  MessageSquareHeart,
  Send,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [resubmitting, setResubmitting] = useState(false);
  const [resubmitSuccess, setResubmitSuccess] = useState(false);

  const fetchApp = async () => {
    if (!id) return;
    try {
      const res = await applicationApi.getOne(id);
      if (res.success && res.data) {
        setApplication(res.data);
      }
    } catch (err) {
      console.error('Failed to load application', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApp();
  }, [id]);

  const handleResubmit = async () => {
    if (!id) return;
    setResubmitting(true);
    try {
      const res = await applicationApi.submit(id);
      if (res.success) {
        setResubmitSuccess(true);
        fetchApp();
        setTimeout(() => setResubmitSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to resubmit application', err);
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-text-muted">{t('common.loading', 'Loading application...')}</div>;
  }

  if (!application) {
    return (
      <div className="p-12 text-center space-y-3">
        <p className="text-text-secondary">Application not found.</p>
        <Link to="/student/applications" className="text-sm font-semibold text-primary underline">
          Back to Applications
        </Link>
      </div>
    );
  }

  const isCorrection = application.status === 'CORRECTION_REQUIRED' || application.status === 'DOCUMENT_DEFICIENCY';

  return (
    <div className="space-y-6 font-body pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/student/applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Applications</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-text-muted flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />
            {application.scholarship?.provider?.organizationName || 'National Scholarship Portal'}
          </span>
          <StatusBadge status={application.status} />
        </div>

        <h1 className="font-heading font-bold text-2xl md:text-3xl text-primary-dark">
          {getTranslatedScholarshipTitle(application.scholarship?.title)}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-stone-50 border border-border rounded-lg text-sm">
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-muted block">Annual Grant</span>
            <span className="font-heading font-bold text-xl text-primary">
              ₹{application.scholarship?.benefit?.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-muted block">Submitted Date</span>
            <span className="font-semibold text-text-primary">
              {application.submittedAt
                ? new Date(application.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Not submitted yet'}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-muted block">Applicant Name</span>
            <span className="font-semibold text-text-primary">{application.student?.fullName || 'Student'}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-muted block">Disbursement Mode</span>
            <span className="font-semibold text-text-primary">Direct Bank Transfer (DBT)</span>
          </div>
        </div>

        {/* Correction Alert Banner */}
        {isCorrection && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-heading font-bold text-sm text-amber-900">
                  Provider Correction Note:
                </h4>
                <p className="text-sm text-amber-800 mt-1">
                  "{application.correctionNote || 'Please review your uploaded documents and resubmit.'}"
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Link
                to="/student/documents"
                className="bg-surface border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-semibold px-4 py-2 rounded transition"
              >
                Go to Document Wallet
              </Link>
              <button
                onClick={handleResubmit}
                disabled={resubmitting}
                className="bg-accent hover:bg-amber-700 text-surface text-xs font-semibold px-4 py-2 rounded transition"
              >
                {resubmitting ? 'Resubmitting...' : 'Resubmit Corrected Application'}
              </button>
            </div>
          </div>
        )}

        {resubmitSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Application successfully resubmitted to the verification desk!</span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Link
            to="/student/jago"
            className="inline-flex items-center gap-2 bg-surface hover:bg-stone-50 border border-border text-primary px-4 py-2 rounded-lg text-xs font-semibold transition"
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>Ask JAGO about this application</span>
          </Link>
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      <ApplicationTimeline
        currentStatus={application.status}
        history={application.statusHistory}
      />

      {/* Attached Documents Checklist */}
      <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-lg text-text-primary">
          Attached Application Documents ({application.applicationDocuments?.length || 0})
        </h3>

        {(!application.applicationDocuments || application.applicationDocuments.length === 0) ? (
          <p className="text-xs text-text-muted">No documents attached to this application record.</p>
        ) : (
          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-stone-50/40">
            {application.applicationDocuments.map((ad) => (
              <div key={ad.id} className="p-3.5 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-text-secondary shrink-0" />
                  <div>
                    <span className="font-medium text-text-primary">
                      {getTranslatedDocType(ad.document?.documentType)}
                    </span>
                    <p className="text-xs text-text-muted font-mono">{ad.document?.originalName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                      ad.document?.verificationState === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {ad.document?.verificationState}
                  </span>

                  {ad.document?.url && (
                    <a
                      href={ad.document.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-text-secondary hover:text-primary rounded hover:bg-stone-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationDetailPage;

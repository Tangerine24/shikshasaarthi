import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { scholarshipApi, eligibilityApi, documentApi, applicationApi } from '../../api';
import { Scholarship, EligibilityResult } from '../../types';
import { getTranslatedScholarshipTitle } from '../../utils/scholarshipI18n';
import { MatchLabel } from '../../components/ui/MatchLabel';
import { DeadlineBadge } from '../../components/ui/DeadlineBadge';
import { EligibilityCriteria } from '../../components/scholarship/EligibilityCriteria';
import { DocumentReadiness } from '../../components/documents/DocumentReadiness';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  FileCheck2,
  MessageSquareHeart,
  ShieldCheck,
  Send,
  AlertCircle,
} from 'lucide-react';

export const ScholarshipDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [readiness, setReadiness] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const [sRes, eRes, rRes] = await Promise.all([
          scholarshipApi.getOne(id),
          eligibilityApi.check(id),
          documentApi.getReadiness(id),
        ]);

        if (sRes.success && sRes.data) setScholarship(sRes.data);
        if (eRes.success && eRes.data) setEligibility(eRes.data);
        if (rRes.success && rRes.data) setReadiness(rRes.data);
      } catch (err) {
        console.error('Failed to load scholarship details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleApply = async () => {
    if (!id) return;
    setApplying(true);
    setApplyError(null);
    try {
      // 1. Create or get draft application
      const draftRes = await applicationApi.createDraft(id);
      if (!draftRes.success || !draftRes.data) {
        throw new Error('Failed to create application draft');
      }
      const appId = draftRes.data.id;

      // 2. Attach any uploaded documents that match requirements
      if (readiness?.details) {
        for (const item of readiness.details) {
          if (item.isUploaded && item.documentId) {
            try {
              await applicationApi.attachDocument(appId, item.documentId);
            } catch (e) {
              // Ignore if already attached
            }
          }
        }
      }

      // 3. Submit application
      const submitRes = await applicationApi.submit(appId);
      if (submitRes.success) {
        setApplySuccess('Application submitted successfully!');
        setTimeout(() => {
          navigate(`/student/applications/${appId}`);
        }, 1500);
      } else {
        throw new Error('Could not submit application');
      }
    } catch (err: any) {
      setApplyError(err.response?.data?.message || err.message || 'Submission failed. Please verify required documents.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-text-muted">
        {t('common.loading', 'Loading scholarship details...')}
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-text-secondary">Scholarship not found.</p>
        <Link to="/student/scholarships" className="text-sm font-semibold text-primary underline">
          Back to Scholarships
        </Link>
      </div>
    );
  }

  const isEligible = eligibility?.status === 'ELIGIBLE';

  return (
    <div className="space-y-6 font-body pb-12">
      {/* Back button */}
      <div>
        <Link
          to="/student/scholarships"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('common.back', 'Back to Scholarships')}</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {scholarship.provider?.organizationName || 'National Scholarship Portal'}
            </span>
            <span className="text-xs text-text-muted">• Domicile: {scholarship.targetGroup || 'ST Students'}</span>
          </div>
          <div className="flex items-center gap-2">
            {eligibility?.matchProfile && <MatchLabel level={eligibility.matchProfile.label} />}
            <DeadlineBadge deadlineInfo={scholarship.deadlineInfo} deadlineDate={scholarship.deadline} />
          </div>
        </div>

        <h1 className="font-heading font-bold text-2xl md:text-3xl text-primary-dark">
          {getTranslatedScholarshipTitle(scholarship.title)}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-stone-50 border border-border rounded-lg text-sm">
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-muted block">Annual Benefit</span>
            <span className="font-heading font-bold text-xl text-primary">
              ₹{scholarship.benefit.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-muted block">Application Deadline</span>
            <span className="font-semibold text-text-primary">
              {new Date(scholarship.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-muted block">Mode</span>
            <span className="font-semibold text-text-primary">Direct Benefit Transfer (DBT)</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-text-muted block">Verification Authority</span>
            <span className="font-semibold text-text-primary">Institutional & Tribal Dept</span>
          </div>
        </div>

        {/* Action Button & Feedback */}
        {applySuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{applySuccess} Redirecting to your application timeline...</span>
          </div>
        )}

        {applyError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{applyError}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleApply}
            disabled={applying}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition shadow-xs ${
              isEligible
                ? 'bg-primary hover:bg-primary-dark text-surface'
                : 'bg-stone-800 hover:bg-stone-900 text-surface'
            } disabled:opacity-50`}
          >
            <Send className="w-4 h-4" />
            <span>{applying ? 'Submitting Application...' : t('scholarships.apply_now', 'Apply for this Scholarship')}</span>
          </button>

          <Link
            to="/student/jago"
            className="inline-flex items-center gap-2 bg-surface hover:bg-stone-50 border border-border text-primary px-4 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            <MessageSquareHeart className="w-4 h-4" />
            <span>Ask JAGO about this scheme</span>
          </Link>
        </div>
      </div>

      {/* Grid: Eligibility Engine on left, Document Readiness on right */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Eligibility Explainer */}
        {eligibility && (
          <EligibilityCriteria
            result={eligibility}
            onAskJago={() => navigate('/student/jago')}
          />
        )}

        {/* Document Readiness Checklist */}
        {readiness && <DocumentReadiness readiness={readiness} />}
      </div>

      {/* Description & Application Process Details */}
      <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-heading font-bold text-lg text-text-primary mb-2">Scheme Description</h3>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {scholarship.description}
          </p>
        </div>

        {scholarship.applicationProcess && (
          <div className="pt-4 border-t border-border">
            <h3 className="font-heading font-bold text-lg text-text-primary mb-2">Application Procedure</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {scholarship.applicationProcess}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScholarshipDetailPage;

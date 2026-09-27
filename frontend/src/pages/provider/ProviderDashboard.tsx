import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { providerApi } from '../../api';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { getTranslatedScholarshipTitle } from '../../utils/scholarshipI18n';
import {
  Building2,
  GraduationCap,
  FileCheck2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    providerApi.getDashboard().then((res) => {
      if (res.success && res.data) {
        setData(res.data);
      }
    }).catch((err) => {
      console.error('Failed to load provider dashboard', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-text-muted">Loading provider dashboard...</div>;
  }

  const { provider, stats, scholarships = [], recentApplications = [] } = data || {};

  return (
    <div className="space-y-8 font-body pb-12">
      {/* Provider Org Banner */}
      <div className="bg-surface p-6 rounded-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl text-primary-dark">
              {provider?.organizationName}
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t('documents.verified')}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {provider?.organizationType} • {provider?.contactPerson} ({provider?.phone})
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/provider/applications"
            className="bg-primary hover:bg-primary-dark text-surface font-semibold text-xs px-4 py-2.5 rounded-lg transition shadow-xs"
          >
            {t('nav.applicant_review')}
          </Link>
          <Link
            to="/provider/scholarships"
            className="bg-surface hover:bg-stone-50 border border-border text-text-primary font-semibold text-xs px-4 py-2.5 rounded-lg transition"
          >
            {t('provider.scholarships_title')}
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface p-5 rounded-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase">{t('provider.scholarships_title')}</span>
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <div className="font-heading font-bold text-3xl text-primary-dark">
            {stats?.totalScholarships || 0}
          </div>
        </div>

        <div className="bg-surface p-5 rounded-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-text-muted mb-2">
            <span className="text-xs font-semibold uppercase">{t('provider.applications_title')}</span>
            <FileCheck2 className="w-4 h-4 text-primary" />
          </div>
          <div className="font-heading font-bold text-3xl text-primary-dark">
            {stats?.totalApplications || 0}
          </div>
        </div>

        <div className="bg-amber-50/60 p-5 rounded-card border border-amber-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-semibold uppercase">{t('provider.pending_review')}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-heading font-bold text-3xl text-amber-900">
            {stats?.pendingReviewCount || 0}
          </div>
        </div>

        <div className="bg-emerald-50/60 p-5 rounded-card border border-emerald-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-semibold uppercase">{t('status.APPROVED')}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-heading font-bold text-3xl text-emerald-900">
            {stats?.approvedCount || 0}
          </div>
        </div>
      </div>

      {/* Recent Applications Requiring Review */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-heading font-bold text-xl text-text-primary">
              {t('nav.applicant_review')}
            </h2>
            <p className="text-xs text-text-muted">
              {t('provider.pending_review')}
            </p>
          </div>
          <Link
            to="/provider/applications"
            className="text-xs font-semibold text-primary hover:underline"
          >
            {t('common.see_all')} ({recentApplications.length}) →
          </Link>
        </div>

        {recentApplications.length === 0 ? (
          <div className="bg-surface p-8 text-center rounded-card border border-border shadow-xs">
            <p className="text-sm text-text-muted">{t('applications.no_applications')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-card overflow-hidden bg-surface shadow-xs">
            {recentApplications.map((app: any) => (
              <div
                key={app.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-bold text-sm text-text-primary">
                      {app.student?.fullName || 'Applicant'}
                    </span>
                    <span className="text-xs text-text-muted">• {app.student?.state}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-text-secondary">
                    {t('scholarships.title')}: <span className="font-semibold">{getTranslatedScholarshipTitle(app.scholarship?.title)}</span> • {t('profile.course')}: {app.student?.course || 'UG'}
                  </p>
                </div>

                <Link
                  to="/provider/applications"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-primary hover:bg-primary-dark text-surface px-4 py-2 rounded-lg transition shrink-0"
                >
                  <span>{t('common.view')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Scholarships */}
      <div className="space-y-4">
        <h2 className="font-heading font-bold text-xl text-text-primary">
          {t('provider.scholarships_title')} ({scholarships.length})
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          {scholarships.map((s: any) => (
            <div
              key={s.id}
              className="bg-surface p-5 rounded-card border border-border shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {s.status}
                  </span>
                  <span className="text-xs text-text-muted">
                    {t('scholarships.deadline')}: {new Date(s.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-text-primary mb-1">
                  {getTranslatedScholarshipTitle(s.title)}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-2">{s.description}</p>
              </div>

              <div className="pt-4 mt-3 border-t border-border flex justify-between items-center text-xs">
                <span>
                  {t('scholarships.benefit')}: <strong className="text-primary font-bold">₹{s.benefit?.toLocaleString('en-IN')}</strong>
                </span>
                <span className="text-text-muted">
                  {t('provider.applications_title')}: <strong>{s._count?.applications || 0}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;

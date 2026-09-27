import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { applicationApi } from '../../api';
import { Application } from '../../types';
import { getTranslatedScholarshipTitle } from '../../utils/scholarshipI18n';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  FileCheck2,
  Calendar,
  Building2,
  IndianRupee,
  ArrowRight,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationApi.listMine().then((res) => {
      if (res.success && res.data) {
        setApplications(res.data);
      }
    }).catch((err) => {
      console.error('Failed to load applications', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 font-body pb-12">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-primary-dark">
          {t('applications.title', 'My Applications')}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('applications.subtitle', 'Track the end-to-end verification and disbursement lifecycle of your submissions.')}
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-text-muted">{t('common.loading', 'Loading applications...')}</div>
      ) : applications.length === 0 ? (
        <div className="bg-surface p-12 text-center rounded-card border border-border shadow-xs space-y-3">
          <FileCheck2 className="w-12 h-12 text-text-muted mx-auto opacity-40" />
          <h3 className="font-heading font-bold text-lg text-text-primary">
            {t('dashboard.no_applications_desc', 'You have not submitted any applications yet.')}
          </h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            Discover scholarships matching your profile and submit your documents online.
          </p>
          <Link
            to="/student/scholarships"
            className="inline-block bg-primary hover:bg-primary-dark text-surface px-5 py-2 rounded-lg text-sm font-semibold transition"
          >
            Explore Scholarships
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-surface p-6 rounded-card border border-border shadow-xs hover:border-primary/40 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {app.scholarship?.provider?.organizationName || 'Ministry of Tribal Affairs'}
                  </span>
                  <span className="text-xs text-text-muted">•</span>
                  <StatusBadge status={app.status} />
                </div>

                <h3 className="font-heading font-bold text-xl text-primary-dark">
                  <Link to={`/student/applications/${app.id}`} className="hover:underline">
                    {getTranslatedScholarshipTitle(app.scholarship?.title)}
                  </Link>
                </h3>

                <div className="flex flex-wrap gap-4 text-xs text-text-secondary pt-1">
                  <span>
                    Grant: <strong className="text-primary font-bold">₹{app.scholarship?.benefit?.toLocaleString('en-IN')}</strong>
                  </span>
                  {app.submittedAt && (
                    <span>
                      Submitted:{' '}
                      <strong className="text-text-primary">
                        {new Date(app.submittedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </strong>
                    </span>
                  )}
                  {app.applicationDocuments && (
                    <span>
                      Attached Documents: <strong>{app.applicationDocuments.length}</strong>
                    </span>
                  )}
                </div>

                {app.correctionNote && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 mt-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Correction Note: {app.correctionNote}</span>
                  </div>
                )}
              </div>

              <div className="shrink-0 flex items-center">
                <Link
                  to={`/student/applications/${app.id}`}
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-surface text-sm font-semibold px-5 py-2.5 rounded-lg transition shadow-xs"
                >
                  <span>{t('applications.view_details', 'View Progress')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;

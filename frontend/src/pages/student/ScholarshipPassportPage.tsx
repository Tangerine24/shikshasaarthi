import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileCheck, 
  Clock, 
  GraduationCap, 
  User, 
  BadgeCheck, 
  Shield,
  Printer
} from 'lucide-react';
import { passportApi } from '../../api';
import { getTranslatedDocType } from '../../utils/documentI18n';

export const ScholarshipPassportPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await passportApi.getPassport();
        if (res.success && res.data) {
          setData(res.data);
        } else {
          // fallback mock if profile incomplete
          setData(res?.data || null);
        }
      } catch (err) {
        console.error('Failed to load passport data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const student = data?.profile || {
    fullName: 'Ramesh Kumar',
    category: 'ST',
    state: 'Jharkhand',
    institution: 'Birla Institute of Technology, Mesra',
    academicPercentage: 78.5,
    course: 'B.Tech Computer Science & Engineering',
    yearOfStudy: 'Semester 4 (2nd Year)',
  };

  const documents = data?.documents || [];
  const applications = data?.applications || [];
  const consents = data?.consents || [];

  const activeApps = applications.filter((a: any) => a.status !== 'REJECTED' && a.status !== 'DISBURSED');
  const pastApps = applications.filter((a: any) => a.status === 'REJECTED' || a.status === 'DISBURSED');

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 font-body">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary-dark flex items-center gap-2.5">
            <BadgeCheck className="text-primary h-8 w-8" />
            {t('passport.title', 'Scholarship Passport')}
          </h1>
          <p className="text-xs text-text-muted mt-1">
            {t('landing_extra.footer_platform')}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-xs transition print:hidden"
        >
          <Printer className="w-4 h-4" />
          <span>{t('passport.print', 'Print Passport')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Identity Header */}
        <div className="md:col-span-2 bg-surface rounded-card shadow-xs border border-border p-6 flex items-start gap-6">
          <div className="bg-primary/10 p-4 rounded-2xl shrink-0">
            <User className="h-14 w-14 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-heading font-bold text-text-primary">{student.fullName}</h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                {student.category ? `${student.category} (${t('dashboard_extra.scheduled_tribe')})` : `ST (${t('dashboard_extra.scheduled_tribe')})`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mt-3">
              <p className="text-text-secondary">
                <span className="font-semibold text-text-primary">{t('passport.category')}:</span>{' '}
                {student.category || 'ST'}
              </p>
              <p className="text-text-secondary">
                <span className="font-semibold text-text-primary">{t('passport.state')}:</span>{' '}
                {student.state || 'Jharkhand'}
              </p>
              <p className="text-text-secondary col-span-2">
                <span className="font-semibold text-text-primary">{t('passport.institution')}:</span>{' '}
                {student.institution || 'BIT Mesra'}
              </p>
              <p className="text-text-secondary">
                <span className="font-semibold text-text-primary">{t('passport.overall_score')}:</span>{' '}
                {student.academicPercentage ? `${student.academicPercentage}%` : '78.5%'}
              </p>
            </div>
          </div>
        </div>

        {/* Academic Credentials */}
        <div className="bg-surface rounded-card shadow-xs border border-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-heading font-bold text-primary-dark flex items-center gap-2 mb-4">
              <GraduationCap className="text-accent h-5 w-5" />
              {t('passport.academics')}
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold block text-text-muted">{t('passport.course')}</span>
                <p className="text-sm font-semibold text-text-primary">{student.course || 'B.Tech'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold block text-text-muted">{t('passport.year')}</span>
                <p className="text-sm font-semibold text-text-primary">{student.yearOfStudy || '3rd Year'}</p>
              </div>
              <div>
                <span className="text-xs font-semibold block text-text-muted">{t('passport.cgpa')}</span>
                <p className="text-sm font-semibold text-text-primary">{student.academicPercentage ? `${(student.academicPercentage / 10).toFixed(1)} / 10` : '7.9 / 10'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Health Matrix */}
      <div className="bg-surface rounded-card shadow-xs border border-border p-6">
        <h3 className="text-lg font-heading font-bold text-primary-dark flex items-center gap-2 mb-4">
          <FileCheck className="text-primary h-5 w-5" />
          {t('passport.documents_health')}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-text-muted text-xs uppercase font-bold tracking-wider">
                <th className="py-3 px-4">{t('documents.document_type')}</th>
                <th className="py-3 px-4">{t('documents.verification_state')}</th>
                <th className="py-3 px-4">{t('roadmap.required_documents_health')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-text-muted">
                    {t('documents.no_documents')}
                  </td>
                </tr>
              ) : (
                documents.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-stone-50/50">
                    <td className="py-3.5 px-4 font-semibold text-text-primary">{getTranslatedDocType(doc.type || doc.documentType)}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        doc.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.status === 'VERIFIED' ? t('documents.verified') : t('documents.under_review')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {doc.daysUntilExpiry === null || doc.daysUntilExpiry === undefined ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                          {t('roadmap.valid')}
                        </span>
                      ) : doc.daysUntilExpiry < 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded font-medium">
                          {t('roadmap.expired')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium">
                          <Clock className="h-3 w-3" />
                          {doc.daysUntilExpiry} {t('roadmap.days_left')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
};

export default ScholarshipPassportPage;

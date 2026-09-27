import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, UploadCloud, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DocumentReadinessItem {
  documentType: string;
  description?: string;
  isRequired: boolean;
  isUploaded: boolean;
  documentId?: string;
  fileName?: string;
  verificationState: string;
}

interface Props {
  readiness: {
    isReady: boolean;
    totalRequired: number;
    uploadedCount: number;
    missingCount: number;
    details: DocumentReadinessItem[];
  };
}

export const DocumentReadiness: React.FC<Props> = ({ readiness }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-surface rounded-card border border-border p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-heading font-bold text-base text-text-primary">
            {t('documents.readiness_title', 'Document Readiness')}
          </h4>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('documents.readiness_subtitle', 'Documents needed for this scholarship.')}
          </p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            readiness.isReady
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          {readiness.isReady
            ? `Ready (${readiness.uploadedCount}/${readiness.totalRequired})`
            : `${readiness.missingCount} Missing`}
        </span>
      </div>

      <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-stone-50/40">
        {readiness.details.map((item, idx) => (
          <div key={idx} className="p-3.5 flex items-center justify-between gap-4 text-sm">
            <div className="flex items-start gap-3">
              <FileText className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
              <div>
                <span className="font-medium text-text-primary">
                  {item.description || item.documentType.replace(/_/g, ' ')}
                </span>
                {item.fileName ? (
                  <p className="text-xs text-text-muted mt-0.5">
                    Uploaded: <span className="font-mono text-text-secondary">{item.fileName}</span>
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 mt-0.5">
                    {t('documents.missing', 'Missing')} {item.isRequired ? '(Required)' : '(Optional)'}
                  </p>
                )}
              </div>
            </div>

            <div>
              {item.isUploaded ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {item.verificationState === 'VERIFIED' ? t('documents.verified', 'Verified') : t('documents.uploaded', 'Uploaded')}
                </span>
              ) : (
                <Link
                  to="/student/documents"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark bg-surface border border-border px-2.5 py-1 rounded hover:bg-stone-50 transition"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  {t('documents.upload', 'Upload')}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

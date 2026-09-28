import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { documentApi } from '../../api';
import { StudentDocument } from '../../types';
import { getTranslatedDocType } from '../../utils/documentI18n';
import {
  FolderOpen,
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const Documents: React.FC = () => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('COMMUNITY_CERTIFICATE');
  const [expiryDate, setExpiryDate] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchDocs = async () => {
    try {
      const res = await documentApi.list();
      if (res.success && res.data) {
        setDocuments(res.data);
      }
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setFeedback({ type: 'error', message: t('documents.file_too_large', 'File is too large. Max 5MB.') });
        return;
      }
      setSelectedFile(file);
      setFeedback(null);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setFeedback({ type: 'error', message: 'Please select a document file to upload.' });
      return;
    }

    setUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentType', docType);
    if (expiryDate) formData.append('expiryDate', expiryDate);

    try {
      const res = await documentApi.upload(formData);
      if (res.success) {
        setFeedback({ type: 'success', message: t('documents.upload_success', 'Document uploaded successfully.') });
        setSelectedFile(null);
        setExpiryDate('');
        fetchDocs();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document from your wallet?')) return;
    try {
      await documentApi.delete(id);
      fetchDocs();
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  const verifiedCount = documents.filter((d) => d.verificationState === 'VERIFIED').length;

  return (
    <div className="space-y-6 font-body pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            <h1 className="font-heading font-bold text-2xl text-primary-dark">
              {t('documents.title', 'Document Wallet')}
            </h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {t('documents.subtitle', 'Upload official documents once and reuse across all your scholarship applications.')}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-stone-50 border border-border p-3 rounded-lg text-xs font-medium">
          <div>
            <span className="text-text-muted block">VERIFIED ASSETS</span>
            <span className="font-heading font-bold text-base text-emerald-800">
              {verifiedCount} / {documents.length}
            </span>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-600 ml-2" />
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-lg text-sm flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Upload Form Box */}
      <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
        <h2 className="font-heading font-bold text-base text-text-primary flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-primary" />
          <span>{t('documents.upload', 'Upload Document to Wallet')}</span>
        </h2>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('documents.document_type', 'Document Type')} *
              </label>
              <select
                className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none bg-surface focus:border-primary"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                <option value="COMMUNITY_CERTIFICATE">{t('document_names.COMMUNITY_CERTIFICATE')}</option>
                <option value="INCOME_CERTIFICATE">{t('document_names.INCOME_CERTIFICATE')}</option>
                <option value="MARKSHEET">{t('document_names.MARKSHEET')}</option>
                <option value="BONAFIDE_CERTIFICATE">{t('document_names.BONAFIDE_CERTIFICATE')}</option>
                <option value="BANK_DOCUMENT">{t('document_names.BANK_DOCUMENT')}</option>
                <option value="DOMICILE_CERTIFICATE">{t('document_names.DOMICILE_CERTIFICATE')}</option>
                <option value="DISABILITY_CERTIFICATE">{t('document_names.DISABILITY_CERTIFICATE')}</option>
                <option value="IDENTITY_DOCUMENT">{t('document_names.IDENTITY_DOCUMENT')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                File (PDF, JPG, PNG - Max 5MB) *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="w-full border border-border rounded-input p-1.5 text-xs outline-none bg-stone-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('documents.expiry_date', 'Expiry Date (Optional)')}
              </label>
              <input
                type="date"
                className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none bg-surface focus:border-primary"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="bg-primary hover:bg-primary-dark text-surface font-semibold text-sm px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {uploading ? t('documents.uploading', 'Uploading...') : t('documents.upload', 'Upload Document')}
            </button>
          </div>
        </form>
      </div>

      {/* Document Wallet Grid */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-lg text-text-primary">
          Your Uploaded Documents ({documents.length})
        </h3>

        {loading ? (
          <div className="p-8 text-center text-text-muted">{t('common.loading', 'Loading wallet...')}</div>
        ) : documents.length === 0 ? (
          <div className="bg-surface p-12 text-center rounded-card border border-border shadow-xs">
            <FolderOpen className="w-12 h-12 text-text-muted mx-auto mb-2 opacity-40" />
            <h4 className="font-heading font-bold text-base text-text-primary mb-1">
              {t('documents.no_documents', 'No documents yet')}
            </h4>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              {t('documents.no_documents_desc', 'Upload documents once and reuse them across multiple applications.')}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const isVerified = doc.verificationState === 'VERIFIED';
              const isRejected = doc.verificationState === 'REJECTED';

              let validityBadge = null;
              if (doc.documentType === 'IDENTITY_DOCUMENT' || doc.documentType === 'COMMUNITY_CERTIFICATE' || doc.documentType === 'DOMICILE_CERTIFICATE') {
                validityBadge = <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-200">✓ Valid for Lifetime</span>;
              } else if (doc.documentType === 'MARKSHEET') {
                validityBadge = <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-200">✓ Permanent Record</span>;
              } else if (doc.documentType === 'BONAFIDE_CERTIFICATE') {
                validityBadge = <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-200">Valid for Current Academic Year</span>;
              } else if (doc.documentType === 'BANK_DOCUMENT') {
                validityBadge = <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-200">✓ Valid until account closure</span>;
              } else if (doc.documentType === 'INCOME_CERTIFICATE' || doc.documentType === 'DISABILITY_CERTIFICATE') {
                if (doc.expiryDate) {
                  const daysUntilExpiry = Math.ceil((new Date(doc.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  if (daysUntilExpiry > 90) {
                    validityBadge = <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-200">✓ Valid</span>;
                  } else if (daysUntilExpiry > 0) {
                    validityBadge = <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-200">Expires in {daysUntilExpiry} days</span>;
                  } else {
                    validityBadge = <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-red-200">Expired</span>;
                  }
                } else {
                  if (doc.documentType === 'INCOME_CERTIFICATE') {
                    validityBadge = <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-200">Validity: 1 Year (verify expiry)</span>;
                  } else {
                    validityBadge = <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-emerald-200">✓ Valid for Lifetime</span>;
                  }
                }
              }

              return (
                <div
                  key={doc.id}
                  className="bg-surface p-5 rounded-card border border-border shadow-xs flex flex-col justify-between hover:border-primary/40 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-text-secondary">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isRejected
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          {isVerified
                            ? t('documents.verified', 'Verified')
                            : isRejected
                            ? t('documents.rejected', 'Rejected')
                            : t('documents.uploaded', 'Uploaded')}
                        </span>
                        {validityBadge}
                      </div>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-text-primary line-clamp-1">
                      {getTranslatedDocType(doc.documentType)}
                    </h4>
                    <p className="text-xs text-text-muted font-mono truncate">{doc.originalName}</p>

                    {doc.notes && (
                      <p className="text-[11px] text-text-secondary bg-stone-50 p-2 rounded border border-border">
                        {doc.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-4 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-text-muted">
                      {(doc.fileSize / 1024).toFixed(0)} KB
                    </span>

                    <div className="flex items-center gap-2">
                      {doc.url && (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-text-secondary hover:text-primary rounded hover:bg-stone-100"
                          title="Open document"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-text-muted hover:text-danger rounded hover:bg-red-50"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;

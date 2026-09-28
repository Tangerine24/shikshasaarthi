import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { verificationApi } from '../../api';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  FolderOpen,
  ArrowRight,
  ExternalLink,
  X,
  FileCheck2,
  FileText,
  BadgeAlert,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface VerificationItem {
  itemType: string;
  status: 'VERIFIED' | 'PENDING' | 'MISMATCH' | 'ACTION_REQUIRED' | 'MANUAL_REVIEW';
  source: string;
  verifiedAt: string;
  certificateNumber?: string;
  dataPayload?: Record<string, any>;
  mismatchDetails?: {
    field: string;
    claimedValue: string;
    sourceValue: string;
    explanation: string;
  };
  notes?: string;
}

const ITEM_METADATA: Record<string, { label: string; icon: string; description: string; defaultSources: string[] }> = {
  IDENTITY: {
    label: 'Identity (Aadhaar / National ID)',
    icon: '🪪',
    description: 'Biometric and demographic authentication via DigiLocker UIDAI registry.',
    defaultSources: ['DigiLocker'],
  },
  ST_PVTG_STATUS: {
    label: 'ST / PVTG Community Status',
    icon: '📜',
    description: 'Scheduled Tribe or PVTG certification from State Revenue / Welfare Department.',
    defaultSources: ['State e-District', 'DigiLocker'],
  },
  ACADEMIC_RECORDS: {
    label: 'Academic Records & Marks',
    icon: '🎓',
    description: 'Class 10th, 12th, or semester transcripts authenticated via APAAR / ABC ID.',
    defaultSources: ['APAAR', 'DigiLocker', 'UDISE+'],
  },
  INSTITUTION: {
    label: 'Institution & AISHE Enrollment',
    icon: '🏛️',
    description: 'Confirmation of active student enrollment and AISHE college affiliation.',
    defaultSources: ['AISHE', 'Institution Verification'],
  },
  INCOME: {
    label: 'Annual Family Income',
    icon: '💰',
    description: 'Tehsildar/Revenue Officer income certificate for means-tested scholarship caps.',
    defaultSources: ['State e-District'],
  },
  DOMICILE: {
    label: 'State Domicile / Residence Proof',
    icon: '🏡',
    description: 'State of domicile verification for state-sponsored and tribal quotas.',
    defaultSources: ['State e-District', 'DigiLocker'],
  },
  DISABILITY: {
    label: 'Disability Status (PwD / UDID)',
    icon: '♿',
    description: 'Unique Disability ID (UDID) authentication from Ministry of Social Justice.',
    defaultSources: ['UDID', 'DigiLocker'],
  },
};

export const VerificationCenterPage: React.FC = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<VerificationItem[]>([]);
  const [summary, setSummary] = useState<any>({
    totalItems: 7,
    verifiedCount: 5,
    pendingCount: 1,
    mismatchCount: 1,
    manualReviewCount: 0,
    readinessScore: 71,
  });

  // Verification Modal State
  const [activeModalItem, setActiveModalItem] = useState<VerificationItem | null>(null);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'source' | 'consent' | 'processing' | 'result'>('source');
  const [processingMsg, setProcessingMsg] = useState('Connecting to government adapter...');
  const [flowResult, setFlowResult] = useState<any>(null);

  // Mismatch Review Modal State
  const [mismatchModalItem, setMismatchModalItem] = useState<VerificationItem | null>(null);
  const [manualReviewReason, setManualReviewReason] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const fetchVerificationStatus = async () => {
    try {
      const res = await verificationApi.getOverview();
      if (res.success && res.data) {
        setItems(res.data.items);
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load verification overview', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const startVerificationFlow = (item: VerificationItem) => {
    setActiveModalItem(item);
    const meta = ITEM_METADATA[item.itemType];
    setSelectedSource(meta?.defaultSources[0] || 'DigiLocker');
    setConsentChecked(false);
    setVerificationStep('source');
    setFlowResult(null);
  };

  const executeVerification = async () => {
    if (!activeModalItem || !consentChecked) return;

    setVerificationStep('processing');
    setProcessingMsg('Connecting to adapter...');

    setTimeout(() => setProcessingMsg('Querying cryptographic record from repository...'), 500);
    setTimeout(() => setProcessingMsg('Validating digital signature and checksum...'), 1100);

    try {
      const res = await verificationApi.verify(activeModalItem.itemType, selectedSource, consentChecked);
      if (res.success && res.data) {
        setTimeout(() => {
          setFlowResult(res.data);
          setVerificationStep('result');
          fetchVerificationStatus();
        }, 1600);
      }
    } catch (err: any) {
      setTimeout(() => {
        setFlowResult({
          status: 'ACTION_REQUIRED',
          notes: err.response?.data?.error || err.message || 'Verification could not be completed.',
        });
        setVerificationStep('result');
      }, 1600);
    }
  };

  const handleManualReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mismatchModalItem) return;

    setSubmittingReview(true);
    try {
      const res = await verificationApi.requestManualReview(
        mismatchModalItem.itemType,
        manualReviewReason || 'Name variation between certificates - requesting manual verification'
      );
      if (res.success) {
        setReviewSubmitted(true);
        setTimeout(() => {
          setReviewSubmitted(false);
          setMismatchModalItem(null);
          fetchVerificationStatus();
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to submit manual review', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
      case 'MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Mismatch Detected
          </span>
        );
      case 'MANUAL_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <RotateCw className="w-3.5 h-3.5 text-blue-600" />
            Manual Review Queued
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            Action Required
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-body pb-12">
      {/* Top Banner / Header */}
      <div className="bg-surface p-6 rounded-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-primary-dark">
              Verification Center
            </h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Adapter Layer
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1 max-w-xl">
            Digitally verify your identity, community credentials, and academic records using secure government adapters. Verified credentials are automatically reused across all scholarship applications.
          </p>
        </div>

        {/* Verification Summary Card */}
        <div className="bg-stone-50 border border-border p-4 rounded-xl flex items-center gap-6 shrink-0">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-text-secondary">Verification Status:</span>
              <span className="font-bold text-emerald-700 ml-2">
                {summary.verifiedCount}/{summary.totalItems} Verified
              </span>
            </div>
            <div className="w-44 bg-stone-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${summary.readinessScore}%` }}
              />
            </div>
            <span className="text-[10px] text-text-muted mt-1 block">
              {summary.readinessScore}% Application Ready
            </span>
          </div>

          <div className="border-l border-border pl-4 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{summary.verifiedCount} Verified</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-700">
              <Clock className="w-3.5 h-3.5" />
              <span>{summary.pendingCount} Pending</span>
            </div>
            {summary.mismatchCount > 0 && (
              <div className="flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{summary.mismatchCount} Mismatch</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Readiness Check Section */}
      <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-base text-text-primary">
              Pre-Submission Application Readiness Check
            </h2>
          </div>
          <span className="text-xs font-semibold text-text-muted">
            Evaluates rule-based scholarship readiness
          </span>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Identity Verified
            </span>
            <span className="text-[11px] text-text-muted block mt-0.5">DigiLocker Aadhaar confirmed</span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ST Status Verified
            </span>
            <span className="text-[11px] text-text-muted block mt-0.5">State e-District registry confirmed</span>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Academic Record Verified
            </span>
            <span className="text-[11px] text-text-muted block mt-0.5">APAAR / ABC ID authenticated</span>
          </div>

          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
            <span className="text-xs font-semibold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Domicile Mismatch
            </span>
            <span className="text-[11px] text-text-muted block mt-0.5">
              Name variation — manual review recommended
            </span>
          </div>
        </div>
      </div>

      {/* 7 Verification Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-xl text-primary-dark">
            Verification Records & Adapters
          </h2>
          <span className="text-xs text-text-muted">
            All records verified through authenticated government sandbox adapters
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-text-muted">Loading verification records...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const meta = ITEM_METADATA[item.itemType] || {
                label: item.itemType,
                icon: '📄',
                description: 'Official credential verification',
                defaultSources: ['DigiLocker'],
              };

              return (
                <div
                  key={item.itemType}
                  className={`bg-surface rounded-card border shadow-xs p-5 flex flex-col justify-between transition hover:shadow-md ${
                    item.status === 'MISMATCH'
                      ? 'border-rose-300 bg-rose-50/20'
                      : item.status === 'VERIFIED'
                      ? 'border-border hover:border-emerald-300'
                      : 'border-border'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{meta.icon}</span>
                        <div>
                          <h3 className="font-heading font-bold text-base text-text-primary leading-snug">
                            {meta.label}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {meta.description}
                    </p>

                    {/* Metadata Box */}
                    <div className="bg-stone-50 border border-border p-2.5 rounded-lg space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Source Adapter:</span>
                        <span className="font-semibold text-text-primary">{item.source}</span>
                      </div>

                      {item.certificateNumber && (
                        <div className="flex justify-between">
                          <span className="text-text-muted">Cert / Ref No:</span>
                          <span className="font-mono text-text-primary text-[11px] truncate max-w-[130px]">
                            {item.certificateNumber}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-text-muted">Last Verified:</span>
                        <span className="text-text-secondary text-[11px]">
                          {item.verifiedAt ? new Date(item.verifiedAt).toLocaleDateString() : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Mismatch Alert Notice */}
                    {item.status === 'MISMATCH' && item.mismatchDetails && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1 text-xs text-rose-900">
                        <div className="flex items-center gap-1 font-semibold text-rose-800">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Name Variation Found</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-rose-700">
                          {item.mismatchDetails.explanation}
                        </p>
                      </div>
                    )}

                    {item.notes && item.status !== 'MISMATCH' && (
                      <p className="text-[11px] text-text-muted italic">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Footer & Actions */}
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
                    {getStatusBadge(item.status)}

                    {item.status === 'MISMATCH' ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setMismatchModalItem(item);
                            setManualReviewReason('');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded transition shadow-xs"
                        >
                          Review & Request
                        </button>
                      </div>
                    ) : item.status === 'VERIFIED' ? (
                      <button
                        type="button"
                        onClick={() => startVerificationFlow(item)}
                        className="text-xs font-semibold text-text-muted hover:text-primary transition flex items-center gap-1"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Re-verify</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startVerificationFlow(item)}
                        className="px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary-dark text-white rounded transition shadow-xs"
                      >
                        Verify Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Integration with Document Wallet Notice */}
      <div className="bg-surface rounded-card border border-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-accent flex items-center justify-center shrink-0">
            <FolderOpen className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-text-primary">
              Document Wallet Integration
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Verified records automatically update your Document Wallet validity indicators and pre-populate scholarship forms.
            </p>
          </div>
        </div>

        <Link
          to="/student/documents"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark hover:underline shrink-0"
        >
          <span>Open Document Wallet</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* VERIFICATION FLOW MODAL */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-card border border-border shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-dark to-slate-900 text-surface p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="font-heading font-bold text-base text-surface">
                    Digital Verification Workflow
                  </h3>
                  <p className="text-xs text-stone-300">
                    {ITEM_METADATA[activeModalItem.itemType]?.label}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="text-stone-300 hover:text-surface p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Content */}
            <div className="p-6 space-y-4 text-sm text-text-primary">
              {verificationStep === 'source' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                      Step 1: Select Verification Source / Government Repository
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {(ITEM_METADATA[activeModalItem.itemType]?.defaultSources || ['DigiLocker', 'State e-District']).map((src) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setSelectedSource(src)}
                          className={`p-3 rounded-lg border text-left text-xs font-semibold transition ${
                            selectedSource === src
                              ? 'border-primary bg-blue-50/50 text-primary'
                              : 'border-border hover:bg-stone-50 text-text-secondary'
                          }`}
                        >
                          <span className="block font-bold">{src}</span>
                          <span className="text-[10px] text-text-muted font-normal mt-0.5 block">
                            Direct Adapter Interface
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <button
                      type="button"
                      onClick={() => setVerificationStep('consent')}
                      className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-5 py-2 rounded-lg transition"
                    >
                      Next: Student Consent →
                    </button>
                  </div>
                </div>
              )}

              {verificationStep === 'consent' && (
                <div className="space-y-4">
                  <div className="bg-stone-50 border border-border p-4 rounded-lg space-y-2 text-xs text-text-secondary leading-relaxed">
                    <h4 className="font-bold text-text-primary text-sm flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Consent and Electronic Authorization
                    </h4>
                    <p>
                      In accordance with data privacy provisions, you hereby authorize <strong>ShikshaSaarthi</strong> to query the <strong>{selectedSource}</strong> adapter solely for the purpose of validating your <strong>{ITEM_METADATA[activeModalItem.itemType]?.label}</strong> for scholarship evaluations.
                    </p>
                    <p className="text-[11px] text-text-muted">
                      • Authentication is read-only and cryptographically signed.
                      <br />• Your Aadhaar / ID number is masked and never exposed to unauthorized entities.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 p-3 border border-border rounded-lg bg-surface cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary rounded mt-0.5"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                    />
                    <span className="text-xs font-medium text-text-primary">
                      I have read and grant electronic consent to fetch and verify this credential from {selectedSource}.
                    </span>
                  </label>

                  <div className="pt-2 border-t border-border flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setVerificationStep('source')}
                      className="text-xs font-semibold text-text-secondary hover:text-text-primary"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={!consentChecked}
                      onClick={executeVerification}
                      className="bg-primary hover:bg-primary-dark text-white font-semibold text-xs px-6 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      Authorize & Verify Now
                    </button>
                  </div>
                </div>
              )}

              {verificationStep === 'processing' && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>
                    <h4 className="font-bold text-base text-primary-dark">Verifying with {selectedSource}</h4>
                    <p className="text-xs text-text-secondary mt-1">{processingMsg}</p>
                  </div>
                </div>
              )}

              {verificationStep === 'result' && flowResult && (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-lg border text-xs space-y-2 ${
                      flowResult.status === 'VERIFIED'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : flowResult.status === 'MISMATCH'
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {flowResult.status === 'VERIFIED' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {flowResult.status === 'MISMATCH' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
                      {flowResult.status === 'PENDING' && <Clock className="w-5 h-5 text-amber-600" />}
                      <span>Verification Result: {flowResult.status}</span>
                    </div>

                    <p className="leading-relaxed">
                      {flowResult.notes || 'Verification executed successfully via sandbox adapter.'}
                    </p>

                    {flowResult.certificateNumber && (
                      <p className="font-mono text-[11px] pt-1">
                        Reference ID: {flowResult.certificateNumber}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setActiveModalItem(null)}
                      className="px-5 py-2 text-xs font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg transition"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MISMATCH REVIEW & MANUAL REVIEW MODAL */}
      {mismatchModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-card border border-border shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-rose-900 to-primary-dark text-surface p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-300" />
                <h3 className="font-heading font-bold text-base text-surface">
                  Review Mismatch & Request Manual Review
                </h3>
              </div>
              <button
                onClick={() => setMismatchModalItem(null)}
                className="text-stone-300 hover:text-surface p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-text-primary">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900">
                <strong>Important Notice:</strong> A mismatch does NOT automatically disqualify or reject your scholarship application. Discrepancies such as minor name variations or spelling differences can be certified through manual review.
              </div>

              {mismatchModalItem.mismatchDetails && (
                <div className="bg-stone-50 border border-border p-3.5 rounded-lg space-y-2">
                  <span className="font-bold text-text-secondary block uppercase text-[10px]">
                    Comparison Details
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-surface border border-border rounded">
                      <span className="text-[10px] text-text-muted block">Profile Record:</span>
                      <span className="font-semibold text-text-primary">
                        {mismatchModalItem.mismatchDetails.claimedValue}
                      </span>
                    </div>
                    <div className="p-2 bg-surface border border-border rounded">
                      <span className="text-[10px] text-text-muted block">Certificate Record:</span>
                      <span className="font-semibold text-rose-700">
                        {mismatchModalItem.mismatchDetails.sourceValue}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-text-secondary pt-1 leading-relaxed">
                    {mismatchModalItem.mismatchDetails.explanation}
                  </p>
                </div>
              )}

              {reviewSubmitted ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Manual review requested successfully! Status updated to MANUAL REVIEW.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleManualReviewSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                      Reason / Clarification Note for Verification Officer
                    </label>
                    <textarea
                      rows={3}
                      className="w-full border border-border rounded-input p-2.5 text-xs outline-none focus:border-primary"
                      placeholder="e.g., My middle name is omitted on the old domicile certificate. Aadhaar and caste certificates contain my full name."
                      value={manualReviewReason}
                      onChange={(e) => setManualReviewReason(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setMismatchModalItem(null)}
                      className="px-4 py-2 text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-text-primary rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2 text-xs font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg transition shadow-xs disabled:opacity-50"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Manual Review Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationCenterPage;

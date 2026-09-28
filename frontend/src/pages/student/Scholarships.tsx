import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { scholarshipApi, studentApi } from '../../api';
import { Scholarship, StudentProfile } from '../../types';
import { getTranslatedScholarshipTitle } from '../../utils/scholarshipI18n';
import { MatchLabel } from '../../components/ui/MatchLabel';
import { DeadlineBadge } from '../../components/ui/DeadlineBadge';
import {
  Search,
  Filter,
  SlidersHorizontal,
  BookOpen,
  FileText,
  MessageSquareHeart,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const STATES_AND_UTS = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 
  'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 
  'West Bengal'
];

export const Scholarships: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [educationFilter, setEducationFilter] = useState('');
  const [sort, setSort] = useState('deadline');
  const [loading, setLoading] = useState(true);

  // JAGO Modal State for "Ask JAGO about this scheme"
  const [selectedSchemeForJago, setSelectedSchemeForJago] = useState<Scholarship | null>(null);
  const [jagoAnswer, setJagoAnswer] = useState<{ question: string; answer: string } | null>(null);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const [scholRes, profRes] = await Promise.all([
        scholarshipApi.list({
          search: search || undefined,
          state: stateFilter || undefined,
          education: educationFilter || undefined,
          sort: sort === 'benefit' ? 'benefit_desc' : 'deadline_asc',
        }),
        studentApi.getProfile().catch(() => ({ success: false, data: null })),
      ]);

      if (profRes.success && profRes.data) {
        setProfile(profRes.data);
      }

      if (scholRes.success && scholRes.data) {
        let list = scholRes.data;

        // Apply strict logical education filtering
        // If a filter is chosen, show only matching scholarships
        if (educationFilter) {
          list = list.filter((s) => {
            const reqs = s.eligibilityRules ? JSON.stringify(s.eligibilityRules).toUpperCase() : '';
            const desc = (s.description + ' ' + s.title + ' ' + (s.targetGroup || '')).toUpperCase();

            if (educationFilter === 'PRE_MATRIC') {
              // Strictly Pre-Matric: Class 1-10. Must NEVER match Post-Matric
              return (
                !desc.includes('POST-MATRIC') &&
                !desc.includes('POST MATRIC') &&
                (reqs.includes('PRE_MATRIC') ||
                  desc.includes('PRE-MATRIC') ||
                  desc.includes('PRE MATRIC') ||
                  desc.includes('CLASS 9') ||
                  desc.includes('CLASS 10') ||
                  desc.includes('CLASS IX') ||
                  desc.includes('CLASS X'))
              );
            }
            if (educationFilter === 'SCHOOL') {
              return (
                reqs.includes('SCHOOL') ||
                reqs.includes('11TH') ||
                reqs.includes('12TH') ||
                desc.includes('CLASS 11') ||
                desc.includes('CLASS 12') ||
                desc.includes('SENIOR SECONDARY') ||
                desc.includes('HIGHER SECONDARY')
              );
            }
            if (educationFilter === 'DIPLOMA') {
              return reqs.includes('DIPLOMA') || desc.includes('DIPLOMA') || desc.includes('POLYTECHNIC');
            }
            if (educationFilter === 'UG') {
              // UG student should NOT see Pre-matric or Class 12 only scholarships
              return (
                !desc.includes('PRE-MATRIC') &&
                !desc.includes('PRE MATRIC') &&
                !desc.includes('CLASS 9') &&
                !desc.includes('CLASS 10') &&
                !desc.includes('CLASS 11') &&
                !desc.includes('CLASS 12') &&
                (reqs.includes('UG') ||
                  desc.includes('UNDERGRADUATE') ||
                  desc.includes('DEGREE') ||
                  desc.includes('GRADUATION') ||
                  desc.includes('B.TECH') ||
                  desc.includes('POST-MATRIC') ||
                  desc.includes('POST MATRIC'))
              );
            }
            if (educationFilter === 'PG') {
              return (
                !desc.includes('PRE-MATRIC') &&
                !desc.includes('CLASS 9') &&
                !desc.includes('CLASS 10') &&
                (reqs.includes('PG') ||
                  desc.includes('POSTGRADUATE') ||
                  desc.includes('MASTER') ||
                  desc.includes('FELLOWSHIP') ||
                  desc.includes('NATIONAL FELLOWSHIP'))
              );
            }
            if (educationFilter === 'PHD') {
              return (
                reqs.includes('PHD') ||
                reqs.includes('DOCTORATE') ||
                desc.includes('PH.D') ||
                desc.includes('FELLOWSHIP') ||
                desc.includes('RESEARCH')
              );
            }
            return true;
          });
        }

        setScholarships(list);
      }
    } catch (err) {
      console.error('Failed to fetch scholarships', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [stateFilter, educationFilter, sort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchScholarships();
  };

  const handleOpenJagoForScheme = (scholarship: Scholarship) => {
    setSelectedSchemeForJago(scholarship);
    setJagoAnswer(null);
  };

  const handleJagoPresetQuestion = (question: string) => {
    if (!selectedSchemeForJago) return;

    let ans = '';
    const s = selectedSchemeForJago;
    const title = getTranslatedScholarshipTitle(s.title);

    if (question.includes('eligible') || question.includes('eligibility')) {
      const isIncomeOk = profile ? profile.annualFamilyIncome <= 250000 : true;
      const isCommunityOk = profile?.category === 'ST' || profile?.category === 'SC';
      ans = `Based on your profile, for "${title}":\n• Target group: ${s.targetGroup || 'ST Students'}\n• Income criteria: Family income should be within the ceiling.\n• Your current verified status indicates ${isIncomeOk && isCommunityOk ? 'High Match (Eligible)' : 'Potential Match — please verify community and income records in the Verification Center'}.`;
    } else if (question.includes('documents')) {
      const docCount = s.documentRequirements?.length || 3;
      ans = `To apply for "${title}", you need ${docCount} documents ready in your Document Wallet:\n1. Community/Caste Certificate\n2. Annual Income Certificate (valid)\n3. Academic Marksheet of previous qualification\n4. Domicile / Residence Proof.`;
    } else if (question.includes('disbursement') || question.includes('payment')) {
      ans = `Scholarship benefit of ₹${s.benefit.toLocaleString('en-IN')}/year is disbursed via Direct Benefit Transfer (DBT) directly into your Aadhaar-linked bank account upon provider verification.`;
    } else if (question.includes('deadline')) {
      const days = s.deadlineInfo?.daysLeft ?? 25;
      ans = `The application cycle for "${title}" closes in approximately ${days} days (${new Date(s.deadline).toLocaleDateString()}). We recommend ensuring your documents are verified in the Verification Center before final submission.`;
    }

    setJagoAnswer({ question, answer: ans });
  };

  return (
    <div className="space-y-6 font-body pb-12">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-primary-dark">
          {t('scholarships.title', 'Scholarships')}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Explore and evaluate verified scholarship opportunities matched to your state and educational qualification.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-surface p-4 rounded-card border border-border shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-border rounded-input text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder={t('scholarships.search_placeholder', 'Search scholarships by title, keyword, or state...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-surface px-5 py-2 rounded-input text-sm font-semibold transition"
          >
            {t('common.search', 'Search')}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border text-xs">
          <span className="font-semibold text-text-secondary flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters:
          </span>

          {/* State Filter - All 28 States and 8 UTs */}
          <select
            className="border border-border rounded px-2.5 py-1.5 bg-surface text-text-primary text-xs outline-none focus:border-primary max-w-[200px]"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">All States / Domiciles</option>
            {STATES_AND_UTS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          {/* Education Filter with Pre-Matric and logical levels */}
          <select
            className="border border-border rounded px-2.5 py-1.5 bg-surface text-text-primary text-xs outline-none focus:border-primary"
            value={educationFilter}
            onChange={(e) => setEducationFilter(e.target.value)}
          >
            <option value="">All Education Levels</option>
            <option value="PRE_MATRIC">Pre-Matric (Class 1-10)</option>
            <option value="SCHOOL">Senior Secondary (Class 11-12)</option>
            <option value="DIPLOMA">Diploma</option>
            <option value="UG">Undergraduate (UG)</option>
            <option value="PG">Postgraduate (PG)</option>
            <option value="PHD">Doctorate (PhD)</option>
          </select>

          <select
            className="border border-border rounded px-2.5 py-1.5 bg-surface text-text-primary text-xs outline-none focus:border-primary ml-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="deadline">Sort: Deadline (Earliest first)</option>
            <option value="benefit">Sort: Benefit (Highest first)</option>
          </select>
        </div>
      </div>

      {/* Scholarship List */}
      {loading ? (
        <div className="p-12 text-center text-sm text-text-muted">
          {t('common.loading', 'Loading scholarships...')}
        </div>
      ) : scholarships.length === 0 ? (
        <div className="bg-surface p-12 text-center rounded-card border border-border shadow-xs">
          <BookOpen className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-40" />
          <h3 className="font-heading font-bold text-lg text-text-primary mb-1">
            {t('scholarships.no_results', 'No scholarships found')}
          </h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">
            {t('scholarships.no_results_desc', 'Try clearing your search query or selecting a different education level.')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scholarships.map((s, idx) => (
            <div
              key={s.id}
              className="bg-surface p-6 rounded-card border border-border shadow-xs hover:border-primary/50 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <MatchLabel level={idx === 0 ? 'STRONG_MATCH' : 'GOOD_MATCH'} />
                  <DeadlineBadge deadlineInfo={s.deadlineInfo} deadlineDate={s.deadline} />
                  <span className="text-xs text-text-muted">
                    • {s.provider?.organizationName || 'National Scholarship Authority'}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-xl text-primary-dark">
                  <Link to={`/student/scholarships/${s.id}`} className="hover:underline">
                    {getTranslatedScholarshipTitle(s.title)}
                  </Link>
                </h3>

                <p className="text-sm text-text-secondary line-clamp-2">{s.description}</p>

                {/* Tag summary */}
                <div className="flex flex-wrap gap-2 pt-1 text-xs text-text-secondary">
                  {s.targetGroup && (
                    <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700">
                      🎯 {s.targetGroup}
                    </span>
                  )}
                  {s.documentRequirements && s.documentRequirements.length > 0 && (
                    <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-700 flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {s.documentRequirements.length} {t('scholarships.required_documents')}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 shrink-0 gap-3">
                <div className="md:text-right">
                  <span className="text-[10px] text-text-muted block font-semibold uppercase">
                    Annual Grant
                  </span>
                  <span className="font-heading font-bold text-2xl text-primary">
                    ₹{s.benefit.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  {/* Ask JAGO about this scheme button */}
                  <button
                    type="button"
                    onClick={() => handleOpenJagoForScheme(s)}
                    className="inline-flex items-center justify-center gap-1.5 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/20 px-3.5 py-2 rounded-lg text-xs font-semibold transition"
                    title="Ask JAGO about this scheme"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask JAGO about this scheme</span>
                  </button>

                  <Link
                    to={`/student/scholarships/${s.id}`}
                    className="bg-primary hover:bg-primary-dark text-surface font-semibold text-xs px-4 py-2 rounded-lg transition shadow-xs text-center"
                  >
                    {t('dashboard_extra.view_details', 'View Details')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* JAGO SCHEME ASSISTANT MODAL */}
      {selectedSchemeForJago && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-card border border-border shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-dark to-slate-900 text-surface p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-surface">
                    Ask JAGO about this scheme
                  </h3>
                  <p className="text-xs text-stone-300 truncate max-w-sm">
                    {getTranslatedScholarshipTitle(selectedSchemeForJago.title)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSchemeForJago(null)}
                className="text-stone-300 hover:text-surface p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-sm text-text-primary">
              {/* Scheme Brief Card */}
              <div className="bg-stone-50 border border-border p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-text-muted uppercase">Scheme Summary</span>
                  <span className="font-bold text-primary text-base">
                    ₹{selectedSchemeForJago.benefit.toLocaleString('en-IN')}/yr
                  </span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {selectedSchemeForJago.description}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] text-text-muted">
                  <span>Target: <strong className="text-text-primary">{selectedSchemeForJago.targetGroup || 'Eligible Students'}</strong></span>
                  <span>•</span>
                  <span>Provider: <strong className="text-text-primary">{selectedSchemeForJago.provider?.organizationName || 'Scholarship Authority'}</strong></span>
                </div>
              </div>

              {/* Quick Questions Chips */}
              <div>
                <span className="text-xs font-semibold text-text-secondary block mb-2">
                  Frequently Asked Questions (Click to ask JAGO):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleJagoPresetQuestion('Am I eligible for this scholarship?')}
                    className="text-left text-xs p-2.5 rounded-lg border border-border hover:border-primary hover:bg-blue-50/50 text-text-primary font-medium transition flex items-center justify-between"
                  >
                    <span>Am I eligible for this?</span>
                    <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleJagoPresetQuestion('What documents are required for this scholarship?')}
                    className="text-left text-xs p-2.5 rounded-lg border border-border hover:border-primary hover:bg-blue-50/50 text-text-primary font-medium transition flex items-center justify-between"
                  >
                    <span>What documents do I need?</span>
                    <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleJagoPresetQuestion('When is the application deadline?')}
                    className="text-left text-xs p-2.5 rounded-lg border border-border hover:border-primary hover:bg-blue-50/50 text-text-primary font-medium transition flex items-center justify-between"
                  >
                    <span>When is the deadline?</span>
                    <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleJagoPresetQuestion('How is disbursement and payment done?')}
                    className="text-left text-xs p-2.5 rounded-lg border border-border hover:border-primary hover:bg-blue-50/50 text-text-primary font-medium transition flex items-center justify-between"
                  >
                    <span>How will money be sent?</span>
                    <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0 ml-1" />
                  </button>
                </div>
              </div>

              {/* JAGO Answer Section */}
              {jagoAnswer && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-accent">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span>JAGO Answer to: "{jagoAnswer.question}"</span>
                  </div>
                  <p className="text-xs text-text-primary whitespace-pre-line leading-relaxed">
                    {jagoAnswer.answer}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-stone-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const schemeId = selectedSchemeForJago.id;
                  const prompt = encodeURIComponent(`Tell me in detail about ${selectedSchemeForJago.title}`);
                  navigate(`/student/jago?schemeId=${schemeId}&prompt=${prompt}`);
                }}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>Continue conversation in JAGO Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedSchemeForJago(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-text-primary rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scholarships;

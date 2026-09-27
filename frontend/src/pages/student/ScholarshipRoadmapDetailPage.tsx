import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Circle,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { roadmapApi } from '../../api';
import { getTranslatedScholarshipTitle } from '../../utils/scholarshipI18n';
import { getTranslatedDocType } from '../../utils/documentI18n';

export const ScholarshipRoadmapDetailPage: React.FC = () => {
  const { scholarshipId } = useParams<{ scholarshipId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!scholarshipId) throw new Error('Scholarship ID is required');
      const response = await roadmapApi.getScholarshipDetail(scholarshipId);
      setData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch detail', err);
      setError(err.message || 'Failed to load scholarship roadmap details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [scholarshipId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F4F7FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1F6FEB]"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F4F7FA] p-6">
        <div className="bg-white p-8 rounded-2xl border border-red-200 text-center max-w-md w-full shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#12304A] mb-2">{t('common.error', 'Could not load details')}</h2>
          <p className="text-gray-600 mb-6">{error || 'An unexpected error occurred.'}</p>
          <button onClick={fetchDetail} className="px-6 py-2.5 bg-[#1F6FEB] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors w-full">
            {t('common.retry', 'Retry')}
          </button>
          <Link to="/student/eligibility-roadmap" className="mt-4 block text-[#1F6FEB] font-medium hover:underline">
            {t('roadmap.back_to_roadmap', 'Go back to Roadmap')}
          </Link>
        </div>
      </div>
    );
  }

  const { scholarship, readinessPercent, criteriaSummary, criteria, howToBecomeEligible, documentHealth, suggestedJagoQuestions } = data;

  const metCriteria = criteria?.met || [];
  const gapCriteria = criteria?.gap || [];
  const futureCriteria = criteria?.future || [];
  const steps = howToBecomeEligible || [];
  const docs = documentHealth || [];
  const questions = suggestedJagoQuestions || [];

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#12304A] font-sans pb-24">
      {/* Header */}
      <div className="bg-white border-b border-[#D9E2EC] pt-6 pb-6 px-6">
        <div className="max-w-4xl mx-auto">
          <Link to="/student/eligibility-roadmap" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-[#1F6FEB] mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" /> {t('roadmap.back_to_roadmap', 'Back to Roadmap')}
          </Link>
          <h1 className="text-3xl font-bold text-[#12304A]">{getTranslatedScholarshipTitle(scholarship?.title)}</h1>
          <div className="mt-2 text-gray-600 flex flex-wrap gap-4 text-sm font-medium">
            <span>{t('scholarships.provider')} {scholarship?.provider}</span>
            <span>•</span>
            <span>{t('scholarships.benefit')} {scholarship?.benefitFormatted}</span>
            <span>•</span>
            <span>{t('profile.category')} {scholarship?.targetGroup}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Readiness Overview */}
        <div className="bg-white rounded-2xl p-8 border border-[#D9E2EC] shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-32 h-32 transform -rotate-90">
              <path
                className="text-gray-100"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${readinessPercent === 100 ? 'text-green-500' : 'text-[#1F6FEB]'}`}
                strokeWidth="3"
                strokeDasharray={`${readinessPercent || 0}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute text-2xl font-bold text-[#12304A]">
              {readinessPercent}%
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#12304A] mb-2">{t('roadmap.readiness_overview', 'Readiness Overview')}</h2>
            <p className="text-gray-600 mb-3">{criteriaSummary?.metCount} of {criteriaSummary?.total} {t('roadmap.requirements_met', 'eligibility criteria satisfied')}</p>
            {readinessPercent === 100 ? (
              <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 mr-2" /> {t('roadmap.criteria_satisfied', 'You are fully eligible!')}
              </div>
            ) : (
              <div className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold">
                <AlertTriangle className="w-4 h-4 mr-2" /> {t('roadmap.action_needed', 'Action needed to qualify')}
              </div>
            )}
          </div>
        </div>

        {/* Criteria Breakdown */}
        <div className="bg-white rounded-2xl p-8 border border-[#D9E2EC] shadow-sm">
          <h2 className="text-2xl font-bold text-[#12304A] mb-6">{t('roadmap.criteria_breakdown', 'Criteria Breakdown')}</h2>
          
          <div className="space-y-6">
            {gapCriteria.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-amber-600 mb-3 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" /> {t('roadmap.missing_criteria', 'Missing / Gap Criteria')}
                </h3>
                <div className="space-y-3">
                  {gapCriteria.map((crit: any, idx: number) => (
                    <div key={idx} className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-amber-900">{crit.description}</h4>
                      </div>
                      <p className="text-sm text-amber-800 mb-3">{crit.explanation}</p>
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div className="bg-white p-2 rounded border border-amber-100">
                          <span className="text-gray-500 block text-xs">{t('roadmap.required_value')}</span>
                          <span className="font-semibold">{crit.requiredValue}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-amber-100">
                          <span className="text-gray-500 block text-xs">{t('roadmap.current_value')}</span>
                          <span className="font-semibold text-red-600">{crit.studentValue}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-amber-200 mt-2">
                        <span className="text-sm font-bold text-amber-900">{t('roadmap.action_label')} </span>
                        <span className="text-sm text-amber-800">{crit.actionRequired}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {metCriteria.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" /> {t('roadmap.satisfied_criteria', 'Satisfied Criteria')}
                </h3>
                <div className="space-y-3">
                  {metCriteria.map((crit: any, idx: number) => (
                    <div key={idx} className="p-4 bg-green-50 rounded-xl border border-green-200 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-green-900">{crit.description}</h4>
                        <p className="text-sm text-green-800 mt-1">{crit.explanation}</p>
                      </div>
                      <div className="text-right ml-4">
                        <span className="block text-xs text-green-700 font-medium">{t('roadmap.verified_value')}</span>
                        <span className="font-bold text-green-900">{crit.studentValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {futureCriteria.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-[#1F6FEB] mb-3 flex items-center">
                  <Circle className="w-5 h-5 mr-2" /> {t('roadmap.future_criteria', 'Future Progression Criteria')}
                </h3>
                <div className="space-y-3">
                  {futureCriteria.map((crit: any, idx: number) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-bold text-blue-900">{crit.description}</h4>
                      <p className="text-sm text-blue-800 mt-1">{crit.explanation}</p>
                      <span className="inline-block mt-2 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">{t('roadmap.time_estimate')} {crit.timeEstimate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How to Become Eligible */}
        <div className="bg-white rounded-2xl p-8 border border-[#D9E2EC] shadow-sm">
          <h2 className="text-2xl font-bold text-[#12304A] mb-6">{t('roadmap.how_to_become_eligible', 'How to Become Eligible')}</h2>
          <div className="relative border-l-2 border-gray-200 ml-3 md:ml-4 py-2 space-y-8">
            {steps.map((step: any, idx: number) => (
              <div key={idx} className="relative pl-8">
                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                  step.status === 'COMPLETED' ? 'bg-green-500' :
                  step.status === 'ACTION_REQUIRED' ? 'bg-amber-500' : 'bg-gray-300'
                }`}></div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                  <span className="text-sm font-bold text-gray-400 min-w-16">{t('roadmap.step_label')} {step.stepNumber}</span>
                  <span className="text-lg font-semibold text-[#12304A]">{step.title}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold w-fit ${
                    step.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    step.status === 'ACTION_REQUIRED' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {step.status === 'COMPLETED' ? t('status.APPROVED') :
                     step.status === 'ACTION_REQUIRED' ? t('applications.correction_needed') :
                     t('roadmap.future_opportunities')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Health */}
        <div className="bg-white rounded-2xl p-8 border border-[#D9E2EC] shadow-sm">
          <h2 className="text-2xl font-bold text-[#12304A] mb-6 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-[#0F766E]" /> {t('roadmap.required_documents_health', 'Required Documents Health')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map((doc: any, idx: number) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between bg-gray-50">
                <span className="font-semibold text-gray-700">{getTranslatedDocType(doc.documentType)}</span>
                <div className="flex items-center space-x-3">
                  {doc.status === 'VALID' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">{t('roadmap.valid')}</span>
                  )}
                  {doc.status === 'EXPIRING_SOON' && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{doc.notes || t('roadmap.expiring_soon')}</span>
                  )}
                  {doc.status === 'EXPIRED' && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">{t('roadmap.expired')}</span>
                  )}
                  {doc.status === 'MISSING' && (
                    <Link to="/student/documents" className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full hover:bg-gray-300 transition-colors">
                      {t('roadmap.upload_in_wallet')}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JAGO Integration */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h2 className="text-xl font-bold text-[#12304A] mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-[#1F6FEB]" /> {t('roadmap.suggested_questions', 'Need Help Understanding This?')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {questions.map((q: string, idx: number) => (
              <Link 
                key={idx} 
                to={`/student/jago?prompt=${encodeURIComponent(q)}`}
                className="px-4 py-2 bg-white border border-blue-200 rounded-full text-sm font-medium text-[#1F6FEB] hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Floating CTA Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#D9E2EC] p-4 shadow-lg z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <p className="font-bold text-[#12304A]">{getTranslatedScholarshipTitle(scholarship?.title)}</p>
            <p className="text-sm text-gray-500">{readinessPercent}% {t('roadmap.ready', 'Ready')}</p>
          </div>
          <div>
            {readinessPercent === 100 ? (
              <button className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors flex items-center">
                {t('roadmap.apply_for_scholarship', 'Apply for this Scholarship')} <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <Link to="/student/documents" className="px-8 py-3 bg-[#1F6FEB] text-white font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                {t('roadmap.complete_next_steps', 'Complete Required Next Steps')} <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

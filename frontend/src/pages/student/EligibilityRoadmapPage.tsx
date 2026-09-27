import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  Milestone,
  Building2,
  Calendar,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import { roadmapApi } from '../../api';
import { getTranslatedScholarshipTitle } from '../../utils/scholarshipI18n';

export const EligibilityRoadmapPage: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Eligible' | 'Almost' | 'Future' | 'Steps'>('All');
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await roadmapApi.getRoadmap();
      setData(response.data);
    } catch (err: any) {
      console.error('Error fetching roadmap data', err);
      setError(err.message || 'Failed to load roadmap data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
          <h2 className="text-xl font-bold text-[#12304A] mb-2">{t('common.error', 'Could not load roadmap')}</h2>
          <p className="text-gray-600 mb-6">{error || 'An unexpected error occurred.'}</p>
          <button onClick={fetchData} className="px-6 py-2.5 bg-[#1F6FEB] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors w-full">
            {t('common.retry', 'Retry')}
          </button>
        </div>
      </div>
    );
  }

  const eligibleNow = data.eligibleNow || [];
  const almostEligible = data.almostEligible || [];
  const futureOpportunities = data.futureOpportunities || [];
  const nextSteps = data.nextSteps || [];
  const summary = data.summary || { eligibleCount: 0, almostCount: 0, futureCount: 0, totalEvaluated: 0 };

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#12304A] font-sans pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#D9E2EC] pt-10 pb-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center space-x-4">
          <div className="p-3 bg-[#1F6FEB]/10 rounded-xl">
            <Compass className="w-8 h-8 text-[#1F6FEB]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#12304A]">{t('roadmap.title', 'Eligibility Roadmap')}</h1>
            <p className="text-gray-500 mt-1">{t('roadmap.subtitle', 'See what you can apply for today and what you can prepare for next.')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#D9E2EC] shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('Eligible')}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('roadmap.eligible_now', 'Eligible Now')}</p>
                <h3 className="text-3xl font-bold mt-2 text-[#12304A]">{summary.eligibleCount}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-lg text-green-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-green-600 mt-4 font-medium">{t('roadmap.criteria_satisfied', '100% criteria satisfied')}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#D9E2EC] shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('Almost')}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('roadmap.almost_eligible', 'Almost Eligible')}</p>
                <h3 className="text-3xl font-bold mt-2 text-[#12304A]">{summary.almostCount}</h3>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-amber-600 mt-4 font-medium">{t('roadmap.action_needed', 'Action needed to qualify')}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#D9E2EC] shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('Future')}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('roadmap.future_opportunities', 'Future Opportunities')}</p>
                <h3 className="text-3xl font-bold mt-2 text-[#12304A]">{summary.futureCount}</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg text-[#1F6FEB]">
                <Milestone className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm text-[#1F6FEB] mt-4 font-medium">{t('roadmap.upcoming_stages', 'Upcoming career stages')}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2 border-b border-[#D9E2EC] overflow-x-auto pb-px">
          {[
            { key: 'All', label: t('roadmap.complete_journey', 'Complete Journey') },
            { key: 'Eligible', label: t('roadmap.eligible_now', 'Eligible Now') },
            { key: 'Almost', label: t('roadmap.almost_eligible', 'Almost Eligible') },
            { key: 'Future', label: t('roadmap.future_opportunities', 'Future Opportunities') },
            { key: 'Steps', label: t('roadmap.your_next_steps', 'Your Next Steps') },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-[#1F6FEB] text-[#1F6FEB]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        {(activeTab === 'All' || activeTab === 'Steps') && nextSteps.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#12304A] mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-[#0F766E]" />
              {t('roadmap.your_next_steps', 'Your Next Steps')}
            </h2>
            <div className="space-y-4">
              {nextSteps.map((step: any) => (
                <div key={step.id} className="bg-white p-6 rounded-2xl border border-[#D9E2EC] flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        step.urgency === 'HIGH' ? 'bg-red-100 text-red-700' :
                        step.urgency === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {step.urgency}
                      </span>
                      <span className="text-xs font-medium text-gray-500 uppercase">{step.category}</span>
                    </div>
                    <h4 className="text-lg font-bold text-[#12304A]">{step.title}</h4>
                    <p className="text-gray-600 mt-1">{step.description}</p>
                    <p className="text-sm font-medium text-[#0F766E] mt-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1" /> {step.impact}
                    </p>
                  </div>
                  <Link to={step.actionUrl} className="px-6 py-2.5 bg-white border border-[#D9E2EC] text-[#12304A] font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center whitespace-nowrap">
                    {step.actionText || t('common.next', 'Take Action')} <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'All' || activeTab === 'Eligible') && eligibleNow.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#12304A] mb-6 flex items-center">
              <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" />
              {t('roadmap.eligible_now', 'Eligible Now')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {eligibleNow.map((scholarship: any) => (
                <div key={scholarship.id} className="bg-white p-6 rounded-2xl border border-[#D9E2EC] shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full">
                  <div className="absolute top-6 right-6 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold flex items-center border border-red-100">
                    <Clock className="w-3 h-3 mr-1" /> {scholarship.daysLeft} {t('roadmap.days_left', 'Days Left')}
                  </div>
                  <div className="pr-24">
                    <h3 className="text-xl font-bold text-[#12304A]">{getTranslatedScholarshipTitle(scholarship.title)}</h3>
                    <p className="text-gray-500 text-sm flex items-center mt-2">
                      <Building2 className="w-4 h-4 mr-1" /> {scholarship.provider}
                    </p>
                    <div className="mt-3 inline-block px-3 py-1 bg-[#1F6FEB]/10 text-[#1F6FEB] rounded-lg font-semibold text-sm">
                      {scholarship.benefitFormatted}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex-grow space-y-3">
                    <div className="flex items-center text-sm font-medium text-green-700 bg-green-50 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {scholarship.requirementsMetText}
                    </div>
                    <div className="flex items-center text-sm font-medium text-blue-700 bg-blue-50 p-2 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {scholarship.documentsReadyText}
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <Link to={scholarship.actionUrl || `/student/scholarships/${scholarship.id}`} className="flex-1 bg-[#1F6FEB] text-white py-2.5 rounded-lg font-medium text-center hover:bg-blue-600 transition-colors">
                      {scholarship.actionText || t('roadmap.apply_now', 'Apply Now')}
                    </Link>
                    <Link to={`/student/eligibility-roadmap/${scholarship.id}`} className="flex-1 bg-white border border-[#D9E2EC] text-[#12304A] py-2.5 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors">
                      {t('roadmap.details', 'Details')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'All' || activeTab === 'Almost') && almostEligible.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#12304A] mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-amber-500" />
              {t('roadmap.almost_eligible', 'Almost Eligible')}
            </h2>
            <div className="space-y-6">
              {almostEligible.map((scholarship: any) => (
                <div key={scholarship.id} className="bg-white p-6 rounded-2xl border border-[#D9E2EC] shadow-sm flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#12304A]">{getTranslatedScholarshipTitle(scholarship.title)}</h3>
                      <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {scholarship.daysLeft} {t('roadmap.days_left', 'Days Left')}
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">{scholarship.provider} • {scholarship.benefitFormatted}</p>
                    
                    <div className="mt-4 inline-flex items-center px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-bold">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {scholarship.readinessPercent}% {t('roadmap.ready', 'Ready')} • {scholarship.remainingRequirementsCount} {t('roadmap.requirements_remaining', 'Requirements Remaining')}
                    </div>

                    <div className="mt-5 space-y-4">
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2">{t('roadmap.criteria_breakdown', 'Criteria Breakdown')}</h4>
                        <ul className="space-y-2">
                          {(scholarship.passedCriteria || []).map((crit: any, idx: number) => (
                            <li key={idx} className="flex items-start text-sm">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{crit.description}: <span className="font-semibold text-gray-900">{crit.studentValue}</span></span>
                            </li>
                          ))}
                          {(scholarship.failedCriteria || []).map((crit: any, idx: number) => (
                            <li key={idx} className="flex items-start text-sm bg-amber-50 p-2 rounded border border-amber-100">
                              <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-gray-800 font-medium">{crit.description}</p>
                                <p className="text-amber-700 text-xs mt-0.5">{crit.actionRequired}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center md:border-l md:border-gray-200 md:pl-6">
                    <Link to={`/student/eligibility-roadmap/${scholarship.id}`} className="w-full md:w-auto px-6 py-3 bg-[#1F6FEB] text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
                      {t('roadmap.view_breakdown', 'View Roadmap Breakdown')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'All' || activeTab === 'Future') && futureOpportunities.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-[#12304A] mb-6 flex items-center">
              <Milestone className="w-6 h-6 mr-2 text-[#1F6FEB]" />
              {t('roadmap.future_opportunities', 'Future Opportunities')}
            </h2>
            <div className="relative border-l-2 border-[#1F6FEB]/20 ml-4 md:ml-10 py-4 space-y-12">
              {futureOpportunities.map((scholarship: any, idx: number) => (
                <div key={scholarship.id} className="relative pl-8 md:pl-12">
                  <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-[#1F6FEB] text-white flex items-center justify-center font-bold text-sm border-4 border-[#F4F7FA]">
                    {idx + 1}
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-[#D9E2EC] shadow-sm">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-[#0F766E] mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>{scholarship.expectedStage}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#12304A]">{getTranslatedScholarshipTitle(scholarship.title)}</h3>
                    <p className="text-gray-500 text-sm mt-1">{scholarship.provider} • {scholarship.benefitFormatted}</p>
                    
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <h4 className="text-sm font-bold text-gray-700 mb-1">{t('roadmap.what_to_prepare', 'What to prepare now:')}</h4>
                      <p className="text-sm text-gray-600">{scholarship.whatToPrepareNow}</p>
                    </div>
                    
                    <div className="mt-4">
                      <Link to={scholarship.primaryAction?.url || '#'} className="text-[#1F6FEB] font-medium text-sm flex items-center hover:underline">
                        {scholarship.primaryAction?.text || t('roadmap.track_opportunity', 'Track Opportunity')} <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* JAGO Assistant Contextual Card */}
        <div className="mt-12 bg-gradient-to-r from-[#12304A] to-[#1F6FEB] rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              <Sparkles className="w-6 h-6 mr-2 text-yellow-400" />
              {t('roadmap.need_help_title', 'Need help understanding your eligibility path?')}
            </h2>
            <p className="text-blue-100 max-w-xl">{t('roadmap.need_help_desc', 'Ask JAGO, your AI assistant, for personalized guidance on completing your requirements or navigating applications.')}</p>
          </div>
          <Link to="/student/jago?topic=eligibility-roadmap" className="mt-6 md:mt-0 px-6 py-3 bg-white text-[#12304A] font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center whitespace-nowrap">
            {t('roadmap.ask_jago', 'Ask JAGO')} <ArrowUpRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
};

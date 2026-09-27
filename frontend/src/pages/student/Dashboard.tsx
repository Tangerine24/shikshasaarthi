import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentApi, scholarshipApi, applicationApi, roadmapApi } from '../../api';
import { StudentProfile, Scholarship, Application } from '../../types';
import { getTranslatedScholarshipTitle } from '../../utils/scholarshipI18n';
import { MatchLabel } from '../../components/ui/MatchLabel';
import { DeadlineBadge } from '../../components/ui/DeadlineBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import {
  Compass,
  FileCheck2,
  FolderOpen,
  MessageSquareHeart,
  UserCheck,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Milestone,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [roadmapSummary, setRoadmapSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, scholRes, appRes, roadRes] = await Promise.all([
          studentApi.getProfile(),
          scholarshipApi.list(),
          applicationApi.listMine(),
          roadmapApi.getRoadmap().catch(() => null),
        ]);

        if (profRes.success && profRes.data) setProfile(profRes.data);
        if (scholRes.success && scholRes.data) setScholarships(scholRes.data);
        if (appRes.success && appRes.data) setApplications(appRes.data);
        if (roadRes && roadRes.success && roadRes.data) setRoadmapSummary(roadRes.data.summary);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting_morning', 'Good morning');
    if (hour < 17) return t('dashboard.greeting_afternoon', 'Good afternoon');
    return t('dashboard.greeting_evening', 'Good evening');
  };

  // Determine dynamic next action
  const getNextAction = () => {
    if (profile && profile.profileCompletePercent < 80) {
      return {
        title: t('dashboard.complete_profile', 'Complete your profile'),
        desc: t('dashboard.complete_profile_desc', { percent: profile.profileCompletePercent }),
        actionText: t('profile.save_changes', 'Update Profile'),
        link: '/student/profile',
        icon: UserCheck,
        urgency: 'medium',
      };
    }

    const needsCorrection = applications.find(
      (a) => a.status === 'CORRECTION_REQUIRED' || a.status === 'DOCUMENT_DEFICIENCY'
    );
    if (needsCorrection) {
      return {
        title: t('applications.correction_needed', 'Action Required on Application'),
        desc: needsCorrection.correctionNote || 'The provider requested corrections on your submission.',
        actionText: t('applications.resubmit', 'Review & Resubmit'),
        link: `/student/applications/${needsCorrection.id}`,
        icon: AlertTriangle,
        urgency: 'high',
      };
    }

    const underVerification = applications.find((a) => a.status === 'UNDER_VERIFICATION');
    if (underVerification) {
      return {
        title: t('dashboard_extra.under_verification'),
        desc: t('dashboard_extra.under_verification_desc', { title: underVerification.scholarship?.title }),
        actionText: t('dashboard_extra.view_timeline'),
        link: `/student/applications/${underVerification.id}`,
        icon: Clock,
        urgency: 'normal',
      };
    }

    return {
      title: t('dashboard.discover_scholarships', 'Discover scholarships'),
      desc: t('dashboard.discover_scholarships_desc', 'Explore scholarships that match your profile and community.'),
      actionText: t('nav.scholarships', 'Explore Schemes'),
      link: '/student/scholarships',
      icon: Compass,
      urgency: 'normal',
    };
  };

  const nextAction = getNextAction();
  const urgentScholarships = scholarships.filter(
    (s) => s.deadlineInfo?.status === 'CRITICAL' || s.deadlineInfo?.status === 'URGENT' || s.deadlineInfo?.status === 'UPCOMING'
  );

  return (
    <div className="space-y-8 font-body">
      {/* Top Banner / Greeting */}
      <section className="bg-surface p-6 rounded-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-2xl text-primary-dark">
              {getGreeting()}, {profile?.fullName || user?.email?.split('@')[0]}!
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {profile?.category ? `${profile.category} (${t('dashboard_extra.scheduled_tribe')})` : `ST (${t('dashboard_extra.scheduled_tribe')})`}
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {profile?.institution ? `${profile.course} • ${profile.institution}` : t('landing_extra.footer_platform')}
          </p>
        </div>

        {profile && (
          <div className="bg-stone-50 border border-border p-3.5 rounded-lg flex items-center gap-4 shrink-0">
            <div>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-text-secondary">{t('profile.completion', 'Profile')}:</span>
                <span className="font-bold text-primary">{profile.profileCompletePercent}%</span>
              </div>
              <div className="w-32 bg-stone-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${profile.profileCompletePercent}%` }}
                />
              </div>
            </div>
            <Link
              to="/student/profile"
              className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline"
            >
              {t('common.edit', 'Edit')}
            </Link>
          </div>
        )}
      </section>

      {/* Dynamic Next Action Card */}
      <section>
        <div
          className={`p-6 rounded-card border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            nextAction.urgency === 'high'
              ? 'bg-amber-50 border-amber-300'
              : 'bg-emerald-50/50 border-emerald-200'
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                nextAction.urgency === 'high'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              <nextAction.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  {t('dashboard.next_action', 'What to do next')}
                </span>
                {nextAction.urgency === 'high' && (
                  <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded">
                    {t('dashboard_extra.action_needed_badge')}
                  </span>
                )}
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary mt-0.5">
                {nextAction.title}
              </h3>
              <p className="text-sm text-text-secondary mt-1">{nextAction.desc}</p>
            </div>
          </div>

          <Link
            to={nextAction.link}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition shrink-0 ${
              nextAction.urgency === 'high'
                ? 'bg-accent hover:bg-amber-700 text-surface'
                : 'bg-primary hover:bg-primary-dark text-surface'
            }`}
          >
            <span>{nextAction.actionText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Eligibility Roadmap Entry Point Card */}
      <section className="bg-gradient-to-r from-primary-dark via-slate-900 to-primary-dark text-surface p-6 rounded-card shadow-sm relative overflow-hidden border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-teal-300 text-xs font-semibold">
              <Milestone className="w-3.5 h-3.5" />
              <span>{t('roadmap.pathway_tag', 'Personalized Scholarship Pathway')}</span>
            </div>
            <h3 className="font-heading font-bold text-xl md:text-2xl text-surface">
              {t('roadmap.title', 'Your Eligibility Roadmap')}
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed">
              {t('roadmap.pathway_desc', 'Discover which scholarships you can apply for today, which requirements are within reach next, and future fellowships for your academic journey.')}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {roadmapSummary?.eligibleCount ?? 2} {t('roadmap.eligible_now', 'Eligible Now')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                <AlertTriangle className="w-3.5 h-3.5" />
                {roadmapSummary?.almostCount ?? 1} {t('roadmap.almost_eligible', 'Almost Eligible')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
                <Clock className="w-3.5 h-3.5" />
                {roadmapSummary?.futureCount ?? 2} {t('roadmap.future_opportunities', 'Future Opportunities')}
              </span>
            </div>
          </div>

          <Link
            to="/student/eligibility-roadmap"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-blue-600 text-surface font-semibold text-sm rounded-lg shadow-sm transition shrink-0"
          >
            <span>{t('roadmap.view_roadmap', 'View Roadmap')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Active Applications Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-heading font-bold text-xl text-text-primary">
            {t('dashboard.my_applications', 'My Applications')}
          </h3>
          <Link
            to="/student/applications"
            className="text-xs font-semibold text-primary hover:underline"
          >
            {t('common.see_all', 'See all')} ({applications.length}) →
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="bg-surface p-8 text-center rounded-card border border-border shadow-xs">
            <FileCheck2 className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm text-text-secondary">{t('dashboard.no_applications_desc', 'Explore scholarships that match your profile.')}</p>
            <Link
              to="/student/scholarships"
              className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
            >
              {t('dashboard_extra.browse_scholarships')} →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-surface p-5 rounded-card border border-border shadow-xs flex flex-col justify-between hover:border-primary/40 transition"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-xs text-text-muted">
                      {app.scholarship?.provider?.organizationName || 'Ministry of Tribal Affairs'}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                  <h4 className="font-heading font-bold text-base text-text-primary mb-1">
                    {getTranslatedScholarshipTitle(app.scholarship?.title)}
                  </h4>
                  {app.correctionNote && (
                    <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                      ⚠️ {t('dashboard_extra.correction_note')} {app.correctionNote}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-border flex justify-between items-center">
                  <span className="text-xs text-text-muted">
                    {t('dashboard_extra.benefit_label')} <strong className="text-primary font-bold">₹{app.scholarship?.benefit?.toLocaleString('en-IN')}</strong>
                  </span>
                  <Link
                    to={`/student/applications/${app.id}`}
                    className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline"
                  >
                    {t('dashboard_extra.view_timeline')} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommended Scholarships Grid */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-heading font-bold text-xl text-text-primary">
              {t('dashboard.scholarship_matches', 'Scholarship Matches')}
            </h3>
            <p className="text-xs text-text-muted">{t('dashboard_extra.profile_subtitle')}</p>
          </div>
          <Link
            to="/student/scholarships"
            className="text-xs font-semibold text-primary hover:underline"
          >
            {t('common.see_all', 'See all')} →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {scholarships.slice(0, 3).map((s, idx) => (
            <div
              key={s.id}
              className="bg-surface p-5 rounded-card border border-border shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <MatchLabel level={idx === 0 ? 'STRONG_MATCH' : 'GOOD_MATCH'} />
                  <DeadlineBadge deadlineInfo={s.deadlineInfo} deadlineDate={s.deadline} />
                </div>
                <h4 className="font-heading font-bold text-base text-text-primary mb-1.5 line-clamp-2">
                  {getTranslatedScholarshipTitle(s.title)}
                </h4>
                <p className="text-xs text-text-secondary line-clamp-3 mb-3">{s.description}</p>
              </div>

              <div className="pt-3 border-t border-border flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-text-muted block">{t('dashboard_extra.annual_grant')}</span>
                  <span className="font-heading font-bold text-base text-primary">
                    ₹{s.benefit.toLocaleString('en-IN')}
                  </span>
                </div>
                <Link
                  to={`/student/scholarships/${s.id}`}
                  className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-text-primary px-3 py-1.5 rounded transition"
                >
                  {t('dashboard_extra.view_details')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* JAGO Entry Banner */}
      <section className="bg-gradient-to-r from-emerald-900 to-primary p-6 rounded-card text-surface shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <MessageSquareHeart className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-heading font-bold text-lg text-white">
                {t('dashboard.jago_prompt', 'Have questions? Ask JAGO')}
              </h4>
              <span className="text-[10px] bg-white/20 text-white font-semibold px-2 py-0.5 rounded-full">
                {t('dashboard_extra.ai_guidance')}
              </span>
            </div>
            <p className="text-sm text-white/80 mt-1 max-w-xl">
              {t('dashboard.jago_desc', 'Your grounded scholarship guide. Ask in Hindi or English about eligibility, required documents, or application status.')}
            </p>
          </div>
        </div>

        <Link
          to="/student/jago"
          className="bg-surface text-primary hover:bg-stone-100 font-semibold text-sm px-5 py-2.5 rounded-lg shadow-xs transition shrink-0"
        >
          {t('dashboard_extra.chat_jago')}
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;

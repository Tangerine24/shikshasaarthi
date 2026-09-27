import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { scholarshipApi } from '../api';
import { Scholarship } from '../types';
import { getTranslatedScholarshipTitle } from '../utils/scholarshipI18n';
import { MatchLabel } from '../components/ui/MatchLabel';
import { DeadlineBadge } from '../components/ui/DeadlineBadge';
import {
  Compass,
  FileCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react';

const Landing: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);

  useEffect(() => {
    scholarshipApi.list().then((res) => {
      if (res.success && res.data) {
        setScholarships(res.data.slice(0, 3));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      {/* Top Government Platform Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary text-surface flex items-center justify-center font-heading font-bold text-lg shadow-sm">
              SS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-lg text-primary leading-tight">ShikshaSaarthi</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                  SIH26238
                </span>
              </div>
              <p className="text-xs text-text-muted">{t('common.ministry')}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              to="/login"
              className="text-sm font-semibold text-text-primary hover:text-primary transition px-3 py-1.5 rounded-md hover:bg-stone-100"
            >
              {t('landing.sign_in', 'Sign In')}
            </Link>
            <Link
              to="/login"
              className="text-sm font-semibold bg-primary hover:bg-primary-dark text-surface px-4 py-2 rounded-md shadow-xs transition"
            >
              {t('landing.register', 'Get Started')}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-medium mb-6">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>{t('landing.demo_disclaimer', 'SIH 2026 Prototype — Unified Tribal Scholarship Assistance')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-primary-dark tracking-tight leading-tight max-w-3xl mx-auto">
            {t('landing.headline', 'Your scholarship journey, made clear.')}
          </h1>

          <p className="text-lg md:text-xl text-text-secondary mt-6 max-w-2xl mx-auto leading-relaxed">
            {t(
              'landing.subheadline',
              'ShikshaSaarthi empowers tribal students to discover, understand, apply for and track scholarships through one unified platform.'
            )}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-surface px-6 py-3 rounded-lg font-medium text-base shadow-sm transition"
            >
              <span>{t('auth.sign_in', 'Launch Demo Portal')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById('schemes');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 bg-surface hover:bg-stone-50 border border-border text-text-primary px-6 py-3 rounded-lg font-medium text-base shadow-xs transition"
            >
              <Compass className="w-4 h-4 text-text-secondary" />
              <span>{t('landing_extra.browse_schemes')}</span>
            </button>
          </div>

          <p className="text-xs text-text-muted mt-3">
            {t('landing_extra.demo_note')}
          </p>
        </section>

        {/* 3 Pillars: Discover -> Understand -> Apply */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t border-border">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-surface rounded-card border border-border shadow-xs hover:border-primary/40 transition">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5 text-emerald-700" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary mb-2">
                1. {t('landing.step1_title', 'Discover')}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t('landing.step1_desc', 'Find scholarships tailored to your state, tribal community, course, and income with deterministic matching.')}
              </p>
            </div>

            <div className="p-6 bg-surface rounded-card border border-border shadow-xs hover:border-primary/40 transition">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5 text-amber-700" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary mb-2">
                2. {t('landing.step2_title', 'Understand')}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t('landing.step2_desc', 'Know criterion-by-criterion why you qualify, what documents you need, and ask JAGO for grounded explanations.')}
              </p>
            </div>

            <div className="p-6 bg-surface rounded-card border border-border shadow-xs hover:border-primary/40 transition">
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center mb-4">
                <FileCheck className="w-5 h-5 text-rose-700" />
              </div>
              <h3 className="font-heading font-bold text-lg text-text-primary mb-2">
                3. {t('landing.step3_title', 'Apply & Track')}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {t('landing.step3_desc', 'Attach documents from your persistent wallet, submit once, and follow your application lifecycle in real time.')}
              </p>
            </div>
          </div>
        </section>

        {/* Scholarship Showcase */}
        <section id="schemes" className="max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t border-border">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {t('landing_extra.official_schemes')}
              </span>
              <h2 className="font-heading font-bold text-2xl text-text-primary mt-1">
                {t('landing_extra.featured_title')}
              </h2>
            </div>
            <Link
              to="/login"
              className="text-sm font-semibold text-primary hover:text-primary-dark flex items-center gap-1 hover:underline"
            >
              {t('landing_extra.view_all')} →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {scholarships.map((s) => (
              <div
                key={s.id}
                className="bg-surface rounded-card border border-border p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-medium text-text-muted">
                      {s.provider?.organizationName || t('common.ministry')}
                    </span>
                    <DeadlineBadge deadlineInfo={s.deadlineInfo} deadlineDate={s.deadline} />
                  </div>

                  <h3 className="font-heading font-bold text-base text-text-primary mb-2 line-clamp-2">
                    {getTranslatedScholarshipTitle(s.title)}
                  </h3>
                  <p className="text-xs text-text-secondary line-clamp-3 mb-4">{s.description}</p>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-muted block">{t('landing_extra.annual_benefit_label')}</span>
                    <span className="font-heading font-bold text-lg text-primary">
                      ₹{s.benefit.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link
                    to="/login"
                    className="text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-text-primary px-3 py-1.5 rounded transition"
                  >
                    {t('landing_extra.check_eligibility')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-8 text-center text-xs text-text-muted">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className="font-medium text-text-secondary">
            {t('landing_extra.footer_platform')}
          </p>
          <p>{t('landing_extra.footer_sih')}</p>
          <p className="text-[11px] text-text-muted pt-2">
            {t('landing_extra.footer_demo')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { scholarshipApi } from '../../api';
import { Scholarship } from '../../types';
import { getTranslatedScholarshipTitle } from '../../utils/scholarshipI18n';
import { MatchLabel } from '../../components/ui/MatchLabel';
import { DeadlineBadge } from '../../components/ui/DeadlineBadge';
import { Search, Filter, SlidersHorizontal, BookOpen, FileText } from 'lucide-react';

export const Scholarships: React.FC = () => {
  const { t } = useTranslation();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [educationFilter, setEducationFilter] = useState('');
  const [sort, setSort] = useState('deadline');
  const [loading, setLoading] = useState(true);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await scholarshipApi.list({
        search: search || undefined,
        state: stateFilter || undefined,
        education: educationFilter || undefined,
        sort: sort === 'benefit' ? 'benefit_desc' : 'deadline_asc',
      });
      if (res.success && res.data) {
        setScholarships(res.data);
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

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-primary-dark">
          {t('scholarships.title', 'Scholarships')}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          {t('scholarships.subtitle', 'Explore and evaluate scholarship assistance programs matched to your academic profile.')}
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

          <select
            className="border border-border rounded px-2.5 py-1.5 bg-surface text-text-primary text-xs outline-none focus:border-primary"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">All States / Domiciles</option>
            <option value="Jharkhand">Jharkhand</option>
            <option value="Odisha">Odisha</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
          </select>

          <select
            className="border border-border rounded px-2.5 py-1.5 bg-surface text-text-primary text-xs outline-none focus:border-primary"
            value={educationFilter}
            onChange={(e) => setEducationFilter(e.target.value)}
          >
            <option value="">All Education Levels</option>
            <option value="UG">Undergraduate (UG)</option>
            <option value="PG">Postgraduate (PG)</option>
            <option value="DIPLOMA">Diploma</option>
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
            {t('scholarships.no_results_desc', 'Try clearing your search query or relaxing filter options.')}
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
                    • {s.provider?.organizationName || 'Ministry of Tribal Affairs'}
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

              {/* Price & Action */}
              <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 shrink-0 gap-3">
                <div className="md:text-right">
                  <span className="text-[10px] text-text-muted block font-semibold uppercase">
                    {t('landing_extra.annual_benefit_label')}
                  </span>
                  <span className="font-heading font-bold text-2xl text-primary">
                    ₹{s.benefit.toLocaleString('en-IN')}
                  </span>
                </div>

                <Link
                  to={`/student/scholarships/${s.id}`}
                  className="bg-primary hover:bg-primary-dark text-surface font-semibold text-sm px-5 py-2 rounded-lg transition shadow-xs text-center"
                >
                  {t('dashboard_extra.view_details')}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Scholarships;

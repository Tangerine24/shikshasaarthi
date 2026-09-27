import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { scholarshipApi } from '../../api';
import { Scholarship } from '../../types';
import { getTranslatedScholarshipTitle } from '../../utils/scholarshipI18n';
import { Plus, GraduationCap } from 'lucide-react';

export const ProviderScholarships: React.FC = () => {
  const { t } = useTranslation();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newBenefit, setNewBenefit] = useState('35000');
  const [newDeadline, setNewDeadline] = useState('2026-11-30');
  const [targetGroup, setTargetGroup] = useState('Scheduled Tribe UG students');
  const [creating, setCreating] = useState(false);

  const fetchScholarships = async () => {
    try {
      const res = await scholarshipApi.listProviderScholarships();
      if (res.success && res.data) {
        setScholarships(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await scholarshipApi.create({
        title: newTitle,
        description: newDesc,
        benefit: parseFloat(newBenefit),
        deadline: newDeadline,
        targetGroup,
        rules: [
          { field: 'category', operator: 'IN', value: '["ST"]', description: 'ST Category' },
          { field: 'educationLevel', operator: 'EQ', value: '"UG"', description: 'Undergraduate study' },
        ],
        documents: [
          { documentType: 'COMMUNITY_CERTIFICATE', description: 'ST Community Certificate', isRequired: true },
          { documentType: 'MARKSHEET', description: 'Academic Marksheet', isRequired: true },
        ],
      });
      if (res.success) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
        fetchScholarships();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 font-body pb-12">
      <div className="flex justify-between items-center bg-surface p-6 rounded-card border border-border shadow-xs">
        <div>
          <h1 className="font-heading font-bold text-2xl text-primary-dark">
            {t('provider.scholarships_title', 'My Scholarships')}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            {t('scholarships.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary-dark text-surface font-semibold text-xs px-4 py-2.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{t('provider.create_scholarship', 'Create Scholarship')}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-text-muted">{t('common.loading')}</div>
      ) : scholarships.length === 0 ? (
        <div className="bg-surface p-12 text-center rounded-card border border-border shadow-xs">
          <GraduationCap className="w-12 h-12 text-text-muted mx-auto mb-2 opacity-40" />
          <p className="text-sm text-text-secondary">{t('scholarships.no_results')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scholarships.map((s) => (
            <div
              key={s.id}
              className="bg-surface p-6 rounded-card border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2 py-0.5 rounded">
                    {s.status}
                  </span>
                  <span className="text-xs text-text-muted">
                    {t('scholarships.deadline')}: {new Date(s.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg text-primary-dark">
                  {getTranslatedScholarshipTitle(s.title)}
                </h3>
                <p className="text-xs text-text-secondary line-clamp-2">{s.description}</p>

                <div className="flex flex-wrap gap-2 text-xs text-text-secondary pt-1">
                  <span className="bg-stone-100 px-2 py-0.5 rounded">
                    {t('eligibility.passed_criteria')}: {s.eligibilityRules?.length || 0}
                  </span>
                  <span className="bg-stone-100 px-2 py-0.5 rounded">
                    {t('scholarships.required_documents')}: {s.documentRequirements?.length || 0}
                  </span>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <span className="text-[10px] uppercase font-semibold text-text-muted block">
                  {t('landing_extra.annual_benefit_label')}
                </span>
                <span className="font-heading font-bold text-2xl text-primary block">
                  ₹{s.benefit?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-text-muted mt-1 block">
                  {t('provider.applications_title')}: <strong>{s._count?.applications || 0}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-card p-6 border border-border shadow-xl max-w-lg w-full space-y-4">
            <h3 className="font-heading font-bold text-lg text-primary-dark">
              {t('provider.create_scholarship')}
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  {t('profile.course')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Tribal STEM Excellence Fellowship"
                  className="w-full border border-border rounded-input px-3.5 py-2 text-xs outline-none focus:border-primary"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  {t('scholarships.eligibility_summary')} *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Comprehensive description of the financial support and objectives..."
                  className="w-full border border-border rounded-input px-3.5 py-2 text-xs outline-none focus:border-primary"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                    {t('landing_extra.annual_benefit_label')} (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full border border-border rounded-input px-3.5 py-2 text-xs outline-none focus:border-primary"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                    {t('scholarships.deadline')} *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-border rounded-input px-3.5 py-2 text-xs outline-none focus:border-primary"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  {t('profile.category')}
                </label>
                <input
                  type="text"
                  className="w-full border border-border rounded-input px-3.5 py-2 text-xs outline-none focus:border-primary"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-border rounded-input text-xs font-semibold text-text-secondary hover:bg-stone-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-surface rounded-input text-xs font-semibold transition disabled:opacity-50"
                >
                  {creating ? t('common.loading') : t('provider.publish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderScholarships;

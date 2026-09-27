import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { studentApi } from '../../api';
import { StudentProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  GraduationCap,
  IndianRupee,
  Settings,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Globe,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState<Partial<StudentProfile> & { preferredLanguage?: string }>({
    fullName: '',
    dateOfBirth: '',
    gender: 'MALE',
    state: 'Jharkhand',
    district: 'Ranchi',
    category: 'ST',
    annualFamilyIncome: 150000,
    educationLevel: 'UG',
    institution: '',
    course: '',
    yearOfStudy: 1,
    academicPercentage: 60,
    isHosteller: false,
    hasDisability: false,
    hasBankAccount: true,
    previousScholarship: '',
    preferredLanguage: 'HI',
  });

  const [completionPercent, setCompletionPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    studentApi.getProfile().then((res) => {
      if (res.success && res.data) {
        const p = res.data;
        setFormData({
          fullName: p.fullName || '',
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
          gender: p.gender || 'MALE',
          state: p.state || 'Jharkhand',
          district: p.district || 'Ranchi',
          category: p.category || 'ST',
          annualFamilyIncome: p.annualFamilyIncome || 150000,
          educationLevel: p.educationLevel || 'UG',
          institution: p.institution || '',
          course: p.course || '',
          yearOfStudy: p.yearOfStudy || 1,
          academicPercentage: p.academicPercentage || 60,
          isHosteller: Boolean(p.isHosteller),
          hasDisability: Boolean(p.hasDisability),
          hasBankAccount: p.hasBankAccount !== undefined ? Boolean(p.hasBankAccount) : true,
          previousScholarship: p.previousScholarship || '',
          preferredLanguage: p.user?.preferredLanguage || 'HI',
        });
        setCompletionPercent(p.profileCompletePercent || 0);
      }
    }).catch((err) => {
      console.error('Failed to load student profile', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLanguageChange = (lang: string) => {
    handleChange('preferredLanguage', lang);
    i18n.changeLanguage(lang.toLowerCase());
    localStorage.setItem('ss_lang', lang.toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);
    setErrorMsg(null);

    try {
      const res = await studentApi.updateProfile(formData);
      if (res.success && res.data) {
        setCompletionPercent(res.data.profileCompletePercent);
        setSuccessMsg(true);
        if (res.data.user) {
          setUser(res.data.user);
        }
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-text-muted">{t('common.loading', 'Loading profile...')}</div>;
  }

  return (
    <div className="space-y-6 font-body pb-12 max-w-4xl mx-auto">
      {/* Page Title & Completion Header */}
      <div className="bg-surface p-6 rounded-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-primary-dark">
            {t('profile.title', 'My Profile')}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Keep your academic and community information accurate for optimal scholarship matching.
          </p>
        </div>

        <div className="bg-stone-50 border border-border p-4 rounded-lg flex items-center gap-4 shrink-0">
          <div>
            <div className="flex justify-between items-center text-xs mb-1 font-semibold text-text-secondary">
              <span>{t('profile.completion', 'Profile Completion')}</span>
              <span className="text-primary font-bold">{completionPercent}%</span>
            </div>
            <div className="w-40 bg-stone-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500 rounded-full"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
          <ShieldCheck className="w-6 h-6 text-primary" />
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{t('profile.saved', 'Profile updated successfully!')}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Personal Information */}
        <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-lg text-text-primary">
              {t('profile.personal', 'Personal Information')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('profile.full_name', 'Full Name')} *
              </label>
              <input
                type="text"
                required
                className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none focus:border-primary"
                value={formData.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('profile.gender', 'Gender')}
              </label>
              <select
                className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none bg-surface focus:border-primary"
                value={formData.gender || 'MALE'}
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('profile.state', 'State of Domicile')} *
              </label>
              <input
                type="text"
                required
                className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none focus:border-primary"
                value={formData.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('profile.district', 'District')}
              </label>
              <input
                type="text"
                className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none focus:border-primary"
                value={formData.district || ''}
                onChange={(e) => handleChange('district', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 2. Community & Financial Criteria (Sensitive Fields) */}
        <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <IndianRupee className="w-5 h-5 text-primary" />
            <div>
              <h2 className="font-heading font-bold text-lg text-text-primary">
                {t('profile.financial', 'Community & Financial Information')}
              </h2>
              <p className="text-xs text-text-muted">
                Protected sensitive fields used solely for deterministic eligibility evaluation
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('profile.category', 'Community Category')} *
              </label>
              <select
                className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none bg-surface focus:border-primary"
                value={formData.category || 'ST'}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="ST">Scheduled Tribe (ST)</option>
                <option value="SC">Scheduled Caste (SC)</option>
                <option value="OBC">Other Backward Class (OBC)</option>
                <option value="GENERAL">General</option>
              </select>
              <p className="text-[11px] text-text-muted mt-1">{t('profile.why_category', 'Required for tribal welfare schemes.')}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('profile.income', 'Annual Family Income (₹)')} *
              </label>
              <input
                type="number"
                required
                className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none focus:border-primary"
                value={formData.annualFamilyIncome || ''}
                onChange={(e) => handleChange('annualFamilyIncome', e.target.value)}
              />
              <p className="text-[11px] text-text-muted mt-1">{t('profile.why_income', 'Used for means-tested scholarship caps.')}</p>
            </div>
          </div>
        </div>

        {/* 3. Education Details */}
        <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-lg text-text-primary">
              {t('profile.education', 'Education Details')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('profile.education_level', 'Education Level')} *
              </label>
              <select
                className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none bg-surface focus:border-primary"
                value={formData.educationLevel || 'UG'}
                onChange={(e) => handleChange('educationLevel', e.target.value)}
              >
                <option value="UG">Undergraduate (UG)</option>
                <option value="PG">Postgraduate (PG)</option>
                <option value="DIPLOMA">Diploma</option>
                <option value="SCHOOL">Senior Secondary (11th-12th)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('profile.course', 'Course / Programme')}
              </label>
              <input
                type="text"
                placeholder="e.g., B.Tech Computer Science"
                className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none focus:border-primary"
                value={formData.course || ''}
                onChange={(e) => handleChange('course', e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('profile.institution', 'Institution Name')}
              </label>
              <input
                type="text"
                placeholder="e.g., Birsa Institute of Technology, Sindri"
                className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none focus:border-primary"
                value={formData.institution || ''}
                onChange={(e) => handleChange('institution', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('profile.year_of_study', 'Year of Study')}
              </label>
              <select
                className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none bg-surface focus:border-primary"
                value={formData.yearOfStudy || 1}
                onChange={(e) => handleChange('yearOfStudy', e.target.value)}
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('profile.academic_percentage', 'Academic Percentage / CGPA')} (%) *
              </label>
              <input
                type="number"
                step="0.1"
                required
                className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none focus:border-primary"
                value={formData.academicPercentage || ''}
                onChange={(e) => handleChange('academicPercentage', e.target.value)}
              />
              <p className="text-[11px] text-text-muted mt-1">{t('profile.why_percentage', 'Evaluates merit eligibility criteria.')}</p>
            </div>
          </div>
        </div>

        {/* 4. Special Criteria & Preferences */}
        <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="font-heading font-bold text-lg text-text-primary">
              {t('profile.preferences', 'Preferences & Status')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-3 p-3 border border-border rounded-lg bg-stone-50/50 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary rounded"
                checked={Boolean(formData.isHosteller)}
                onChange={(e) => handleChange('isHosteller', e.target.checked)}
              />
              <span className="text-xs font-medium text-text-primary">
                {t('profile.is_hosteller', 'Hostel Resident')}
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-border rounded-lg bg-stone-50/50 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary rounded"
                checked={Boolean(formData.hasDisability)}
                onChange={(e) => handleChange('hasDisability', e.target.checked)}
              />
              <span className="text-xs font-medium text-text-primary">
                {t('profile.has_disability', 'Person with Disability (PwD)')}
              </span>
            </label>

            <label className="flex items-center gap-3 p-3 border border-border rounded-lg bg-stone-50/50 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary rounded"
                checked={Boolean(formData.hasBankAccount)}
                onChange={(e) => handleChange('hasBankAccount', e.target.checked)}
              />
              <span className="text-xs font-medium text-text-primary">
                {t('profile.has_bank_account', 'Aadhaar-Linked Bank Account')}
              </span>
            </label>
          </div>

          {/* Preferred Language */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              {t('profile.preferred_language', 'Preferred Communication Language')}
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleLanguageChange('HI')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition ${
                  formData.preferredLanguage === 'HI'
                    ? 'bg-primary text-surface border-primary'
                    : 'bg-surface text-text-secondary border-border hover:bg-stone-50'
                }`}
              >
                🇮🇳 हिन्दी (Hindi)
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('EN')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg border transition ${
                  formData.preferredLanguage === 'EN'
                    ? 'bg-primary text-surface border-primary'
                    : 'bg-surface text-text-secondary border-border hover:bg-stone-50'
                }`}
              >
                English (EN)
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary-dark text-surface font-semibold px-8 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : t('profile.save_changes', 'Save Changes')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { studentApi, documentApi } from '../../api';
import { StudentProfile, StudentDocument } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getTranslatedDocType } from '../../utils/documentI18n';
import {
  User,
  GraduationCap,
  IndianRupee,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  BadgeCheck,
  Download,
  ExternalLink,
  Clock,
  Building2,
  Award,
} from 'lucide-react';

const STATES_AND_UTS = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 
  'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 
  'West Bengal'
];

const DISTRICT_MAP: Record<string, string[]> = {
  'Jharkhand': ['Ranchi', 'Khunti', 'Gumla', 'Simdega', 'Lohardaga', 'West Singhbhum', 'East Singhbhum', 'Saraikela Kharsawan', 'Dumka', 'Jamtara', 'Sahebganj', 'Pakur', 'Godda', 'Hazaribagh', 'Ramgarh', 'Bokaro', 'Dhanbad', 'Giridih', 'Deoghar', 'Palamu', 'Garhwa', 'Latehar', 'Chatra', 'Koderma'],
  'Odisha': ['Mayurbhanj', 'Sundargarh', 'Keonjhar', 'Rayagada', 'Koraput', 'Malkangiri', 'Nabarangpur', 'Kandhamal', 'Gajapati', 'Kalahandi', 'Nuapada'],
  'Madhya Pradesh': ['Jhabua', 'Alirajpur', 'Barwani', 'Dhar', 'Khargone', 'Khandwa', 'Burhanpur', 'Betul', 'Chhindwara', 'Seoni', 'Mandla', 'Dindori', 'Balaghat', 'Anuppur', 'Umaria', 'Shahdol', 'Sidhi', 'Singrauli'],
  'Chhattisgarh': ['Bastar', 'Dantewada', 'Sukma', 'Bijapur', 'Narayanpur', 'Kondagaon', 'Kanker', 'Surguja', 'Jashpur', 'Koriya', 'Surajpur', 'Balrampur', 'Raigarh', 'Korba', 'Bilaspur'],
  'Rajasthan': ['Banswara', 'Dungarpur', 'Pratapgarh', 'Udaipur', 'Sirohi', 'Rajsamand', 'Chittorgarh', 'Pali', 'Baran'],
  'Maharashtra': ['Nandurbar', 'Dhule', 'Jalgaon', 'Nashik', 'Palghar', 'Thane', 'Raigad', 'Pune', 'Ahmednagar', 'Nanded', 'Amravati', 'Yavatmal', 'Wardha', 'Nagpur', 'Bhandara', 'Gondia', 'Chandpur', 'Gadchiroli'],
  'Gujarat': ['Dangs', 'Tapi', 'Navsari', 'Valsad', 'Surat', 'Bharuch', 'Narmada', 'Vadodara', 'Chhota Udepur', 'Panchmahal', 'Dahod', 'Mahisagar', 'Sabarkantha', 'Aravalli', 'Banaskantha'],
  'West Bengal': ['Purulia', 'Bankura', 'Paschim Medinipur', 'Jhargram', 'Jalpaiguri', 'Alipurduar', 'Darjeeling', 'Kalimpong', 'Dakshin Dinajpur', 'Uttar Dinajpur', 'Malda'],
  'Assam': ['Kokrajhar', 'Chirang', 'Baksa', 'Udalguri', 'Karbi Anglong', 'West Karbi Anglong', 'Dima Hasao', 'Goalpara', 'Kamrup', 'Sonitpur', 'Lakhimpur', 'Dhemaji', 'Tinsukia', 'Dibrugarh', 'Sivasagar', 'Jorhat', 'Golaghat'],
  'Tripura': ['Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'],
  'Meghalaya': ['East Khasi Hills', 'West Khasi Hills', 'South West Khasi Hills', 'Ri Bhoi', 'East Jaintia Hills', 'West Jaintia Hills', 'North Garo Hills', 'East Garo Hills', 'South Garo Hills', 'West Garo Hills', 'South West Garo Hills'],
  'Nagaland': ['Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Peren', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto'],
  'Manipur': ['Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl', 'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'],
  'Mizoram': ['Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mamit', 'Saiha', 'Saitual', 'Serchhip'],
  'Arunachal Pradesh': ['Tawang', 'West Kameng', 'East Kameng', 'Papum Pare', 'Kurung Kumey', 'Kra Daadi', 'Lower Subansiri', 'Upper Subansiri', 'West Siang', 'East Siang', 'Siang', 'Upper Siang', 'Lower Siang', 'Lower Dibang Valley', 'Dibang Valley', 'Anjaw', 'Lohit', 'Namsai', 'Changlang', 'Tirap', 'Longding']
};

const getYearsForEducation = (level: string) => {
  switch (level) {
    case 'PRE_MATRIC':
      return Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: `Class ${i + 1}` }));
    case 'SCHOOL':
      return [
        { value: 11, label: 'Class 11' },
        { value: 12, label: 'Class 12' },
      ];
    case 'DIPLOMA':
      return [
        { value: 1, label: '1st Year' },
        { value: 2, label: '2nd Year' },
        { value: 3, label: '3rd Year' },
      ];
    case 'UG':
      return [
        { value: 1, label: '1st Year' },
        { value: 2, label: '2nd Year' },
        { value: 3, label: '3rd Year' },
        { value: 4, label: '4th Year' },
      ];
    case 'PG':
      return [
        { value: 1, label: '1st Year' },
        { value: 2, label: '2nd Year' },
      ];
    case 'PHD':
      return [
        { value: 1, label: '1st Year' },
        { value: 2, label: '2nd Year' },
        { value: 3, label: '3rd Year' },
        { value: 4, label: '4th Year' },
        { value: 5, label: '5th Year' },
      ];
    default:
      return [{ value: 1, label: '1st Year' }];
  }
};

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { setUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'passport'>('profile');
  const [documents, setDocuments] = useState<StudentDocument[]>([]);

  const [formData, setFormData] = useState<Partial<StudentProfile>>({
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
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const completionPercent = useMemo(() => {
    const requiredFields: (keyof StudentProfile)[] = [
      'fullName', 'state', 'district', 'category', 'annualFamilyIncome', 
      'educationLevel', 'institution', 'course', 'yearOfStudy', 'academicPercentage'
    ];
    let filled = 0;
    for (const field of requiredFields) {
      const val = formData[field];
      if (val !== undefined && val !== null && val !== '') {
        filled++;
      }
    }
    return Math.round((filled / requiredFields.length) * 100);
  }, [formData]);

  useEffect(() => {
    Promise.all([
      studentApi.getProfile(),
      documentApi.list().catch(() => ({ success: false, data: [] }))
    ]).then(([profRes, docsRes]) => {
      if (profRes.success && profRes.data) {
        const p = profRes.data;
        let eduLevel = p.educationLevel || 'UG';
        let yearOfStudy = p.yearOfStudy || 1;
        
        const validYears = getYearsForEducation(eduLevel).map(y => y.value);
        if (!validYears.includes(yearOfStudy)) {
          yearOfStudy = validYears[0];
        }

        setFormData({
          fullName: p.fullName || '',
          dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '',
          gender: p.gender || 'MALE',
          state: p.state || 'Jharkhand',
          district: p.district || 'Ranchi',
          category: p.category || 'ST',
          annualFamilyIncome: p.annualFamilyIncome || 150000,
          educationLevel: eduLevel,
          institution: p.institution || '',
          course: p.course || '',
          yearOfStudy,
          academicPercentage: p.academicPercentage || 60,
          isHosteller: Boolean(p.isHosteller),
          hasDisability: Boolean(p.hasDisability),
          hasBankAccount: p.hasBankAccount !== undefined ? Boolean(p.hasBankAccount) : true,
          previousScholarship: p.previousScholarship || '',
        });
      }

      if (docsRes.success && docsRes.data) {
        setDocuments(docsRes.data);
      }
    }).catch((err) => {
      console.error('Failed to load student profile and documents', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'educationLevel') {
        const validYears = getYearsForEducation(value);
        updated.yearOfStudy = validYears[0].value;
      }
      if (field === 'state') {
        const districts = DISTRICT_MAP[value];
        if (districts && districts.length > 0) {
          updated.district = districts[0];
        } else {
          updated.district = '';
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);
    setErrorMsg(null);

    try {
      const res = await studentApi.updateProfile(formData);
      if (res.success && res.data) {
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

  const districtsForState = formData.state ? DISTRICT_MAP[formData.state] : [];
  const yearOptions = getYearsForEducation(formData.educationLevel || 'UG');

  return (
    <div className="space-y-6 font-body pb-12 max-w-4xl mx-auto">
      {/* Page Title & Completion Header */}
      <div className="bg-surface p-6 rounded-card border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl text-primary-dark">
              {t('profile.title', 'My Profile')}
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified Student
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Manage your personal credentials, academic history, and verifiable scholarship passport.
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

      {/* Navigation Tabs between Profile Details and Scholarship Passport */}
      <div className="flex border-b border-border space-x-2">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('passport')}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'passport'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <BadgeCheck className="w-4 h-4 text-accent" />
          <span>Scholarship Passport & Documents</span>
          <span className="text-[11px] bg-stone-100 text-text-secondary px-2 py-0.2 rounded-full">
            {documents.length}
          </span>
        </button>
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

      {/* TAB 1: PROFILE DETAILS FORM */}
      {activeTab === 'profile' && (
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
                <select
                  required
                  className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none bg-surface focus:border-primary"
                  value={formData.state || ''}
                  onChange={(e) => handleChange('state', e.target.value)}
                >
                  <option value="">Select State / UT</option>
                  {STATES_AND_UTS.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  {t('profile.district', 'District')} *
                </label>
                {districtsForState && districtsForState.length > 0 ? (
                  <select
                    required
                    className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none bg-surface focus:border-primary"
                    value={formData.district || ''}
                    onChange={(e) => handleChange('district', e.target.value)}
                  >
                    <option value="">Select District</option>
                    {districtsForState.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter District Name"
                    className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none focus:border-primary"
                    value={formData.district || ''}
                    onChange={(e) => handleChange('district', e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 2. Education Details */}
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
                  <option value="PRE_MATRIC">Pre-Matric (Class 1-10)</option>
                  <option value="SCHOOL">Senior Secondary (Class 11-12)</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="UG">Undergraduate (UG)</option>
                  <option value="PG">Postgraduate (PG)</option>
                  <option value="PHD">Doctorate (PhD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  {t('profile.course', 'Course / Programme')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., B.Tech Computer Science"
                  className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none focus:border-primary"
                  value={formData.course || ''}
                  onChange={(e) => handleChange('course', e.target.value)}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  {t('profile.institution', 'Institution Name')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Birla Institute of Technology, Mesra"
                  className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none focus:border-primary"
                  value={formData.institution || ''}
                  onChange={(e) => handleChange('institution', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  {t('profile.year_of_study', 'Year / Class of Study')} *
                </label>
                <select
                  className="w-full border border-border rounded-input px-3.5 py-2 text-sm outline-none bg-surface focus:border-primary"
                  value={formData.yearOfStudy || yearOptions[0]?.value}
                  onChange={(e) => handleChange('yearOfStudy', Number(e.target.value))}
                >
                  {yearOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
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

          {/* 3. Community & Financial Criteria */}
          <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <IndianRupee className="w-5 h-5 text-primary" />
              <div>
                <h2 className="font-heading font-bold text-lg text-text-primary">
                  {t('profile.financial', 'Community & Financial Information')}
                </h2>
                <p className="text-xs text-text-muted">
                  Used for means-tested and category-based scholarship matching
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
                <p className="text-[11px] text-text-muted mt-1">{t('profile.why_category', 'Required for welfare schemes.')}</p>
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

          {/* 4. Additional Information (Checkboxes) */}
          <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-lg text-text-primary">
                Additional Information
              </h2>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-3 border border-border rounded-lg bg-stone-50/50 cursor-pointer hover:bg-stone-50">
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

              <label className="flex items-center gap-3 p-3 border border-border rounded-lg bg-stone-50/50 cursor-pointer hover:bg-stone-50">
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

              <label className="flex items-center gap-3 p-3 border border-border rounded-lg bg-stone-50/50 cursor-pointer hover:bg-stone-50">
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
      )}

      {/* TAB 2: SCHOLARSHIP PASSPORT & UPLOADED DOCUMENTS */}
      {activeTab === 'passport' && (
        <div className="space-y-6">
          {/* Verifiable Student ID Card */}
          <div className="bg-surface rounded-card shadow-xs border border-border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <User className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-xl text-primary-dark">
                    {formData.fullName || 'Student'}
                  </h3>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Passport Verified
                  </span>
                </div>
                <p className="text-sm text-text-secondary">
                  {formData.course} • {formData.institution}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-text-muted">
                  <span>Category: <strong className="text-text-primary">{formData.category || 'ST'}</strong></span>
                  <span>•</span>
                  <span>State: <strong className="text-text-primary">{formData.state || 'Jharkhand'}</strong></span>
                  <span>•</span>
                  <span>Academic Score: <strong className="text-primary font-bold">{formData.academicPercentage}%</strong></span>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 border border-border p-3.5 rounded-lg text-center shrink-0 min-w-[150px]">
              <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">
                Verifiable Passport ID
              </span>
              <span className="font-mono text-sm font-bold text-primary block mt-0.5">
                SS-2026-{formData.state?.substring(0, 2).toUpperCase() || 'IN'}-9021
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> State Certified
              </span>
            </div>
          </div>

          {/* Uploaded Documents & Verification Status Section */}
          <div className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
              <div>
                <h3 className="font-heading font-bold text-lg text-text-primary flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Uploaded Documents & Verification Status
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  View your stored credentials and their official verification status.
                </p>
              </div>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-10 bg-stone-50 rounded-lg border border-dashed border-border">
                <FileText className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-text-secondary">No documents uploaded yet</p>
                <p className="text-xs text-text-muted mt-1">
                  Upload your documents in the Document Wallet to display verification status here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-text-muted text-xs uppercase font-bold tracking-wider">
                      <th className="py-3 px-4">Document Type</th>
                      <th className="py-3 px-4">File Name</th>
                      <th className="py-3 px-4">Verification Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {documents.map((doc) => {
                      const isVerified = doc.verificationState === 'VERIFIED';
                      const isRejected = doc.verificationState === 'REJECTED';

                      return (
                        <tr key={doc.id} className="hover:bg-stone-50/50 transition">
                          <td className="py-3.5 px-4 font-semibold text-text-primary">
                            {getTranslatedDocType(doc.documentType)}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-mono text-text-secondary truncate max-w-[200px]">
                            {doc.originalName}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                isVerified
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isRejected
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {isVerified ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : isRejected ? (
                                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                              )}
                              <span>
                                {isVerified
                                  ? 'Verified'
                                  : isRejected
                                  ? 'Rejected'
                                  : 'Under Review'}
                              </span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {doc.url && (
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark hover:underline"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download</span>
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

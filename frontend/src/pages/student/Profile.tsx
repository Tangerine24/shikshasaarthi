import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { studentApi } from '../../api';
import { StudentProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  GraduationCap,
  ShieldCheck,
  BadgeCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  FolderOpen,
  Edit3,
  Save,
  X,
  ExternalLink,
  Award,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Eye,
} from 'lucide-react';

export const STATES_AND_UTS = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 
  'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 
  'West Bengal'
];

export const DISTRICT_MAP: Record<string, string[]> = {
  'Karnataka': [
    'Bengaluru Urban', 'Bengaluru Rural', 'Dakshina Kannada', 'Udupi', 'Mysuru', 'Belagavi', 
    'Dharwad', 'Kalaburagi', 'Ballari', 'Shivamogga', 'Tumakuru', 'Chikkamagaluru', 'Kodagu', 
    'Hassan', 'Mandya', 'Chamarajanagar', 'Ramanagara', 'Kolar', 'Chikkaballapur', 'Davanagere', 
    'Chitradurga', 'Haveri', 'Gadag', 'Bagalkote', 'Vijayapura', 'Raichur', 'Koppal', 'Yadgir', 
    'Bidar', 'Uttara Kannada', 'Vijayanagara'
  ],
  'Jharkhand': [
    'Ranchi', 'Khunti', 'Gumla', 'Simdega', 'Lohardaga', 'West Singhbhum', 'East Singhbhum', 
    'Saraikela Kharsawan', 'Dumka', 'Jamtara', 'Sahebganj', 'Pakur', 'Godda', 'Hazaribagh', 
    'Ramgarh', 'Bokaro', 'Dhanbad', 'Giridih', 'Deoghar', 'Palamu', 'Garhwa', 'Latehar', 
    'Chatra', 'Koderma'
  ],
  'Odisha': [
    'Mayurbhanj', 'Sundargarh', 'Keonjhar', 'Rayagada', 'Koraput', 'Malkangiri', 'Nabarangpur', 
    'Kandhamal', 'Gajapati', 'Kalahandi', 'Nuapada'
  ],
  'Madhya Pradesh': [
    'Jhabua', 'Alirajpur', 'Barwani', 'Dhar', 'Khargone', 'Khandwa', 'Burhanpur', 'Betul', 
    'Chhindwara', 'Seoni', 'Mandla', 'Dindori', 'Balaghat', 'Anuppur', 'Umaria', 'Shahdol', 
    'Sidhi', 'Singrauli'
  ],
  'Chhattisgarh': [
    'Bastar', 'Dantewada', 'Sukma', 'Bijapur', 'Narayanpur', 'Kondagaon', 'Kanker', 'Surguja', 
    'Jashpur', 'Koriya', 'Surajpur', 'Balrampur', 'Raigarh', 'Korba', 'Bilaspur'
  ],
  'Rajasthan': [
    'Banswara', 'Dungarpur', 'Pratapgarh', 'Udaipur', 'Sirohi', 'Rajsamand', 'Chittorgarh', 
    'Pali', 'Baran'
  ],
  'Maharashtra': [
    'Nandurbar', 'Dhule', 'Jalgaon', 'Nashik', 'Palghar', 'Thane', 'Raigad', 'Pune', 
    'Ahmednagar', 'Nanded', 'Amravati', 'Yavatmal', 'Wardha', 'Nagpur', 'Bhandara', 'Gondia', 
    'Chandpur', 'Gadchiroli'
  ],
  'Gujarat': [
    'Dangs', 'Tapi', 'Navsari', 'Valsad', 'Surat', 'Bharuch', 'Narmada', 'Vadodara', 
    'Chhota Udepur', 'Panchmahal', 'Dahod', 'Mahisagar', 'Sabarkantha', 'Aravalli', 'Banaskantha'
  ],
  'West Bengal': [
    'Purulia', 'Bankura', 'Paschim Medinipur', 'Jhargram', 'Jalpaiguri', 'Alipurduar', 
    'Darjeeling', 'Kalimpong', 'Dakshin Dinajpur', 'Uttar Dinajpur', 'Malda'
  ],
  'Assam': [
    'Kokrajhar', 'Chirang', 'Baksa', 'Udalguri', 'Karbi Anglong', 'West Karbi Anglong', 
    'Dima Hasao', 'Goalpara', 'Kamrup', 'Sonitpur', 'Lakhimpur', 'Dhemaji', 'Tinsukia', 
    'Dibrugarh', 'Sivasagar', 'Jorhat', 'Golaghat'
  ]
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
  const { user, setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit toggles for Personal & Academic Information
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingAcademic, setIsEditingAcademic] = useState(false);

  // Certificate Modal State
  const [showCertModal, setShowCertModal] = useState(false);

  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    fullName: 'Ramesh Kumar',
    dateOfBirth: '2004-07-15',
    gender: 'MALE',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    category: 'ST',
    annualFamilyIncome: 150000,
    educationLevel: 'UG',
    institution: 'National Institute of Technology Karnataka (NITK), Surathkal',
    course: 'B.Tech Computer Science & Engineering',
    yearOfStudy: 2,
    academicPercentage: 78.5,
    isHosteller: true,
    hasDisability: false,
    hasBankAccount: true,
    previousScholarship: 'Pre-Matric Tribal Scholarship (Karnataka)',
  });

  // Calculate dynamic completion percentage based on core required fields
  const completionDetails = useMemo(() => {
    const checks = [
      { key: 'fullName', label: 'Full Name', filled: Boolean(formData.fullName) },
      { key: 'state', label: 'State of Domicile', filled: Boolean(formData.state) },
      { key: 'district', label: 'District', filled: Boolean(formData.district) },
      { key: 'category', label: 'Category / Tribe Info', filled: Boolean(formData.category) },
      { key: 'annualFamilyIncome', label: 'Family Income', filled: formData.annualFamilyIncome !== undefined && formData.annualFamilyIncome > 0 },
      { key: 'educationLevel', label: 'Education Level', filled: Boolean(formData.educationLevel) },
      { key: 'course', label: 'Course / Degree', filled: Boolean(formData.course) },
      { key: 'institution', label: 'Institution Name', filled: Boolean(formData.institution) },
      { key: 'academicPercentage', label: 'Academic Performance', filled: Boolean(formData.academicPercentage) },
      { key: 'hasBankAccount', label: 'Aadhaar Bank Account', filled: Boolean(formData.hasBankAccount) },
    ];

    const completedCount = checks.filter((c) => c.filled).length;
    const percent = Math.round((completedCount / checks.length) * 100);
    return { checks, percent, completedCount, totalCount: checks.length };
  }, [formData]);

  useEffect(() => {
    studentApi
      .getProfile()
      .then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          let eduLevel = p.educationLevel || 'UG';
          let year = p.yearOfStudy || 2;
          const validYears = getYearsForEducation(eduLevel).map((y) => y.value);
          if (!validYears.includes(year)) {
            year = validYears[0];
          }

          setFormData({
            fullName: p.fullName || 'Ramesh Kumar',
            dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '2004-07-15',
            gender: p.gender || 'MALE',
            state: p.state || 'Karnataka',
            district: p.district || 'Bengaluru Urban',
            category: p.category || 'ST',
            annualFamilyIncome: p.annualFamilyIncome || 150000,
            educationLevel: eduLevel,
            institution: p.institution || 'National Institute of Technology Karnataka (NITK), Surathkal',
            course: p.course || 'B.Tech Computer Science & Engineering',
            yearOfStudy: year,
            academicPercentage: p.academicPercentage || 78.5,
            isHosteller: Boolean(p.isHosteller),
            hasDisability: Boolean(p.hasDisability),
            hasBankAccount: p.hasBankAccount !== undefined ? Boolean(p.hasBankAccount) : true,
            previousScholarship: p.previousScholarship || 'Pre-Matric Tribal Scholarship (Karnataka)',
          });
        }
      })
      .catch((err) => {
        console.error('Failed to load profile data', err);
      })
      .finally(() => {
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

  const handleSave = async (section: 'personal' | 'academic') => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await studentApi.updateProfile(formData);
      if (res.success && res.data) {
        setSuccessMsg(
          section === 'personal'
            ? 'Personal information saved successfully!'
            : 'Academic details updated successfully!'
        );
        if (res.data.user) {
          setUser(res.data.user);
        }
        if (section === 'personal') setIsEditingPersonal(false);
        if (section === 'academic') setIsEditingAcademic(false);
        setTimeout(() => setSuccessMsg(null), 3500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-sm text-text-muted">
        {t('common.loading', 'Loading profile...')}
      </div>
    );
  }

  const districtsForState = formData.state ? DISTRICT_MAP[formData.state] || [] : [];
  const yearOptions = getYearsForEducation(formData.educationLevel || 'UG');

  return (
    <div className="space-y-6 font-body pb-16 max-w-4xl mx-auto">
      {/* Messages */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm rounded-lg flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm rounded-lg flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: PROFILE HEADER
          ========================================================================= */}
      <section className="bg-surface rounded-card border border-border p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
          {/* Avatar with fallback */}
          <div className="relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
              alt={formData.fullName || 'Student Avatar'}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary/20 shadow-xs"
              onError={(e) => {
                // Fallback to initial avatar if image fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl sm:text-2xl border-2 border-primary/20 hidden">
              {formData.fullName?.[0]?.toUpperCase() || 'S'}
            </div>
            <span
              className="absolute -bottom-1 -right-1 bg-emerald-600 text-surface p-1 rounded-full border-2 border-surface shadow-xs"
              title="Verified Identity"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Student Info */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading font-bold text-xl sm:text-2xl text-primary-dark">
                {formData.fullName || 'Ramesh Kumar'}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                ST Student
              </span>
            </div>

            <p className="text-sm font-medium text-text-primary">
              {formData.course || 'B.Tech Computer Science & Engineering'} • {formData.yearOfStudy ? `${formData.yearOfStudy}${formData.yearOfStudy === 1 ? 'st' : formData.yearOfStudy === 2 ? 'nd' : formData.yearOfStudy === 3 ? 'rd' : 'th'} Year` : '2nd Year'}
            </p>

            <p className="text-xs text-text-secondary flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span>
                {formData.institution || 'National Institute of Technology Karnataka (NITK), Surathkal'} • {formData.state || 'Karnataka'}
              </span>
            </p>
          </div>
        </div>

        {/* Verification Status Pill */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Profile Verified
          </span>
          <span className="text-[11px] text-text-muted mt-1 font-mono">
            ID: SS-KA-{user?.email?.split('@')[0].toUpperCase() || '2026'}
          </span>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: PROFILE COMPLETION
          ========================================================================= */}
      <section className="bg-surface rounded-card border border-border p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-sm sm:text-base text-text-primary">
                Profile Completion
              </h2>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {completionDetails.percent}% Completed
              </span>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {completionDetails.completedCount} of {completionDetails.totalCount} essential attributes completed & verified
            </p>
          </div>

          <div className="w-full sm:w-48 bg-stone-100 h-2 rounded-full overflow-hidden border border-border">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${completionDetails.percent}%` }}
            />
          </div>
        </div>

        {/* Lightweight attribute checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-border text-[11px]">
          {completionDetails.checks.map((c) => (
            <div
              key={c.key}
              className={`flex items-center gap-1.5 p-1.5 rounded transition ${
                c.filled ? 'text-emerald-800 bg-emerald-50/60' : 'text-amber-800 bg-amber-50/60'
              }`}
            >
              {c.filled ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              )}
              <span className="truncate font-medium">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: PERSONAL INFORMATION
          ========================================================================= */}
      <section className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-bold text-base text-text-primary">
              Personal Information
            </h2>
          </div>

          <div>
            {isEditingPersonal ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingPersonal(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-text-secondary hover:bg-stone-100 transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave('personal')}
                  className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-primary text-surface hover:bg-primary-dark transition flex items-center gap-1 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingPersonal(true)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-primary hover:bg-primary/10 transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
        </div>

        {isEditingPersonal ? (
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">
                Full Name *
              </label>
              <input
                type="text"
                className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none focus:border-primary"
                value={formData.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">
                Gender
              </label>
              <select
                className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none bg-surface focus:border-primary"
                value={formData.gender || 'MALE'}
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none focus:border-primary"
                value={formData.dateOfBirth || ''}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                className="w-full border border-border rounded-input px-3 py-2 text-sm bg-stone-50 text-text-muted cursor-not-allowed"
                value={user?.email || 'student@demo.shikshasaarthi.in'}
              />
            </div>

            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">
                State of Domicile *
              </label>
              <select
                className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none bg-surface focus:border-primary"
                value={formData.state || ''}
                onChange={(e) => handleChange('state', e.target.value)}
              >
                <option value="">Select State / UT</option>
                {STATES_AND_UTS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">
                District *
              </label>
              {districtsForState && districtsForState.length > 0 ? (
                <select
                  className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none bg-surface focus:border-primary"
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
                  placeholder="Enter District Name"
                  className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none focus:border-primary"
                  value={formData.district || ''}
                  onChange={(e) => handleChange('district', e.target.value)}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
              <span className="text-text-muted block text-[11px] mb-0.5">Full Name</span>
              <span className="font-semibold text-text-primary text-sm">{formData.fullName || '—'}</span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
              <span className="text-text-muted block text-[11px] mb-0.5">Date of Birth</span>
              <span className="font-semibold text-text-primary text-sm">
                {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '15 Jul 2004'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
              <span className="text-text-muted block text-[11px] mb-0.5">Gender</span>
              <span className="font-semibold text-text-primary text-sm capitalize">{formData.gender?.toLowerCase() || 'Male'}</span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
              <span className="text-text-muted block text-[11px] mb-0.5">Mobile Contact</span>
              <span className="font-semibold text-text-primary text-sm">+91 98450 12891</span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
              <span className="text-text-muted block text-[11px] mb-0.5">Email Address</span>
              <span className="font-semibold text-text-primary text-sm truncate block" title={user?.email || ''}>
                {user?.email || 'student@demo.shikshasaarthi.in'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
              <span className="text-text-muted block text-[11px] mb-0.5">State & District</span>
              <span className="font-semibold text-text-primary text-sm">
                {formData.district ? `${formData.district}, ` : ''}{formData.state || 'Karnataka'}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 4: ACADEMIC INFORMATION
          ========================================================================= */}
      <section className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-base text-text-primary">
                Academic Information
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified (APAAR)
              </span>
            </div>
          </div>

          <div>
            {isEditingAcademic ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingAcademic(false)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold text-text-secondary hover:bg-stone-100 transition flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave('academic')}
                  className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-primary text-surface hover:bg-primary-dark transition flex items-center gap-1 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingAcademic(true)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-primary hover:bg-primary/10 transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
        </div>

        {isEditingAcademic ? (
          <div className="grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">
                Education Level *
              </label>
              <select
                className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none bg-surface focus:border-primary"
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
              <label className="block font-semibold text-text-secondary uppercase mb-1">
                Course / Branch *
              </label>
              <input
                type="text"
                className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none focus:border-primary"
                value={formData.course || ''}
                onChange={(e) => handleChange('course', e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">
                Year / Class of Study *
              </label>
              <select
                className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none bg-surface focus:border-primary"
                value={formData.yearOfStudy || yearOptions[0]?.value}
                onChange={(e) => handleChange('yearOfStudy', Number(e.target.value))}
              >
                {yearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">
                Academic Percentage / CGPA (%) *
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none focus:border-primary"
                value={formData.academicPercentage || ''}
                onChange={(e) => handleChange('academicPercentage', Number(e.target.value))}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-text-secondary uppercase mb-1">
                Institution Name *
              </label>
              <input
                type="text"
                className="w-full border border-border rounded-input px-3 py-2 text-sm outline-none focus:border-primary"
                value={formData.institution || ''}
                onChange={(e) => handleChange('institution', e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
              <span className="text-text-muted block text-[11px] mb-0.5">Education Level</span>
              <span className="font-semibold text-text-primary text-sm">
                {formData.educationLevel === 'PRE_MATRIC'
                  ? 'Pre-Matric (Class 1-10)'
                  : formData.educationLevel === 'SCHOOL'
                  ? 'Senior Secondary (11-12)'
                  : formData.educationLevel === 'DIPLOMA'
                  ? 'Diploma'
                  : formData.educationLevel === 'UG'
                  ? 'Undergraduate (UG)'
                  : formData.educationLevel === 'PG'
                  ? 'Postgraduate (PG)'
                  : formData.educationLevel === 'PHD'
                  ? 'Doctorate (PhD)'
                  : formData.educationLevel || 'UG'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
              <span className="text-text-muted block text-[11px] mb-0.5">Course / Branch</span>
              <span className="font-semibold text-text-primary text-sm truncate block" title={formData.course || ''}>
                {formData.course || 'B.Tech Computer Science & Engineering'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
              <span className="text-text-muted block text-[11px] mb-0.5">Current Standing</span>
              <span className="font-semibold text-text-primary text-sm">
                {formData.yearOfStudy ? `${formData.yearOfStudy}${formData.yearOfStudy === 1 ? 'st' : formData.yearOfStudy === 2 ? 'nd' : formData.yearOfStudy === 3 ? 'rd' : 'th'} Year (Sem IV)` : '2nd Year (Sem IV)'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70 sm:col-span-2">
              <span className="text-text-muted block text-[11px] mb-0.5">Enrolled Institution</span>
              <span className="font-semibold text-text-primary text-sm truncate block" title={formData.institution || ''}>
                {formData.institution || 'National Institute of Technology Karnataka (NITK), Surathkal'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
              <span className="text-text-muted block text-[11px] mb-0.5">Academic Score / CGPA</span>
              <span className="font-semibold text-primary text-sm">
                {formData.academicPercentage}% <span className="text-text-muted font-normal text-xs">({((formData.academicPercentage || 78.5) / 10).toFixed(2)} CGPA)</span>
              </span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
              <span className="text-text-muted block text-[11px] mb-0.5">Enrollment / Roll No.</span>
              <span className="font-mono font-semibold text-text-primary text-sm">24BTECH089</span>
            </div>

            <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70 sm:col-span-2">
              <span className="text-text-muted block text-[11px] mb-0.5">Board / University Record</span>
              <span className="font-semibold text-text-primary text-sm">
                NITK Deemed University • AISHE Code: U-0214
              </span>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 5: ST / CATEGORY INFORMATION
          ========================================================================= */}
      <section className="bg-surface rounded-card border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-bold text-base text-text-primary">
                ST / Category Information
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Record
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCertModal(true)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold text-primary hover:bg-primary/10 transition flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" /> View Certificate
          </button>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
            <span className="text-text-muted block text-[11px] mb-0.5">Constitutional Category</span>
            <span className="font-bold text-text-primary text-sm">Scheduled Tribe (ST)</span>
          </div>

          <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
            <span className="text-text-muted block text-[11px] mb-0.5">Tribe / Sub-Community</span>
            <span className="font-semibold text-text-primary text-sm">Naikda (Schedule Tribe)</span>
          </div>

          <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
            <span className="text-text-muted block text-[11px] mb-0.5">Certificate Number</span>
            <span className="font-mono font-bold text-text-primary text-sm tracking-wide">
              KA-ST-****8921
            </span>
          </div>

          <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
            <span className="text-text-muted block text-[11px] mb-0.5">Issuing Authority</span>
            <span className="font-semibold text-text-primary text-sm">
              Tahsildar / SDO, Bengaluru Urban
            </span>
          </div>

          <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
            <span className="text-text-muted block text-[11px] mb-0.5">Validity Status</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Permanent / Lifetime
            </span>
          </div>

          <div className="p-3 rounded-lg bg-stone-50/60 border border-border/70">
            <span className="text-text-muted block text-[11px] mb-0.5">Digital Verification Source</span>
            <span className="font-semibold text-text-primary text-sm">
              Karnataka Revenue e-District & DigiLocker
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: ACTION REQUIRED
          ========================================================================= */}
      <section className="bg-emerald-50/80 border border-emerald-200 rounded-card p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-emerald-950 flex items-center gap-1.5">
              Your profile is up to date
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5">
              All essential personal, academic, and category verification records are verified. No further action is required for scholarship applications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          <Link
            to="/student/documents"
            className="flex-1 sm:flex-initial text-center px-3.5 py-2 rounded-md bg-surface text-text-primary border border-border text-xs font-semibold hover:bg-stone-50 transition shadow-2xs flex items-center justify-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5 text-text-muted" /> Document Wallet
          </Link>
          <Link
            to="/student/verification"
            className="flex-1 sm:flex-initial text-center px-3.5 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-surface text-xs font-semibold transition shadow-2xs flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Verification Center
          </Link>
        </div>
      </section>

      {/* =========================================================================
          MODAL: VIEW CERTIFICATE PREVIEW
          ========================================================================= */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-surface rounded-card border border-border shadow-lg max-w-md w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-bold text-base text-primary-dark">
                  ST Caste Certificate
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-50 border border-border rounded-lg p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-text-muted">Certificate No:</span>
                <span className="font-mono font-bold text-text-primary">KA-ST-2023-849208921</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-text-muted">Beneficiary Name:</span>
                <span className="font-semibold text-text-primary">{formData.fullName || 'Ramesh Kumar'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-text-muted">Recognized Community:</span>
                <span className="font-semibold text-text-primary">Naikda (Scheduled Tribe)</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-text-muted">Issuing Authority:</span>
                <span className="font-semibold text-text-primary">Tahsildar, Bengaluru Urban</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="text-text-muted">Issuance Date:</span>
                <span className="text-text-primary">12-Jun-2023</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Digital Signature:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CCA-GOV-INDIA Verified
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                to="/student/documents"
                onClick={() => setShowCertModal(false)}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <FolderOpen className="w-3.5 h-3.5" /> Open in Document Wallet
              </Link>
              <button
                type="button"
                onClick={() => setShowCertModal(false)}
                className="px-4 py-2 rounded-md bg-stone-100 hover:bg-stone-200 text-text-primary text-xs font-semibold transition"
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

export default Profile;

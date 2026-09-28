import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { notificationApi, studentApi } from '../../api';
import { StudentProfile } from '../../types';
import { WhatsAppAvatar } from '../ui/WhatsAppAvatar';
import {
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  FolderOpen,
  MessageSquareHeart,
  UserCheck,
  Bell,
  LogOut,
  Building2,
  Shield,
  ShieldCheck,
  Milestone,
  Menu,
  X,
  User,
  ChevronDown,
  CheckCircle2,
  MapPin,
  ExternalLink,
} from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export const AppShell: React.FC<Props> = ({ children }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      notificationApi
        .list()
        .then((res) => {
          if (res.success && res.data) {
            setUnreadCount(res.data.unreadCount || 0);
          }
        })
        .catch(() => {});

      studentApi
        .getProfile()
        .then((res) => {
          if (res.success && res.data) {
            setProfile(res.data);
          }
        })
        .catch(() => {});
    }
  }, [user, location.pathname]);

  // Close menus on page navigation
  useEffect(() => {
    setProfilePopoverOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for profile popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setProfilePopoverOpen(false);
      }
    };
    if (profilePopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profilePopoverOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  interface NavItem {
    to: string;
    icon: any;
    label: string;
    badge?: number;
  }

  const studentNav: NavItem[] = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: t('nav.overview', 'Overview') },
    { to: '/student/eligibility-roadmap', icon: Milestone, label: t('nav.eligibility_roadmap', 'Eligibility Roadmap') },
    { to: '/student/scholarships', icon: GraduationCap, label: t('nav.scholarships', 'Scholarships') },
    { to: '/student/applications', icon: FileCheck2, label: t('nav.applications', 'Applications') },
    { to: '/student/documents', icon: FolderOpen, label: t('nav.documents', 'Document Wallet') },
    { to: '/student/verification', icon: ShieldCheck, label: 'Verification Center' },
    { to: '/student/jago', icon: MessageSquareHeart, label: t('nav.jago', 'JAGO Assistant') },
    { to: '/student/profile', icon: UserCheck, label: t('nav.profile', 'My Profile') },
    {
      to: '/student/notifications',
      icon: Bell,
      label: t('nav.notifications', 'Notifications'),
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
  ];

  const providerNav: NavItem[] = [
    { to: '/provider/dashboard', icon: LayoutDashboard, label: t('nav.overview', 'Overview') },
    { to: '/provider/scholarships', icon: GraduationCap, label: t('nav.scholarships', 'Scholarships') },
    { to: '/provider/applications', icon: FileCheck2, label: t('nav.applicant_review', 'Applicant Review') },
  ];

  const adminNav: NavItem[] = [
    { to: '/admin/dashboard', icon: Shield, label: t('nav.admin', 'Administration') },
  ];

  const currentNav: NavItem[] =
    user?.role === 'PROVIDER'
      ? providerNav
      : user?.role === 'ADMIN'
      ? adminNav
      : studentNav;

  const displayName = profile?.fullName || (user?.email?.split('@')[0] ? 'Ramesh Kumar' : 'Student');
  const userInstitution = profile?.institution || 'Birla Institute of Technology, Mesra';
  const userState = profile?.state || 'Jharkhand';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo & Header */}
          <div className="p-5 border-b border-border">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-surface flex items-center justify-center font-heading font-bold text-base shadow-sm">
                SS
              </div>
              <div>
                <h1 className="font-heading font-bold text-base text-primary leading-tight">ShikshaSaarthi</h1>
                <p className="text-[10px] text-text-muted font-medium">Unified Scholarship Portal</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary text-surface shadow-sm font-semibold'
                      : 'text-text-secondary hover:bg-stone-100 hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-accent text-surface text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout in Sidebar */}
        <div className="p-3 border-t border-border bg-stone-50/50">
          <div
            onClick={() => setProfilePopoverOpen(!profilePopoverOpen)}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-stone-100 cursor-pointer transition"
            title="Click to view profile details"
          >
            <div className="relative shrink-0">
              <WhatsAppAvatar size="sm" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-surface" />
            </div>

            <div className="truncate flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{displayName}</p>
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                  {user?.role === 'STUDENT' ? 'ST Student' : user?.role}
                </span>
                <span className="text-[10px] text-text-muted truncate">• {userState}</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title={t('nav.sign_out', 'Sign Out')}
              className="p-1.5 text-text-muted hover:text-danger rounded hover:bg-stone-200 transition shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-surface border-b border-border px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
          {/* Top Left Area */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Quick Profile Button on Top Left (Works on both desktop & mobile) */}
            <button
              type="button"
              onClick={() => setProfilePopoverOpen(!profilePopoverOpen)}
              className="flex items-center gap-2.5 p-1 sm:px-2 sm:py-1 rounded-lg hover:bg-stone-100 transition text-left"
              title="Click to view profile details"
            >
              <div className="relative shrink-0">
                <WhatsAppAvatar size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-surface" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-semibold text-text-primary block leading-tight">
                  {displayName}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">
                  {user?.role === 'STUDENT' ? `ST Student • ${userState}` : user?.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:block" />
            </button>

            <div className="hidden lg:block pl-2 border-l border-border">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                ShikshaSaarthi
              </span>
              <span className="text-xs text-text-muted ml-2">| Unified Scholarship Assistance Platform</span>
            </div>
          </div>

          {/* Top Right Area */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            {user?.role === 'STUDENT' && (
              <Link
                to="/student/notifications"
                className="relative p-2 text-text-secondary hover:text-primary transition rounded-full hover:bg-stone-100"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
                )}
              </Link>
            )}

            {/* Avatar Button on Top Right as well */}
            <div className="relative pl-1 border-l border-border">
              <button
                type="button"
                onClick={() => setProfilePopoverOpen(!profilePopoverOpen)}
                className="rounded-full hover:ring-2 hover:ring-primary/20 transition flex items-center justify-center"
                title="View Profile Details"
              >
                <WhatsAppAvatar size="sm" />
              </button>
            </div>
          </div>
        </header>

        {/* User Profile Brief Popover Dropdown */}
        {profilePopoverOpen && (
          <div
            ref={popoverRef}
            className="absolute top-16 left-4 sm:left-6 z-50 w-80 bg-surface rounded-card border border-border shadow-lg p-5 space-y-4 animate-fadeIn"
          >
            {/* Popover Header */}
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <WhatsAppAvatar size="md" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-sm text-primary-dark truncate">
                    {displayName}
                  </h3>
                  <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ST Student • {userState}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfilePopoverOpen(false)}
                className="text-text-muted hover:text-text-primary p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Details */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-stone-50 border border-border/60 space-y-1">
                <div className="flex items-center gap-1.5 text-text-secondary font-medium">
                  <Building2 className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span className="truncate">{userInstitution}</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                  <GraduationCap className="w-3.5 h-3.5 text-text-muted shrink-0" />
                  <span className="truncate">
                    {profile?.course || 'B.Tech Computer Science & Engineering'} • {profile?.yearOfStudy ? `Semester ${profile.yearOfStudy} (2nd Year)` : 'Semester 4 (2nd Year)'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] px-1 text-text-muted">
                <span>Verification Status:</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Certified
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-border space-y-2">
              <Link
                to="/student/profile"
                onClick={() => setProfilePopoverOpen(false)}
                className="w-full py-2 px-3 rounded-md bg-primary text-surface hover:bg-primary-dark transition text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <UserCheck className="w-3.5 h-3.5" /> View Full Profile
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/student/documents"
                  onClick={() => setProfilePopoverOpen(false)}
                  className="py-1.5 px-2 rounded-md border border-border text-text-secondary hover:bg-stone-50 transition text-[11px] font-semibold text-center"
                >
                  Document Wallet
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setProfilePopoverOpen(false);
                    handleLogout();
                  }}
                  className="py-1.5 px-2 rounded-md border border-red-200 text-danger hover:bg-red-50 transition text-[11px] font-semibold flex items-center justify-center gap-1"
                >
                  <LogOut className="w-3 h-3" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-b border-border p-3 space-y-1 z-30">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                    isActive ? 'bg-primary text-surface font-semibold' : 'text-text-secondary hover:bg-stone-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="bg-accent text-surface text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-md mt-2 font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('nav.sign_out', 'Sign Out')}</span>
            </button>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

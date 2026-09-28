import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { notificationApi } from '../../api';
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

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      notificationApi.list().then((res) => {
        if (res.success && res.data) {
          setUnreadCount(res.data.unreadCount || 0);
        }
      }).catch(() => {});
    }
  }, [user, location.pathname]);

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

        {/* User Card & Logout */}
        <div className="p-4 border-t border-border bg-stone-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="truncate pr-2">
              <p className="text-xs font-semibold text-text-primary truncate">{user?.email}</p>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title={t('nav.sign_out', 'Sign Out')}
              className="p-1.5 text-text-muted hover:text-danger rounded hover:bg-stone-200 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-surface border-b border-border px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                ShikshaSaarthi
              </span>
              <span className="text-xs text-text-muted ml-2">| Unified Scholarship Assistance Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />

            {user?.role === 'STUDENT' && (
              <Link
                to="/student/notifications"
                className="relative p-2 text-text-secondary hover:text-primary transition rounded-full hover:bg-stone-100"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
                )}
              </Link>
            )}

            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {user?.email?.[0].toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

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

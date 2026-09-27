import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { ShieldCheck, User, Building2, Shield, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'PROVIDER') {
        navigate('/provider/dashboard');
      } else if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('auth.error_invalid', 'Invalid credentials.'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@1234');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-body">
      <header className="flex justify-between items-center p-4 sm:p-6 max-w-6xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-surface flex items-center justify-center font-heading font-bold text-sm">
            SS
          </div>
          <span className="font-heading font-bold text-primary text-lg">ShikshaSaarthi</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-surface p-6 sm:p-8 rounded-card shadow-sm border border-border w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-heading font-bold text-primary-dark">
              {t('auth.sign_in', 'Sign In')}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {t('auth.sign_in_subtitle', 'Unified Scholarship Assistance Platform for Tribal Students')}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('auth.email', 'Email Address')}
              </label>
              <input
                type="email"
                required
                className="w-full border border-border rounded-input px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                {t('auth.password', 'Password')}
              </label>
              <input
                type="password"
                required
                className="w-full border border-border rounded-input px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-surface py-2.5 rounded-input font-semibold text-sm transition shadow-sm disabled:opacity-50"
            >
              {loading ? t('auth.signing_in', 'Signing in...') : t('auth.sign_in', 'Sign In')}
            </button>
          </form>

          {/* One-click Demo Credentials Helper Box */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>{t('auth.demo_credentials', 'One-Click Demo Credentials')}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('student@demo.shikshasaarthi.in')}
                className="p-2 text-left rounded border border-border hover:bg-stone-50 transition"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-primary">
                  <User className="w-3 h-3" />
                  <span>{t('login_extra.student_label')}</span>
                </div>
                <span className="text-[10px] text-text-muted block mt-0.5">{t('login_extra.student_name')}</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('provider@demo.shikshasaarthi.in')}
                className="p-2 text-left rounded border border-border hover:bg-stone-50 transition"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-primary">
                  <Building2 className="w-3 h-3" />
                  <span>{t('login_extra.provider_label')}</span>
                </div>
                <span className="text-[10px] text-text-muted block mt-0.5">{t('login_extra.provider_name')}</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('admin@demo.shikshasaarthi.in')}
                className="p-2 text-left rounded border border-border hover:bg-stone-50 transition"
              >
                <div className="flex items-center gap-1 text-[11px] font-bold text-primary">
                  <Shield className="w-3 h-3" />
                  <span>{t('login_extra.admin_label')}</span>
                </div>
                <span className="text-[10px] text-text-muted block mt-0.5">{t('login_extra.admin_name')}</span>
              </button>
            </div>
            <p className="text-[10px] text-text-muted text-center mt-2">
              {t('login_extra.password_note')} <code className="font-mono font-semibold">Demo@1234</code>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;

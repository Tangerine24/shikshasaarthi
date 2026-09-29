import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email || 'student@demo.shikshasaarthi.in', password || 'Demo@1234');
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

  const handleGoogleAuth = () => {
    // Simulated realistic Google Auth flow
    setLoading(true);
    setTimeout(async () => {
      try {
        await login('student@demo.shikshasaarthi.in', 'Demo@1234');
        navigate('/student/dashboard');
      } catch {
        setError('Google sign-in could not be completed. Please try with email.');
      } finally {
        setLoading(false);
      }
    }, 800);
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
              {isSignUp ? 'Create Your Account' : 'Sign In'}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              {isSignUp
                ? 'Sign up to discover and apply for scholarships'
                : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required={isSignUp}
                  className="w-full border border-border rounded-input px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Username or Email Address
              </label>
              <input
                type="text"
                required
                className="w-full border border-border rounded-input px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                placeholder="Enter any username or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
                Password
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
              {loading
                ? isSignUp
                  ? 'Creating Account...'
                  : 'Signing in...'
                : isSignUp
                ? 'Sign Up'
                : 'Sign In'}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-text-muted text-xs font-medium">OR</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-white border border-border hover:bg-stone-50 text-text-primary py-2.5 rounded-input font-semibold text-sm transition shadow-xs flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-sm text-text-secondary">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-primary hover:underline font-semibold"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;

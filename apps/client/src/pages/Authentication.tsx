import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export default function Authentication() {
  const [formType, setFormType] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  function validate(): string | null {
    if (!email.trim()) return 'Email is required.';
    if (!EMAIL_REGEX.test(email.trim()))
      return 'Please enter a valid email address.';
    if (!password) return 'Password is required.';
    if (password.length < MIN_PASSWORD_LENGTH)
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (formType === 'register' && !name.trim())
      return 'Name is required.';
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      if (formType === 'register') {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  function switchForm(type: 'login' | 'register') {
    setFormType(type);
    setError(null);
  }

  const spinner = (
    <span className="material-symbols-outlined text-[20px] animate-spin">
      progress_activity
    </span>
  );

  return (
    <div className="h-full flex items-center justify-center p-4 md:p-8 ambient-bg">
      {/* Main Container */}
      <div className="w-full max-w-[1000px] grid md:grid-cols-2 gap-8 items-center bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_rgba(11,28,48,0.06)] border border-outline-variant overflow-hidden h-[600px] relative">
        {/* Left Side: Branding/Imagery Area */}
        <div className="hidden md:flex flex-col h-full bg-surface-container-low p-8 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-primary text-[32px]">fact_check</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold">AssessMaster</span>
              </div>
              <h1 className="font-display-lg text-display-lg text-on-surface mb-4">Master Your<br />Assessments.</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
                A systematic, transparent platform engineered for complex hierarchical data and linear workflow management.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-surface-container-lowest/60 p-4 rounded-lg backdrop-blur-sm border border-white/50">
                <span className="material-symbols-outlined text-secondary">verified</span>
                <span className="font-label-lg text-label-lg text-on-surface">Authoritative Data Structuring</span>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-lowest/60 p-4 rounded-lg backdrop-blur-sm border border-white/50">
                <span className="material-symbols-outlined text-secondary">architecture</span>
                <span className="font-label-lg text-label-lg text-on-surface">Cognitive Architecture</span>
              </div>
            </div>
          </div>
          {/* Abstract subtle decorative element mimicking data structures */}
          <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
            <svg className="w-full h-full fill-primary" viewBox="0 0 100 100">
              <path d="M10,10 h20 v20 h-20 z M40,10 h50 v20 h-50 z M10,40 h20 v20 h-20 z M40,40 h50 v20 h-50 z M10,70 h20 v20 h-20 z M40,70 h50 v20 h-50 z"></path>
            </svg>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="w-full max-w-md mx-auto p-8 h-full flex flex-col justify-center relative">
          {/* Mobile Brand Header */}
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <span className="material-symbols-outlined text-primary text-[28px]">fact_check</span>
            <span className="font-headline-sm text-headline-sm text-primary font-bold">AssessMaster</span>
          </div>

          {/* Form Toggle Tabs */}
          <div className="flex border-b border-outline-variant mb-8 w-full">
            <button
              className={`flex-1 pb-3 text-center font-label-lg text-label-lg transition-colors ${formType === 'login' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
              onClick={() => switchForm('login')}
              type="button"
            >
              Log In
            </button>
            <button
              className={`flex-1 pb-3 text-center font-label-lg text-label-lg transition-colors ${formType === 'register' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'}`}
              onClick={() => switchForm('register')}
              type="button"
            >
              Register
            </button>
          </div>

          {/* Shared error banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2 bg-error-container/10 border border-error/30 text-error rounded px-3 py-2 font-label-md text-label-md">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form className={`space-y-6 ${formType === 'login' ? 'block' : 'hidden'}`} onSubmit={handleSubmit}>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Welcome Back</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Enter your credentials to access your workspace.</p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="login-email">Email Address</label>
                <div className="relative input-glow rounded transition-all">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-on-surface focus:outline-none focus:ring-0"
                    id="login-email"
                    placeholder="name@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="login-password">Password</label>
                  <a className="font-label-sm text-label-sm text-primary hover:underline" href="#">Forgot Password?</a>
                </div>
                <div className="relative input-glow rounded transition-all">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                  <input
                    className="w-full pl-10 pr-10 py-2 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-on-surface focus:outline-none focus:ring-0"
                    id="login-password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>
            </div>
            <button
              className="w-full bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg py-3 rounded shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="submit"
              disabled={submitting}
            >
              {submitting && spinner}
              Sign In to Workspace
            </button>
          </form>

          {/* Registration Form */}
          <form className={`space-y-6 ${formType === 'register' ? 'block' : 'hidden'}`} onSubmit={handleSubmit}>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Create Account</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Set up your professional suite profile.</p>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="reg-name">Full Name</label>
                <div className="relative input-glow rounded transition-all">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-on-surface focus:outline-none focus:ring-0"
                    id="reg-name"
                    placeholder="Jane Doe"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="reg-email">Work Email</label>
                <div className="relative input-glow rounded transition-all">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-on-surface focus:outline-none focus:ring-0"
                    id="reg-email"
                    placeholder="jane@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="reg-password">Password</label>
                <div className="relative input-glow rounded transition-all">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                  <input
                    className="w-full pl-10 pr-10 py-2 bg-surface-container-lowest border border-outline-variant rounded font-body-md text-on-surface focus:outline-none focus:ring-0"
                    id="reg-password"
                    placeholder="Create a strong password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </div>
            <button
              className="w-full bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg py-3 rounded shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              type="submit"
              disabled={submitting}
            >
              {submitting && spinner}
              Register Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

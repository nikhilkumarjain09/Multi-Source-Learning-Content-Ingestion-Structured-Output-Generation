import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { AuthCard } from './AuthCard';
import { AuthInput } from './AuthInput';
import { AuthFooter } from './AuthFooter';
import { BrandHeader } from '../branding/BrandHeader';
import { BRANDING } from '../../config/branding';

interface LoginViewProps {
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
  embedded?: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onNavigateToSignup,
  onNavigateToForgotPassword,
  embedded = false,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (val: string) => {
    const clean = val.trim();
    if (!clean) {
      setEmailError('Email address is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clean)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePass = (val: string) => {
    if (!val) {
      setPassError('Password is required.');
      return false;
    }
    setPassError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const isEmailValid = validateEmail(email);
    const isPassValid = validatePass(password);

    if (!isEmailValid || !isPassValid) return;

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setGlobalError(result.error || 'Invalid email address or password.');
    }
  };

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        {/* Brand Header */}
        <BrandHeader title={`Sign in to ${BRANDING.APP_NAME}`} subtitle={BRANDING.APP_TAGLINE} compact />

        {/* Global Error Banner */}
        {globalError && (
          <div
            role="alert"
            style={{
              backgroundColor: 'var(--error-glow)',
              border: '1px solid var(--error)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '0.5rem 0.75rem',
              fontSize: '12px',
              color: 'var(--error)',
              marginBottom: '0.65rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{globalError}</span>
          </div>
        )}

        {/* Form Controls */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <AuthInput
            id="login-email"
            label="Work Email Address"
            type="email"
            value={email}
            onChange={(val) => {
              setEmail(val);
              if (emailError) validateEmail(val);
            }}
            onBlur={() => validateEmail(email)}
            placeholder="name@company.com"
            icon={<Mail size={15} />}
            error={emailError}
            isValid={!!email && !emailError}
            autoComplete="email"
          />

          <div>
            <AuthInput
              id="login-password"
              label="Security Password"
              type="password"
              value={password}
              onChange={(val) => {
                setPassword(val);
                if (passError) validatePass(val);
              }}
              onBlur={() => validatePass(password)}
              placeholder="••••••••"
              icon={<Lock size={15} />}
              error={passError}
              autoComplete="current-password"
              showCapsLockWarning
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
              <button
                type="button"
                onClick={onNavigateToForgotPassword}
                style={{
                  fontSize: '11px',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              Remember device session
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', fontSize: '12px', fontWeight: 600, marginTop: '0.25rem' }}
          >
            {loading ? <RefreshCw size={16} className="spinner" /> : <span>Sign In to Workspace</span>}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        {/* Switch to Signup Prompt */}
        <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <button
            onClick={onNavigateToSignup}
            style={{ color: 'var(--accent)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Create account
          </button>
        </div>
      </div>

      <AuthFooter />
    </div>
  );

  if (embedded) return content;
  return <AuthCard>{content}</AuthCard>;
};

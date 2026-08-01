import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { AuthCard } from './AuthCard';
import { AuthInput } from './AuthInput';
import { AuthFooter } from './AuthFooter';
import { BrandHeader } from '../branding/BrandHeader';
import { BRANDING } from '../../config/branding';

interface ForgotPasswordViewProps {
  onNavigateToLogin: () => void;
  embedded?: boolean;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onNavigateToLogin, embedded = false }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setMessage(null);

    if (!validateEmail(email)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setMessage(data.message || 'If an account exists, a password reset link has been sent. Please check your inbox and Spam/Junk folder.');
      } else {
        setGlobalError(data.error || 'Failed to send password reset email.');
      }
    } catch {
      setLoading(false);
      setGlobalError('Network error. Please try again.');
    }
  };

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        <BrandHeader title={`Reset ${BRANDING.APP_NAME} Password`} subtitle="Enter account email to receive 6-digit OTP code" compact />

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
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{globalError}</span>
          </div>
        )}

        {message && (
          <div
            style={{
              backgroundColor: 'var(--success-glow)',
              border: '1px solid var(--success)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '0.6rem 0.75rem',
              fontSize: '12px',
              color: '#16A34A',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.4rem',
            }}
          >
            <CheckCircle2 size={16} style={{ marginTop: '1px', flexShrink: 0 }} />
            <div>
              <div>{message}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Note: Check Spam or Junk folder if not found in inbox.
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <AuthInput
            id="forgot-email"
            label="Account Email Address"
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

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', fontSize: '12px', fontWeight: 600, marginTop: '0.35rem' }}
          >
            {loading ? <RefreshCw size={16} className="spinner" /> : <span>Send Reset Instructions</span>}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <div style={{ marginTop: '0.85rem', textAlign: 'center' }}>
          <button
            onClick={onNavigateToLogin}
            style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            <ArrowLeft size={13} /> Back to Login
          </button>
        </div>
      </div>

      <AuthFooter />
    </div>
  );

  if (embedded) return content;
  return <AuthCard>{content}</AuthCard>;
};

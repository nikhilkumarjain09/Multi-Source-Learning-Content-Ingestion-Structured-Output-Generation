import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, MailOpen } from 'lucide-react';
import { AuthCard } from './AuthCard';
import { AuthFooter } from './AuthFooter';
import { BrandHeader } from '../branding/BrandHeader';
import { BRANDING } from '../../config/branding';

interface EmailVerifyViewProps {
  email: string;
  onVerified: () => void;
  onNavigateToLogin: () => void;
  embedded?: boolean;
}

export const EmailVerifyView: React.FC<EmailVerifyViewProps> = ({
  email,
  onVerified,
  onNavigateToLogin,
  embedded = false,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Focus first box on mount
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 120);
  }, []);

  // Cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownRef.current = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            clearInterval(cooldownRef.current!);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, [resendCooldown]);

  const handleDigitChange = (idx: number, raw: string) => {
    const val = raw.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError(null);
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const otp = digits.join('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (otp.length !== 6) {
      setError('Please enter all 6 digits of your OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccess('Email verified! Redirecting to login…');
        setTimeout(() => onVerified(), 1800);
      } else {
        setError(data.error || 'Invalid or expired OTP. Please try again.');
        setDigits(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch {
      setLoading(false);
      setError('Network error. Please check your connection and try again.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setSuccess(null);
    setResendLoading(true);
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setResendLoading(false);
      if (res.ok) {
        setResendCooldown(60);
        setSuccess('A new OTP has been sent. Check your inbox & Spam/Junk folder.');
      } else {
        setError(data.error || 'Failed to resend OTP. Please try again.');
      }
    } catch {
      setResendLoading(false);
      setError('Network error. Please try again.');
    }
  };

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        <BrandHeader
          title="Verify Your Email"
          subtitle={`Enter the 6-digit OTP sent to ${email}`}
          compact
        />

        {/* Animated mail icon */}
        <div style={{ textAlign: 'center', margin: '0.6rem 0 0.9rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-glow) 0%, transparent 100%)',
              border: '1.5px solid var(--accent)',
              boxShadow: '0 0 18px var(--accent-glow)',
              animation: 'pulseGlow 2.5s ease-in-out infinite',
            }}
          >
            <MailOpen size={24} color="var(--accent)" />
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: 'var(--error-glow)',
              border: '1px solid var(--error)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '0.4rem 0.65rem',
              fontSize: '11px',
              color: 'var(--error)',
              marginBottom: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <AlertCircle size={13} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {success && (
          <div
            style={{
              backgroundColor: 'var(--success-glow)',
              border: '1px solid var(--success)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '0.4rem 0.65rem',
              fontSize: '11px',
              color: '#16A34A',
              marginBottom: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {/* 6-Digit OTP Boxes */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              padding: '0.2rem 0',
            }}
            onPaste={handlePaste}
          >
            {digits.map((d, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                id={`otp-digit-${idx}`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                style={{
                  width: 42,
                  height: 48,
                  textAlign: 'center',
                  fontSize: '22px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  background: d ? 'var(--input-focus-bg, rgba(99,102,241,0.08))' : 'var(--input-bg)',
                  border: `1.5px solid ${d ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--border-radius-sm)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                  boxShadow: d ? '0 0 8px var(--accent-glow)' : 'none',
                  cursor: 'text',
                  caretColor: 'var(--accent)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent)';
                  e.target.style.boxShadow = '0 0 8px var(--accent-glow)';
                }}
                onBlur={(e) => {
                  if (!d) {
                    e.target.style.borderColor = 'var(--border)';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
            ))}
          </div>

          {/* Spam note */}
          <div
            style={{
              fontSize: '10.5px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '0 0.5rem',
              lineHeight: 1.5,
            }}
          >
            Didn't get it? Check your{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Spam / Junk</span> folder.
            OTP is valid for <strong>10 minutes</strong>.
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || otp.length !== 6}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.55rem',
              fontSize: '12px',
              fontWeight: 600,
              opacity: otp.length !== 6 ? 0.55 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? (
              <RefreshCw size={15} className="spinner" />
            ) : (
              <>
                <ShieldCheck size={15} />
                <span>Verify Email & Continue</span>
              </>
            )}
          </button>
        </form>

        {/* Resend + Back row */}
        <div
          style={{
            marginTop: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
          }}
        >
          <button
            onClick={onNavigateToLogin}
            style={{
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '11px',
              padding: 0,
            }}
          >
            <ArrowLeft size={12} /> Back to Login
          </button>

          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || resendLoading}
            style={{
              color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--accent)',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: resendCooldown > 0 ? 'default' : 'pointer',
              fontSize: '11px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: 0,
              transition: 'color 0.2s',
            }}
          >
            {resendLoading ? (
              <RefreshCw size={12} className="spinner" />
            ) : resendCooldown > 0 ? (
              `Resend in ${resendCooldown}s`
            ) : (
              'Resend OTP'
            )}
          </button>
        </div>
      </div>

      <AuthFooter />
    </div>
  );

  if (embedded) return content;
  return <AuthCard>{content}</AuthCard>;
};

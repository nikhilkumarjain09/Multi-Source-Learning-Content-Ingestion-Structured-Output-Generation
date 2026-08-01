import React, { useState } from 'react';
import { Lock, KeyRound, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { AuthCard } from './AuthCard';
import { AuthInput } from './AuthInput';
import { PasswordStrength } from './PasswordStrength';
import { AuthFooter } from './AuthFooter';
import { BrandHeader } from '../branding/BrandHeader';
import { BRANDING } from '../../config/branding';

interface ResetPasswordViewProps {
  token: string;
  onNavigateToLogin: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ token: initialToken, onNavigateToLogin }) => {
  const [tokenInput, setTokenInput] = useState(initialToken || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [tokenError, setTokenError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateToken = (val: string) => {
    if (!val.trim()) {
      setTokenError('6-digit OTP required.');
      return false;
    }
    setTokenError(null);
    return true;
  };

  const validatePass = (val: string) => {
    if (val.length < 8) {
      setPassError('8+ chars required.');
      return false;
    }
    if (!/[A-Z]/.test(val) || !/[a-z]/.test(val) || !/[0-9]/.test(val)) {
      setPassError('Needs upper, lower & number.');
      return false;
    }
    setPassError(null);
    return true;
  };

  const validateConfirm = (val: string) => {
    if (val !== newPassword) {
      setConfirmError('Passwords do not match.');
      return false;
    }
    setConfirmError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const isTokenValid = validateToken(tokenInput);
    const isPassValid = validatePass(newPassword);
    const isConfirmValid = validateConfirm(confirmPassword);

    if (!isTokenValid || !isPassValid || !isConfirmValid) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim(), newPassword, confirmPassword }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccess(true);
      } else {
        setGlobalError(data.error || 'Failed to reset password. Check your 6-digit OTP code.');
      }
    } catch {
      setLoading(false);
      setGlobalError('Network error. Please try again.');
    }
  };

  return (
    <AuthCard>
      {/* Brand Header */}
      <BrandHeader title={`Set New ${BRANDING.APP_NAME} Password`} subtitle="Enter 6-digit OTP code and choose new password" compact />

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

      {success ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            backgroundColor: 'var(--success-glow)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '0.85rem',
            fontSize: '12px',
            color: '#16A34A',
            marginBottom: '1rem',
          }}>
            <CheckCircle2 size={20} style={{ marginBottom: '0.35rem' }} />
            <div>Password updated successfully! You can now log in.</div>
          </div>
          <button className="btn-primary" onClick={onNavigateToLogin} style={{ width: '100%', justifyContent: 'center' }}>
            Proceed to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <AuthInput
            id="reset-otp"
            label="6-Digit Reset OTP Code"
            type="text"
            value={tokenInput}
            onChange={(val) => {
              setTokenInput(val);
              if (tokenError) validateToken(val);
            }}
            onBlur={() => validateToken(tokenInput)}
            placeholder="e.g. 684920"
            icon={<KeyRound size={15} />}
            error={tokenError}
            isValid={!!tokenInput.trim() && !tokenError}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <div>
              <AuthInput
                id="reset-new-password"
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(val) => {
                  setNewPassword(val);
                  validatePass(val);
                  if (confirmPassword) validateConfirm(confirmPassword);
                }}
                onBlur={() => validatePass(newPassword)}
                placeholder="••••••••"
                icon={<Lock size={15} />}
                error={passError}
                autoComplete="new-password"
                showCapsLockWarning
              />
              <PasswordStrength password={newPassword} />
            </div>

            <AuthInput
              id="reset-confirm-password"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(val) => {
                setConfirmPassword(val);
                if (confirmError) validateConfirm(confirmPassword);
              }}
              onBlur={() => validateConfirm(confirmPassword)}
              placeholder="••••••••"
              icon={<Lock size={15} />}
              error={confirmError}
              isValid={!!confirmPassword && confirmPassword === newPassword && !confirmError}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.6rem', fontSize: '12px', fontWeight: 600, marginTop: '0.2rem' }}
          >
            {loading ? <RefreshCw size={16} className="spinner" /> : <span>Update Password</span>}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>
      )}

      <AuthFooter />
    </AuthCard>
  );
};

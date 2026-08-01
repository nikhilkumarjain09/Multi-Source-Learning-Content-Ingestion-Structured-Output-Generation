import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { AuthCard } from './AuthCard';
import { AuthInput } from './AuthInput';
import { PasswordStrength } from './PasswordStrength';
import { AuthFooter } from './AuthFooter';
import { BrandHeader } from '../branding/BrandHeader';
import { BRANDING } from '../../config/branding';

interface SignupViewProps {
  onNavigateToLogin: () => void;
}

export const SignupView: React.FC<SignupViewProps> = ({ onNavigateToLogin }) => {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [termsError, setTermsError] = useState<string | null>(null);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateName = (val: string) => {
    if (!val.trim()) {
      setNameError('Full name is required.');
      return false;
    }
    setNameError(null);
    return true;
  };

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
    if (val.length < 8) {
      setPassError('Password must be at least 8 characters long.');
      return false;
    }
    if (!/[A-Z]/.test(val) || !/[a-z]/.test(val) || !/[0-9]/.test(val)) {
      setPassError('Password must include uppercase, lowercase, and numeric characters.');
      return false;
    }
    setPassError(null);
    return true;
  };

  const validateConfirm = (val: string) => {
    if (val !== password) {
      setConfirmError('Passwords do not match.');
      return false;
    }
    setConfirmError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessMsg(null);

    const isNameValid = validateName(fullName);
    const isEmailValid = validateEmail(email);
    const isPassValid = validatePass(password);
    const isConfirmValid = validateConfirm(confirmPassword);

    if (!acceptTerms) {
      setTermsError('You must accept the Terms of Service and Privacy Policy.');
      return;
    } else {
      setTermsError(null);
    }

    if (!isNameValid || !isEmailValid || !isPassValid || !isConfirmValid) return;

    setLoading(true);
    const result = await signup(fullName.trim(), email.trim(), password, confirmPassword);
    setLoading(false);

    if (!result.success) {
      setGlobalError(result.error || 'Failed to create account.');
    } else {
      setSuccessMsg(result.message || 'Account created successfully! Please check your email inbox (and check your Spam/Junk folder if you don\'t see it).');
    }
  };

  return (
    <AuthCard>
      {/* Brand Header */}
      <BrandHeader title={`Join ${BRANDING.APP_NAME}`} subtitle="Get started with your AI learning workspace" />

      {/* Global Banners */}
      {globalError && (
        <div
          role="alert"
          style={{
            backgroundColor: 'var(--error-glow)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '0.75rem',
            fontSize: '13px',
            color: 'var(--error)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{globalError}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            backgroundColor: 'var(--success-glow)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '0.85rem',
            fontSize: '13px',
            color: '#16A34A',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={18} style={{ marginTop: '2px', flexShrink: 0 }} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Controls */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AuthInput
          id="signup-fullname"
          label="Full Name"
          type="text"
          value={fullName}
          onChange={(val) => {
            setFullName(val);
            if (nameError) validateName(val);
          }}
          onBlur={() => validateName(fullName)}
          placeholder="Jane Doe"
          icon={<User size={16} />}
          error={nameError}
          isValid={!!fullName.trim() && !nameError}
          autoComplete="name"
        />

        <AuthInput
          id="signup-email"
          label="Work Email Address"
          type="email"
          value={email}
          onChange={(val) => {
            setEmail(val);
            if (emailError) validateEmail(val);
          }}
          onBlur={() => validateEmail(email)}
          placeholder="name@company.com"
          icon={<Mail size={16} />}
          error={emailError}
          isValid={!!email && !emailError}
          autoComplete="email"
        />

        <div>
          <AuthInput
            id="signup-password"
            label="Security Password"
            type="password"
            value={password}
            onChange={(val) => {
              setPassword(val);
              validatePass(val);
              if (confirmPassword) validateConfirm(confirmPassword);
            }}
            onBlur={() => validatePass(password)}
            placeholder="••••••••"
            icon={<Lock size={16} />}
            error={passError}
            autoComplete="new-password"
            showCapsLockWarning
          />

          <PasswordStrength password={password} />
        </div>

        <AuthInput
          id="signup-confirm-password"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(val) => {
            setConfirmPassword(val);
            if (confirmError) validateConfirm(val);
          }}
          onBlur={() => validateConfirm(confirmPassword)}
          placeholder="••••••••"
          icon={<Lock size={16} />}
          error={confirmError}
          isValid={!!confirmPassword && confirmPassword === password && !confirmError}
          autoComplete="new-password"
        />

        {/* Terms of Service Checkbox */}
        <div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                if (e.target.checked) setTermsError(null);
              }}
              style={{ marginTop: '2px', accentColor: 'var(--accent)' }}
            />
            <span>
              I agree to the <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: 'var(--accent)', fontWeight: 600 }}>Terms of Service</a> and <a href="#privacy" onClick={(e) => e.preventDefault()} style={{ color: 'var(--accent)', fontWeight: 600 }}>Privacy Policy</a>.
            </span>
          </label>
          {termsError && <div style={{ fontSize: '11px', color: 'var(--error)', marginTop: '3px' }}>{termsError}</div>}
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
          style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', fontSize: '13px', fontWeight: 600, marginTop: '0.25rem' }}
        >
          {loading ? <RefreshCw size={18} className="spinner" /> : <span>Create SynthLearn Account</span>}
          {!loading && <ArrowRight size={16} />}
        </button>
      </form>

      {/* Switch to Login Prompt */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
        Already have an account?{' '}
        <button
          onClick={onNavigateToLogin}
          style={{ color: 'var(--accent)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          Sign in
        </button>
      </div>

      <AuthFooter />
    </AuthCard>
  );
};

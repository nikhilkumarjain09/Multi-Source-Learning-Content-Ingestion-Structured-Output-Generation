import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface AuthInputProps {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: string | null;
  isValid?: boolean;
  required?: boolean;
  autoComplete?: string;
  showCapsLockWarning?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  id,
  label,
  type,
  value,
  onChange,
  onBlur,
  placeholder,
  icon,
  error,
  isValid,
  required = true,
  autoComplete,
  showCapsLockWarning = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  // Auto-hide password after 20 seconds for enhanced security
  React.useEffect(() => {
    if (!showPassword) return;
    const timer = setTimeout(() => {
      setShowPassword(false);
    }, 20000);
    return () => clearTimeout(timer);
  }, [showPassword]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showCapsLockWarning && type === 'password') {
      const caps = e.getModifierState('CapsLock');
      setCapsLockOn(caps);
    }
  };

  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label
          htmlFor={id}
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '0.1px',
          }}
        >
          {label} {required && <span style={{ color: 'var(--accent)' }}>*</span>}
        </label>

        {capsLockOn && showCapsLockWarning && (
          <span style={{
            fontSize: '11px',
            color: 'var(--warning)',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}>
            <ShieldAlert size={12} /> Caps Lock is ON
          </span>
        )}
      </div>

      <div style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: isFocused ? 'var(--accent)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.15s ease',
          }}>
            {icon}
          </div>
        )}

        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (onBlur) onBlur();
          }}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyDown}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          style={{
            width: '100%',
            paddingLeft: icon ? '38px' : '14px',
            paddingRight: type === 'password' ? '38px' : isValid ? '34px' : '14px',
            paddingTop: '0.65rem',
            paddingBottom: '0.65rem',
            borderRadius: 'var(--border-radius-sm)',
            border: error
              ? '1px solid var(--error)'
              : isFocused
              ? '1px solid var(--accent)'
              : '1px solid var(--border-color)',
            backgroundColor: isFocused ? 'var(--bg-surface)' : 'var(--bg-base)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            outline: 'none',
            boxShadow: isFocused ? '0 0 0 3px var(--accent-glow)' : 'none',
            transition: 'all 0.15s ease',
          }}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {isValid && type !== 'password' && (
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
          }}>
            <CheckCircle2 size={16} />
          </div>
        )}
      </div>

      {error && (
        <div
          id={`${id}-error`}
          role="alert"
          style={{
            fontSize: '11px',
            color: 'var(--error)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '2px',
          }}
        >
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

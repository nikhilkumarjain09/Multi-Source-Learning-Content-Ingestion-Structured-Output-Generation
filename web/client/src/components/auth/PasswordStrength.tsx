import React from 'react';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  if (!password) return null;

  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNum = /[0-9]/.test(password);

  const score = [hasMinLen, hasUpper, hasLower, hasNum].filter(Boolean).length;

  const getMeterColor = () => {
    if (score <= 1) return 'var(--error)';
    if (score <= 3) return 'var(--warning)';
    return 'var(--success)';
  };

  const getMeterLabel = () => {
    if (score <= 1) return 'Weak';
    if (score <= 3) return 'Moderate';
    return 'Strong';
  };

  return (
    <div style={{ marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Password Strength
        </span>
        <span style={{ fontSize: '10px', fontWeight: 600, color: getMeterColor() }}>
          {getMeterLabel()}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '3px', height: '3px' }}>
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            style={{
              flex: 1,
              borderRadius: '2px',
              backgroundColor: step <= score ? getMeterColor() : 'var(--border-color)',
              transition: 'background-color 0.2s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
};

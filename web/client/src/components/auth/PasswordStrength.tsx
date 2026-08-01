import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  if (!password) return null;

  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNum = /[0-9]/.test(password);

  const requirements = [
    { label: 'At least 8 characters', met: hasMinLen },
    { label: 'One uppercase letter (A-Z)', met: hasUpper },
    { label: 'One lowercase letter (a-z)', met: hasLower },
    { label: 'One number (0-9)', met: hasNum },
  ];

  const score = requirements.filter((r) => r.met).length;

  const getMeterColor = () => {
    if (score <= 1) return 'var(--error)';
    if (score <= 3) return 'var(--warning)';
    return 'var(--success)';
  };

  const getMeterLabel = () => {
    if (score <= 1) return 'Weak Password';
    if (score <= 3) return 'Moderate Password';
    return 'Strong Password';
  };

  return (
    <div style={{ marginTop: '0.4rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {/* Meter Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Password Strength
          </span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: getMeterColor() }}>
            {getMeterLabel()}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
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

      {/* Requirements Checklist */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '4px 8px',
        backgroundColor: 'var(--bg-base)',
        padding: '0.5rem 0.65rem',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
      }}>
        {requirements.map((req) => (
          <div
            key={req.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              color: req.met ? 'var(--success)' : 'var(--text-muted)',
              transition: 'color 0.15s ease',
            }}
          >
            {req.met ? <Check size={12} color="var(--success)" /> : <X size={12} color="var(--text-muted)" />}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

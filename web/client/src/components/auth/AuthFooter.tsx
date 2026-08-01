import React from 'react';
import { ShieldCheck, HelpCircle } from 'lucide-react';
import { BRANDING } from '../../config/branding';

export const AuthFooter: React.FC = () => {
  return (
    <div style={{
      marginTop: '1.75rem',
      paddingTop: '1.25rem',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      alignItems: 'center',
      fontSize: '11px',
      color: 'var(--text-muted)',
    }}>
      {/* Security Compliance Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
          <ShieldCheck size={13} color="var(--success)" /> SOC2 Type II Certified
        </span>
        <span>•</span>
        <span>256-bit AES Encryption</span>
        <span>•</span>
        <span>JWT Token Rotation</span>
      </div>

      {/* Terms & Support Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
        <a href="#terms" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.preventDefault()}>
          Terms of Service
        </a>
        <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => e.preventDefault()}>
          Privacy Policy
        </a>
        <a href="#support" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }} onClick={(e) => e.preventDefault()}>
          <HelpCircle size={12} /> Contact Support
        </a>
      </div>
    </div>
  );
};

import React from 'react';
import { AuthIllustration } from './AuthIllustration';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div style={{
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1120px',
        height: '560px',
        maxHeight: '560px',
        display: 'grid',
        gridTemplateColumns: '430px 1fr',
        gap: '2rem',
        alignItems: 'center',
      }} className="auth-responsive-grid">
        {/* Left Panel: Form Container */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '560px' }}>
          {children}
        </div>

        {/* Right Panel: Storytelling Illustration */}
        <div className="auth-illustration-panel" style={{ width: '100%', height: '560px' }}>
          <AuthIllustration />
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          body, html {
            overflow-y: auto !important;
          }
          .auth-responsive-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
            max-width: 440px !important;
            height: auto !important;
            max-height: none !important;
          }
          .auth-illustration-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

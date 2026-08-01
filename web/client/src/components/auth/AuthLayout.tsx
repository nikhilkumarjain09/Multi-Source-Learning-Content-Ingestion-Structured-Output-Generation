import React from 'react';
import { AuthIllustration } from './AuthIllustration';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1180px',
        minHeight: '640px',
        display: 'grid',
        gridTemplateColumns: 'minmax(380px, 460px) 1fr',
        gap: '2.5rem',
        alignItems: 'center',
      }} className="auth-responsive-grid">
        {/* Left Panel: Form Container */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {children}
        </div>

        {/* Right Panel: Storytelling Illustration */}
        <div className="auth-illustration-panel" style={{ width: '100%', height: '100%' }}>
          <AuthIllustration />
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .auth-responsive-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            max-width: 480px !important;
          }
          .auth-illustration-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

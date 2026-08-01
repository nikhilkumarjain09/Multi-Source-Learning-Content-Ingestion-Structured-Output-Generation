import React, { useState } from 'react';
import { LoginView } from './LoginView';
import { SignupView } from './SignupView';
import { ForgotPasswordView } from './ForgotPasswordView';
import { ResetPasswordView } from './ResetPasswordView';
import { EmailVerifyView } from './EmailVerifyView';
import { AuthCard } from './AuthCard';

type AuthTab = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'verify-email';

interface UnifiedAuthContainerProps {
  initialPage?: AuthTab;
  resetToken?: string;
}

// Shared panel wrapper — provides padding inside each panel so the sliding
// track can be flush/zero-padded against the card edges (no bleed-through).
const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      width: '20%',
      height: '100%',
      flexShrink: 0,
      boxSizing: 'border-box',
      padding: '1.75rem',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}
  >
    {children}
  </div>
);

export const UnifiedAuthContainer: React.FC<UnifiedAuthContainerProps> = ({
  initialPage = 'login',
  resetToken = '',
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialPage);
  const [pendingEmail, setPendingEmail] = useState('');

  // translateX is relative to the track element (500% of card width).
  // Each 20% step = exactly 1 card-width slide.
  const tabIndex: Record<AuthTab, number> = {
    'login': 0,
    'signup': 1,
    'forgot-password': 2,
    'reset-password': 3,
    'verify-email': 4,
  };

  const translateX = `${tabIndex[activeTab] * -20}%`;

  const handleSignupSuccess = (email: string) => {
    setPendingEmail(email);
    setActiveTab('verify-email');
  };

  const handleVerified = () => {
    setActiveTab('login');
    setPendingEmail('');
  };

  return (
    // noPadding — padding lives inside each Panel wrapper instead
    <AuthCard noPadding>
      {/* Clip window — exactly card-sized */}
      <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
        {/* Sliding track — 5 panels wide */}
        <div
          style={{
            display: 'flex',
            width: '500%',
            height: '100%',
            transform: `translateX(${translateX})`,
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
        >
          {/* Panel 1: Login */}
          <Panel>
            <LoginView
              onNavigateToSignup={() => setActiveTab('signup')}
              onNavigateToForgotPassword={() => setActiveTab('forgot-password')}
              embedded
            />
          </Panel>

          {/* Panel 2: Signup */}
          <Panel>
            <SignupView
              onNavigateToLogin={() => setActiveTab('login')}
              onSignupSuccess={handleSignupSuccess}
              embedded
            />
          </Panel>

          {/* Panel 3: Forgot Password */}
          <Panel>
            <ForgotPasswordView
              onNavigateToLogin={() => setActiveTab('login')}
              embedded
            />
          </Panel>

          {/* Panel 4: Reset Password */}
          <Panel>
            <ResetPasswordView
              token={resetToken}
              onNavigateToLogin={() => setActiveTab('login')}
              embedded
            />
          </Panel>

          {/* Panel 5: Email OTP Verification */}
          <Panel>
            <EmailVerifyView
              email={pendingEmail}
              onVerified={handleVerified}
              onNavigateToLogin={() => setActiveTab('login')}
              embedded
            />
          </Panel>
        </div>
      </div>
    </AuthCard>
  );
};

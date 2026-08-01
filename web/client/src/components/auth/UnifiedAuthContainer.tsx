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

export const UnifiedAuthContainer: React.FC<UnifiedAuthContainerProps> = ({
  initialPage = 'login',
  resetToken = '',
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialPage);
  const [pendingEmail, setPendingEmail] = useState('');

  // Map activeTab to translateX percentage (5 panels = 20% each)
  const getTranslateX = () => {
    switch (activeTab) {
      case 'signup':         return '-20%';
      case 'forgot-password': return '-40%';
      case 'reset-password': return '-60%';
      case 'verify-email':   return '-80%';
      case 'login':
      default:               return '0%';
    }
  };

  const handleSignupSuccess = (email: string) => {
    setPendingEmail(email);
    setActiveTab('verify-email');
  };

  const handleVerified = () => {
    setActiveTab('login');
    setPendingEmail('');
  };

  return (
    <AuthCard>
      {/* Sliding Viewports Track — 5 panels */}
      <div style={{ overflow: 'hidden', width: '100%', height: '100%', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            width: '500%',
            height: '100%',
            transform: `translateX(${getTranslateX()})`,
            transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
        >
          {/* Panel 1: Login */}
          <div style={{ width: '20%', height: '100%', flexShrink: 0, boxSizing: 'border-box' }}>
            <LoginView
              onNavigateToSignup={() => setActiveTab('signup')}
              onNavigateToForgotPassword={() => setActiveTab('forgot-password')}
              embedded
            />
          </div>

          {/* Panel 2: Signup */}
          <div style={{ width: '20%', height: '100%', flexShrink: 0, boxSizing: 'border-box' }}>
            <SignupView
              onNavigateToLogin={() => setActiveTab('login')}
              onSignupSuccess={handleSignupSuccess}
              embedded
            />
          </div>

          {/* Panel 3: Forgot Password */}
          <div style={{ width: '20%', height: '100%', flexShrink: 0, boxSizing: 'border-box' }}>
            <ForgotPasswordView
              onNavigateToLogin={() => setActiveTab('login')}
              embedded
            />
          </div>

          {/* Panel 4: Reset Password */}
          <div style={{ width: '20%', height: '100%', flexShrink: 0, boxSizing: 'border-box' }}>
            <ResetPasswordView
              token={resetToken}
              onNavigateToLogin={() => setActiveTab('login')}
              embedded
            />
          </div>

          {/* Panel 5: Email OTP Verification */}
          <div style={{ width: '20%', height: '100%', flexShrink: 0, boxSizing: 'border-box' }}>
            <EmailVerifyView
              email={pendingEmail}
              onVerified={handleVerified}
              onNavigateToLogin={() => setActiveTab('login')}
              embedded
            />
          </div>
        </div>
      </div>
    </AuthCard>
  );
};

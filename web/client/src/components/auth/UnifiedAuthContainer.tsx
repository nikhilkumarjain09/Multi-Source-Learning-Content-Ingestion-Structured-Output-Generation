import React, { useState, useRef, useEffect } from 'react';
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

const TAB_ORDER: AuthTab[] = ['login', 'signup', 'forgot-password', 'reset-password', 'verify-email'];

// Slide-in keyframes injected once
const SLIDE_STYLE = `
  @keyframes slideInFromRight {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  @keyframes slideInFromLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to   { transform: translateX(0);     opacity: 1; }
  }
`;

export const UnifiedAuthContainer: React.FC<UnifiedAuthContainerProps> = ({
  initialPage = 'login',
  resetToken = '',
}) => {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialPage);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [pendingEmail, setPendingEmail] = useState('');
  const prevTabRef = useRef<AuthTab>(initialPage);

  const navigate = (tab: AuthTab) => {
    const curIdx = TAB_ORDER.indexOf(prevTabRef.current);
    const nextIdx = TAB_ORDER.indexOf(tab);
    setDirection(nextIdx >= curIdx ? 'right' : 'left');
    prevTabRef.current = tab;
    setActiveTab(tab);
  };

  const handleSignupSuccess = (email: string) => {
    setPendingEmail(email);
    navigate('verify-email');
  };

  const handleVerified = () => {
    navigate('login');
    setPendingEmail('');
  };

  // Key forces remount + re-animation on every tab change
  const animKey = activeTab + direction;

  const animation = `${direction === 'right' ? 'slideInFromRight' : 'slideInFromLeft'} 0.38s cubic-bezier(0.16, 1, 0.3, 1) both`;

  return (
    <AuthCard>
      <style>{SLIDE_STYLE}</style>

      {/* Clip window — same size as card content area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', minHeight: 0 }}>
        {/* Animated panel — only the active view is in the DOM */}
        <div
          key={animKey}
          style={{
            position: 'absolute',
            inset: 0,
            animation,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          {activeTab === 'login' && (
            <LoginView
              onNavigateToSignup={() => navigate('signup')}
              onNavigateToForgotPassword={() => navigate('forgot-password')}
              embedded
            />
          )}
          {activeTab === 'signup' && (
            <SignupView
              onNavigateToLogin={() => navigate('login')}
              onSignupSuccess={handleSignupSuccess}
              embedded
            />
          )}
          {activeTab === 'forgot-password' && (
            <ForgotPasswordView
              onNavigateToLogin={() => navigate('login')}
              embedded
            />
          )}
          {activeTab === 'reset-password' && (
            <ResetPasswordView
              token={resetToken}
              onNavigateToLogin={() => navigate('login')}
              embedded
            />
          )}
          {activeTab === 'verify-email' && (
            <EmailVerifyView
              email={pendingEmail}
              onVerified={handleVerified}
              onNavigateToLogin={() => navigate('login')}
              embedded
            />
          )}
        </div>
      </div>
    </AuthCard>
  );
};

import React, { useState } from 'react';
import { LoginView } from './LoginView';
import { SignupView } from './SignupView';
import { ForgotPasswordView } from './ForgotPasswordView';
import { ResetPasswordView } from './ResetPasswordView';
import { AuthCard } from './AuthCard';

interface UnifiedAuthContainerProps {
  initialPage?: 'login' | 'signup' | 'forgot-password' | 'reset-password';
  resetToken?: string;
}

export const UnifiedAuthContainer: React.FC<UnifiedAuthContainerProps> = ({
  initialPage = 'login',
  resetToken = '',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password'>(initialPage);

  // Map activeTab to translateX percentage
  const getTranslateX = () => {
    switch (activeTab) {
      case 'signup':
        return '-25%';
      case 'forgot-password':
        return '-50%';
      case 'reset-password':
        return '-75%';
      case 'login':
      default:
        return '0%';
    }
  };

  return (
    <AuthCard>
      {/* Sliding Viewports Track */}
      <div style={{ overflow: 'hidden', width: '100%', height: '100%', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            width: '400%',
            height: '100%',
            transform: `translateX(${getTranslateX()})`,
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform',
          }}
        >
          {/* Panel 1: Login */}
          <div style={{ width: '25%', height: '100%', flexShrink: 0, paddingRight: '1px', boxSizing: 'border-box' }}>
            <LoginView
              onNavigateToSignup={() => setActiveTab('signup')}
              onNavigateToForgotPassword={() => setActiveTab('forgot-password')}
              embedded
            />
          </div>

          {/* Panel 2: Signup */}
          <div style={{ width: '25%', height: '100%', flexShrink: 0, paddingLeft: '1px', boxSizing: 'border-box' }}>
            <SignupView
              onNavigateToLogin={() => setActiveTab('login')}
              embedded
            />
          </div>

          {/* Panel 3: Forgot Password */}
          <div style={{ width: '25%', height: '100%', flexShrink: 0, boxSizing: 'border-box' }}>
            <ForgotPasswordView
              onNavigateToLogin={() => setActiveTab('login')}
              embedded
            />
          </div>

          {/* Panel 4: Reset Password */}
          <div style={{ width: '25%', height: '100%', flexShrink: 0, boxSizing: 'border-box' }}>
            <ResetPasswordView
              token={resetToken}
              onNavigateToLogin={() => setActiveTab('login')}
              embedded
            />
          </div>
        </div>
      </div>
    </AuthCard>
  );
};

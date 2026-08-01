import React from 'react';
import { BrandLogo } from './BrandLogo';
import { BRANDING } from '../../config/branding';

interface BrandLoadingProps {
  message?: string;
}

export const BrandLoading: React.FC<BrandLoadingProps> = ({
  message = 'Preparing your SynthLearn learning workspace...',
}) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-base)',
      padding: '2rem',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        textAlign: 'center',
      }}>
        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
          <BrandLogo size={64} showGlow />
        </div>

        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            {BRANDING.APP_NAME}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '360px' }}>
            {message}
          </p>
        </div>

        {/* Animated Loader Bar */}
        <div style={{
          width: '180px',
          height: '4px',
          backgroundColor: 'var(--border-color)',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            width: '60px',
            height: '100%',
            backgroundColor: 'var(--accent)',
            borderRadius: '2px',
            position: 'absolute',
            animation: 'spin 1.4s ease-in-out infinite',
          }} />
        </div>
      </div>
    </div>
  );
};

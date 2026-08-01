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
      <style>{`
        @keyframes progressSlide {
          0% { left: -40%; width: 40%; }
          50% { left: 30%; width: 60%; }
          100% { left: 100%; width: 40%; }
        }
      `}</style>

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

        {/* Animated Horizontal Progress Bar Fill */}
        <div style={{
          width: '200px',
          height: '4px',
          backgroundColor: 'var(--border-color)',
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            height: '100%',
            backgroundColor: 'var(--accent)',
            borderRadius: '4px',
            position: 'absolute',
            animation: 'progressSlide 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }} />
        </div>
      </div>
    </div>
  );
};

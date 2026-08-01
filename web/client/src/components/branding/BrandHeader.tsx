import React from 'react';
import { BrandLogo } from './BrandLogo';
import { BRANDING } from '../../config/branding';

interface BrandHeaderProps {
  title?: string;
  subtitle?: string;
  logoSize?: number;
  compact?: boolean;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  title = BRANDING.APP_NAME,
  subtitle = BRANDING.APP_TAGLINE,
  logoSize = 34,
  compact = true,
}) => {
  return (
    <div style={{ textAlign: 'center', marginBottom: compact ? '1rem' : '1.5rem' }}>
      <div style={{ display: 'inline-flex', marginBottom: '0.5rem' }}>
        <BrandLogo size={logoSize} />
      </div>
      <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.15rem', lineHeight: 1.2 }}>
        {title}
      </h1>
      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
        {subtitle}
      </p>
    </div>
  );
};

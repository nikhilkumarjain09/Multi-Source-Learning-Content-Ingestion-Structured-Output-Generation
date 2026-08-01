import React from 'react';
import { BrandLogo } from './BrandLogo';
import { BRANDING } from '../../config/branding';

interface BrandHeaderProps {
  title?: string;
  subtitle?: string;
  logoSize?: number;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  title = BRANDING.APP_NAME,
  subtitle = BRANDING.APP_TAGLINE,
  logoSize = 44,
}) => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <div style={{ display: 'inline-flex', marginBottom: '0.85rem' }}>
        <BrandLogo size={logoSize} />
      </div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
        {title}
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
        {subtitle}
      </p>
    </div>
  );
};

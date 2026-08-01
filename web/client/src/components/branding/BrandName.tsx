import React from 'react';
import { BRANDING } from '../../config/branding';

interface BrandNameProps {
  fontSize?: string;
  showBadge?: boolean;
  color?: string;
}

export const BrandName: React.FC<BrandNameProps> = ({
  fontSize = '16px',
  showBadge = true,
  color = 'var(--text-primary)',
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize, fontWeight: 700, color, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
        {BRANDING.APP_NAME}
      </span>
      {showBadge && (
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--accent)',
          backgroundColor: 'var(--accent-glow)',
          padding: '1px 6px',
          borderRadius: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          PRO
        </span>
      )}
    </div>
  );
};

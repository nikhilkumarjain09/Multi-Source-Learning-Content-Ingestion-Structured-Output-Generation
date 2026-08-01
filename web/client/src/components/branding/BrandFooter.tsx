import React from 'react';
import { BRANDING } from '../../config/branding';

export const BrandFooter: React.FC = () => {
  return (
    <footer style={{
      padding: '1rem',
      textAlign: 'center',
      fontSize: '12px',
      color: 'var(--text-muted)',
      borderTop: '1px solid var(--border-color)',
      marginTop: 'auto',
    }}>
      Powered by <strong style={{ color: 'var(--text-secondary)' }}>{BRANDING.APP_NAME}</strong> • {BRANDING.APP_SUBTITLE}
    </footer>
  );
};

import React from 'react';
import { BRANDING } from '../../config/branding';

interface BrandLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  showGlow?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 36,
  className = '',
  style = {},
  showGlow = true,
}) => {
  return (
    <img
      src={BRANDING.LOGO_PATH}
      alt={`${BRANDING.APP_NAME} Logo`}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        objectFit: 'contain',
        borderRadius: '8px',
        boxShadow: showGlow ? '0 4px 14px rgba(37, 99, 235, 0.25)' : 'none',
        ...style,
      }}
    />
  );
};

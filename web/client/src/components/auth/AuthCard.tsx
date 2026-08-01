import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  noPadding?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, style = {}, noPadding = false }) => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        width: '100%',
        maxWidth: '430px',
        height: '560px',
        padding: noPadding ? '0' : '1.75rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        animation: 'fadeIn 0.25s ease-in-out',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

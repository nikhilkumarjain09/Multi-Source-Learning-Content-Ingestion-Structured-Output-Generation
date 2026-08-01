import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, style = {} }) => {
  return (
    <div
      className="card-hover"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        width: '100%',
        maxWidth: '440px',
        padding: '2.25rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
        backdropFilter: 'blur(10px)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

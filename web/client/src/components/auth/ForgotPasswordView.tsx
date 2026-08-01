import React, { useState } from 'react';
import { Brain, Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface ForgotPasswordViewProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setMessage(data.message || 'If an account exists, a password reset link has been sent.');
      } else {
        setError(data.error || 'Failed to send password reset email.');
      }
    } catch (err: any) {
      setLoading(false);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-lg)',
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--purple-accent) 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.85rem',
          }}>
            <Brain size={24} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Reset Password
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Enter your account email to receive a password reset link
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'var(--error-glow)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '0.75rem',
            fontSize: '13px',
            color: 'var(--error)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={{
            backgroundColor: 'var(--success-glow)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--border-radius-sm)',
            padding: '0.75rem',
            fontSize: '13px',
            color: '#16A34A',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Account Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
          >
            {loading ? <RefreshCw size={18} className="spinner" /> : <span>Send Reset Instructions</span>}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
          <button
            onClick={onNavigateToLogin}
            style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={14} /> Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

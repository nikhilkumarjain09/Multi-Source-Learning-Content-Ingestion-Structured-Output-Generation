import React, { useState } from 'react';
import { Brain, Lock, ArrowRight, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface ResetPasswordViewProps {
  token: string;
  onNavigateToLogin: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ token, onNavigateToLogin }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch {
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
            Set New Password
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Enter your new secure password below
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

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: 'var(--success-glow)',
              border: '1px solid var(--success)',
              borderRadius: 'var(--border-radius-sm)',
              padding: '1rem',
              fontSize: '13px',
              color: '#16A34A',
              marginBottom: '1.5rem',
            }}>
              <CheckCircle2 size={24} style={{ marginBottom: '0.5rem' }} />
              <div>Password updated successfully! You can now log in with your new password.</div>
            </div>
            <button className="btn-primary" onClick={onNavigateToLogin} style={{ width: '100%', justifyContent: 'center' }}>
              Proceed to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', paddingLeft: '36px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? <RefreshCw size={18} className="spinner" /> : <span>Update Password</span>}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

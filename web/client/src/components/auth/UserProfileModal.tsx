import React, { useState } from 'react';
import { User, Mail, ShieldCheck, Key, LogOut, X, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUserProfile, logout, logoutAllSessions } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    const success = await updateUserProfile(fullName);
    if (success) setProfileMsg('Profile name updated successfully.');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    setPassError(null);

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('cognitive_access_token');
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        setPassMsg('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPassError(data.error || 'Failed to change password.');
      }
    } catch {
      setLoading(false);
      setPassError('Network error.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>User Account Profile</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</span>
            </div>
          </div>

          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* User Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <span className="badge badge-blue">Role: {user.role.toUpperCase()}</span>
          <span className={`badge ${user.isEmailVerified ? 'badge-green' : 'badge-red'}`}>
            {user.isEmailVerified ? '✓ Email Verified' : 'Unverified Email'}
          </span>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleUpdateProfile} style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Full Name</h4>
          {profileMsg && <div style={{ fontSize: '12px', color: 'var(--success)', marginBottom: '0.5rem' }}>{profileMsg}</div>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ flex: 1 }}
              required
            />
            <button type="submit" className="btn-secondary" style={{ fontSize: '12px' }}>Update</button>
          </div>
        </form>

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-base)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Change Security Password</h4>
          {passMsg && <div style={{ fontSize: '12px', color: 'var(--success)', marginBottom: '0.5rem' }}>{passMsg}</div>}
          {passError && <div style={{ fontSize: '12px', color: 'var(--error)', marginBottom: '0.5rem' }}>{passError}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="New Password (8+ chars, upper, lower, num)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: 'center', fontSize: '12px' }}>
              {loading ? <RefreshCw size={14} className="spinner" /> : 'Save New Password'}
            </button>
          </div>
        </form>

        {/* Session Management */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
          <button className="btn-secondary" onClick={logoutAllSessions} style={{ color: 'var(--error)', fontSize: '12px' }}>
            <LogOut size={14} /> Logout All Sessions
          </button>
          <button className="btn-primary" onClick={logout} style={{ fontSize: '12px' }}>
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

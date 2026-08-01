import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithTokens: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  signup: (fullName: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  logout: () => Promise<void>;
  logoutAllSessions: () => Promise<void>;
  refreshAuthTokens: () => Promise<boolean>;
  updateUserProfile: (fullName: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cognitive_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('cognitive_access_token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem('cognitive_refresh_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('cognitive_user', JSON.stringify(user));
    else localStorage.removeItem('cognitive_user');
  }, [user]);

  useEffect(() => {
    if (accessToken) localStorage.setItem('cognitive_access_token', accessToken);
    else localStorage.removeItem('cognitive_access_token');
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) localStorage.setItem('cognitive_refresh_token', refreshToken);
    else localStorage.removeItem('cognitive_refresh_token');
  }, [refreshToken]);

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else if (refreshToken) {
            await refreshAuthTokens();
          }
        } catch {
          if (refreshToken) await refreshAuthTokens();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to log in.' };
      }

      setUser(data.user);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login.' };
    }
  };

  const loginWithTokens = (userData: UserProfile, at: string, rt: string) => {
    setUser(userData);
    setAccessToken(at);
    setRefreshToken(rt);
  };

  const signup = async (fullName: string, email: string, password: string, confirmPassword: string) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to create account.' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration.' };
    }
  };

  const refreshAuthTokens = async (): Promise<boolean> => {
    if (!refreshToken) return false;
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        return true;
      }
    } catch {}

    // Revoke on failure
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    return false;
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {}
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const logoutAllSessions = async () => {
    try {
      if (accessToken) {
        await fetch('/api/auth/logout-all', {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      }
    } catch {}
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
  };

  const updateUserProfile = async (fullName: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ fullName }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
    } catch {}
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithTokens,
        signup,
        logout,
        logoutAllSessions,
        refreshAuthTokens,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

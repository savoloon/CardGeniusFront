import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  refreshTokens,
  logoutUser,
  setSessionExpiredHandler,
  type ApiUser,
} from '../services/api';

interface AuthContextType {
  user: ApiUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  setUserFromLogin: (data: { user: ApiUser }) => void;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await refreshTokens();
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return true;
      }
    } catch {
      setUser(null);
      return false;
    }
    setUser(null);
    return false;
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const ok = await refresh();
        if (!mounted) return;
        if (!ok) setUser(null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();
    return () => {
      mounted = false;
    };
  }, [refresh]);

  const setUserFromLogin = useCallback((data: { user: ApiUser }) => {
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      setUserFromLogin,
      logout,
      refresh,
    }),
    [user, loading, setUserFromLogin, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

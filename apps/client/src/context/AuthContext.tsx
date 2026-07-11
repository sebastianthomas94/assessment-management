import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const BACKEND_BASE_URL =
  import.meta.env.VITE_Backend_Base_url ?? "http://localhost:5000";

async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BACKEND_BASE_URL}${url}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = (await res.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!res.ok) {
    throw new Error(data?.message ?? "Something went wrong. Please try again.");
  }
  return data as T;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate the session on mount via /api/auth/me.
  useEffect(() => {
    let cancelled = false;
    apiFetch<{ user: AuthUser }>('/api/auth/me')
      .then(({ user }) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
        // 401 just means no active session — ignore.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { user } = await apiFetch<{ user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      setUser(user);
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await apiFetch<{ user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Even if the server call fails, clear local state.
    }
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

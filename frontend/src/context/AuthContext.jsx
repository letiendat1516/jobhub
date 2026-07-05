import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import authService from '../services/authService.js';

/**
 * AuthContext — nguồn chân lý về phiên đăng nhập ở frontend.
 * ------------------------------------------------------------------
 * - Lưu accessToken trong localStorage (key `jobhub.accessToken`)
 *   đúng kỳ vọng của apiClient interceptor (xem services/apiClient.js).
 * - Khi app mount, nếu có token → gọi /auth/me để khôi phục user.
 * - Components dùng useAuth() để biết trạng thái + gọi login/register/logout.
 *
 * Service layer (authService) là cổng duy nhất gọi backend
 * (docs/02_ARCHITECTURE.md §3.1) — context không gọi axios trực tiếp.
 */
const AuthContext = createContext(null);

const TOKEN_KEY = 'jobhub.accessToken';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Lấy lại user khi có token (ví dụ: refresh trang). */
  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    authService
      .getMe()
      .then((res) => {
        if (cancelled) return;
        if (res?.success && res?.data) setUser(res.data);
      })
      .catch(() => {
        // Token hết hạn / không hợp lệ → xoá.
        window.localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((nextUser, token) => {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async ({ email, password }) => {
      const res = await authService.login({ email, password });
      if (!res?.success) throw res;
      persist(res.data.user, res.data.accessToken);
      return res.data.user;
    },
    [persist],
  );

  const register = useCallback(
    async (payload) => {
      const res = await authService.register(payload);
      if (!res?.success) throw res;
      persist(res.data.user, res.data.accessToken);
      return res.data.user;
    },
    [persist],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: Boolean(user),
      loading,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook duy nhất để truy cập phiên đăng nhập. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>.');
  return ctx;
}

export default AuthContext;

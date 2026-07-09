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

  /* Lấy lại user khi có token (ví dụ: refresh trang hoặc backend restart).
   *
   * Quan trọng: KHÔNG xoá token khi lỗi mạng (backend đang restart).
   * Chỉ xoá khi thực sự 401 (token hết hạn/không hợp lệ). */
  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    let retryTimer = null;
    let attempt = 0;

    const fetchMe = () => {
      attempt += 1;
      authService
        .getMe()
        .then((res) => {
          if (cancelled) return;
          if (res?.success && res?.data) {
            setUser(res.data);
          }
        })
        .catch((err) => {
          if (cancelled) return;
          const status = err?.status ?? 0;
          if (status === 401 || status === 403) {
            // Token thực sự hết hạn / không hợp lệ → xoá.
            window.localStorage.removeItem(TOKEN_KEY);
            setUser(null);
          } else {
            // Lỗi mạng (backend đang restart, ERR_NETWORK, timeout) →
            // GIỮ token, retry tối đa 3 lần cách 2 giây.
            if (attempt < 3) {
              retryTimer = setTimeout(fetchMe, 2000);
            }
            // Nếu hết retry vẫn fail, giữ user logged-in trong UI
            // (token có thể vẫn hợp lệ khi backend lên lại).
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    fetchMe();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  const persist = useCallback((nextUser, token) => {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async ({ email, password, rememberMe }) => {
      const res = await authService.login({ email, password, rememberMe: rememberMe ?? false });
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

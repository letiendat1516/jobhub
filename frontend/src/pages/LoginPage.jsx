import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import AuthShell from '../components/auth/AuthShell.jsx';
import Field from '../components/auth/Field.jsx';
import AlertError from '../components/auth/AlertError.jsx';
import Icon from '../components/ui/Icon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { usePasswordField } from '../hooks/index.js';
import redirectPathByRole from '../utils/redirectByRole.js';

/**
 * LoginPage — /dang-nhap
 * Auth page (KHÔNG qua PublicLayout, không navbar/footer).
 * Sau khi login → redirect theo role.
 */
export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const passwordField = usePasswordField();

  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Đã đăng nhập rồi thì không vào đây nữa.
  if (isAuthenticated && user) {
    return <Navigate to={redirectPathByRole(user.role)} replace />;
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const u = await login(form);
      navigate(redirectPathByRole(u.role), { replace: true });
    } catch (err) {
      setFormError(err?.message ?? 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Chào mừng bạn quay lại JobHub."
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="font-semibold text-primary hover:underline">
            Đăng ký miễn phí
          </Link>
        </>
      }
    >
      <AlertError message={formError} />

      <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="ban@example.com"
          icon={<Icon name="mail" size={18} />}
          value={form.email}
          onChange={onChange}
        />

        <Field
          label="Mật khẩu"
          name="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          icon={<Icon name="shield" size={18} />}
          value={form.password}
          onChange={onChange}
          {...passwordField}
        />

        {/* Remember me */}
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="rememberMe"
            checked={form.rememberMe}
            onChange={(e) => setForm((prev) => ({ ...prev, rememberMe: e.target.checked }))}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span>Ghi nhớ đăng nhập (giữ phiên 7 ngày, không bị out khi reload)</span>
        </label>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          {!submitting ? <Icon name="arrowRight" size={18} /> : null}
        </button>
      </form>
    </AuthShell>
  );
}

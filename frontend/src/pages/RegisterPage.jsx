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
 * RegisterPage — /dang-ky
 * Form đăng ký cho ỨNG VIÊN (job_seeker).
 * Nhà tuyển dụng đăng ký ở /dang-ky-nha-tuyen-dung (form chi tiết hơn).
 */
export default function RegisterPage() {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const passwordField = usePasswordField();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={redirectPathByRole(user.role)} replace />;
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Mật khẩu nhập lại không khớp.' });
      return;
    }

    setSubmitting(true);
    try {
      const u = await register({
        role: 'job_seeker',
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate(redirectPathByRole(u.role), { replace: true });
    } catch (err) {
      if (err?.details?.fieldErrors) {
        const fe = err.details.fieldErrors;
        const picked = {};
        for (const key of Object.keys(fe)) {
          if (Array.isArray(fe[key]) && fe[key][0]) picked[key] = fe[key][0];
        }
        setFieldErrors(picked);
      }
      setFormError(err?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Tạo hồ sơ ứng viên miễn phí"
      subtitle="Chỉ mất 1 phút để bắt đầu tìm việc."
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to="/dang-nhap" className="font-semibold text-primary hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <AlertError message={formError} />

      <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
        <Field
          label="Họ và tên"
          name="fullName"
          autoComplete="name"
          required
          placeholder="Nguyễn Văn A"
          icon={<Icon name="users" size={18} />}
          value={form.fullName}
          onChange={onChange}
          error={fieldErrors.fullName}
        />

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
          error={fieldErrors.email}
        />

        <Field
          label="Mật khẩu"
          name="password"
          autoComplete="new-password"
          required
          placeholder="Tối thiểu 8 ký tự"
          icon={<Icon name="shield" size={18} />}
          value={form.password}
          onChange={onChange}
          error={fieldErrors.password}
          {...passwordField}
        />

        <Field
          label="Nhập lại mật khẩu"
          name="confirmPassword"
          autoComplete="new-password"
          required
          placeholder="Nhập lại mật khẩu"
          icon={<Icon name="shield" size={18} />}
          value={form.confirmPassword}
          onChange={onChange}
          error={fieldErrors.confirmPassword}
          {...passwordField}
        />

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          {submitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          {!submitting ? <Icon name="arrowRight" size={18} /> : null}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-primary/20 bg-primary-50/60 px-4 py-3 text-center text-sm">
        Bạn là <span className="font-semibold text-ink">nhà tuyển dụng</span>?{' '}
        <Link to="/dang-ky-nha-tuyen-dung" className="font-semibold text-primary hover:underline">
          Đăng ký tại đây
        </Link>
      </div>
    </AuthShell>
  );
}

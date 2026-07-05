import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import AuthShell from '../components/auth/AuthShell.jsx';
import Field from '../components/auth/Field.jsx';
import SelectField from '../components/auth/SelectField.jsx';
import Checkbox from '../components/auth/Checkbox.jsx';
import AlertError from '../components/auth/AlertError.jsx';
import Icon from '../components/ui/Icon.jsx';
import { cn } from '../utils/cn.js';
import { useAuth } from '../context/AuthContext.jsx';
import { usePasswordField } from '../hooks/index.js';
import { provinces } from '../data/provinces.js';
import redirectPathByRole from '../utils/redirectByRole.js';

const GENDERS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
];

/**
 * RegisterEmployerPage — /dang-ky-nha-tuyen-dung
 * Form đăng ký chi tiết cho nhà tuyển dụng (tham khảo TopCV).
 *
 * Lưu ý: register employer yêu cầu nhiều field hơn job_seeker, nên có
 * route riêng. Job seeker dùng /dang-ky (form đơn giản hơn).
 */
export default function RegisterEmployerPage() {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const passwordField = usePasswordField();

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    contactName: '',
    gender: '',
    phone: '',
    companyName: '',
    city: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
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

    // Validate client-side: confirm password + đồng ý điều khoản
    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Mật khẩu nhập lại không khớp.' });
      return;
    }
    if (!agreeTerms) {
      setFormError('Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư.');
      return;
    }
    if (!form.gender) {
      setFieldErrors({ gender: 'Vui lòng chọn giới tính.' });
      return;
    }

    setSubmitting(true);
    try {
      const u = await register({
        role: 'employer',
        email: form.email.trim(),
        password: form.password,
        contactName: form.contactName.trim(),
        gender: form.gender,
        phone: form.phone.trim(),
        companyName: form.companyName.trim(),
        city: form.city,
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
      title="Đăng ký tài khoản Nhà tuyển dụng"
      subtitle="Đăng tin tuyển dụng và tiếp cận ứng viên phù hợp nhờ gợi ý từ hệ thống."
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link
            to="/dang-nhap"
            className="font-semibold text-primary hover:underline"
          >
            Đăng nhập ngay
          </Link>
        </>
      }
    >
      <AlertError message={formError} />

      <form onSubmit={onSubmit} className="mt-4 space-y-6" noValidate>
        {/* ---------- Tài khoản ---------- */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Tài khoản
          </h2>

          <Field
            label="Email đăng nhập"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="hr@congty.vn"
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
        </section>

        {/* ---------- Thông tin nhà tuyển dụng ---------- */}
        <section className="space-y-4 border-t border-slate-100 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Thông tin nhà tuyển dụng
          </h2>

          <Field
            label="Họ và tên"
            name="contactName"
            autoComplete="name"
            required
            placeholder="Nguyễn Văn A"
            icon={<Icon name="users" size={18} />}
            value={form.contactName}
            onChange={onChange}
            error={fieldErrors.contactName}
          />

          {/* Giới tính */}
          <div>
            <p className="mb-1.5 block text-sm font-medium text-ink-soft">
              Giới tính <span className="text-primary">*</span>
            </p>
            <div className="flex gap-3">
              {GENDERS.map((g) => {
                const active = form.gender === g.value;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, gender: g.value }));
                      setFieldErrors((prev) => ({ ...prev, gender: undefined }));
                    }}
                    aria-pressed={active}
                    className={cn(
                      'flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
                      active
                        ? 'border-primary bg-primary-50 text-primary ring-2 ring-primary/20'
                        : 'border-slate-200 bg-white text-ink-soft hover:border-primary/50',
                    )}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
            {fieldErrors.gender ? (
              <p className="mt-1.5 text-xs text-red-600">{fieldErrors.gender}</p>
            ) : null}
          </div>

          <Field
            label="Số điện thoại cá nhân"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            placeholder="09xx xxx xxx"
            icon={<Icon name="phone" size={18} />}
            value={form.phone}
            onChange={onChange}
            error={fieldErrors.phone}
          />

          <Field
            label="Công ty"
            name="companyName"
            autoComplete="organization"
            required
            placeholder="Công ty Cổ phần ABC"
            icon={<Icon name="building" size={18} />}
            value={form.companyName}
            onChange={onChange}
            error={fieldErrors.companyName}
          />

          <SelectField
            label="Địa điểm làm việc"
            name="city"
            placeholder="Chọn tỉnh/thành phố"
            required
            options={provinces}
            value={form.city}
            onChange={onChange}
            error={fieldErrors.city}
          />
        </section>

        {/* ---------- Đồng ý ---------- */}
        <section className="space-y-3 border-t border-slate-100 pt-6">
          <Checkbox
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
            label={
              <>
                Tôi đã đọc và đồng ý với{' '}
                <span className="font-medium text-primary">Điều khoản dịch vụ</span> và{' '}
                <span className="font-medium text-primary">Chính sách quyền riêng tư</span> của JobHub.
              </>
            }
            hint="Chúng tôi không thể cung cấp dịch vụ nếu không nhận được sự đồng ý ở mục này."
          />

          <Checkbox
            checked={agreeMarketing}
            onChange={(e) => setAgreeMarketing(e.target.checked)}
            label="Tôi đồng ý nhận thông tin tư vấn để được hỗ trợ đăng tin nhanh và các giải pháp tuyển dụng phù hợp."
            hint="Khuyên dùng: Nếu không có sự đồng ý, chuyên viên sẽ không thể liên hệ để hỗ trợ Quý khách xác thực tài khoản nhanh chóng."
          />
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full py-3"
        >
          {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
          {!submitting ? <Icon name="arrowRight" size={18} /> : null}
        </button>
      </form>
    </AuthShell>
  );
}

import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import employerService from '../services/employerService.js';
import { useAuth } from '../context/AuthContext.jsx';

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none';

export default function EmployerCompanyProfilePage() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    companyName: '',
    phone: '',
    website: '',
    companyDescription: '',
    city: '',
    contactName: '',
    gender: '',
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
  if (authLoading) return;

  if (!isAuthenticated || user?.role !== 'employer') {
    setLoading(false);
    return;
  }

  employerService
    .getMyProfile()
    .then((profile) => {
      setForm({
        companyName: profile.company_name ?? profile.companyName ?? '',
        phone: profile.phone ?? '',
        website: profile.website ?? '',
        companyDescription:
          profile.company_description ?? profile.companyDescription ?? '',
        city: profile.city ?? '',
        contactName: profile.contact_name ?? profile.contactName ?? '',
        gender: profile.gender ?? '',
      });
    })
    .catch((err) => {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Không thể tải hồ sơ công ty.',
      );
    })
    .finally(() => {
      setLoading(false);
    });
}, [authLoading, isAuthenticated, user?.role]);

  const setField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (user?.role !== 'employer') {
      setError('Bạn không có quyền thực hiện thao tác này.');
      return;
    }

    try {
      setError('');
      setMessage('');

      await employerService.updateMyProfile(form);

      setMessage('Cập nhật hồ sơ công ty thành công.');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Không thể cập nhật hồ sơ công ty.',
      );
    }
  };

  if (authLoading) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-28">
      <div className="rounded-xl border bg-white p-6 text-slate-500">
        Đang kiểm tra phiên đăng nhập...
      </div>
    </main>
  );
}

if (!isAuthenticated) {
  return <Navigate to="/dang-nhap" replace />;
}

if (user?.role !== 'employer') {
    return (
      <main className="mx-auto max-w-4xl px-6 py-28">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          Không có quyền truy cập
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Bạn không thể truy cập trang hồ sơ công ty
        </h1>

        <p className="mt-2 text-slate-500">
          Chức năng này chỉ dành cho tài khoản nhà tuyển dụng.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-28">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
        Hồ sơ công ty
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Quản lý hồ sơ công ty
      </h1>

      <p className="mt-2 text-slate-500">
        Cập nhật thông tin công ty để hiển thị cùng các tin tuyển dụng.
      </p>

      {loading ? (
        <div className="mt-6 rounded-xl border bg-white p-6 text-slate-500">
          Đang tải hồ sơ công ty...
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
          {message}
        </div>
      ) : null}

      {!loading && !error ? (
        <form
          onSubmit={submit}
          className="mt-8 space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block font-semibold">Tên công ty</label>
            <input
              className={inputClass}
              value={form.companyName}
              onChange={(e) => setField('companyName', e.target.value)}
              placeholder="Tên công ty"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold">Số điện thoại</label>
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="Số điện thoại liên hệ"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Website</label>
              <input
                className={inputClass}
                value={form.website}
                onChange={(e) => setField('website', e.target.value)}
                placeholder="https://company.com"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-semibold">Thành phố</label>
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                placeholder="Hà Nội"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Người liên hệ</label>
              <input
                className={inputClass}
                value={form.contactName}
                onChange={(e) => setField('contactName', e.target.value)}
                placeholder="Tên người phụ trách tuyển dụng"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-semibold">Giới thiệu công ty</label>
            <textarea
              className={`${inputClass} h-32`}
              value={form.companyDescription}
              onChange={(e) => setField('companyDescription', e.target.value)}
              placeholder="Mô tả ngắn gọn về công ty, lĩnh vực hoạt động và môi trường làm việc."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Lưu hồ sơ công ty
          </button>
        </form>
      ) : null}
    </main>
  );
}
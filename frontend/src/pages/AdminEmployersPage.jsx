import { useCallback, useEffect, useState } from 'react';
import adminService from '../services/adminService.js';

export default function AdminEmployersPage() {
  const [keywordInput, setKeywordInput] = useState('');
  const [filters, setFilters] = useState({ keyword: '', status: 'all', verification: 'all', page: 1, limit: 20 });
  const [result, setResult] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const loadEmployers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminService.listEmployers(filters);
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách nhà tuyển dụng.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadEmployers();
  }, [loadEmployers]);

  const submitSearch = (event) => {
    event.preventDefault();
    setFilters((current) => ({ ...current, keyword: keywordInput.trim(), page: 1 }));
  };

  const updateVerification = async (employer) => {
    const action = employer.is_verified ? 'unverify' : 'verify';
    const label = action === 'verify' ? 'xác minh' : 'hủy xác minh';
    if (!window.confirm(`Bạn có chắc muốn ${label} nhà tuyển dụng này?`)) return;
    setUpdatingId(employer.employer_id);
    setError('');
    try {
      await adminService.updateEmployerVerification(employer.employer_id, action);
      await loadEmployers();
    } catch (err) {
      setError(err.message || `Không thể ${label} nhà tuyển dụng.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));

  return (
    <main className="mx-auto max-w-7xl px-6 py-28">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">UC-18</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Quản lý nhà tuyển dụng</h1>
      <p className="mt-2 text-slate-500">
        Xác minh thông tin doanh nghiệp. Trạng thái đăng nhập được quản lý riêng tại trang người dùng.
      </p>

      <form onSubmit={submitSearch} className="mt-8 grid gap-3 rounded-2xl border bg-white p-4 lg:grid-cols-[1fr_200px_200px_auto]">
        <input
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          placeholder="Tìm công ty hoặc email"
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
        />
        <select
          value={filters.verification}
          onChange={(event) => setFilters((current) => ({ ...current, verification: event.target.value, page: 1 }))}
          className="rounded-xl border border-slate-200 px-4 py-3"
        >
          <option value="all">Tất cả xác minh</option>
          <option value="verified">Đã xác minh</option>
          <option value="pending">Chờ xác minh</option>
        </select>
        <select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
          className="rounded-xl border border-slate-200 px-4 py-3"
        >
          <option value="all">Tất cả tài khoản</option>
          <option value="active">Đang hoạt động</option>
          <option value="blocked">Đã khóa</option>
        </select>
        <button className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800">Tìm kiếm</button>
      </form>

      {error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

      <div className="mt-5 grid gap-4">
        {result.items.map((employer) => (
          <article key={employer.employer_id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">{employer.company_name}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${employer.is_verified ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                    {employer.is_verified ? 'Đã xác minh' : 'Chờ xác minh'}
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${employer.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {employer.is_active ? 'Tài khoản hoạt động' : 'Tài khoản đã khóa'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{employer.email} · {employer.city || 'Chưa cập nhật địa điểm'}</p>
                <p className="mt-1 text-xs text-slate-500">Người liên hệ: {employer.contact_name || 'Chưa cập nhật'} · ID: {employer.employer_id}</p>
              </div>
              <button
                type="button"
                disabled={updatingId === employer.employer_id}
                onClick={() => updateVerification(employer)}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-50 ${employer.is_verified ? 'border border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-blue-700 text-white hover:bg-blue-800'}`}
              >
                {updatingId === employer.employer_id ? 'Đang xử lý...' : employer.is_verified ? 'Hủy xác minh' : 'Xác minh doanh nghiệp'}
              </button>
            </div>
          </article>
        ))}
        {loading ? <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">Đang tải danh sách...</div> : null}
        {!loading && result.items.length === 0 ? <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">Không tìm thấy nhà tuyển dụng phù hợp.</div> : null}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{result.total} nhà tuyển dụng</span>
        <div className="flex items-center gap-2">
          <button type="button" disabled={filters.page <= 1} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">Trước</button>
          <span>Trang {filters.page}/{totalPages}</span>
          <button type="button" disabled={filters.page >= totalPages} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40">Sau</button>
        </div>
      </div>
    </main>
  );
}

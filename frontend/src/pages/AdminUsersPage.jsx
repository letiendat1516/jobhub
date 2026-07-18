import { useCallback, useEffect, useState } from 'react';
import adminService from '../services/adminService.js';

const accountTypes = [
  { value: 'job_seeker', label: 'Ứng viên' },
  { value: 'employer', label: 'Nhà tuyển dụng' },
];

const statusBadge = (active) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
      active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
    }`}
  >
    {active ? 'Đang hoạt động' : 'Đã khóa'}
  </span>
);

export default function AdminUsersPage() {
  const [accountType, setAccountType] = useState('job_seeker');
  const [keywordInput, setKeywordInput] = useState('');
  const [filters, setFilters] = useState({ keyword: '', status: 'all', page: 1, limit: 20 });
  const [result, setResult] = useState({ items: [], total: 0, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response =
        accountType === 'job_seeker'
          ? await adminService.listJobSeekers(filters)
          : await adminService.listUserEmployers(filters);
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  }, [accountType, filters]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const submitSearch = (event) => {
    event.preventDefault();
    setFilters((current) => ({ ...current, keyword: keywordInput.trim(), page: 1 }));
  };

  const changeType = (value) => {
    setAccountType(value);
    setFilters((current) => ({ ...current, page: 1 }));
  };

  const updateStatus = async (account) => {
    const id = accountType === 'job_seeker' ? account.job_seeker_id : account.employer_id;
    const action = account.is_active ? 'block' : 'activate';
    const label = action === 'block' ? 'khóa' : 'kích hoạt';
    if (!window.confirm(`Bạn có chắc muốn ${label} tài khoản này?`)) return;

    setUpdatingId(id);
    setError('');
    try {
      if (accountType === 'job_seeker') {
        await adminService.updateJobSeekerStatus(id, action);
      } else {
        await adminService.updateEmployerStatus(id, action);
      }
      await loadAccounts();
    } catch (err) {
      setError(err.message || `Không thể ${label} tài khoản.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));

  return (
    <main className="mx-auto max-w-7xl px-6 py-28">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">UC-17</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Quản lý người dùng</h1>
      <p className="mt-2 text-slate-500">
        Theo dõi và khóa hoặc kích hoạt tài khoản. Việc xác minh nhà tuyển dụng được quản lý riêng.
      </p>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Loại tài khoản">
        {accountTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            role="tab"
            aria-selected={accountType === type.value}
            onClick={() => changeType(type.value)}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold ${
              accountType === type.value
                ? 'bg-blue-700 text-white'
                : 'border border-slate-200 bg-white text-slate-600'
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <form onSubmit={submitSearch} className="mt-5 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-[1fr_220px_auto]">
        <input
          value={keywordInput}
          onChange={(event) => setKeywordInput(event.target.value)}
          placeholder="Tìm theo tên hoặc email"
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
        />
        <select
          value={filters.status}
          onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}
          className="rounded-xl border border-slate-200 px-4 py-3 outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="blocked">Đã khóa</option>
        </select>
        <button className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800">
          Tìm kiếm
        </button>
      </form>

      {error ? <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-5 py-4 font-semibold">Tài khoản</th>
                <th className="px-5 py-4 font-semibold">Liên hệ</th>
                <th className="px-5 py-4 font-semibold">Trạng thái</th>
                <th className="px-5 py-4 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.items.map((account) => {
                const id = accountType === 'job_seeker' ? account.job_seeker_id : account.employer_id;
                const name = accountType === 'job_seeker' ? account.full_name : account.company_name;
                return (
                  <tr key={id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{name}</p>
                      <p className="mt-1 text-xs text-slate-500">ID: {id}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <p>{account.email}</p>
                      <p className="mt-1 text-xs">{account.city || 'Chưa cập nhật địa điểm'}</p>
                    </td>
                    <td className="px-5 py-4">{statusBadge(account.is_active)}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        disabled={updatingId === id}
                        onClick={() => updateStatus(account)}
                        className={`rounded-lg px-4 py-2 font-semibold disabled:opacity-50 ${
                          account.is_active
                            ? 'border border-red-200 text-red-700 hover:bg-red-50'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {updatingId === id ? 'Đang xử lý...' : account.is_active ? 'Khóa tài khoản' : 'Kích hoạt'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {loading ? <p className="p-8 text-center text-slate-500">Đang tải danh sách...</p> : null}
        {!loading && result.items.length === 0 ? <p className="p-8 text-center text-slate-500">Không tìm thấy tài khoản phù hợp.</p> : null}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
        <span>{result.total} tài khoản</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={filters.page <= 1}
            onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
            className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40"
          >
            Trước
          </button>
          <span>Trang {filters.page}/{totalPages}</span>
          <button
            type="button"
            disabled={filters.page >= totalPages}
            onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
            className="rounded-lg border bg-white px-3 py-2 disabled:opacity-40"
          >
            Sau
          </button>
        </div>
      </div>
    </main>
  );
}

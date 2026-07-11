import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RoleGuard({ roles, children }) {
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-28">
        <div className="rounded-xl border bg-white p-6 text-slate-500">
          Đang kiểm tra quyền truy cập...
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />;
  }

  if (!roles.includes(user?.role)) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-28">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          Không có quyền truy cập
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Bạn không thể truy cập trang này
        </h1>

        <p className="mt-2 text-slate-500">
          Chức năng này chỉ dành cho tài khoản có quyền phù hợp.
        </p>
      </main>
    );
  }

  return children;
}
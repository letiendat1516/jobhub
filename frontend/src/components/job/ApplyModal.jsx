import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import applicationService from '../../services/applicationService.js';
import Icon from '../ui/Icon.jsx';

export default function ApplyModal({ job, isOpen, onClose, onSubmit }) {
  const { isAuthenticated, role } = useAuth();
  const [context, setContext] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !job || !isAuthenticated || role !== 'job_seeker') return;
    let active = true;
    setState('validating');
    setError('');
    applicationService
      .getApplyContext(job.id)
      .then((response) => {
        if (active) {
          setContext(response.data);
          setState('ready');
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
          setState('error');
        }
      });
    return () => {
      active = false;
    };
  }, [isOpen, job, isAuthenticated, role]);

  if (!isOpen || !job) return null;
  const missingProfile =
    context?.profile && ['full_name', 'headline', 'city'].filter((key) => !context.profile[key]);
  const canSubmit =
    state === 'ready' && context?.resume && !context?.alreadyApplied && !missingProfile?.length;

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setState('submitting');
    setError('');
    try {
      const response = await applicationService.apply({ jobId: Number(job.id), coverLetter });
      setState('success');
      onSubmit?.(response.data);
    } catch (err) {
      setError(err.message);
      setState('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-elevated">
        <header className="flex items-start justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-bold">Ứng tuyển công việc</h2>
            <p className="mt-1 text-sm text-ink-soft">{job.title}</p>
            <p className="text-xs text-ink-muted">
              {job.company?.name} · {job.location}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-ink-muted hover:bg-slate-100"
          >
            <Icon name="close" size={20} />
          </button>
        </header>
        <form onSubmit={submit} className="space-y-5 p-6">
          {!isAuthenticated && (
            <div className="rounded-xl bg-amber-50 p-4 text-sm">
              Vui lòng{' '}
              <Link className="font-semibold text-primary" to="/dang-nhap">
                đăng nhập
              </Link>{' '}
              để ứng tuyển.
            </div>
          )}
          {isAuthenticated && role !== 'job_seeker' && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              Chỉ tài khoản ứng viên mới có thể ứng tuyển.
            </div>
          )}
          {state === 'validating' && (
            <p className="text-sm text-ink-muted">Đang kiểm tra hồ sơ và CV...</p>
          )}
          {context && (
            <>
              <section className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase text-ink-muted">Hồ sơ ứng viên</p>
                <p className="mt-2 font-semibold">{context.profile?.full_name}</p>
                <p className="text-sm text-ink-soft">
                  {context.profile?.headline || 'Chưa có tiêu đề hồ sơ'} ·{' '}
                  {context.profile?.city || 'Chưa có địa điểm'}
                </p>
              </section>
              <section className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase text-ink-muted">CV sẽ được gửi</p>
                {context.resume ? (
                  <>
                    <p className="mt-2 font-semibold">
                      {context.resume.title || context.resume.file_name}
                    </p>
                    <p className="text-xs text-ink-muted">{context.resume.file_name}</p>
                  </>
                ) : (
                  <div>
                    <p className="mt-2 text-sm text-red-600">
                      Bạn chưa có CV chính. Hãy tải CV trong hồ sơ cá nhân.
                    </p>
                    <Link
                      to="/ho-so"
                      onClick={onClose}
                      className="mt-2 inline-block text-sm font-semibold text-primary underline"
                    >
                      Tải CV ngay
                    </Link>
                  </div>
                )}
              </section>
              {missingProfile?.length > 0 && (
                <p className="rounded-xl bg-amber-50 p-3 text-sm">
                  Hồ sơ còn thiếu: {missingProfile.join(', ')}.
                </p>
              )}
              {context.alreadyApplied && (
                <p className="rounded-xl bg-primary-50 p-3 text-sm text-primary">
                  Bạn đã ứng tuyển công việc này.
                </p>
              )}
              <label className="block text-sm font-semibold">
                Thư giới thiệu (không bắt buộc)
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  maxLength={5000}
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-normal"
                />
              </label>
            </>
          )}
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {state === 'success' && (
            <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
              <p className="font-semibold">Ứng tuyển thành công.</p>
              <Link to="/applications" className="mt-1 inline-block underline">
                Theo dõi hồ sơ ứng tuyển
              </Link>
            </div>
          )}
          <div className="flex justify-end gap-3 border-t pt-5">
            <button type="button" onClick={onClose} className="btn-secondary">
              Đóng
            </button>
            <button
              type="submit"
              disabled={!canSubmit || state === 'submitting' || state === 'success'}
              className="btn-primary"
            >
              {state === 'submitting' ? 'Đang gửi...' : 'Xác nhận ứng tuyển'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

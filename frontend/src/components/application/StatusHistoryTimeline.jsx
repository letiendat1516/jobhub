import ApplicationStatusBadge from './ApplicationStatusBadge.jsx';

export default function StatusHistoryTimeline({ application, history = [] }) {
  const initial = {
    id: 'submitted',
    new_status: 'SUBMITTED',
    changed_at: application.application_date,
    changed_by_role: 'job_seeker',
  };
  return (
    <ol className="space-y-4">
      {[initial, ...history].map((item) => (
        <li key={item.id} className="flex gap-3">
          <span className="mt-2 h-2.5 w-2.5 rounded-full bg-primary" />
          <div>
            <ApplicationStatusBadge status={item.new_status} />
            <p className="mt-1 text-xs text-ink-muted">
              {new Date(item.changed_at).toLocaleString('vi-VN')} ·{' '}
              {item.changed_by_role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

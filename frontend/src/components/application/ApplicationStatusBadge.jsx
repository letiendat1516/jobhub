const labels = {
  SUBMITTED: 'Đã nộp',
  UNDER_REVIEW: 'Đang xem xét',
  ACCEPTED: 'Đã chấp nhận',
  REJECTED: 'Đã từ chối',
};
const styles = {
  SUBMITTED: 'bg-blue-50 text-blue-700',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700',
  ACCEPTED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
};

export default function ApplicationStatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-700'}`}
    >
      {labels[status] || status}
    </span>
  );
}

export { labels as applicationStatusLabels };

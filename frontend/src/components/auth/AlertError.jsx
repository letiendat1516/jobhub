import Icon from '../ui/Icon.jsx';

/**
 * AlertError — banner lỗi tổng thể từ API (vd: sai mật khẩu, email trùng).
 *
 * @param {string|null} message - null thì không render gì.
 */
export default function AlertError({ message }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
    >
      <span className="mt-0.5 shrink-0 text-red-500">
        <Icon name="close" size={16} />
      </span>
      <span className="leading-5">{message}</span>
    </div>
  );
}

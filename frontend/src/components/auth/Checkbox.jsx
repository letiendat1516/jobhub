import { useId } from 'react';

import { cn } from '../../utils/cn.js';

/**
 * Checkbox — label + checkbox, dùng cho phần đồng ý điều khoản.
 *
 * @param {object} props
 * @param {import('react').ReactNode} [props.hint] - dòng mô tả phụ dưới checkbox
 * @param {boolean} [props.required] - nếu true, hiện dấu * và bôi đậm yêu cầu
 * @param {object} [props.rest] - các prop input còn lại (checked, onChange, ...)
 */
export default function Checkbox({ label, hint, required = false, className, ...rest }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer gap-3">
      <input
        id={id}
        type="checkbox"
        className={cn(
          'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300',
          'text-primary focus:ring-2 focus:ring-primary/30',
          className,
        )}
        {...rest}
      />
      <span className="text-sm leading-5 text-ink-soft">
        {label}
        {required ? <span className="ml-0.5 text-primary">*</span> : null}
        {hint ? (
          <span className="mt-1 block text-xs text-ink-muted">{hint}</span>
        ) : null}
      </span>
    </label>
  );
}

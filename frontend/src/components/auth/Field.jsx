import { useId } from 'react';

import { cn } from '../../utils/cn.js';

/**
 * Field — wrapper input có label, icon tuỳ chọn, và message lỗi.
 * Dùng cho cả login và register form.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} [props.type='text']
 * @param {string} [props.autoComplete]
 * @param {boolean} [props.required]
 * @param {string} [props.error] - thông báo lỗi của trường này
 * @param {import('react').ReactNode} [props.icon] - icon đầu field
 * @param {import('react').ReactNode} [props.trailing] - nút bên phải (vd: show password)
 * @param {object} [props.rest] - các prop input còn lại
 */
export default function Field({
  label,
  type = 'text',
  autoComplete,
  required = false,
  error,
  icon,
  trailing,
  ...rest
}) {
  const id = useId();
  const hasError = Boolean(error);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-ink-soft"
      >
        {label}
        {required ? <span className="ml-0.5 text-primary">*</span> : null}
      </label>

      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted">
            {icon}
          </span>
        ) : null}

        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={hasError || undefined}
          className={cn(
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink',
            'placeholder:text-ink-muted transition-colors',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
            icon ? 'pl-10' : '',
            trailing ? 'pr-11' : '',
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200/40'
              : 'border-slate-200',
          )}
          {...rest}
        />

        {trailing ? (
          <span className="absolute inset-y-0 right-2 flex items-center">
            {trailing}
          </span>
        ) : null}
      </div>

      {hasError ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

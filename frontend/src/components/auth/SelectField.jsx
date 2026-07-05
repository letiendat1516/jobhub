import { useId } from 'react';

import { cn } from '../../utils/cn.js';

/**
 * SelectField — label + select dropdown, dùng chung cho form auth.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {{value:string,label:string}[]|string[]} props.options
 * @param {string} [props.placeholder] - option rỗng đầu tiên (vd: "Chọn tỉnh/thành phố")
 * @param {string} [props.error]
 * @param {object} [props.rest] - các prop <select> còn lại
 */
export default function SelectField({
  label,
  options,
  placeholder,
  error,
  required = false,
  ...rest
}) {
  const id = useId();
  const hasError = Boolean(error);

  const normalized = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt,
  );

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
        <select
          id={id}
          aria-invalid={hasError || undefined}
          className={cn(
            'w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-ink',
            'transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200/40'
              : 'border-slate-200',
            rest.value ? '' : 'text-ink-muted',
          )}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {normalized.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-muted">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>

      {hasError ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

import { useState } from 'react';

import Icon from '../components/ui/Icon.jsx';

/**
 * usePasswordField — state + nút show/hide cho ô nhập mật khẩu.
 *
 * Trả về các prop sẵn để truyền vào <Field>:
 * @returns {{type:string, trailing:JSX.Element}}
 */
export default function usePasswordField() {
  const [visible, setVisible] = useState(false);

  const toggle = () => setVisible((v) => !v);

  return {
    type: visible ? 'text' : 'password',
    trailing: (
      <button
        type="button"
        onClick={toggle}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-slate-100 hover:text-ink"
      >
        <Icon name={visible ? 'shield' : 'close'} size={16} />
      </button>
    ),
  };
}

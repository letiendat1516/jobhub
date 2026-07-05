import { Link } from 'react-router-dom';

import Brand from '../ui/Brand.jsx';
import Icon from '../ui/Icon.jsx';

/**
 * AuthShell — khung 2 cột dùng chung cho login & register.
 * Cột trái: brand panel (gradient + giá trị cốt lõi).
 * Cột phải: form (truyền qua prop `children`).
 *
 * Auth pages KHÔNG dùng PublicLayout (không navbar/footer) để focus form.
 */
const highlights = [
  {
    icon: 'sparkles',
    title: 'Hiểu đúng hồ sơ của bạn',
    desc: 'Đọc CV và nhận diện kỹ năng, kinh nghiệm thực tế thay vì chỉ tìm theo từ khoá.',
  },
  {
    icon: 'shield',
    title: 'An toàn cho dữ liệu cá nhân',
    desc: 'Thông tin được mã hoá và bảo vệ theo tiêu chuẩn phổ biến của các dịch vụ tài chính.',
  },
  {
    icon: 'trendingUp',
    title: 'Gợi ý việc làm sát với bạn',
    desc: 'Ưu tiên các tin tuyển dụng phù hợp kinh nghiệm và định hướng nghề nghiệp.',
  },
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/5" />

        <Link to="/" className="relative z-10 inline-flex">
          <Brand variant="light" href={null} className="h-12 w-12" />
        </Link>

        <div className="relative z-10">
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white">
            Tìm việc đúng người, đúng việc
          </h2>
          <p className="mt-3 max-w-md text-primary-100">
            JobHub giúp ứng viên tiếp cận các tin tuyển dụng phù hợp và để nhà tuyển dụng tìm được
            người đúng yêu cầu nhanh hơn.
          </p>

          <ul className="mt-10 space-y-6">
            {highlights.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon name={item.icon} size={20} />
                </span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-primary-100">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-primary-100">
          © {new Date().getFullYear()} JobHub. Mọi quyền được bảo lưu.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center bg-canvas px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          {/* Brand trên mobile (lg:hidden vì mobile không hiện aside) */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Brand className="h-14 w-14" />
          </div>

          <header className="mb-8">
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-ink-soft">{subtitle}</p> : null}
          </header>

          {children}

          {footer ? <div className="mt-6 text-center text-sm text-ink-soft">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}

import { Link } from 'react-router-dom';

import Brand from '../ui/Brand.jsx';
import Icon from '../ui/Icon.jsx';

/** Footer link groups (docs/06_HOMEPAGE_SPEC.md §8.11). */
const groups = [
  {
    title: 'Công ty',
    links: [
      { label: 'Giới thiệu JobHub', to: '/#why-jobhub' },
      { label: 'Tuyển dụng', to: '/#why-jobhub' },
      { label: 'Tin tức', to: '/#career-resources' },
      { label: 'Liên hệ', to: '/#why-jobhub' },
    ],
  },
  {
    title: 'Sản phẩm',
    links: [
      { label: 'Tìm việc làm', to: '/viec-lam' },
      { label: 'Hồ sơ & CV', to: '/#ai-analysis' },
      { label: 'Dành cho doanh nghiệp', to: '/dang-ky' },
      { label: 'Gợi ý việc làm AI', to: '/#ai-analysis' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Trung tâm trợ giúp', to: '/#why-jobhub' },
      { label: 'Câu hỏi thường gặp', to: '/#why-jobhub' },
      { label: 'Hướng dẫn sử dụng', to: '/#career-resources' },
      { label: 'Báo cáo vấn đề', to: '/#why-jobhub' },
    ],
  },
  {
    title: 'Pháp lý',
    links: [
      { label: 'Điều khoản dịch vụ', to: '/#why-jobhub' },
      { label: 'Chính sách bảo mật', to: '/#why-jobhub' },
      { label: 'Chính sách cookie', to: '/#why-jobhub' },
    ],
  },
];

const socials = [
  { name: 'linkedin', label: 'LinkedIn' },
  { name: 'facebook', label: 'Facebook' },
  { name: 'youtube', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-page py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
          {/* Brand block */}
          <div className="col-span-2">
            <Brand />
            <p className="mt-4 max-w-xs text-sm leading-7 text-ink-soft">
              JobHub — nền tảng tuyển dụng thông minh ứng dụng AI, kết nối ứng viên với doanh nghiệp
              thông qua việc làm phù hợp nhất.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href="/#why-jobhub"
                  aria-label={`JobHub trên ${s.label}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-ink-soft transition-colors hover:border-primary hover:bg-primary hover:text-white"
                >
                  <Icon name={s.name} size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-bold text-ink">{group.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-soft transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} JobHub. Mọi quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <Icon name="mail" size={14} />
              lienhe@jobhub.vn
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="phone" size={14} />
              1900 1234
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

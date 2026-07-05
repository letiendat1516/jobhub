import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';
import logo from '../../assets/logo.svg';

/**
 * Brand — logo mark. Dùng chung ở Navbar, Footer, Auth pages.
 *
 * @param {'dark' | 'light'} [variant='dark'] - 'light' chuyển sang monochrome
 *   trắng để dùng trên nền tối.
 * @param {string} [href] - link target (mặc định về trang chủ).
 * @param {string} [className] - override hoàn toàn size (vd: 'h-14 w-14').
 *   Khi truyền className, default 'h-9 w-9' sẽ bị bỏ qua để tránh xung đột.
 */
export default function Brand({ variant = 'dark', href = '/', className }) {
  const colorClass = variant === 'light' ? 'brightness-0 invert' : '';

  // Nếu caller truyền className (chứa size), dùng nó; không thì default h-9 w-9.
  const sizeClass = className ?? 'h-9 w-9';

  const content = <img src={logo} alt="JobHub" className={cn('shrink-0', sizeClass, colorClass)} />;

  if (!href) {
    return content;
  }

  return (
    <Link to={href} aria-label="JobHub — trang chủ" className="inline-flex">
      {content}
    </Link>
  );
}

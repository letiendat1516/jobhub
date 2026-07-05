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
 *   Khi truyền className, default 'h-[100px] w-[100px]' sẽ bị bỏ qua.
 */
export default function Brand({ variant = 'dark', href = '/', className }) {
  const colorClass = variant === 'light' ? 'brightness-0 invert' : '';

  // Mặc định logo luôn 100x100 ở mọi nơi; caller có thể override qua className.
  const sizeClass = className ?? 'h-[100px] w-[100px]';

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

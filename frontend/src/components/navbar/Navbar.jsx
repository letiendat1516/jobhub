import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Brand from '../ui/Brand.jsx';
import Icon from '../ui/Icon.jsx';
import { cn } from '../../utils/cn.js';
import { useScrolled } from '../../hooks/index.js';
import { useAuth } from '../../context/AuthContext.jsx';

const navLinks = [
  { label: 'Việc làm', to: '/#featured-jobs' },
  { label: 'Công ty', to: '/#top-companies' },
  { label: 'Hồ sơ & AI', to: '/#ai-analysis' },
  { label: 'Cẩm nang nghề nghiệp', to: '/#career-resources' },
];

const roleLabel = (role) => (role === 'employer' ? 'NTD' : role === 'admin' ? 'Admin' : 'Ứng viên');

/**
 * Navbar — thanh điều hướng chính (tham khảo TopCV).
 *
 * Cấu trúc DOM đơn giản, chỉ 2 section con để `justify-between` hoạt động:
 *
 *   <nav flex justify-between>           ← container 1280px, cao 72px
 *     <div left flex>  logo + navigation
 *     <div right flex> employer + login + register
 *
 * KHÔNG dùng grid, KHÔNG dùng absolute cho layout (chỉ dropdown user menu
 * dùng absolute vì nó là overlay).
 */
export default function Navbar() {
  const scrolled = useScrolled(8);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Đóng user menu khi click ra ngoài.
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-slate-200 bg-white/95 shadow-soft backdrop-blur-md'
          : 'border-b border-slate-200/60 bg-white/85 backdrop-blur-md',
      )}
    >
      {/* Container: max-width 1280px, căn giữa, padding 24px.
          Giữ chiều cao cố định 72px; logo overlay không làm navbar to theo.
          Logo đặt relative theo NAV (luôn 72px) chứ không phải HEADER
          (header cao thay đổi khi mobile menu mở) → logo im một chỗ. */}
      <nav className="relative mx-auto flex h-18 w-full items-center justify-between px-6">
        {/* Logo overlay: absolute theo nav (relative), căn giữa dọc,
            tách khỏi flex flow. top-1/2 -translate-y-1/2 → căn giữa đúng
            theo chiều cao nav cố định 72px, không bị kéo khi menu mở. */}
        <div className="pointer-events-none absolute left-6 top-1/2 z-10 -translate-y-1/2">
          <div className="pointer-events-auto">
            <Brand href="/" className="h-[100px] w-[100px]" />
          </div>
        </div>

        {/* ===================== LEFT SECTION =====================
            Nav links có padding-left để tránh bị logo (overlay absolute)
            che, nhưng vẫn nằm cạnh logo thay vì bị đẩy ra giữa. */}
        <ul className="hidden items-center gap-2 whitespace-nowrap md:flex md:pl-[120px]">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-slate-100 hover:text-primary"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ===================== RIGHT SECTION =====================
            ml-auto để luôn đẩy sát mép phải (kể cả khi section trái bị ẩn
            trên mobile, tránh justify-between đẩy nút hamburger sang trái). */}
        <div className="ml-auto flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/dang-nhap" className="btn-secondary hidden px-4 py-2 md:inline-flex">
                Đăng nhập
              </Link>
              <Link to="/dang-ky" className="btn-primary hidden px-4 py-2 md:inline-flex">
                Đăng ký
              </Link>
              <Link
                to="/dang-ky-nha-tuyen-dung"
                className="hidden rounded-lg px-2 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-primary md:inline-block"
              >
                Dành cho NTD
              </Link>
            </>
          ) : (
            <div ref={userMenuRef} className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 transition-colors hover:border-primary/40 hover:bg-slate-50"
                aria-expanded={userMenuOpen}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                </span>
                <span className="max-w-[120px] truncate text-sm font-medium text-ink">
                  {user?.name}
                </span>
                <span className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  {roleLabel(user?.role)}
                </span>
                <Icon
                  name="chevronDown"
                  size={14}
                  className={cn(
                    'text-ink-muted transition-transform',
                    userMenuOpen && 'rotate-180',
                  )}
                />
              </button>

              <AnimatePresence>
                {userMenuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card"
                  >
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
                      <p className="truncate text-xs text-ink-muted">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/ho-so"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-soft transition-colors hover:bg-slate-50 hover:text-primary"
                      >
                        <Icon name="users" size={16} />
                        Hồ sơ cá nhân
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <Icon name="close" size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )}

          {/* Mobile hamburger — chỉ hiện dưới md (768px) */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-slate-100 md:hidden"
            aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileOpen}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>
      </nav>

      {/* ===================== MOBILE MENU ===================== */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-slate-200 bg-white md:hidden"
          >
            <ul className="mx-auto flex w-full flex-col gap-1 px-6 py-4">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-ink-soft hover:bg-slate-100 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="mt-3 border-t border-slate-100 pt-3">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-white">
                        {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                        <p className="text-xs text-primary">{roleLabel(user.role)}</p>
                      </div>
                    </div>
                    <Link
                      to="/ho-so"
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-slate-100"
                    >
                      Hồ sơ cá nhân
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    <Link
                      to="/dang-nhap"
                      onClick={() => setMobileOpen(false)}
                      className="btn-secondary justify-center"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/dang-ky"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary justify-center"
                    >
                      Đăng ký miễn phí
                    </Link>
                    <Link
                      to="/dang-ky-nha-tuyen-dung"
                      onClick={() => setMobileOpen(false)}
                      className="mt-1 text-center text-xs text-ink-muted hover:text-primary"
                    >
                      Dành cho nhà tuyển dụng →
                    </Link>
                  </div>
                )}
              </li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

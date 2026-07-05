import { Link } from 'react-router-dom';

/**
 * NotFoundPage — 404 surface.
 */
export default function NotFoundPage() {
  return (
    <section className="container-page py-24 sm:py-32">
      <div className="mx-auto max-w-xl text-center">
        <p className="eyebrow mb-4">404</p>
        <h1 className="text-3xl font-bold sm:text-4xl">Không tìm thấy trang</h1>
        <p className="mt-4 text-base leading-7 text-ink-soft">
          Trang bạn đang tìm có thể đã bị di chuyển hoặc không còn tồn tại.
        </p>
        <div className="mt-8 flex justify-center">
          <Link to="/" className="btn-primary">
            Về trang chủ
          </Link>
        </div>
      </div>
    </section>
  );
}

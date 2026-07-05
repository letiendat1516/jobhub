import { Link } from 'react-router-dom';

import Brand from '../components/ui/Brand.jsx';

/**
 * PlaceholderPage — branded "coming soon" surface for routes whose
 * features are implemented in later phases. Kept minimal and on-brand
 * so navigation never dead-ends.
 */
export default function PlaceholderPage({ eyebrow, title, description }) {
  return (
    <section className="container-page py-24 sm:py-32">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-4 text-base leading-7 text-ink-soft">{description}</p>
        ) : null}
        <div className="mt-8 flex justify-center">
          <Link to="/" className="btn-primary">
            Về trang chủ
          </Link>
        </div>
      </div>
    </section>
  );
}

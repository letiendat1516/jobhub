import Reveal from '../ui/Reveal.jsx';
import { trustedCompanies } from '../../data/companies.js';

/**
 * Trusted-by strip — renders well-known enterprise names as muted
 * typographic wordmarks (no trademarked logo files are bundled).
 */
export default function CompanyLogoGrid() {
  return (
    <section className="border-y border-slate-100 bg-white py-12">
      <div className="container-page">
        <Reveal>
          <p className="text-center text-sm font-medium uppercase tracking-wider text-ink-muted">
            Được tin dùng bởi các doanh nghiệp hàng đầu tại Việt Nam
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="mt-8 grid grid-cols-2 items-center gap-x-6 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
            {trustedCompanies.map((name) => (
              <li
                key={name}
                className="flex items-center justify-center text-center text-lg font-bold tracking-tight text-ink-muted/80 transition-colors duration-200 hover:text-primary"
                style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
              >
                {name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

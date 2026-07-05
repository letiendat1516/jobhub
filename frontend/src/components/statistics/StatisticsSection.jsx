import Reveal from '../ui/Reveal.jsx';
import StatisticCard from './StatisticCard.jsx';
import { statistics } from '../../data/stats.js';

/**
 * Career statistics band (docs/06_HOMEPAGE_SPEC.md §8.8).
 * Sits on the primary surface to add visual rhythm.
 */
export default function StatisticsSection() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      </div>
      <div className="container-page relative py-16 sm:py-20">
        <Reveal>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {statistics.map((stat, index) => (
              <Reveal key={stat.id} delay={index * 0.08}>
                <StatisticCard value={stat.value} label={stat.label} icon={stat.icon} />
              </Reveal>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

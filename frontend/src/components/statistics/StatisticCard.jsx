import Icon from '../ui/Icon.jsx';

/**
 * StatisticCard — large headline number + label (docs/06 §8.8).
 */
export default function StatisticCard({ value, label, icon }) {
  return (
    <div className="text-center">
      {icon ? (
        <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white">
          <Icon name={icon} size={22} />
        </span>
      ) : null}
      <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{value}</p>
      <p className="mt-2 text-sm text-primary-100">{label}</p>
    </div>
  );
}

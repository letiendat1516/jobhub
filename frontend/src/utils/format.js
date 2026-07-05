/**
 * Display formatters for the Presentation layer.
 * Pure functions only — no business logic.
 */

const vi = new Intl.NumberFormat('vi-VN');

/**
 * Formats a salary range in VND using Vietnamese grouping.
 * @param {number} [min]
 * @param {number} [max]
 * @param {string} [currency='VND']
 * @returns {string}
 */
export const formatSalary = (min, max, currency = 'VND') => {
  const fmt = (value) => `${Math.round(value / 1_000_000)} triệu`;
  if (min && max) return `${fmt(min)} – ${fmt(max)} ${currency}`;
  if (min) return `Từ ${fmt(min)} ${currency}`;
  if (max) return `Lên đến ${fmt(max)} ${currency}`;
  return 'Thỏa thuận';
};

/** Compact number formatting, e.g. 30000 -> "30.000+". */
export const formatCompact = (value, suffix = '+') => `${vi.format(value)}${suffix}`;

export default { formatSalary, formatCompact };

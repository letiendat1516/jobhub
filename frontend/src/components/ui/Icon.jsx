/**
 * Icon — inline SVG icon set (zero-dependency).
 * All icons share a 24x24 grid, currentColor stroke, rounded joins.
 *
 * @param {string} name - icon key (see paths below).
 * @param {number} [size=22]
 * @param {string} [className]
 * @param {'stroke'|'fill'} [variant='stroke']
 */
const paths = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></>,
  mapPin: (
    <>
      <path d="M12 21s-6.5-5.4-6.5-10.2A6.5 6.5 0 0 1 18.5 10.8C18.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.6" r="2.3" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
      <path d="M8.5 7.6V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.6" />
      <path d="M3.6 12.5h16.8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.4V12l3.1 1.9" />
    </>
  ),
  bookmark: <path d="M6.5 4.5h11a1 1 0 0 1 1 1v14L12 15.6 6.5 19.5v-14a1 1 0 0 1 1-1Z" />,
  bookmarkFill: <path d="M6.5 4.5h11a1 1 0 0 1 1 1v14L12 15.6 6.5 19.5v-14a1 1 0 0 1 1-1Z" />,
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  check: <path d="m5 12.5 4.4 4.4L19 7" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.4 12 2.5 2.5 4.7-5" />
    </>
  ),
  star: (
    <path d="m12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 17.1l-5.25 2.65 1-5.85L3.5 9.75l5.9-.85L12 3.6Z" />
  ),
  fileText: (
    <>
      <path d="M7 3.5h6l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-8.5A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5Z" />
      <path d="M13 3.5V8h4" />
      <path d="M8.5 12.5h7M8.5 15.5h7M8.5 9.5h2" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 4 13.4 8.6 18 10l-4.6 1.4L12 16l-1.4-4.6L6 10l4.6-1.4L12 4Z" />
      <path d="M18.6 14.4 19 16l1.6.5L19 17l-.4 1.6L18 17l-1.6-.5L18 16l.6-1.6Z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.6 19a5.5 5.5 0 0 1 10.8 0" />
      <path d="M16 6.4a3 3 0 0 1 0 5.6" />
      <path d="M17.2 14.4a5.5 5.5 0 0 1 3.2 4.6" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3.5" width="14" height="17" rx="1.6" />
      <path d="M8.8 7.5h2.2M13 7.5h2.2M8.8 11h2.2M13 11h2.2M8.8 14.5h2.2M13 14.5h2.2" />
      <path d="M10.6 20.5v-3h2.8v3" />
    </>
  ),
  trendingUp: (
    <>
      <path d="M3.5 16.5 9 11l3.6 3.6L20 7.2" />
      <path d="M15 7.2h5v5" />
    </>
  ),
  wallet: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2.6" />
      <path d="M3.6 10h16.8" />
      <circle cx="16.6" cy="14" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9.5h12V10" />
      <path d="M10 19.5v-5h4v5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.6 2.6 2.6 14.4 0 17M12 3.5c-2.6 2.6-2.6 14.4 0 17" />
    </>
  ),
  quote: (
    <path d="M9 7.2c-2.5 1-4 3.2-4 5.9v3.4h5V12H7.6c0-1.9.8-3.2 2.4-3.9L9 7.2ZM19 7.2c-2.5 1-4 3.2-4 5.9v3.4h5V12h-2.4c0-1.9.8-3.2 2.4-3.9L19 7.2Z" />
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="m8 7.6 4-4 4 4" />
      <path d="M5 13.5v4.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4.5" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6 18 18M18 6 6 18" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  bolt: <path d="M13 3 5 13.2h5.4L9.4 21 17 10.6h-5.2L13 3Z" />,
  network: (
    <>
      <circle cx="6" cy="6" r="2.1" />
      <circle cx="18" cy="6" r="2.1" />
      <circle cx="12" cy="18" r="2.1" />
      <path d="M7.7 7.4 10.4 16M16.3 7.4 13.6 16M8 6h8" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 19 6v5.2c0 4.4-3 7.9-7 9.3-4-1.4-7-4.9-7-9.3V6l7-2.5Z" />
      <path d="m9 11.8 2.1 2.1L15 10" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.6 7.6 7.4 5 7.4-5" />
    </>
  ),
  phone: (
    <path d="M6.5 4.5h3l1.5 4-2 1.4a11 11 0 0 0 5 5l1.4-2 4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 6.5a2 2 0 0 1 2-2Z" />
  ),
  send: (
    <>
      <path d="M21 4 3 11l7 2 2 7 9-16Z" />
      <path d="m10 13 4-4" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8 10.5V16M8 7.6v.01M11.5 16v-3a2 2 0 0 1 4 0v3M11.5 16v-5.5" />
    </>
  ),
  facebook: <path d="M13.5 21v-7h2.3l.5-3h-2.8V9c0-.9.3-1.5 1.6-1.5H17V4.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V11H8v3h2.5v7h3Z" />,
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3.5" />
      <path d="m10.5 9.5 4.5 2.5-4.5 2.5v-5Z" fill="currentColor" stroke="none" />
    </>
  ),
};

export default function Icon({ name, size = 22, className, variant = 'stroke' }) {
  const node = paths[name];
  if (!node) return null;

  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: variant === 'fill' ? 'currentColor' : 'none',
    stroke: variant === 'fill' ? 'none' : 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
    className,
  };

  return <svg {...common}>{node}</svg>;
}

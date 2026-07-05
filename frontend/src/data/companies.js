/**
 * Companies — (1) trusted-by wordmark strip and (2) featured top companies.
 * Brand names are rendered as typographic wordmarks (no trademarked logo
 * files are bundled). Replaced by the Employer API in Phase 5.
 */
import companyOffice from '../assets/images/company-office.jpg';
import teamMeeting from '../assets/images/team-meeting.jpg';
import teamCollab from '../assets/images/team-collab.jpg';

/** Trusted-by strip — well-known enterprises (rendered as wordmarks). */
export const trustedCompanies = [
  'FPT',
  'Viettel',
  'VNPay',
  'Shopee',
  'MoMo',
  'Grab',
  'Techcombank',
  'VNG',
];

/** Featured top companies with a real cover photo. */
export const topCompanies = [
  {
    id: 'co-1',
    name: 'FPT Software',
    industry: 'Công nghệ thông tin',
    location: 'Quận Cầu Giấy, Hà Nội',
    openPositions: 128,
    size: '10.000+ nhân viên',
    initials: 'FS',
    brand: 'bg-orange-50 text-orange-600',
    cover: companyOffice,
  },
  {
    id: 'co-2',
    name: 'MoMo (M_Service)',
    industry: 'Fintech / Thanh toán số',
    location: 'Quận 7, TP. Hồ Chí Minh',
    openPositions: 64,
    size: '1.000 - 5.000 nhân viên',
    initials: 'MM',
    brand: 'bg-pink-50 text-pink-600',
    cover: teamMeeting,
  },
  {
    id: 'co-3',
    name: 'Shopee Vietnam',
    industry: 'Thương mại điện tử',
    location: 'Quận 6, TP. Hồ Chí Minh',
    openPositions: 96,
    size: '5.000+ nhân viên',
    initials: 'SH',
    brand: 'bg-amber-50 text-amber-600',
    cover: teamCollab,
  },
];

export default { trustedCompanies, topCompanies };

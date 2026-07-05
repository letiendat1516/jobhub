/**
 * Featured jobs — static homepage sample data.
 * Realistic Vietnamese job postings. Replaced by the Job API in Phase 7.
 *
 * brand: tailwind bg/text classes used for the company monogram badge.
 */

export const featuredJobs = [
  {
    id: 'jb-001',
    title: 'Lập trình viên Front-end (ReactJS)',
    company: { name: 'FPT Software', initials: 'FS', brand: 'bg-orange-50 text-orange-600' },
    salaryLabel: '25 – 40 triệu',
    location: 'Hà Nội',
    experience: '2 – 4 năm',
    employmentType: 'Toàn thời gian',
    workType: 'Hybrid',
    tags: ['ReactJS', 'TypeScript', 'TailwindCSS'],
    postedAgo: '2 ngày trước',
    hot: true,
  },
  {
    id: 'jb-002',
    title: 'Kỹ sư Backend Node.js / Express',
    company: { name: 'MoMo', initials: 'MM', brand: 'bg-pink-50 text-pink-600' },
    salaryLabel: '30 – 50 triệu',
    location: 'TP. Hồ Chí Minh',
    experience: '3 – 5 năm',
    employmentType: 'Toàn thời gian',
    workType: 'Tại văn phòng',
    tags: ['Node.js', 'PostgreSQL', 'Microservices'],
    postedAgo: 'Hôm qua',
    hot: true,
  },
  {
    id: 'jb-003',
    title: 'Chuyên viên Phân tích Dữ liệu (Data Analyst)',
    company: { name: 'Shopee', initials: 'SH', brand: 'bg-amber-50 text-amber-600' },
    salaryLabel: '20 – 35 triệu',
    location: 'TP. Hồ Chí Minh',
    experience: '1 – 3 năm',
    employmentType: 'Toàn thời gian',
    workType: 'Tại văn phòng',
    tags: ['SQL', 'Python', 'Power BI'],
    postedAgo: '3 ngày trước',
    hot: false,
  },
  {
    id: 'jb-004',
    title: 'Quản lý Sản phẩm Kỹ thuật (Technical PM)',
    company: { name: 'Viettel', initials: 'VT', brand: 'bg-red-50 text-red-600' },
    salaryLabel: '40 – 65 triệu',
    location: 'Hà Nội',
    experience: '4 – 6 năm',
    employmentType: 'Toàn thời gian',
    workType: 'Hybrid',
    tags: ['Agile', 'SaaS', 'Roadmap'],
    postedAgo: '5 ngày trước',
    hot: false,
  },
  {
    id: 'jb-005',
    title: 'Thiết kế UI/UX Senior',
    company: { name: 'VNG', initials: 'VNG', brand: 'bg-sky-50 text-sky-600' },
    salaryLabel: '28 – 45 triệu',
    location: 'TP. Hồ Chí Minh',
    experience: '3 – 5 năm',
    employmentType: 'Toàn thời gian',
    workType: 'Remote',
    tags: ['Figma', 'Design System', 'Research'],
    postedAgo: '1 tuần trước',
    hot: false,
  },
  {
    id: 'jb-006',
    title: 'Chuyên viên Marketing Số (Digital Marketing)',
    company: { name: 'Grab', initials: 'GR', brand: 'bg-green-50 text-green-600' },
    salaryLabel: '18 – 30 triệu',
    location: 'Hà Nội',
    experience: '1 – 3 năm',
    employmentType: 'Toàn thời gian',
    workType: 'Hybrid',
    tags: ['SEO', 'Performance', 'Content'],
    postedAgo: '4 ngày trước',
    hot: false,
  },
];

export default featuredJobs;

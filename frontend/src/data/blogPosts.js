/**
 * Career resources / blog cards (docs/06_HOMEPAGE_SPEC.md §8.10).
 * Covers are real photography imported as Vite asset URLs.
 */
import workspace from '../assets/images/workspace.jpg';
import careerGrowth from '../assets/images/career-growth.jpg';
import jobInterview from '../assets/images/job-interview.jpg';

export const blogPosts = [
  {
    id: 'bl-1',
    category: 'Viết CV',
    title: 'Cách viết CV chuyên nghiệp thu hút nhà tuyển dụng',
    excerpt:
      'Những nguyên tắc cấu trúc và cách trình bày CV giúp hồ sơ của bạn nổi bật giữa hàng trăm ứng viên khác.',
    readTime: '6 phút đọc',
    date: '28/06/2026',
    cover: workspace,
  },
  {
    id: 'bl-2',
    category: 'Lộ trình nghề nghiệp',
    title: 'Định hướng lộ trình nghề nghiệp cho người làm công nghệ',
    excerpt:
      'Khung phát triển năng lực theo từng giai đoạn, từ junior đến senior, kèm kỹ năng cần trau dồi.',
    readTime: '8 phút đọc',
    date: '21/06/2026',
    cover: careerGrowth,
  },
  {
    id: 'bl-3',
    category: 'Phỏng vấn',
    title: 'Bí quyết trả lời phỏng vấn tự tin và ấn tượng',
    excerpt:
      'Phương pháp trả lời theo cấu trúc, các câu hỏi thường gặp và cách để lại dấu ấn tích cực.',
    readTime: '7 phút đọc',
    date: '14/06/2026',
    cover: jobInterview,
  },
];

export default blogPosts;

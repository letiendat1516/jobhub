/**
 * Testimonials — realistic Vietnamese reviews with real portrait photos.
 * Portraits are imported as Vite asset URLs (never AI-generated faces).
 */
import portraitAnh from '../assets/images/portrait-anh.jpg';
import portraitMinh from '../assets/images/portrait-minh.jpg';
import portraitLinh from '../assets/images/portrait-linh.jpg';

export const testimonials = [
  {
    id: 'ts-1',
    name: 'Nguyễn Hoàng Anh',
    role: 'Lập trình viên Front-end',
    company: 'FPT Software',
    avatar: portraitAnh,
    rating: 5,
    quote:
      'Nhờ AI phân tích CV, tôi hiểu rõ điểm mạnh của mình và nhận được những gợi ý việc làm thực sự phù hợp. Chỉ sau hai tuần, tôi đã nhận lời mời phỏng vấn từ công ty mơ ước.',
  },
  {
    id: 'ts-2',
    name: 'Trần Quang Minh',
    role: 'Kỹ sư Backend',
    company: 'MoMo',
    avatar: portraitMinh,
    rating: 5,
    quote:
      'Hồ sơ được tối ưu tự động giúp tôi tiết kiệm rất nhiều thời gian. Việc theo dõi trạng thái ứng tuyển ngay trên nền tảng cũng vô cùng thuận tiện và minh bạch.',
  },
  {
    id: 'ts-3',
    name: 'Lê Thanh Linh',
    role: 'Chuyên viên Marketing',
    company: 'Grab',
    avatar: portraitLinh,
    rating: 5,
    quote:
      'Các gợi ý việc làm rất chính xác và có lý do giải thích rõ ràng. Tôi cảm thấy tự tin hơn khi biết vị trí nào thực sự phù hợp với định hướng nghề nghiệp của mình.',
  },
];

export default testimonials;

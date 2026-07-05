/**
 * AI resume analysis workflow steps (docs/06_HOMEPAGE_SPEC.md §8.6).
 * Illustrated as a simple process — NOT a fake dashboard.
 */
export const workflowSteps = [
  {
    id: 'wf-1',
    icon: 'upload',
    title: 'Tải lên CV',
    description: 'Đăng tải hồ sơ PDF của bạn lên hệ thống trong vài giây.',
  },
  {
    id: 'wf-2',
    icon: 'sparkles',
    title: 'AI phân tích',
    description: 'Trí tuệ nhân tạo đọc và hiểu nội dung CV một cách tự động.',
  },
  {
    id: 'wf-3',
    icon: 'fileText',
    title: 'Trích xuất kỹ năng',
    description: 'Kỹ năng, kinh nghiệm và học vấn được cấu trúc hoá đầy đủ.',
  },
  {
    id: 'wf-4',
    icon: 'target',
    title: 'So khớp việc làm',
    description: 'Hồ sơ được đối chiếu với hàng ngàn việc làm phù hợp.',
  },
  {
    id: 'wf-5',
    icon: 'checkCircle',
    title: 'Đề xuất phù hợp',
    description: 'Nhận danh sách cơ hội việc làm tối ưu nhất cho bạn.',
  },
];

export default workflowSteps;

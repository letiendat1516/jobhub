import { Link } from 'react-router-dom';

import Section from './Section.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';

/**
 * CtaBand — closing call-to-action before the footer.
 * Sits on the secondary (green) surface to differentiate from the
 * primary statistics band above it.
 */
export default function CtaBand() {
  return (
    <Section className="bg-canvas" container={false}>
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-secondary px-6 py-12 shadow-elevated sm:px-12 sm:py-16">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
            </div>
            <div className="relative flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Sẵn sàng tìm kiếm cơ hội nghề nghiệp tiếp theo?
                </h2>
                <p className="mt-3 text-base leading-7 text-white/90">
                  Tải CV lên hôm nay để AI phân tích hồ sơ và gợi ý những việc làm phù hợp nhất
                  dành riêng cho bạn.
                </p>
              </div>
              <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  to="/dang-ky"
                  className="btn inline-flex items-center justify-center gap-2 bg-white px-6 py-3.5 text-sm font-semibold text-secondary shadow-soft hover:bg-canvas"
                >
                  <Icon name="upload" size={18} />
                  Tải CV miễn phí
                </Link>
                <Link
                  to="/dang-ky"
                  className="btn inline-flex items-center justify-center gap-2 border border-white/40 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Đăng tuyển dụng
                  <Icon name="arrowRight" size={18} />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

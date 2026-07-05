import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import Icon from '../ui/Icon.jsx';
import SearchBar from '../search/SearchBar.jsx';
import heroOffice from '../../assets/images/hero-office.jpg';
import portraitAnh from '../../assets/images/portrait-anh.jpg';
import portraitMinh from '../../assets/images/portrait-minh.jpg';
import portraitLinh from '../../assets/images/portrait-linh.jpg';
import portraitTuan from '../../assets/images/portrait-tuan.jpg';

const avatars = [portraitAnh, portraitMinh, portraitLinh, portraitTuan];

const ease = [0.22, 1, 0.36, 1];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/70 via-canvas to-canvas">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-secondary-200/40 blur-3xl" />
      </div>

      <div className="container-page relative grid grid-cols-1 items-center gap-12 pb-16 pt-28 sm:pt-32 lg:grid-cols-12 lg:gap-8 lg:pb-24 lg:pt-36">
        {/* Left: copy + search */}
        <motion.div
          className="lg:col-span-7"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
        >
          <span className="eyebrow">
            <Icon name="sparkles" size={14} />
            Nền tảng tuyển dụng ứng dụng AI
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
            Tìm <span className="text-primary">đúng công việc</span> phù hợp với năng lực của bạn.
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
            JobHub ứng dụng trí tuệ nhân tạo để phân tích CV, hiểu rõ điểm mạnh của bạn và đề xuất
            những cơ hội nghề nghiệp phù hợp nhất — giúp bạn ứng tuyển nhanh và tự tin hơn.
          </p>

          <SearchBar className="mt-8" />

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/dang-ky" className="btn-primary">
              <Icon name="upload" size={18} />
              Tải CV của bạn
            </Link>
            <Link to="/#featured-jobs" className="btn-secondary">
              Khám phá việc làm
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>

          {/* Trust row */}
          <div className="mt-9 flex items-center gap-4">
            <div className="flex -space-x-3">
              {avatars.map((src, index) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  loading="lazy"
                  width="40"
                  height="40"
                  className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-soft"
                  style={{ zIndex: avatars.length - index }}
                />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1 text-secondary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon key={i} name="star" size={14} variant="fill" />
                ))}
              </div>
              <p className="text-ink-soft">
                Được <span className="font-semibold text-ink">150.000+</span> ứng viên tin tưởng
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right: image card */}
        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.1 }}
        >
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/60 bg-white shadow-elevated">
              <img
                src={heroOffice}
                alt="Đội ngũ chuyên gia đang làm việc tại văn phòng hiện đại"
                className="aspect-[4/5] w-full object-cover sm:aspect-[5/5] lg:aspect-[4/5]"
                width="640"
                height="800"
                fetchPriority="high"
              />
            </div>

            {/* Floating: matching accuracy */}
            <motion.div
              className="absolute -left-4 top-10 hidden rounded-2xl border border-slate-100 bg-white/95 p-3 shadow-card backdrop-blur sm:block"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary-50 text-secondary">
                  <Icon name="target" size={20} />
                </span>
                <div>
                  <p className="text-lg font-bold leading-none text-ink">95%</p>
                  <p className="mt-1 text-xs text-ink-muted">độ chính xác gợi ý</p>
                </div>
              </div>
            </motion.div>

            {/* Floating: companies */}
            <motion.div
              className="absolute -bottom-5 -right-3 hidden rounded-2xl border border-slate-100 bg-white/95 p-3 shadow-card backdrop-blur sm:block"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary">
                  <Icon name="building" size={20} />
                </span>
                <div>
                  <p className="text-lg font-bold leading-none text-ink">10.000+</p>
                  <p className="mt-1 text-xs text-ink-muted">doanh nghiệp đối tác</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

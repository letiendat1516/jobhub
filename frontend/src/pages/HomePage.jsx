import { Link } from 'react-router-dom';

import Hero from '../components/hero/Hero.jsx';
import CompanyLogoGrid from '../components/company/CompanyLogoGrid.jsx';
import Section from '../components/section/Section.jsx';
import SectionHeading from '../components/section/SectionHeading.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import Icon from '../components/ui/Icon.jsx';
import JobCard from '../components/job/JobCard.jsx';
import FeatureCard from '../components/feature/FeatureCard.jsx';
import WorkflowSection from '../components/workflow/WorkflowSection.jsx';
import StatisticsSection from '../components/statistics/StatisticsSection.jsx';
import TopCompanyCard from '../components/company/TopCompanyCard.jsx';
import TestimonialCard from '../components/testimonial/TestimonialCard.jsx';
import BlogCard from '../components/blog/BlogCard.jsx';
import CtaBand from '../components/section/CtaBand.jsx';

import { featuredJobs } from '../data/jobs.js';
import { mockJobs } from '../data/jobsList.js';
import { topCompanies } from '../data/companies.js';
import { features } from '../data/features.js';
import { testimonials } from '../data/testimonials.js';
import { blogPosts } from '../data/blogPosts.js';

const categories = [
  'Tất cả',
  'Công nghệ thông tin',
  'Kinh doanh',
  'Marketing',
  'Tài chính – Kế toán',
  'Nhân sự',
];

/**
 * Pick featured jobs from the real job pool (jobsList.js).
 * Strategy: prefer "hot" jobs (high salary), but ensure category diversity
 * so the homepage doesn't show 6 jobs from the same industry. Falls back to
 * the static sample if the pool is empty.
 */
function pickFeaturedJobs(pool, count = 6) {
  if (!pool || pool.length === 0) return featuredJobs;
  // Sort by hot first, then by salary descending
  const ranked = [...pool].sort(
    (a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0) || (b.salaryMax ?? 0) - (a.salaryMax ?? 0),
  );
  // Pick one job per category until we have `count` jobs
  const seen = new Set();
  const picked = [];
  for (const j of ranked) {
    if (seen.has(j.category)) continue;
    seen.add(j.category);
    picked.push(j);
    if (picked.length >= count) break;
  }
  // If not enough diverse, top up with the next best
  for (const j of ranked) {
    if (picked.length >= count) break;
    if (!picked.includes(j)) picked.push(j);
  }
  return picked.slice(0, count);
}

/**
 * HomePage — single landing page (docs/06_HOMEPAGE_SPEC.md).
 * Composes all sections; each section is a reusable component.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <CompanyLogoGrid />

      {/* 8.4 Featured jobs */}
      <Section id="featured-jobs" className="bg-canvas">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Việc làm nổi bật"
            title="Cơ hội việc làm hàng đầu dành cho bạn"
            description="Những vị trí đang được tuyển dụng gấp, được AI đánh giá phù hợp với nhiều nhóm kỹ năng khác nhau."
          />
          <Link to="/viec-lam" className="btn-secondary shrink-0">
            Xem tất cả việc làm
            <Icon name="arrowRight" size={18} />
          </Link>
        </div>

        {/* Category chips */}
        <Reveal>
          <div className="mt-8 flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={
                  index === 0
                    ? 'chip bg-primary text-white'
                    : 'chip bg-white text-ink-soft hover:bg-primary-50 hover:text-primary'
                }
              >
                {category}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pickFeaturedJobs(mockJobs).map((job, index) => (
            <Reveal key={job.id} delay={index * 0.05}>
              <JobCard job={job} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 8.8 Statistics */}
      <StatisticsSection />

      {/* 8.5 Why choose JobHub */}
      <Section id="why-jobhub" className="bg-white">
        <SectionHeading
          eyebrow="Vì sao chọn JobHub"
          title="Mọi thứ bạn cần cho một hành trình nghề nghiệp thành công"
          description="JobHub kết hợp công nghệ AI và mạng lưới doanh nghiệp rộng lớn để mang đến trải nghiệm tìm việc nhanh chóng, chính xác và đáng tin cậy."
        />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 0.06}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 8.6 AI Resume Analysis workflow */}
      <WorkflowSection />

      {/* 8.7 Top companies */}
      <Section id="top-companies" className="bg-white">
        <SectionHeading
          eyebrow="Doanh nghiệp hàng đầu"
          title="Làm việc tại những công ty tốt nhất"
          description="Khám phá các doanh nghiệp uy tín đang mở rộng đội ngũ và tìm môi trường phù hợp với định hướng của bạn."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topCompanies.map((company, index) => (
            <Reveal key={company.id} delay={index * 0.07}>
              <TopCompanyCard company={company} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 8.9 Testimonials */}
      <Section id="testimonials" className="bg-canvas">
        <SectionHeading
          eyebrow="Câu chuyện thành công"
          title="Ứng viên nói gì về JobHub"
          description="Hàng trăm nghìn ứng viên đã tìm được công việc phù hợp nhờ JobHub. Dưới đây là một vài trải nghiệm thực tế."
        />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.id} delay={index * 0.07}>
              <TestimonialCard testimonial={testimonial} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 8.10 Career resources */}
      <Section id="career-resources" className="bg-white">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Cẩm nang nghề nghiệp"
            title="Kiến thức giúp bạn phát triển sự nghiệp"
            description="Những bài viết và hướng dẫn thực tế về viết CV, phỏng vấn và phát triển nghề nghiệp."
          />
          <Link to="/#career-resources" className="btn-secondary shrink-0">
            Xem tất cả bài viết
            <Icon name="arrowRight" size={18} />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <Reveal key={post.id} delay={index * 0.07}>
              <BlogCard post={post} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Closing CTA */}
      <CtaBand />
    </>
  );
}

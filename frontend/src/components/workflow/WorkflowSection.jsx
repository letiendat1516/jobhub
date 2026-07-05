import Section from '../section/Section.jsx';
import SectionHeading from '../section/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';
import resumeCandidate from '../../assets/images/resume-candidate.jpg';
import { workflowSteps } from '../../data/workflow.js';

/**
 * AI Resume Analysis section (docs/06_HOMEPAGE_SPEC.md §8.6).
 *
 * Illustrates the process simply. Does NOT render a fake AI dashboard —
 * only the workflow steps and a supporting photograph.
 */
export default function WorkflowSection() {
  return (
    <Section id="ai-analysis" className="bg-white">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Left: image */}
        <Reveal className="order-last lg:order-first">
          <div className="relative mx-auto max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-[1.75rem] shadow-elevated">
              <img
                src={resumeCandidate}
                alt="Ứng viên tải CV và nhận phân tích từ hệ thống"
                className="aspect-[4/3] w-full object-cover"
                width="720"
                height="540"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-5 left-6 right-6 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-card backdrop-blur sm:left-10 sm:right-10">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary-50 text-secondary">
                  <Icon name="fileText" size={22} />
                </span>
                <div>
                  <p className="text-sm font-bold text-ink">CV của bạn đã được phân tích</p>
                  <p className="text-xs text-ink-muted">
                    Kỹ năng &amp; kinh nghiệm được trích xuất tự động
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Right: steps */}
        <div>
          <SectionHeading
            align="left"
            eyebrow="AI Resume Analysis"
            title="Hành trình từ CV đến cơ hội việc làm"
            description="Chỉ với một lần tải CV, JobHub tự động phân tích, trích xuất thông tin và so khớp bạn với những việc làm phù hợp nhất."
          />

          <div className="mt-8 space-y-5">
            {workflowSteps.map((step, index) => (
              <Reveal key={step.id} delay={index * 0.06}>
                <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-canvas p-4">
                  <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white">
                    <Icon name={step.icon} size={22} />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-secondary text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-ink">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-ink-soft">{step.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

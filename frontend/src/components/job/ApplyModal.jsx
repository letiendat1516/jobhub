import { useState, useRef } from 'react';
import Icon from '../ui/Icon.jsx';
import { cn } from '../../utils/cn.js';
import provinces from '../../data/provinces.js';

/**
 * ApplyModal — popup job application form (TopCV-style).
 *
 * Props:
 *   job: { id, title, company: { name }, location }
 *   isOpen: boolean
 *   onClose: () => void
 *   onSubmit: (formData) => void   (future: POST /api/applications)
 */

// Mock CVs for demo (Phase 8 will fetch from API).
const MOCK_CVS = [
  { id: 'cv-001', name: 'CV IT Helpdesk', updatedAt: '02/06/2026 16:53', type: 'online' },
  { id: 'cv-002', name: 'CV Thực tập', updatedAt: '10/12/2025 12:45', type: 'online' },
];

export default function ApplyModal({ job, isOpen, onClose, onSubmit }) {
  const [selectedCvId, setSelectedCvId] = useState('');
  const [location, setLocation] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [aiConsent, setAiConsent] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileRef = useRef(null);

  if (!isOpen || !job) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCvId && !uploadedFile) return;
    if (!agreeTerms) return;
    onSubmit?.({
      jobId: job.id,
      cvId: selectedCvId || null,
      uploadedFile,
      location,
      coverLetter,
      aiConsent,
    });
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setUploadedFile(file);
      setSelectedCvId('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-xl animate-fade-in rounded-2xl bg-white shadow-elevated">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-ink">Ứng tuyển</h2>
            <p className="mt-1 text-sm text-ink-soft">{job.title}</p>
            <p className="text-xs text-ink-muted">{job.company?.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-slate-100"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* CV Selection */}
          <section>
            <h3 className="mb-3 text-sm font-bold text-ink">Chọn CV để ứng tuyển</h3>
            {MOCK_CVS.map((cv) => (
              <label
                key={cv.id}
                className={cn(
                  'mb-2 flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors',
                  selectedCvId === cv.id
                    ? 'border-primary bg-primary-50'
                    : 'border-slate-200 hover:border-primary/50',
                )}
              >
                <input
                  type="radio"
                  name="cvId"
                  value={cv.id}
                  checked={selectedCvId === cv.id}
                  onChange={() => { setSelectedCvId(cv.id); setUploadedFile(null); }}
                  className="mt-1 h-4 w-4 text-primary"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{cv.name}</p>
                  <p className="text-xs text-ink-muted">
                    CV {cv.type} - {cv.updatedAt}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Xem
                </button>
              </label>
            ))}

            {/* Upload CV */}
            <label
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 transition-colors',
                uploadedFile
                  ? 'border-primary bg-primary-50'
                  : 'border-slate-300 hover:border-primary/50',
              )}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".doc,.docx,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {uploadedFile ? (
                <>
                  <Icon name="fileText" size={28} className="text-primary" />
                  <p className="mt-2 text-sm font-medium text-ink">{uploadedFile.name}</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                    className="mt-1 text-xs text-red-500 hover:underline"
                  >
                    Gỡ bỏ
                  </button>
                </>
              ) : (
                <>
                  <Icon name="upload" size={28} className="text-ink-muted" />
                  <p className="mt-2 text-sm font-medium text-ink">
                    Tải lên CV từ máy tính, chọn hoặc kéo thả
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Hỗ trợ định dạng .doc, .docx, pdf có kích thước dưới 5MB
                  </p>
                </>
              )}
            </label>
          </section>

          {/* Desired work location */}
          <section>
            <label className="text-sm font-bold text-ink">
              Địa điểm làm việc mong muốn{' '}
              <span className="text-red-500">*</span>
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink focus:border-primary"
            >
              <option value="">Chọn địa điểm</option>
              {provinces.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </section>

          {/* Cover letter */}
          <section>
            <label className="text-sm font-bold text-ink">Thư giới thiệu:</label>
            <p className="mt-1 text-xs text-ink-muted">
              Một thư giới thiệu ngắn gọn, chỉn chu sẽ giúp bạn trở nên chuyên nghiệp và gây ấn tượng
              hơn với nhà tuyển dụng.
            </p>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              placeholder="Viết giới thiệu ngắn gọn về bản thân (điểm mạnh, điểm yếu) và nêu rõ mong muốn, lý do bạn muốn ứng tuyển cho vị trí này."
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary"
            />
          </section>

          {/* Safety note */}
          <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-ink-soft">
            <p className="font-semibold text-ink">⚠️ Lưu ý:</p>
            <p className="mt-1">
              Hãy luôn cẩn trọng trong quá trình tìm việc và chủ động nghiên cứu về thông tin công ty,
              vị trí việc làm trước khi ứng tuyển. Ứng viên có trách nhiệm với hành vi ứng tuyển của mình.
              Nếu gặp tin tuyển dụng đáng ngờ, hãy báo cáo qua email <strong>hotro@jobhub.vn</strong>.
            </p>
          </div>

          {/* Consents */}
          <section className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={(e) => setAiConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary"
              />
              <span className="text-sm text-ink-soft">
                Cho phép JobHub sử dụng công nghệ AI để phân tích độ phù hợp CV của bạn
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary"
              />
              <span className="text-sm text-ink-soft">
                Tôi đã đọc và đồng ý với <span className="text-primary underline">Thoả thuận sử dụng dữ liệu cá nhân</span>
              </span>
            </label>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-5 py-2.5"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={(!selectedCvId && !uploadedFile) || !agreeTerms}
              className="btn-primary px-6 py-2.5"
            >
              <Icon name="send" size={18} />
              Nộp hồ sơ ứng tuyển
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

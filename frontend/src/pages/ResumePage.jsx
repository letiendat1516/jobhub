import { useEffect, useState, useCallback } from 'react';
import resumeService from '../services/resumeService.js';
import Icon from '../components/ui/Icon.jsx';

export default function ResumePage() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  // analysesMap: { [resumeId]: { status: 'idle'|'loading'|'done'|'error', data, errorMsg } }
  const [analysesMap, setAnalysesMap] = useState({});

  const loadAnalysesForList = useCallback(async (cvList) => {
    const entries = await Promise.all(
      cvList.map(async (cv) => {
        try {
          const res = await resumeService.getAnalysis(cv.resume_id);
          return [cv.resume_id, { status: 'done', data: res.data }];
        } catch {
          return [cv.resume_id, { status: 'idle', data: null }];
        }
      }),
    );
    setAnalysesMap(Object.fromEntries(entries));
  }, []);

  const load = useCallback(() => {
    resumeService
      .getMyResume()
      .then((r) => {
        const cvList = r.data ?? [];
        setItems(cvList);
        loadAnalysesForList(cvList);
      })
      .catch((e) => setError(e.message ?? 'Không thể tải danh sách CV.'));
  }, [loadAnalysesForList]);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (event) => {
    event.preventDefault();
    if (!file) return;
    setState('uploading');
    setError('');
    const data = new FormData();
    data.append('resume', file);
    data.append('title', title);
    try {
      await resumeService.upload(data);
      setFile(null);
      setTitle('');
      setState('success');
      await load();
    } catch (e) {
      setError(e.message);
      setState('error');
    }
  };

  const makePrimary = async (id) => {
    await resumeService.update(id, { isPrimary: true });
    await load();
  };

  const remove = async (id) => {
    if (!window.confirm('Xóa CV này?')) return;
    await resumeService.remove(id);
    await load();
  };

  const download = async (item) => {
    const blob = await resumeService.download(item.resume_id);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = item.file_name;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExtract = async (id) => {
    setAnalysesMap((prev) => ({ ...prev, [id]: { status: 'loading', data: null } }));
    try {
      const res = await resumeService.analyze(id);
      setAnalysesMap((prev) => ({ ...prev, [id]: { status: 'done', data: res.data } }));
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Không thể trích xuất CV';
      setAnalysesMap((prev) => ({ ...prev, [id]: { status: 'error', data: null, errorMsg: msg } }));
    }
  };

  return (
    <main className="container-page py-12">
      <p className="eyebrow">Ứng viên</p>
      <h1 className="mt-3 text-3xl font-bold">Hồ sơ & CV</h1>
      <p className="mt-2 text-ink-soft">Quản lý CV PDF dùng để ứng tuyển.</p>
      <form onSubmit={upload} className="card mt-8 grid gap-4 p-6 md:grid-cols-[1fr_1fr_auto]">
        <label className="text-sm font-semibold">
          Tên CV
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="CV Backend Developer"
            className="mt-2 w-full rounded-xl border p-3 font-normal"
          />
        </label>
        <label className="text-sm font-semibold">
          Tệp PDF
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-2 block w-full rounded-xl border p-2 text-sm font-normal"
          />
        </label>
        <button disabled={!file || state === 'uploading'} className="btn-primary self-end">
          <Icon name="upload" size={18} />
          {state === 'uploading' ? 'Đang tải...' : 'Tải CV'}
        </button>
      </form>
      {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {state === 'success' && (
        <p className="mt-4 rounded-xl bg-emerald-50 p-4 text-emerald-700">Tải CV thành công.</p>
      )}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">CV của tôi</h2>
          <span className="text-sm text-ink-muted">{items.length} CV</span>
        </div>
        {items.length === 0 ? (
          <div className="card mt-4 p-10 text-center text-ink-muted">Bạn chưa tải CV nào.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {items.map((item) => {
              const analysis = analysesMap[item.resume_id];
              const isExtracting = analysis?.status === 'loading';
              const isExtracted = analysis?.status === 'done' && analysis.data;
              const extractError = analysis?.status === 'error' ? analysis.errorMsg : null;

              return (
                <article
                  key={item.resume_id}
                  className="card overflow-hidden"
                >
                  {/* Main row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                    <div className="flex items-center gap-3">
                      <Icon name="fileText" className="text-primary" />
                      <div>
                        <p className="font-bold">{item.title || item.file_name}</p>
                        <p className="text-xs text-ink-muted">
                          {item.file_name} · {new Date(item.upload_date).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      {item.is_primary && (
                        <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                          CV chính
                        </span>
                      )}
                      {isExtracted && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <Icon name="check" size={12} />
                          Đã trích xuất
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => download(item)}
                        className="btn-secondary px-3 py-2"
                      >
                        Tải xuống
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExtract(item.resume_id)}
                        disabled={isExtracting}
                        className="btn-secondary flex items-center gap-1.5 px-3 py-2 text-primary hover:border-primary/50"
                      >
                        {isExtracting ? (
                          <>
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            Đang trích xuất...
                          </>
                        ) : (
                          <>
                            <Icon name="sparkles" size={15} />
                            {isExtracted ? 'Trích xuất lại' : 'Trích xuất CV'}
                          </>
                        )}
                      </button>
                      {!item.is_primary && (
                        <button
                          onClick={() => makePrimary(item.resume_id)}
                          className="btn-secondary px-3 py-2"
                        >
                          Đặt làm CV chính
                        </button>
                      )}
                      <button onClick={() => remove(item.resume_id)} className="btn-ghost text-red-600">
                        Xóa
                      </button>
                    </div>
                  </div>

                  {/* Analysis panel */}
                  {extractError && (
                    <div className="border-t border-slate-100 bg-red-50 px-5 py-3 text-xs text-red-600">
                      ⚠ {extractError}
                    </div>
                  )}
                  {isExtracting && (
                    <div className="border-t border-slate-100 bg-primary-50 px-5 py-3 text-xs text-primary">
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        AI đang đọc & phân tích CV — có thể mất 30–90 giây...
                      </span>
                    </div>
                  )}
                  {isExtracted && (
                    <AnalysisPanel data={analysis.data} />
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function AnalysisPanel({ data }) {
  const skills = data?.extracted_skills?.skills ?? [];
  const softSkills = data?.extracted_skills?.soft_skills ?? [];
  const languages = data?.extracted_skills?.languages ?? [];
  const certs = data?.extracted_skills?.certifications ?? [];
  const expYears = data?.total_experience_years ?? 0;
  const education = data?.education_level ?? '';
  const summary = data?.summary ?? '';
  const analyzedAt = data?.analyzed_at ? new Date(data.analyzed_at).toLocaleString('vi-VN') : '';

  return (
    <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-primary">
        <Icon name="sparkles" size={13} />
        Kết quả trích xuất bằng AI
        {analyzedAt && <span className="ml-auto font-normal text-ink-muted">{analyzedAt}</span>}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {skills.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">Kỹ năng</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {skills.map((s) => (
                <span key={s} className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {softSkills.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-wide">Kỹ năng mềm</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {softSkills.map((s) => (
                <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-ink-soft">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-4 text-xs">
          {expYears > 0 && (
            <span>
              <span className="font-semibold text-ink">{expYears}</span>{' '}
              <span className="text-ink-muted">năm kinh nghiệm</span>
            </span>
          )}
          {education && (
            <span>
              <span className="font-semibold text-ink">{education}</span>
            </span>
          )}
        </div>
        {(languages.length > 0 || certs.length > 0) && (
          <div className="text-xs text-ink-muted">
            {languages.length > 0 && <p>Ngôn ngữ: {languages.join(', ')}</p>}
            {certs.length > 0 && <p>Chứng chỉ: {certs.join(', ')}</p>}
          </div>
        )}
      </div>
      {summary && (
        <p className="mt-2 text-xs text-ink-soft line-clamp-3">{summary}</p>
      )}
    </div>
  );
}


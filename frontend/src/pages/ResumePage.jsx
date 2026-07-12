import { useEffect, useState } from 'react';
import resumeService from '../services/resumeService.js';
import Icon from '../components/ui/Icon.jsx';

export default function ResumePage() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const load = () =>
    resumeService
      .getMyResume()
      .then((r) => setItems(r.data))
      .catch((e) => setError(e.message));
  useEffect(load, []);
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
            {items.map((item) => (
              <article
                key={item.resume_id}
                className="card flex flex-wrap items-center justify-between gap-4 p-5"
              >
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
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => download(item)}
                    className="btn-secondary px-3 py-2"
                  >
                    Tải xuống
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
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

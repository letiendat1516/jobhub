import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import jobService from '../services/jobService.js';

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none';

export default function CreateJobPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'VND',
    location: '',
    city: '',
    experience: 'junior',
    category: 'Công nghệ thông tin',
    workType: 'hybrid',
    employmentType: 'full_time',
    skills: 'React, JavaScript',
    positionsAvailable: 1,
    applicationDeadline: '2026-08-30',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');

      const payload = {
        ...form,
        salaryMin: Number(form.salaryMin),
        salaryMax: Number(form.salaryMax),
        positionsAvailable: Number(form.positionsAvailable),
        skills: form.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      await jobService.createJob(payload);

      navigate('/employer/jobs');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Không thể tạo tin tuyển dụng.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-28">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
        Đăng tin tuyển dụng
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Tạo tin tuyển dụng mới
      </h1>

      <p className="mt-2 text-slate-500">
        Tin tuyển dụng mới sẽ ở trạng thái chờ duyệt trước khi được hiển thị công khai.
      </p>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      ) : null}

      <form
        onSubmit={submit}
        className="mt-8 space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block font-semibold">Tên vị trí tuyển dụng</label>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            placeholder="Ví dụ: Lập trình viên Frontend"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Mô tả công việc</label>
          <textarea
            className={`${inputClass} h-32`}
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Mô tả nhiệm vụ, trách nhiệm và yêu cầu chính của công việc."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">Lương tối thiểu</label>
            <input
              className={inputClass}
              value={form.salaryMin}
              onChange={(e) => setField('salaryMin', e.target.value)}
              placeholder="10000000"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Lương tối đa</label>
            <input
              className={inputClass}
              value={form.salaryMax}
              onChange={(e) => setField('salaryMax', e.target.value)}
              placeholder="20000000"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">Địa điểm làm việc</label>
            <input
              className={inputClass}
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="Hà Nội"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Thành phố</label>
            <input
              className={inputClass}
              value={form.city}
              onChange={(e) => setField('city', e.target.value)}
              placeholder="Hà Nội"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-semibold">Ngành nghề</label>
          <input
            className={inputClass}
            value={form.category}
            onChange={(e) => setField('category', e.target.value)}
            placeholder="Công nghệ thông tin"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">Kỹ năng yêu cầu</label>
          <input
            className={inputClass}
            value={form.skills}
            onChange={(e) => setField('skills', e.target.value)}
            placeholder="React, JavaScript, Tailwind CSS"
          />
          <p className="mt-1 text-xs text-slate-500">
            Mỗi kỹ năng cách nhau bằng dấu phẩy.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">Hình thức làm việc</label>
            <select
              className={inputClass}
              value={form.workType}
              onChange={(e) => setField('workType', e.target.value)}
            >
              <option value="onsite">Làm tại văn phòng</option>
              <option value="remote">Làm từ xa</option>
              <option value="hybrid">Kết hợp</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold">Loại hình công việc</label>
            <select
              className={inputClass}
              value={form.employmentType}
              onChange={(e) => setField('employmentType', e.target.value)}
            >
              <option value="full_time">Toàn thời gian</option>
              <option value="part_time">Bán thời gian</option>
              <option value="contract">Hợp đồng</option>
              <option value="internship">Thực tập</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">Số lượng tuyển</label>
            <input
              className={inputClass}
              value={form.positionsAvailable}
              onChange={(e) => setField('positionsAvailable', e.target.value)}
              placeholder="1"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Hạn nộp hồ sơ</label>
            <input
              type="date"
              className={inputClass}
              value={form.applicationDeadline}
              onChange={(e) => setField('applicationDeadline', e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {loading ? 'Đang tạo tin...' : 'Tạo tin tuyển dụng'}
        </button>
      </form>
    </main>
  );
}
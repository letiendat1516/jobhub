import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
} from 'react-router-dom';

import employerService from '../services/employerService.js';

export default function CompanyDetailPage() {
  const { id } = useParams();

  const [company, setCompany] =
    useState(null);

  const [jobs, setJobs] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    let cancelled = false;

    const loadCompany = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          companyData,
          jobData,
        ] = await Promise.all([
          employerService.getEmployerById(id),
          employerService.getEmployerJobs(id),
        ]);

        if (cancelled) return;

        setCompany(companyData);

        setJobs(
          Array.isArray(jobData)
            ? jobData
            : Array.isArray(jobData?.data)
              ? jobData.data
              : [],
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              'Không thể tải thông tin công ty.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCompany();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-28">
        <p className="text-slate-500">
          Đang tải thông tin công ty...
        </p>
      </main>
    );
  }

  if (error || !company) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-28">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-bold">
            Lỗi hệ thống
          </p>

          <p className="mt-1 text-sm">
            {error ||
              'Không tìm thấy công ty.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-28">
      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-blue-50 text-xl font-bold text-blue-700">
            {company.company_name
              ?.split(/\s+/)
              .slice(0, 3)
              .map((word) => word[0])
              .join('')
              .toUpperCase() || 'CT'}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Hồ sơ công ty
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              {company.company_name}
            </h1>

            <p className="mt-2 text-slate-500">
              {company.city ||
                'Chưa cập nhật địa điểm'}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">
              Số điện thoại
            </p>

            <p className="mt-1 font-medium">
              {company.phone ||
                'Chưa cập nhật'}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Website
            </p>

            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="mt-1 block font-medium text-blue-700 hover:underline"
              >
                {company.website}
              </a>
            ) : (
              <p className="mt-1 font-medium">
                Chưa cập nhật
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Người liên hệ
            </p>

            <p className="mt-1 font-medium">
              {company.contact_name ||
                'Chưa cập nhật'}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Trạng thái
            </p>

            <p className="mt-1 font-medium">
              {company.is_verified
                ? 'Đã xác minh'
                : 'Chưa xác minh'}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t pt-6">
          <h2 className="text-xl font-bold text-slate-900">
            Giới thiệu công ty
          </h2>

          <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
            {company.company_description ||
              'Công ty chưa cập nhật phần giới thiệu.'}
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">
          Việc làm đang tuyển
        </h2>

        {jobs.length === 0 ? (
          <p className="mt-4 text-slate-500">
            Công ty hiện chưa có tin tuyển dụng đang mở.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {jobs.map((job) => {
              const jobId =
                job.job_id || job.id;

              return (
                <Link
                  key={jobId}
                  to={`/viec-lam/${jobId}`}
                  className="block rounded-xl border p-4 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <h3 className="font-bold text-slate-900">
                    {job.job_title ||
                      job.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {job.location ||
                      job.city ||
                      'Chưa cập nhật địa điểm'}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
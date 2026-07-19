import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

import jobService from '../services/jobService.js';
import { useAuth } from '../context/AuthContext.jsx';

const getJobId = (job) => job.job_id || job.id;

const isJobOpen = (job) => job.status === 'OPEN' && job.is_approved === true;
const isJobClosedApproved = (job) =>
    job.status === 'CLOSED' && job.is_approved === true;

const getJobTitle = (job) => job.job_title || job.title || 'Tin tuyển dụng chưa có tiêu đề';

const getWorkModeLabel = (value) => {
    const labels = {
        ONSITE: 'Làm tại văn phòng',
        REMOTE: 'Làm từ xa',
        HYBRID: 'Kết hợp',
        onsite: 'Làm tại văn phòng',
        remote: 'Làm từ xa',
        hybrid: 'Kết hợp',
    };

    return labels[value] || 'Chưa cập nhật';
};

const getJobTypeLabel = (value) => {
    const labels = {
        FULL_TIME: 'Toàn thời gian',
        PART_TIME: 'Bán thời gian',
        CONTRACT: 'Hợp đồng',
        INTERNSHIP: 'Thực tập',
        full_time: 'Toàn thời gian',
        part_time: 'Bán thời gian',
        contract: 'Hợp đồng',
        internship: 'Thực tập',
    };

    return labels[value] || 'Chưa cập nhật';
};
const getStatusLabel = (job) => {
    if (job.status === 'DRAFT' && job.is_approved === false) {
        return 'Chờ duyệt';
    }

    if (job.status === 'OPEN' && job.is_approved === true) {
        return 'Đang hiển thị';
    }

    if (job.status === 'CLOSED' && job.is_approved === false) {
        return 'Bị từ chối';
    }

    if (job.status === 'CLOSED' && job.is_approved === true) {
        return 'Đã đóng';
    }

    return job.status || 'Chưa rõ';
};
const getApprovalLabel = (job) => {
    if (job.is_approved === true) {
        return 'Đã duyệt';
    }

    if (
        job.status === 'CLOSED' &&
        job.is_approved === false
    ) {
        return 'Không được duyệt';
    }

    return 'Chờ duyệt';
};

const getApprovalClass = (job) => {
    if (job.is_approved === true) {
        return 'text-green-600';
    }

    if (
        job.status === 'CLOSED' &&
        job.is_approved === false
    ) {
        return 'text-red-600';
    }

    return 'text-amber-600';
};

const formatSalary = (job) => {
    const min = job.salary_min ?? job.salaryMin;
    const max = job.salary_max ?? job.salaryMax;
    const currency = job.salary_currency || job.currency || 'VND';

    if (!min && !max) {
        return 'Thỏa thuận';
    }

    return `${Number(min || 0).toLocaleString('vi-VN')} - ${Number(max || 0).toLocaleString('vi-VN')} ${currency}`;
};

export default function EmployerJobsPage() {
    const { isAuthenticated, user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadJobs = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await jobService.getMyPostings();

            const list = Array.isArray(data)
                ? data
                : Array.isArray(data?.items)
                    ? data.items
                    : [];

            setJobs(list);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                'Không thể tải danh sách tin tuyển dụng.',
            );
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (isAuthenticated && user?.role === 'employer') {
            loadJobs();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user?.role]);

    const closeJob = async (jobId) => {
        const ok = window.confirm('Bạn có chắc muốn đóng tin tuyển dụng này không?');
        if (!ok) return;

        try {
            await jobService.closeJob(jobId);
            await loadJobs();
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Không thể đóng tin tuyển dụng.');
        }
    };

    const reopenJob = async (jobId) => {
        const ok = window.confirm('Mở lại tin tuyển dụng này để ứng viên có thể thấy & ứng tuyển?');
        if (!ok) return;

        try {
            await jobService.reopenJob(jobId);
            await loadJobs();
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Không thể mở lại tin tuyển dụng.');
        }
    };

    const deleteJob = async (jobId) => {
        const ok = window.confirm('Bạn có chắc muốn xoá tin tuyển dụng này không?');
        if (!ok) return;

        try {
            await jobService.deleteJob(jobId);
            await loadJobs();
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Không thể xoá tin tuyển dụng.');
        }
    };

    if (!isAuthenticated) {
        return <Navigate to="/dang-nhap" replace />;
    }

    if (user?.role !== 'employer') {
        return (
            <main className="mx-auto max-w-4xl px-6 py-28">
                <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                    Không có quyền truy cập
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                    Bạn không thể truy cập trang quản lý tin tuyển dụng
                </h1>

                <p className="mt-2 text-slate-500">
                    Chức năng này chỉ dành cho tài khoản nhà tuyển dụng.
                </p>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-6xl px-6 py-28">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                        Quản lý tin tuyển dụng
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-slate-900">
                        Tin tuyển dụng của tôi
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Xem, đóng hoặc xoá các tin tuyển dụng do công ty của bạn đăng.
                    </p>
                </div>

                <Link
                    to="/employer/jobs/create"
                    className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
                >
                    Đăng tin tuyển dụng
                </Link>
            </div>

            {loading ? (
                <div className="rounded-2xl border bg-white p-6 text-slate-500">
                    Đang tải danh sách tin tuyển dụng...
                </div>
            ) : null}

            {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
                    {error}
                </div>
            ) : null}

            {!loading && !error && jobs.length === 0 ? (
                <div className="rounded-2xl border bg-white p-8 text-center text-slate-500">
                    Công ty của bạn chưa có tin tuyển dụng nào.
                </div>
            ) : null}

            <div className="space-y-4">
                {jobs.map((job) => {
                    const jobId = getJobId(job);

                    return (
                        <div
                            key={jobId}
                            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        {getJobTitle(job)}
                                    </h2>

                                    <p className="mt-2 text-sm text-slate-500">
                                        {job.location || 'Chưa cập nhật địa điểm'} •{' '}
                                        {getWorkModeLabel(job.work_mode || job.workType)} •{' '}
                                        {getJobTypeLabel(job.job_type || job.employmentType)}
                                    </p>

                                    <p className="mt-3 text-sm">
                                        Trạng thái:{' '}
                                        <span className="font-semibold text-blue-700">
                                            {getStatusLabel(job)}
                                        </span>
                                        {' '} | Duyệt:{' '}
                                        <span
                                            className={`font-semibold ${getApprovalClass(job)}`}
                                        >
                                            {getApprovalLabel(job)}
                                        </span>
                                    </p>

                                    <p className="mt-2 text-sm text-slate-500">
                                        Mức lương: {formatSalary(job)}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {isJobOpen(job) ? (
                                        <button
                                            type="button"
                                            onClick={() => closeJob(jobId)}
                                            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                                        >
                                            Đóng tin
                                        </button>
                                    ) : null}

                                    {isJobClosedApproved(job) ? (
                                        <button
                                            type="button"
                                            onClick={() => reopenJob(jobId)}
                                            className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
                                        >
                                            Mở tin
                                        </button>
                                    ) : null}

                                    <button
                                        type="button"
                                        onClick={() => deleteJob(jobId)}
                                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                                    >
                                        Xoá
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
import { useEffect, useState } from 'react';

import systemConfigurationService from '../services/systemConfigurationService.js';

const DEFAULT_CONFIG = {
    MAX_SKILLS_PER_JOB: 10,
    DEFAULT_DEADLINE_DAYS: 30,
    REQUIRE_JOB_APPROVAL: true,
};

const getErrorMessage = (error) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Không thể xử lý cấu hình hệ thống.'
    );
};

const parseBoolean = (value) => {
    return value === true || value === 'true';
};

export default function AdminSystemConfigurationPage() {
    const [config, setConfig] = useState(
        DEFAULT_CONFIG,
    );

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState('');

    const [message, setMessage] =
        useState('');

    useEffect(() => {
        const loadConfigurations = async () => {
            try {
                setLoading(true);
                setError('');

                const data =
                    await systemConfigurationService
                        .getAllConfigurations();

                const list = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.items)
                        ? data.items
                        : [];

                const configMap = {};

                for (const item of list) {
                    configMap[item.config_key] =
                        item.parsed_value ??
                        item.config_value;
                }

                setConfig({
                    MAX_SKILLS_PER_JOB: Number(
                        configMap.MAX_SKILLS_PER_JOB ??
                        DEFAULT_CONFIG.MAX_SKILLS_PER_JOB,
                    ),

                    DEFAULT_DEADLINE_DAYS: Number(
                        configMap.DEFAULT_DEADLINE_DAYS ??
                        DEFAULT_CONFIG.DEFAULT_DEADLINE_DAYS,
                    ),

                    REQUIRE_JOB_APPROVAL:
                        parseBoolean(
                            configMap.REQUIRE_JOB_APPROVAL ??
                            DEFAULT_CONFIG.REQUIRE_JOB_APPROVAL,
                        ),
                });
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        loadConfigurations();
    }, []);

    const handleNumberChange = (
        event,
    ) => {
        const { name, value } =
            event.target;

        setConfig((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleApprovalChange = (
        event,
    ) => {
        setConfig((current) => ({
            ...current,
            REQUIRE_JOB_APPROVAL:
                event.target.checked,
        }));
    };

    const handleSubmit = async (
        event,
    ) => {
        event.preventDefault();

        const maxSkills = Number(
            config.MAX_SKILLS_PER_JOB,
        );

        const deadlineDays = Number(
            config.DEFAULT_DEADLINE_DAYS,
        );

        if (
            !Number.isInteger(maxSkills) ||
            maxSkills < 1
        ) {
            setError(
                'Số kỹ năng tối đa phải là số nguyên lớn hơn 0.',
            );

            return;
        }

        if (
            !Number.isInteger(deadlineDays) ||
            deadlineDays < 1
        ) {
            setError(
                'Số ngày hạn tuyển dụng phải là số nguyên lớn hơn 0.',
            );

            return;
        }

        try {
            setSaving(true);
            setError('');
            setMessage('');

            await Promise.all([
                systemConfigurationService
                    .updateConfiguration(
                        'MAX_SKILLS_PER_JOB',
                        maxSkills,
                    ),

                systemConfigurationService
                    .updateConfiguration(
                        'DEFAULT_DEADLINE_DAYS',
                        deadlineDays,
                    ),

                systemConfigurationService
                    .updateConfiguration(
                        'REQUIRE_JOB_APPROVAL',
                        config.REQUIRE_JOB_APPROVAL,
                    ),
            ]);

            setConfig((current) => ({
                ...current,
                MAX_SKILLS_PER_JOB:
                    maxSkills,
                DEFAULT_DEADLINE_DAYS:
                    deadlineDays,
            }));

            setMessage(
                'Cập nhật cấu hình hệ thống thành công.',
            );
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="mx-auto max-w-4xl px-6 py-28">
            <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                    Quản trị hệ thống
                </p>

                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                    Cấu hình hệ thống
                </h1>

                <p className="mt-2 text-slate-500">
                    Quản lý các quy tắc dùng chung của hệ thống JobHub.
                </p>
            </div>

            {error ? (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                    <p className="font-bold">
                        Lỗi hệ thống
                    </p>

                    <p className="mt-1 text-sm">
                        {error}
                    </p>
                </div>
            ) : null}

            {message ? (
                <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 text-green-700">
                    {message}
                </div>
            ) : null}

            {loading ? (
                <div className="rounded-2xl border bg-white p-6 text-slate-500">
                    Đang tải cấu hình hệ thống...
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                    <div className="space-y-6">
                        <div>
                            <label
                                htmlFor="MAX_SKILLS_PER_JOB"
                                className="block text-sm font-semibold text-slate-900"
                            >
                                Số kỹ năng tối đa trong một tin
                            </label>

                            <p className="mt-1 text-sm text-slate-500">
                                Giới hạn số kỹ năng Employer được chọn khi tạo tin tuyển dụng.
                            </p>

                            <div className="mt-3 flex items-center gap-3">
                                <input
                                    id="MAX_SKILLS_PER_JOB"
                                    name="MAX_SKILLS_PER_JOB"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={
                                        config.MAX_SKILLS_PER_JOB
                                    }
                                    onChange={
                                        handleNumberChange
                                    }
                                    className="w-32 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                                />

                                <span className="text-sm text-slate-500">
                                    kỹ năng
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <label
                                htmlFor="DEFAULT_DEADLINE_DAYS"
                                className="block text-sm font-semibold text-slate-900"
                            >
                                Hạn tuyển dụng mặc định
                            </label>

                            <p className="mt-1 text-sm text-slate-500">
                                Số ngày mặc định trước khi một tin tuyển dụng hết hạn.
                            </p>

                            <div className="mt-3 flex items-center gap-3">
                                <input
                                    id="DEFAULT_DEADLINE_DAYS"
                                    name="DEFAULT_DEADLINE_DAYS"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={
                                        config.DEFAULT_DEADLINE_DAYS
                                    }
                                    onChange={
                                        handleNumberChange
                                    }
                                    className="w-32 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                                />

                                <span className="text-sm text-slate-500">
                                    ngày
                                </span>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <div className="flex items-start justify-between gap-6">
                                <div>
                                    <label
                                        htmlFor="REQUIRE_JOB_APPROVAL"
                                        className="text-sm font-semibold text-slate-900"
                                    >
                                        Bắt buộc Admin duyệt tin
                                    </label>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Khi bật, tin mới phải được Admin duyệt trước khi hiển thị.
                                    </p>
                                </div>

                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        id="REQUIRE_JOB_APPROVAL"
                                        type="checkbox"
                                        checked={
                                            config.REQUIRE_JOB_APPROVAL
                                        }
                                        onChange={
                                            handleApprovalChange
                                        }
                                        className="peer sr-only"
                                    />

                                    <span className="h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-blue-700 peer-focus:ring-2 peer-focus:ring-blue-200" />

                                    <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
                                </label>
                            </div>

                            <p className="mt-3 text-sm font-medium">
                                Trạng thái:{' '}

                                <span
                                    className={
                                        config.REQUIRE_JOB_APPROVAL
                                            ? 'text-green-600'
                                            : 'text-amber-600'
                                    }
                                >
                                    {config.REQUIRE_JOB_APPROVAL
                                        ? 'Đang bật'
                                        : 'Đang tắt'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving
                                ? 'Đang lưu...'
                                : 'Lưu cấu hình'}
                        </button>
                    </div>
                </form>
            )}
        </main>
    );
}
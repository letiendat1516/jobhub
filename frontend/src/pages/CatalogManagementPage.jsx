import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import jobService from '../services/jobService.js';

/*
 * Lấy tên ngành nghề.
 * Hỗ trợ cả hai kiểu dữ liệu:
 * category.name
 * category.category_name
 */
const getCategoryName = (category) =>
  category?.name ||
  category?.category_name ||
  '';

/*
 * Lấy tên kỹ năng.
 * Hỗ trợ cả hai kiểu dữ liệu:
 * skill.skill_name
 * skill.name
 */
const getSkillName = (skill) =>
  skill?.skill_name ||
  skill?.name ||
  '';

/*
 * Hỗ trợ trường hợp service trả:
 * 1. Mảng trực tiếp: [...]
 * 2. Object: { data: [...] }
 */
const getListData = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

/*
 * Lấy thông báo lỗi chi tiết từ backend.
 */
const getErrorMessage = (
  err,
  fallbackMessage,
) => {
  const details =
    err?.details ||
    err?.response?.data?.error?.details ||
    null;

  const formErrors = Array.isArray(
    details?.formErrors,
  )
    ? details.formErrors
    : [];

  const fieldErrors =
    details?.fieldErrors &&
      typeof details.fieldErrors === 'object'
      ? Object.values(
        details.fieldErrors,
      ).flat()
      : [];

  const reasons = [
    ...formErrors,
    ...fieldErrors,
  ].filter(Boolean);

  if (reasons.length > 0) {
    return [...new Set(reasons)].join(' ');
  }

  return (
    err?.response?.data?.error?.message ||
    err?.response?.data?.message ||
    err?.message ||
    fallbackMessage
  );
};

export default function CatalogManagementPage() {
  const [categories, setCategories] =
    useState([]);

  const [skills, setSkills] =
    useState([]);

  const [categoryName, setCategoryName] =
    useState('');

  const [skillName, setSkillName] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  /*
   * Có thể nhận:
   * null
   * "category"
   * "skill"
   */
  const [savingType, setSavingType] =
    useState(null);

  /*
   * Ví dụ:
   * "category-12"
   * "skill-20"
   */
  const [deletingKey, setDeletingKey] =
    useState(null);

  const [error, setError] =
    useState('');

  const [message, setMessage] =
    useState('');

  /*
   * Tải toàn bộ ngành nghề và kỹ năng.
   */
  const loadData = useCallback(
    async () => {
      try {
        setLoading(true);
        setError('');

        const [categoryResponse, skillResponse] =
          await Promise.all([
            jobService.listCategories(),
            jobService.listSkills(),
          ]);

        const categoryList =
          getListData(categoryResponse);

        const skillList =
          getListData(skillResponse);

        /*
         * Tạo mảng mới trước khi sắp xếp,
         * tránh thay đổi trực tiếp response gốc.
         */
        const sortedCategories = [
          ...categoryList,
        ].sort((first, second) =>
          getCategoryName(first).localeCompare(
            getCategoryName(second),
            'vi',
          ),
        );

        const sortedSkills = [
          ...skillList,
        ].sort((first, second) =>
          getSkillName(first).localeCompare(
            getSkillName(second),
            'vi',
          ),
        );

        setCategories(sortedCategories);
        setSkills(sortedSkills);
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            'Không thể tải danh mục ngành nghề và kỹ năng.',
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  /*
   * Thêm một ngành nghề mới.
   */
  const addCategory = async (event) => {
    event.preventDefault();

    const name = categoryName.trim();

    if (!name) {
      setError(
        'Vui lòng nhập tên ngành nghề.',
      );

      return;
    }

    try {
      setSavingType('category');
      setError('');
      setMessage('');

      await jobService.createCategory(name);

      setCategoryName('');

      await loadData();

      setMessage(
        `Đã thêm ngành nghề "${name}".`,
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Không thể thêm ngành nghề.',
        ),
      );
    } finally {
      setSavingType(null);
    }
  };

  /*
   * Thêm một kỹ năng mới.
   */
  const addSkill = async (event) => {
    event.preventDefault();

    const name = skillName.trim();

    if (!name) {
      setError(
        'Vui lòng nhập tên kỹ năng.',
      );

      return;
    }

    try {
      setSavingType('skill');
      setError('');
      setMessage('');

      await jobService.createSkill(name);

      setSkillName('');

      await loadData();

      setMessage(
        `Đã thêm kỹ năng "${name}".`,
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Không thể thêm kỹ năng.',
        ),
      );
    } finally {
      setSavingType(null);
    }
  };

  /*
   * Xóa một ngành nghề.
   */
  const deleteCategory = async (
    id,
    name,
  ) => {
    if (!id) {
      setError(
        'Không xác định được mã ngành nghề cần xoá.',
      );

      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xoá ngành nghề "${name}" không?`,
    );

    if (!confirmed) return;

    const deleteKey = `category-${id}`;

    try {
      setDeletingKey(deleteKey);
      setError('');
      setMessage('');

      await jobService.deleteCategory(id);

      await loadData();

      setMessage(
        `Đã xoá ngành nghề "${name}".`,
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Không thể xoá ngành nghề.',
        ),
      );
    } finally {
      setDeletingKey(null);
    }
  };

  /*
   * Xóa một kỹ năng.
   */
  const deleteSkill = async (
    id,
    name,
  ) => {
    if (!id) {
      setError(
        'Không xác định được mã kỹ năng cần xoá.',
      );

      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xoá kỹ năng "${name}" không?`,
    );

    if (!confirmed) return;

    const deleteKey = `skill-${id}`;

    try {
      setDeletingKey(deleteKey);
      setError('');
      setMessage('');

      await jobService.deleteSkill(id);

      await loadData();

      setMessage(
        `Đã xoá kỹ năng "${name}".`,
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Không thể xoá kỹ năng.',
        ),
      );
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-28">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
        Quản lý danh mục
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Quản lý ngành nghề và kỹ năng
      </h1>

      <p className="mt-2 text-slate-500">
        Quản trị viên có thể thêm hoặc xoá
        ngành nghề, kỹ năng dùng trong tin
        tuyển dụng.
      </p>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <p className="font-bold">
            Lỗi hệ thống
          </p>

          <p className="mt-1 text-sm">
            {error}
          </p>
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700"
        >
          {message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Ngành nghề */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">
              Ngành nghề
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {categories.length} ngành
            </span>
          </div>

          <form
            onSubmit={addCategory}
            className="mt-4 flex gap-2"
          >
            <input
              required
              maxLength={100}
              disabled={
                savingType === 'category'
              }
              className="min-w-0 flex-1 rounded-xl border px-4 py-3 disabled:cursor-not-allowed disabled:bg-slate-100"
              value={categoryName}
              onChange={(event) =>
                setCategoryName(
                  event.target.value,
                )
              }
              placeholder="Nhập ngành nghề mới"
            />

            <button
              type="submit"
              disabled={
                savingType === 'category'
              }
              className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingType === 'category'
                ? 'Đang thêm...'
                : 'Thêm'}
            </button>
          </form>

          <div className="mt-5 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-sm text-slate-500">
                Đang tải ngành nghề...
              </p>
            ) : null}

            {!loading &&
              categories.length === 0 ? (
              <p className="text-sm text-slate-500">
                Chưa có ngành nghề nào.
              </p>
            ) : null}

            {!loading &&
              categories.map((category) => {
                const categoryId =
                  category.category_id ??
                  category.id;

                const categoryNameValue =
                  getCategoryName(category);

                const deleteKey =
                  `category-${categoryId}`;

                return (
                  <div
                    key={
                      categoryId ||
                      categoryNameValue
                    }
                    className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
                  >
                    <span className="min-w-0 break-words">
                      {categoryNameValue}
                    </span>

                    <button
                      type="button"
                      disabled={
                        deletingKey ===
                        deleteKey
                      }
                      onClick={() =>
                        deleteCategory(
                          categoryId,
                          categoryNameValue,
                        )
                      }
                      className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingKey ===
                        deleteKey
                        ? 'Đang xoá...'
                        : 'Xoá'}
                    </button>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Kỹ năng */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-900">
              Kỹ năng
            </h2>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {skills.length} kỹ năng
            </span>
          </div>

          <form
            onSubmit={addSkill}
            className="mt-4 flex gap-2"
          >
            <input
              required
              maxLength={100}
              disabled={
                savingType === 'skill'
              }
              className="min-w-0 flex-1 rounded-xl border px-4 py-3 disabled:cursor-not-allowed disabled:bg-slate-100"
              value={skillName}
              onChange={(event) =>
                setSkillName(
                  event.target.value,
                )
              }
              placeholder="Nhập kỹ năng mới"
            />

            <button
              type="submit"
              disabled={
                savingType === 'skill'
              }
              className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingType === 'skill'
                ? 'Đang thêm...'
                : 'Thêm'}
            </button>
          </form>

          <div className="mt-5 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-sm text-slate-500">
                Đang tải kỹ năng...
              </p>
            ) : null}

            {!loading &&
              skills.length === 0 ? (
              <p className="text-sm text-slate-500">
                Chưa có kỹ năng nào.
              </p>
            ) : null}

            {!loading &&
              skills.map((skill) => {
                const skillId =
                  skill.skill_id ??
                  skill.id;

                const skillNameValue =
                  getSkillName(skill);

                const deleteKey =
                  `skill-${skillId}`;

                return (
                  <div
                    key={
                      skillId ||
                      skillNameValue
                    }
                    className="flex items-center justify-between gap-4 rounded-xl border px-4 py-3"
                  >
                    <span className="min-w-0 break-words">
                      {skillNameValue}
                    </span>

                    <button
                      type="button"
                      disabled={
                        deletingKey ===
                        deleteKey
                      }
                      onClick={() =>
                        deleteSkill(
                          skillId,
                          skillNameValue,
                        )
                      }
                      className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingKey ===
                        deleteKey
                        ? 'Đang xoá...'
                        : 'Xoá'}
                    </button>
                  </div>
                );
              })}
          </div>
        </section>
      </div>
    </main>
  );
}
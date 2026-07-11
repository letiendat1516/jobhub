import { useEffect, useState } from 'react';

import jobService from '../services/jobService.js';

export default function CatalogManagementPage() {
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);

  const [categoryName, setCategoryName] = useState('');
  const [skillName, setSkillName] = useState('');

  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');

      const [categoryData, skillData] = await Promise.all([
        jobService.listCategories(),
        jobService.listSkills(),
      ]);

      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setSkills(Array.isArray(skillData) ? skillData : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Không thể tải danh mục ngành nghề và kỹ năng.',
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addCategory = async (event) => {
    event.preventDefault();

    if (!categoryName.trim()) return;

    try {
      await jobService.createCategory(categoryName.trim());
      setCategoryName('');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Không thể thêm ngành nghề.');
    }
  };

  const addSkill = async (event) => {
    event.preventDefault();

    if (!skillName.trim()) return;

    try {
      await jobService.createSkill(skillName.trim());
      setSkillName('');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Không thể thêm kỹ năng.');
    }
  };

  const deleteCategory = async (id) => {
    const ok = window.confirm('Bạn có chắc muốn xoá ngành nghề này không?');
    if (!ok) return;

    try {
      await jobService.deleteCategory(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Không thể xoá ngành nghề.');
    }
  };

  const deleteSkill = async (id) => {
    const ok = window.confirm('Bạn có chắc muốn xoá kỹ năng này không?');
    if (!ok) return;

    try {
      await jobService.deleteSkill(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Không thể xoá kỹ năng.');
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
        Quản trị viên có thể thêm hoặc xoá ngành nghề, kỹ năng dùng trong tin tuyển dụng.
      </p>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Ngành nghề</h2>

          <form onSubmit={addCategory} className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-xl border px-4 py-3"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Nhập ngành nghề mới"
            />

            <button className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white">
              Thêm
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có ngành nghề nào.</p>
            ) : null}

            {categories.map((category) => (
              <div
                key={category.category_id || category.id}
                className="flex items-center justify-between rounded-xl border px-4 py-3"
              >
                <span>{category.name}</span>

                <button
                  type="button"
                  onClick={() => deleteCategory(category.category_id || category.id)}
                  className="text-sm font-semibold text-red-600"
                >
                  Xoá
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Kỹ năng</h2>

          <form onSubmit={addSkill} className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-xl border px-4 py-3"
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="Nhập kỹ năng mới"
            />

            <button className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white">
              Thêm
            </button>
          </form>

          <div className="mt-5 space-y-2">
            {skills.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có kỹ năng nào.</p>
            ) : null}

            {skills.map((skill) => (
              <div
                key={skill.skill_id || skill.id}
                className="flex items-center justify-between rounded-xl border px-4 py-3"
              >
                <span>{skill.skill_name || skill.name}</span>

                <button
                  type="button"
                  onClick={() => deleteSkill(skill.skill_id || skill.id)}
                  className="text-sm font-semibold text-red-600"
                >
                  Xoá
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
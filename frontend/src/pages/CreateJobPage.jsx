import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import jobService from '../services/jobService.js';
import systemConfigurationService from '../services/systemConfigurationService.js';
const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none';
const getCategoryName = (category) =>
  category?.name || category?.category_name || '';

const getSkillName = (skill) =>
  skill?.skill_name || skill?.name || '';
const today = new Date().toISOString().split('T')[0];
const FIELD_LABELS = {
  title: 'Tên vị trí tuyển dụng',
  description: 'Mô tả công việc',
  salaryMin: 'Lương tối thiểu',
  salaryMax: 'Lương tối đa',
  currency: 'Đơn vị tiền tệ',
  location: 'Địa điểm làm việc',
  city: 'Thành phố',
  experience: 'Kinh nghiệm',
  category: 'Ngành nghề',
  categoryId: 'Ngành nghề',
  workType: 'Hình thức làm việc',
  employmentType: 'Loại hình công việc',
  skills: 'Kỹ năng yêu cầu',
  positionsAvailable: 'Số lượng tuyển',
  applicationDeadline: 'Hạn nộp hồ sơ',
};

const getFieldLabel = (fieldName) => {
  return FIELD_LABELS[fieldName] || fieldName;
};

const formatValidationError = (err) => {
  /*
   * Hỗ trợ cả hai trường hợp:
   * 1. apiClient đã chuẩn hóa lỗi thành err.details
   * 2. Axios trả lỗi gốc qua err.response.data.error.details
   */
  const details =
    err?.details ||
    err?.response?.data?.error?.details ||
    null;

  const backendMessage =
    err?.message ||
    err?.response?.data?.error?.message ||
    'Không thể tạo tin tuyển dụng.';

  const reasons = [];

  /*
   * Lỗi không thuộc riêng một trường nào.
   * Ví dụ: Lương tối thiểu phải nhỏ hơn hoặc bằng lương tối đa.
   */
  if (Array.isArray(details?.formErrors)) {
    details.formErrors.forEach((message) => {
      if (message) {
        reasons.push(String(message));
      }
    });
  }

  /*
   * Lỗi theo từng trường do Zod error.flatten() trả về.
   */
  if (
    details?.fieldErrors &&
    typeof details.fieldErrors === 'object'
  ) {
    Object.entries(details.fieldErrors).forEach(
      ([fieldName, messages]) => {
        const fieldLabel = getFieldLabel(fieldName);

        const messageList = Array.isArray(messages)
          ? messages
          : [messages];

        messageList.forEach((message) => {
          if (!message) return;

          const cleanMessage = String(message).trim();

          /*
           * Nếu validator đã ghi rõ tên trường thì giữ nguyên.
           * Nếu thông báo còn chung chung, thêm tên trường vào trước.
           */
          if (
            cleanMessage
              .toLocaleLowerCase('vi')
              .includes(fieldLabel.toLocaleLowerCase('vi'))
          ) {
            reasons.push(cleanMessage);
          } else {
            reasons.push(`${fieldLabel}: ${cleanMessage}`);
          }
        });
      },
    );
  }

  return {
    title: 'Lỗi hệ thống',

    message:
      reasons.length > 0
        ? 'Không thể tạo tin tuyển dụng. Vui lòng kiểm tra và sửa các nội dung sau:'
        : backendMessage,

    reasons: [...new Set(reasons)],
  };
};

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
    category: '',
    workType: 'hybrid',
    employmentType: 'full_time',
    skills: [],
    positionsAvailable: 1,
    applicationDeadline: '',
  });

  const [loading, setLoading] = useState(false);

  /*
   * Error không còn là string.
   * Nó có dạng:
   * {
   *   title: string,
   *   message: string,
   *   reasons: string[]
   * }
   */
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [maxSkillsPerJob, setMaxSkillsPerJob] =
    useState(30);
  const setField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setCatalogLoading(true);
        setError(null);

        const [
          categoryData,
          skillData,
          configurationData,
        ] = await Promise.all([
          jobService.listCategories(),
          jobService.listSkills(),
          systemConfigurationService
            .getAllConfigurations(),
        ]);
        const categoryList = Array.isArray(categoryData)
          ? categoryData
          : Array.isArray(categoryData?.data)
            ? categoryData.data
            : [];

        const skillList = Array.isArray(skillData)
          ? skillData
          : Array.isArray(skillData?.data)
            ? skillData.data
            : [];

        setCategories(categoryList);
        setSkillOptions(skillList);
        const configurationList =
          Array.isArray(configurationData)
            ? configurationData
            : Array.isArray(configurationData?.data)
              ? configurationData.data
              : [];
        const maxSkillsConfiguration =
          configurationList.find(
            (config) =>
              config.config_key ===
              'MAX_SKILLS_PER_JOB',
          );

        const configuredMaxSkills = Number(
          maxSkillsConfiguration?.parsed_value ??
          maxSkillsConfiguration?.config_value ??
          30,
        );

        if (
          Number.isFinite(configuredMaxSkills) &&
          configuredMaxSkills > 0
        ) {
          setMaxSkillsPerJob(
            configuredMaxSkills,
          );
        }
      } catch (err) {
        setError({
          title: 'Lỗi hệ thống',
          message:
            err?.message ||
            'Không thể tải danh sách ngành nghề và kỹ năng.',
          reasons: [],
        });
      } finally {
        setCatalogLoading(false);
      }
    };

    loadCatalog();
  }, []);

  const toggleSkill = (skillName) => {
    const alreadySelected =
      form.skills.includes(skillName);

    if (alreadySelected) {
      setForm((previous) => ({
        ...previous,
        skills: previous.skills.filter(
          (skill) => skill !== skillName,
        ),
      }));

      return;
    }

    if (form.skills.length >= maxSkillsPerJob) {
      setError({
        title: 'Lỗi hệ thống',
        message: 'Không thể chọn thêm kỹ năng.',
        reasons: [
          `Một tin tuyển dụng không được có quá ${maxSkillsPerJob} kỹ năng.`,
        ],
      });

      return;
    }

    setError(null);

    setForm((previous) => ({
      ...previous,
      skills: [
        ...previous.skills,
        skillName,
      ],
    }));
  };

  const removeSkill = (skillName) => {
    setForm((previous) => ({
      ...previous,
      skills: previous.skills.filter(
        (skill) => skill !== skillName,
      ),
    }));
  };

  const filteredSkills = useMemo(() => {
    const keyword = skillSearch
      .trim()
      .toLocaleLowerCase('vi');

    return skillOptions
      .filter((skill) => {
        const skillName = getSkillName(skill);

        if (!skillName) return false;

        return skillName
          .toLocaleLowerCase('vi')
          .includes(keyword);
      })
      .slice(0, 30);
  }, [skillOptions, skillSearch]);
  const submit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...form,

        /*
         * Chuyển dữ liệu từ input string thành number
         * trước khi gửi lên backend.
         */
        salaryMin:
          form.salaryMin === ''
            ? undefined
            : Number(form.salaryMin),

        salaryMax:
          form.salaryMax === ''
            ? undefined
            : Number(form.salaryMax),

        positionsAvailable: Number(
          form.positionsAvailable,
        ),

        /*
  * form.skills đã là mảng kỹ năng được người dùng chọn.
  */
        skills: form.skills

      };

      await jobService.createJob(payload);

      navigate('/employer/jobs');
    } catch (err) {
      setError(formatValidationError(err));
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
        Tin tuyển dụng mới sẽ ở trạng thái chờ duyệt trước
        khi được hiển thị công khai.
      </p>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
        >
          <p className="font-bold">
            {error.title || 'Lỗi hệ thống'}
          </p>

          <p className="mt-1 text-sm">
            {error.message}
          </p>

          {error.reasons?.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {error.reasons.map((reason, index) => (
                <li key={`${reason}-${index}`}>
                  {reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <form
        onSubmit={submit}
        className="mt-8 space-y-5 rounded-2xl border bg-white p-6 shadow-sm"
      >
        <div>
          <label className="mb-2 block font-semibold">
            Tên vị trí tuyển dụng
          </label>

          <input
            required
            minLength={3}
            className={inputClass}
            value={form.title}
            onChange={(e) =>
              setField('title', e.target.value)
            }
            placeholder="Ví dụ: Lập trình viên Frontend"
          />
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Mô tả công việc
          </label>

          <textarea
            required
            minLength={10}
            maxLength={10000}
            className={`${inputClass} h-32`}
            value={form.description}
            onChange={(e) =>
              setField('description', e.target.value)
            }
            placeholder="Mô tả nhiệm vụ, trách nhiệm và yêu cầu chính của công việc."
          />

          <p className="mt-1 text-xs text-slate-500">
            Tối thiểu 10 ký tự.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">
              Lương tối thiểu
            </label>

            <input
              type="number"
              min="0"
              step="1"
              className={inputClass}
              value={form.salaryMin}
              onChange={(e) =>
                setField('salaryMin', e.target.value)
              }
              placeholder="10000000"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Lương tối đa
            </label>

            <input
              type="number"
              min="0"
              step="1"
              className={inputClass}
              value={form.salaryMax}
              onChange={(e) =>
                setField('salaryMax', e.target.value)
              }
              placeholder="20000000"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">
              Địa điểm làm việc
            </label>

            <input
              required
              className={inputClass}
              value={form.location}
              onChange={(e) =>
                setField('location', e.target.value)
              }
              placeholder="Ví dụ: 120 Yên Lãng"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Thành phố
            </label>

            <input
              required
              className={inputClass}
              value={form.city}
              onChange={(e) =>
                setField('city', e.target.value)
              }
              placeholder="Hà Nội"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Ngành nghề
          </label>

          <select
            required
            disabled={catalogLoading}
            className={inputClass}
            value={form.category}
            onChange={(event) =>
              setField('category', event.target.value)
            }
          >
            <option value="">
              {catalogLoading
                ? 'Đang tải ngành nghề...'
                : 'Chọn ngành nghề'}
            </option>

            {categories.map((category) => {
              const categoryId =
                category.category_id || category.id;

              const categoryName =
                getCategoryName(category);

              return (
                <option
                  key={categoryId || categoryName}
                  value={categoryName}
                >
                  {categoryName}
                </option>
              );
            })}
          </select>

          {!catalogLoading && categories.length === 0 ? (
            <p className="mt-1 text-xs text-red-600">
              Chưa có ngành nghề trong hệ thống.
              Quản trị viên cần thêm ngành nghề trước.
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block font-semibold">
            Kỹ năng yêu cầu
          </label>

          {/* Các kỹ năng đã chọn */}
          {form.skills.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {form.skills.map((skillName) => (
                <span
                  key={skillName}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
                >
                  {skillName}

                  <button
                    type="button"
                    onClick={() =>
                      removeSkill(skillName)
                    }
                    className="font-bold text-blue-500 hover:text-red-600"
                    aria-label={`Bỏ kỹ năng ${skillName}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          {/* Ô tìm kiếm kỹ năng */}
          <input
            type="search"
            className={inputClass}
            value={skillSearch}
            onChange={(event) =>
              setSkillSearch(event.target.value)
            }
            placeholder="Tìm kỹ năng, ví dụ: React"
          />

          {/* Danh sách kỹ năng để chọn */}
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200">
            {catalogLoading ? (
              <p className="p-4 text-sm text-slate-500">
                Đang tải kỹ năng...
              </p>
            ) : null}

            {!catalogLoading &&
              filteredSkills.length === 0 ? (
              <p className="p-4 text-sm text-slate-500">
                Không tìm thấy kỹ năng phù hợp.
              </p>
            ) : null}

            {!catalogLoading &&
              filteredSkills.map((skill) => {
                const skillId =
                  skill.skill_id || skill.id;

                const skillName =
                  getSkillName(skill);

                const checked =
                  form.skills.includes(skillName);

                return (
                  <label
                    key={skillId || skillName}
                    className="flex cursor-pointer items-center gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleSkill(skillName)
                      }
                      className="h-4 w-4"
                    />

                    <span className="text-sm text-slate-700">
                      {skillName}
                    </span>
                  </label>
                );
              })}
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Đã chọn {form.skills.length}/{maxSkillsPerJob} kỹ năng.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">
              Hình thức làm việc
            </label>

            <select
              className={inputClass}
              value={form.workType}
              onChange={(e) =>
                setField('workType', e.target.value)
              }
            >
              <option value="onsite">
                Làm tại văn phòng
              </option>

              <option value="remote">
                Làm từ xa
              </option>

              <option value="hybrid">
                Kết hợp
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Loại hình công việc
            </label>

            <select
              className={inputClass}
              value={form.employmentType}
              onChange={(e) =>
                setField(
                  'employmentType',
                  e.target.value,
                )
              }
            >
              <option value="full_time">
                Toàn thời gian
              </option>

              <option value="part_time">
                Bán thời gian
              </option>

              <option value="contract">
                Hợp đồng
              </option>

              <option value="internship">
                Thực tập
              </option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-semibold">
              Số lượng tuyển
            </label>

            <input
              required
              type="number"
              min="1"
              step="1"
              className={inputClass}
              value={form.positionsAvailable}
              onChange={(e) =>
                setField(
                  'positionsAvailable',
                  e.target.value,
                )
              }
              placeholder="1"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">
              Hạn nộp hồ sơ
            </label>

            <input
              required
              type="date"
              min={today}
              className={inputClass}
              value={form.applicationDeadline}
              onChange={(e) =>
                setField(
                  'applicationDeadline',
                  e.target.value,
                )
              }
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? 'Đang tạo tin...'
            : 'Tạo tin tuyển dụng'}
        </button>
      </form>
    </main>
  );
}
const EXPERIENCE_LABELS = {
  INTERN: 'Không yêu cầu',
  FRESHER: 'Dưới 1 năm',
  JUNIOR: '1 - 2 năm',
  MID: '2 - 4 năm',
  SENIOR: '5 năm',
  LEAD: 'Trên 5 năm',
};

const JOB_TYPE_LABELS = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
};

const WORK_MODE_LABELS = {
  ONSITE: 'Tại văn phòng',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
};

const COMPANY_PALETTES = [
  'bg-orange-50 text-orange-600',
  'bg-pink-50 text-pink-600',
  'bg-amber-50 text-amber-600',
  'bg-red-50 text-red-600',
  'bg-sky-50 text-sky-600',
  'bg-green-50 text-green-600',
  'bg-violet-50 text-violet-600',
  'bg-teal-50 text-teal-600',
  'bg-indigo-50 text-indigo-600',
  'bg-rose-50 text-rose-600',
];

function createCompanyDisplay(name = '') {
  const cleanName = String(name).trim() || 'Công ty chưa cập nhật';
  const words = cleanName.split(/\s+/).filter(Boolean);

  const initials = words
    .slice(0, 3)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

  let hash = 0;

  for (let index = 0; index < cleanName.length; index += 1) {
    hash = (hash * 31 + cleanName.charCodeAt(index)) >>> 0;
  }

  return {
    name: cleanName,
    initials: initials || 'CT',
    brand: COMPANY_PALETTES[hash % COMPANY_PALETTES.length],
  };
}

function formatSalary(min, max, currency = 'VND') {
  const salaryMin =
    min === null || min === undefined || min === '' ? null : Number(min);

  const salaryMax =
    max === null || max === undefined || max === '' ? null : Number(max);

  if (!salaryMin && !salaryMax) {
    return 'Thoả thuận';
  }

  if (currency === 'VND') {
    const minMillion = salaryMin ? salaryMin / 1_000_000 : null;
    const maxMillion = salaryMax ? salaryMax / 1_000_000 : null;

    if (minMillion && maxMillion) {
      return `${minMillion.toLocaleString(
        'vi-VN',
      )} - ${maxMillion.toLocaleString('vi-VN')} triệu`;
    }

    if (minMillion) {
      return `Từ ${minMillion.toLocaleString('vi-VN')} triệu`;
    }

    return `Đến ${maxMillion.toLocaleString('vi-VN')} triệu`;
  }

  return `${Number(salaryMin || 0).toLocaleString('vi-VN')} - ${Number(
    salaryMax || 0,
  ).toLocaleString('vi-VN')} ${currency}`;
}

function getPostedText(createdAt) {
  if (!createdAt) {
    return 'Đăng gần đây';
  }

  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return 'Đăng gần đây';
  }

  const diffMilliseconds = Date.now() - createdDate.getTime();

  const diffDays = Math.max(
    0,
    Math.floor(diffMilliseconds / (1000 * 60 * 60 * 24)),
  );

  if (diffDays === 0) {
    return 'Đăng hôm nay';
  }

  if (diffDays === 1) {
    return 'Đăng 1 ngày trước';
  }

  if (diffDays < 7) {
    return `Đăng ${diffDays} ngày trước`;
  }

  const weeks = Math.floor(diffDays / 7);

  if (weeks < 5) {
    return `Đăng ${weeks} tuần trước`;
  }

  const months = Math.floor(diffDays / 30);

  return `Đăng ${months} tháng trước`;
}

function formatDate(value) {
  if (!value) {
    return 'Chưa cập nhật';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Chưa cập nhật';
  }

  return date.toLocaleDateString('vi-VN');
}

function getDeadlineFullLabel(value) {
  if (!value) {
    return 'Chưa cập nhật';
  }

  const deadline = new Date(value);

  if (Number.isNaN(deadline.getTime())) {
    return 'Chưa cập nhật';
  }

  const today = new Date();

  deadline.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays > 0) {
    return `${formatDate(value)} (còn ${diffDays} ngày)`;
  }

  if (diffDays === 0) {
    return `${formatDate(value)} (hết hạn hôm nay)`;
  }

  return `${formatDate(value)} (đã hết hạn)`;
}

function toTextArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n/)
      .map((item) => item.replace(/^[-•*]\s*/, '').trim())
      .filter(Boolean);
  }

  return [];
}

function parseJobDetail(description, experienceLabel) {
  if (description && typeof description === 'object') {
    return description;
  }

  if (typeof description === 'string') {
    try {
      const parsed = JSON.parse(description);

      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch {
      // Mô tả cũ là chuỗi bình thường.
    }
  }

  return {
    mo_ta_cong_viec: toTextArray(description),
    yeu_cau_ung_vien: [],
    quyen_loi: [],
    thoi_gian_lam_viec: '',
    yeu_cau_kinh_nghiem: experienceLabel,
    yeu_cau_bang_cap: 'Không yêu cầu',
  };
}

function getSkillNames(job) {
  if (!Array.isArray(job?.job_skill)) {
    return [];
  }

  return job.job_skill
    .map((item) => item?.skill?.skill_name || item?.skill_name)
    .filter(Boolean);
}

export function normalizeApiJob(job) {
  const companyName =
    job?.employer?.company_name ||
    job?.company_name ||
    'Công ty chưa cập nhật';

  const experienceEnum = job?.experience_level || 'INTERN';

  const experienceLabel =
    EXPERIENCE_LABELS[experienceEnum] || 'Không yêu cầu';

  const postedText = getPostedText(job?.created_at);

  return {
    id: job?.job_id ?? job?.id,
    source: 'database',

    title:
      job?.job_title ||
      job?.title ||
      'Tin tuyển dụng chưa có tiêu đề',

    company: createCompanyDisplay(companyName),

    category:
      job?.category?.name ||
      job?.category_name ||
      'Ngành nghề khác',

    salaryLabel: formatSalary(
      job?.salary_min ?? job?.salaryMin,
      job?.salary_max ?? job?.salaryMax,
      job?.salary_currency || job?.currency || 'VND',
    ),

    salaryMin: job?.salary_min ?? job?.salaryMin ?? null,
    salaryMax: job?.salary_max ?? job?.salaryMax ?? null,

    negotiable:
      !job?.salary_min &&
      !job?.salary_max &&
      !job?.salaryMin &&
      !job?.salaryMax,

    location:
      job?.location ||
      job?.city ||
      'Chưa cập nhật',

    experienceLabel,
    experienceEnum,

    employmentType:
      JOB_TYPE_LABELS[job?.job_type] ||
      'Toàn thời gian',

    jobTypeEnum:
      job?.job_type ||
      'FULL_TIME',

    workType:
      WORK_MODE_LABELS[job?.work_mode] ||
      'Tại văn phòng',

    workModeEnum:
      job?.work_mode ||
      'ONSITE',

    tags: getSkillNames(job),

    postedAgo: postedText.replace(/^Đăng\s*/, ''),
    postedText,

    detail: parseJobDetail(
      job?.job_description,
      experienceLabel,
    ),

    hot: Number(job?.salary_max || 0) >= 50_000_000,

    applicationDeadline:
      job?.application_deadline || null,

    deadlineLabel: formatDate(
      job?.application_deadline,
    ),

    deadlineFullLabel: getDeadlineFullLabel(
      job?.application_deadline,
    ),

    applicationsLabel:
      `${job?.applications_count || 0} người`,

    status: job?.status,
    isApproved: Boolean(job?.is_approved),
  };
}

export function mergeJobs(mockJobs = [], apiJobs = []) {
  const sampleJobs = mockJobs.map((job) => ({
    ...job,
    source: job.source || 'mock',
  }));

  const databaseJobs = apiJobs
    .filter(
      (job) =>
        job?.status === 'OPEN' &&
        job?.is_approved === true,
    )
    .map(normalizeApiJob)
    .filter(
      (job) =>
        job.id !== null &&
        job.id !== undefined,
    );

  const mergedMap = new Map();

  for (const job of sampleJobs) {
    mergedMap.set(
      `mock-${String(job.id)}`,
      job,
    );
  }

  for (const job of databaseJobs) {
    mergedMap.set(
      `database-${String(job.id)}`,
      job,
    );
  }

  return [...mergedMap.values()];
}
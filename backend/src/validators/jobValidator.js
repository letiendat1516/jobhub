/**
 * Job input schemas (Zod)
 * ------------------------------------------------------------------
 * Shape validation for job create/update requests. Salary, location,
 * experience, work type and employment type mirror the search filters
 * in docs/01_PROJECT_OVERVIEW.md §5.
 */
import { z } from 'zod';

const workType = z.enum(['remote', 'hybrid', 'onsite']);
const employmentType = z.enum(['full_time', 'part_time', 'contract', 'internship']);
const decision = z.enum(['Approved', 'Rejected']);

const money = z.coerce
  .number()
  .int('Lương phải là số nguyên.')
  .nonnegative('Lương không được âm.');

const positiveInt = z.coerce
  .number()
  .int('Giá trị phải là số nguyên.')
  .positive('Giá trị phải lớn hơn 0.');

const dateString = z
  .string()
  .trim()
  .optional()
  .refine((value) => {
    if (!value) return true;
    const date = new Date(value);
    return !Number.isNaN(date.getTime());
  }, 'Hạn nộp hồ sơ không hợp lệ.');

const skillName = z
  .string()
  .trim()
  .min(1, 'Tên kỹ năng không được để trống.')
  .max(80, 'Tên kỹ năng quá dài.');

const requirementText = z
  .string()
  .trim()
  .min(1, 'Yêu cầu không được để trống.')
  .max(500, 'Yêu cầu quá dài.');

const jobBase = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Tên vị trí phải có ít nhất 3 ký tự.')
    .max(150, 'Tên vị trí quá dài.'),

  description: z
    .string()
    .trim()
    .min(10, 'Mô tả công việc phải có ít nhất 10 ký tự.')
    .max(10000, 'Mô tả công việc quá dài.'),

  requirements: z.array(requirementText).max(20).optional(),

  salaryMin: money.optional(),
  salaryMax: money.optional(),

  currency: z
    .string()
    .trim()
    .length(3, 'Đơn vị tiền tệ phải có 3 ký tự.')
    .transform((value) => value.toUpperCase())
    .default('VND'),

  location: z
    .string()
    .trim()
    .min(1, 'Địa điểm làm việc là bắt buộc.')
    .max(150, 'Địa điểm quá dài.'),

  city: z.string().trim().max(100, 'Thành phố quá dài.').optional(),

  experience: z.string().trim().max(100, 'Kinh nghiệm quá dài.').optional(),

  category: z.string().trim().max(100, 'Ngành nghề quá dài.').optional(),

  categoryId: positiveInt.optional(),

  workType,

  employmentType,

  skills: z
    .array(skillName)
    .optional()
    .transform((skills) => {
      if (!skills) return skills;

      const uniqueSkills = [];

      for (const skill of skills) {
        const existed = uniqueSkills.some(
          (item) => item.toLowerCase() === skill.toLowerCase(),
        );

        if (!existed) {
          uniqueSkills.push(skill);
        }
      }

      return uniqueSkills;
    }),

  positionsAvailable: positiveInt.default(1),

  applicationDeadline: dateString,
});

const salaryRule = (data) => {
  if (data.salaryMin === undefined || data.salaryMax === undefined) {
    return true;
  }

  return data.salaryMin <= data.salaryMax;
};

const deadlineRule = (data) => {
  if (!data.applicationDeadline) {
    return true;
  }

  const deadline = new Date(data.applicationDeadline);
  const today = new Date();

  deadline.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return deadline >= today;
};

const create = jobBase
  .refine(salaryRule, {
    message: 'Lương tối thiểu phải nhỏ hơn hoặc bằng lương tối đa.',
    path: ['salaryMax'],
  })
  .refine(deadlineRule, {
    message: 'Hạn nộp hồ sơ phải là hôm nay hoặc trong tương lai.',
    path: ['applicationDeadline'],
  });

const update = jobBase
  .partial()
  .refine(salaryRule, {
    message: 'Lương tối thiểu phải nhỏ hơn hoặc bằng lương tối đa.',
    path: ['salaryMax'],
  })
  .refine(deadlineRule, {
    message: 'Hạn nộp hồ sơ phải là hôm nay hoặc trong tương lai.',
    path: ['applicationDeadline'],
  });

const catalogItem = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Tên không được để trống.')
    .max(100, 'Tên quá dài.'),
});

const moderate = z.object({
  decision,
});

export default {
  create,
  update,
  catalogItem,
  moderate,
};
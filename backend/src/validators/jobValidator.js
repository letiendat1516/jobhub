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

const create = z.object({
  title: z.string().trim().min(3, 'Tiêu đề công việc là bắt buộc.').max(150),
  description: z.string().trim().min(10).max(10000),
  requirements: z.array(z.string()).optional(),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).default('VND'),
  location: z.string().trim().min(1).max(150),
  experience: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  workType,
  employmentType,
  skills: z.array(z.string()).optional(),
});

const update = create.partial();

export default {
  create,
  update,
};

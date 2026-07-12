import { z } from 'zod';

const id = z.coerce.number().int().positive();
const status = z.enum(['SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED']);
const optionalFilter = (schema) =>
  z.preprocess((value) => (value === '' ? undefined : value), schema.optional());

const apply = z
  .object({
    jobId: id,
    coverLetter: z.string().trim().max(5000).optional().default(''),
  })
  .strict();

const list = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  jobId: optionalFilter(id),
  status: optionalFilter(status),
  keyword: optionalFilter(z.string().trim().max(150)),
  candidateName: optionalFilter(z.string().trim().max(150)),
  submittedFrom: optionalFilter(z.string().date()),
  submittedTo: optionalFilter(z.string().date()),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});

const params = z.object({ id });

const updateStatus = z
  .object({
    status: z.enum(['UNDER_REVIEW', 'ACCEPTED', 'REJECTED']),
    expectedCurrentStatus: z.enum(['SUBMITTED', 'UNDER_REVIEW']),
  })
  .strict();

export default { apply, list, params, updateStatus };

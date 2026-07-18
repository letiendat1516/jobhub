import { z } from 'zod';

const pagination = {
  keyword: z.string().trim().max(100).optional().default(''),
  status: z.enum(['all', 'active', 'blocked']).optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
};

const userList = z.object(pagination);
const employerList = z.object({
  ...pagination,
  verification: z.enum(['all', 'verified', 'pending']).optional().default('all'),
});
const idParams = z.object({ id: z.coerce.number().int().positive() });
const accountStatusAction = z.object({ action: z.enum(['activate', 'block']) });
const verificationAction = z.object({ action: z.enum(['verify', 'unverify']) });

export default { userList, employerList, idParams, accountStatusAction, verificationAction };

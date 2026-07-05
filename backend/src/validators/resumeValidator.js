/**
 * Resume input schemas (Zod)
 * ------------------------------------------------------------------
 * Resume upload is multipart/form-data (PDF). This schema validates
 * metadata fields that accompany the file. The file itself is
 * validated by the upload middleware (type + size) in Phase 6.
 */
import { z } from 'zod';

const setPrimary = z.object({
  isPrimary: z.boolean().optional(),
  label: z.string().trim().max(100).optional(),
});

export default {
  setPrimary,
};

import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads/resumes');

const storage = multer.diskStorage({
  destination: root,
  filename: (_req, file, done) => {
    done(
      null,
      `${Date.now()}-${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`,
    );
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, done) => {
    const isPdf =
      file.mimetype === 'application/pdf' &&
      path.extname(file.originalname).toLowerCase() === '.pdf';
    done(isPdf ? null : ApiError.badRequest('Chỉ chấp nhận tệp PDF.'), isPdf);
  },
});

export { root as resumeStorageRoot };
export default upload;

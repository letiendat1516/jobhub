import fs from 'node:fs/promises';
import jwt from 'jsonwebtoken';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import config from '../src/config/index.js';

const repository = {
  saveResume: vi.fn(),
  findResumeById: vi.fn(),
  findResumesByUser: vi.fn(),
  clearPrimary: vi.fn(),
  updateResume: vi.fn(),
  deleteResume: vi.fn(),
};
vi.mock('../src/repositories/ResumeRepository.js', () => ({ default: repository }));
const { default: app } = await import('../src/app.js');

let server;
let baseUrl;
let savedPath;
const token = (role = 'job_seeker') =>
  jwt.sign({ sub: 4, role }, config.jwt.secret, { expiresIn: '5m' });

beforeAll(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  if (savedPath) await fs.unlink(savedPath).catch(() => undefined);
});
beforeEach(() => {
  vi.clearAllMocks();
  repository.findResumesByUser.mockResolvedValue([]);
  repository.clearPrimary.mockResolvedValue(undefined);
  repository.saveResume.mockImplementation(async (payload) => {
    savedPath = payload.file_path;
    return { resume_id: 1, ...payload, upload_date: new Date().toISOString() };
  });
});

describe('Resume API', () => {
  it('requires a job-seeker session', async () => {
    const response = await fetch(`${baseUrl}/api/resumes/me`, {
      headers: { authorization: `Bearer ${token('employer')}` },
    });
    expect(response.status).toBe(403);
  });

  it('lists the authenticated candidate resumes', async () => {
    const response = await fetch(`${baseUrl}/api/resumes/me`, {
      headers: { authorization: `Bearer ${token()}` },
    });
    expect(response.status).toBe(200);
    expect(repository.findResumesByUser).toHaveBeenCalledWith(4);
  });

  it('uploads a PDF and makes the first resume primary', async () => {
    const form = new FormData();
    form.append('title', 'Test CV');
    form.append('resume', new Blob(['%PDF-1.4\n%%EOF'], { type: 'application/pdf' }), 'test.pdf');
    const response = await fetch(`${baseUrl}/api/resumes`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token()}` },
      body: form,
    });
    expect(response.status).toBe(201);
    expect(repository.saveResume).toHaveBeenCalledWith(
      expect.objectContaining({ job_seeker_id: 4, file_name: 'test.pdf', is_primary: true }),
    );
  });

  it('rejects a non-PDF upload', async () => {
    const form = new FormData();
    form.append('resume', new Blob(['text'], { type: 'text/plain' }), 'test.txt');
    const response = await fetch(`${baseUrl}/api/resumes`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token()}` },
      body: form,
    });
    expect(response.status).toBe(400);
  });
});

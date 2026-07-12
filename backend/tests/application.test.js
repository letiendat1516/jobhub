import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import config from '../src/config/index.js';

const repository = {
  getCandidateContext: vi.fn(),
  findJob: vi.fn(),
  findDuplicate: vi.fn(),
  createApplication: vi.fn(),
  listForCandidate: vi.fn(),
  listForEmployer: vi.fn(),
  findDetail: vi.fn(),
  listHistory: vi.fn(),
  updateStatusAtomic: vi.fn(),
};

vi.mock('../src/repositories/ApplicationRepository.js', () => ({ default: repository }));

const { default: app } = await import('../src/app.js');

let server;
let baseUrl;

const token = (role, sub = 1) =>
  jwt.sign({ sub, role, email: `${role}@test.local` }, config.jwt.secret, { expiresIn: '5m' });
const request = (path, options = {}) =>
  fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token('job_seeker')}`,
      ...options.headers,
    },
  });

beforeAll(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => new Promise((resolve) => server.close(resolve)));

beforeEach(() => {
  vi.clearAllMocks();
  repository.getCandidateContext.mockResolvedValue({
    profile: {
      job_seeker_id: 1,
      full_name: 'Candidate',
      headline: 'Developer',
      city: 'HCM',
      is_active: true,
    },
    resume: { resume_id: 9 },
  });
  repository.findJob.mockResolvedValue({
    job_id: 2,
    status: 'OPEN',
    is_approved: true,
    application_deadline: '2099-01-01',
  });
  repository.findDuplicate.mockResolvedValue(null);
  repository.createApplication.mockResolvedValue({
    application_id: 3,
    job_id: 2,
    status: 'SUBMITTED',
    application_date: '2026-07-12T00:00:00Z',
  });
  repository.listForCandidate.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 });
  repository.listHistory.mockResolvedValue([]);
});

describe('Application API', () => {
  it('rejects unauthenticated application submission', async () => {
    const response = await fetch(`${baseUrl}/api/applications`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jobId: 2 }),
    });
    expect(response.status).toBe(401);
  });

  it('rejects the wrong role', async () => {
    const response = await request('/api/applications', {
      method: 'POST',
      headers: { authorization: `Bearer ${token('employer')}` },
      body: JSON.stringify({ jobId: 2 }),
    });
    expect(response.status).toBe(403);
  });

  it('submits a valid application using authenticated identity and primary resume', async () => {
    const response = await request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId: 2, coverLetter: 'Hello' }),
    });
    expect(response.status).toBe(201);
    expect(repository.createApplication).toHaveBeenCalledWith(
      expect.objectContaining({ job_seeker_id: 1, job_id: 2, resume_id: 9, status: 'SUBMITTED' }),
    );
  });

  it('rejects duplicate applications', async () => {
    repository.findDuplicate.mockResolvedValue({ application_id: 99 });
    const response = await request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId: 2 }),
    });
    expect(response.status).toBe(409);
  });

  it('rejects missing active resume', async () => {
    repository.getCandidateContext.mockResolvedValue({
      profile: { full_name: 'Candidate', headline: 'Developer', city: 'HCM', is_active: true },
      resume: null,
    });
    const response = await request('/api/applications', {
      method: 'POST',
      body: JSON.stringify({ jobId: 2 }),
    });
    expect(response.status).toBe(400);
  });

  it('accepts empty optional list filters from the UI', async () => {
    const response = await request('/api/applications/me?status=&keyword=&sort=newest&page=1');
    expect(response.status).toBe(200);
  });

  it('blocks cross-employer review', async () => {
    repository.findDetail.mockResolvedValue({
      application_id: 3,
      status: 'SUBMITTED',
      job: { employer_id: 7 },
    });
    const response = await request('/api/applications/employer/3', {
      headers: { authorization: `Bearer ${token('employer', 8)}` },
    });
    expect(response.status).toBe(403);
  });

  it('updates an owned application through the atomic repository operation', async () => {
    repository.findDetail.mockResolvedValue({
      application_id: 3,
      status: 'SUBMITTED',
      job: { employer_id: 7 },
    });
    repository.updateStatusAtomic.mockResolvedValue({
      application_id: 3,
      status: 'UNDER_REVIEW',
      history_id: 1,
    });
    const response = await request('/api/applications/employer/3/status', {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token('employer', 7)}` },
      body: JSON.stringify({ status: 'UNDER_REVIEW', expectedCurrentStatus: 'SUBMITTED' }),
    });
    expect(response.status).toBe(200);
    expect(repository.updateStatusAtomic).toHaveBeenCalledOnce();
  });

  it('allows an admin to review an application without employer ownership', async () => {
    repository.findDetail.mockResolvedValue({
      application_id: 3,
      status: 'SUBMITTED',
      job: { employer_id: 7 },
    });
    const response = await request('/api/applications/employer/3', {
      headers: { authorization: `Bearer ${token('admin', 1)}` },
    });
    expect(response.status).toBe(200);
  });

  it('rejects a transition from a terminal status', async () => {
    repository.findDetail.mockResolvedValue({
      application_id: 3,
      status: 'ACCEPTED',
      job: { employer_id: 7 },
    });
    const response = await request('/api/applications/employer/3/status', {
      method: 'PATCH',
      headers: { authorization: `Bearer ${token('employer', 7)}` },
      body: JSON.stringify({ status: 'REJECTED', expectedCurrentStatus: 'SUBMITTED' }),
    });
    expect(response.status).toBe(409);
  });
});

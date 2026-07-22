import { beforeEach, describe, expect, it, vi } from 'vitest';

const database = vi.hoisted(() => ({
  rpc: vi.fn(),
  single: vi.fn(),
}));

vi.mock('../src/config/supabase.js', () => ({
  default: () => ({ rpc: database.rpc }),
}));

const { default: ApplicationRepository } = await import(
  '../src/repositories/ApplicationRepository.js'
);

const update = (overrides = {}) =>
  ApplicationRepository.updateStatusAtomic({
    applicationId: 3,
    expectedStatus: 'SUBMITTED',
    newStatus: 'ACCEPTED',
    actorId: 7,
    actorRole: 'employer',
    ...overrides,
  });

beforeEach(() => {
  vi.clearAllMocks();
  database.rpc.mockReturnValue({ single: database.single });
});

describe('ApplicationRepository.updateStatusAtomic', () => {
  it('calls the ownership-aware RPC and maps its result', async () => {
    database.single.mockResolvedValue({
      data: {
        result_application_id: 3,
        result_status: 'ACCEPTED',
        result_updated_at: '2026-07-22T00:00:00Z',
        history_id: 10,
      },
      error: null,
    });

    await expect(update()).resolves.toEqual({
      application_id: 3,
      status: 'ACCEPTED',
      updated_at: '2026-07-22T00:00:00Z',
      history_id: 10,
    });
    expect(database.rpc).toHaveBeenCalledWith('update_application_status', {
      p_application_id: 3,
      p_expected_status: 'SUBMITTED',
      p_new_status: 'ACCEPTED',
      p_changed_by: 7,
      p_changed_by_role: 'employer',
      p_employer_id: 7,
      p_is_admin: false,
    });
  });

  it.each([
    ['P0002', 404],
    ['42501', 403],
    ['40001', 409],
    ['22023', 400],
    ['PGRST202', 503],
  ])('maps database error %s to HTTP %i', async (code, statusCode) => {
    database.single.mockResolvedValue({ data: null, error: { code, message: code } });
    await expect(update()).rejects.toMatchObject({ statusCode });
  });

  it('passes an admin principal without trusting an employer id from the client', async () => {
    database.single.mockResolvedValue({
      data: {
        result_application_id: 3,
        result_status: 'ACCEPTED',
        result_updated_at: '2026-07-22T00:00:00Z',
        history_id: 10,
      },
      error: null,
    });
    await update({ actorId: 1, actorRole: 'admin' });
    expect(database.rpc).toHaveBeenCalledWith(
      'update_application_status',
      expect.objectContaining({ p_changed_by: 1, p_employer_id: null, p_is_admin: true }),
    );
  });
});

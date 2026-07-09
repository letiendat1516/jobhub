/**
 * AI Scores storage (localStorage) — organized by sessions.
 * ------------------------------------------------------------------
 * Mỗi lần chấm điểm = 1 phiên (session). Lưu trữ theo phiên để user
 * xem lại từng lần chấm riêng biệt.
 *
 * Structure:
 *   {
 *     sessions: [
 *       {
 *         id: string,
 *         cvName: string,
 *         method: 'ai' | 'sql' | 'both',
 *         scoredAt: ISO string,
 *         jobCount: number,
 *         scores: { [jobId]: { ai?: {...}, sql?: {...} } },
 *         jobs: { [jobId]: { id, title, company, ... } }
 *       },
 *       ...
 *     ]
 *   }
 */

const STORAGE_KEY = 'jobhub.aiSessions';
const MAX_SESSIONS = 20;

/** Đọc toàn bộ sessions đã lưu (tự migrate từ format cũ nếu có). */
export function loadSessions() {
  try {
    // Migration: nếu có data ở key cũ (jobhub.aiScores), convert sang sessions
    const oldRaw = localStorage.getItem('jobhub.aiScores');
    if (oldRaw && !localStorage.getItem(STORAGE_KEY)) {
      const oldData = JSON.parse(oldRaw);
      if (oldData?.scores) {
        const migratedSession = {
          id: `session_migrated_${Date.now()}`,
          cvName: oldData.cvName || 'Phiên chấm điểm (cũ)',
          method: 'ai',
          scoredAt: oldData.scoredAt || new Date().toISOString(),
          jobCount: Object.keys(oldData.scores).length,
          scores: {},
          jobs: oldData.jobs || {},
        };
        // Convert old flat scores → new { ai: {...} } format
        for (const [jobId, score] of Object.entries(oldData.scores)) {
          migratedSession.scores[jobId] = { ai: score };
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions: [migratedSession] }));
        localStorage.removeItem('jobhub.aiScores');
      }
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : { sessions: [] };
    return data.sessions || [];
  } catch {
    return [];
  }
}

/**
 * Lưu 1 phiên chấm điểm mới vào localStorage.
 *
 * @param {object} params
 * @param {string} params.cvName
 * @param {string} params.method     - 'ai' | 'sql' | 'both'
 * @param {object} params.scores     - { [jobId]: { ai?: {...}, sql?: {...} } }
 * @param {Array}  params.jobs       - array of normalized job objects
 * @returns {object} session vừa tạo
 */
export function saveSession({ cvName, method, scores, jobs }) {
  const sessions = loadSessions();

  const id = `session_${Date.now()}`;
  const jobMap = {};
  for (const job of jobs) {
    if (scores[job.id]) {
      jobMap[job.id] = {
        id: job.id,
        title: job.title,
        company: job.company,
        companyLogo: job.companyLogo,
        salaryLabel: job.salaryLabel,
        location: job.location,
        experienceLabel: job.experienceLabel,
        workType: job.workType,
        employmentType: job.employmentType,
        tags: job.tags,
        category: job.category,
        postedAgo: job.postedAgo,
      };
    }
  }

  const session = {
    id,
    cvName: cvName || 'Không rõ',
    method: method || 'both',
    scoredAt: new Date().toISOString(),
    jobCount: Object.keys(scores).length,
    scores,
    jobs: jobMap,
  };

  sessions.unshift(session); // newest first

  // Cap at MAX_SESSIONS to avoid localStorage overflow
  const capped = sessions.slice(0, MAX_SESSIONS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions: capped }));
  } catch (e) {
    console.warn('Cannot save AI sessions to localStorage:', e);
  }

  return session;
}

/** Xoá toàn bộ sessions. */
export function clearSessions() {
  localStorage.removeItem(STORAGE_KEY);
}

/** Xoá 1 session theo id. */
export function deleteSession(id) {
  const sessions = loadSessions().filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions }));
  } catch {
    // ignore
  }
}

/** Đếm tổng số sessions. */
export function countSessions() {
  return loadSessions().length;
}

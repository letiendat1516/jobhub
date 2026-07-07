/**
 * AI Logger
 * ------------------------------------------------------------------
 * Ghi log mỗi lần gọi AI (DeepSeek) vào 2 nơi:
 *
 * 1. DB — bảng `ai_matching_log` (để query/tracking qua Supabase)
 * 2. File — `ai-lab/logs/*.json` (để offline phân tích cải thiện prompt)
 *
 * Luôn được gọi từ deepseekClient.js, bất kể success hay fail.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import getSupabaseClient from '../config/supabase.js';
import logger from '../utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// backend/src/ai/ → lên 3 cấp → project root → ai-lab/logs
const LOGS_DIR = path.resolve(__dirname, '../../../ai-lab/logs');

/**
 * Sinh id file an toàn (timestamp + random ngắn).
 */
const buildLogId = () => {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const rand = Math.random().toString(36).slice(2, 8);
  return `ai_${ts}_${rand}`;
};

/**
 * Tạo object log chuẩn.
 * @param {object} p
 * @param {string} p.task
 * @param {string} p.model
 * @param {string} p.prompt
 * @param {string} p.response
 * @param {number} p.processingTimeMs
 * @param {number} p.tokensIn
 * @param {number} p.tokensOut
 * @param {boolean} p.success
 * @param {string|null} p.error
 * @param {object} p.metadata
 */
export async function logAiCall({
  task,
  model,
  prompt,
  response,
  processingTimeMs,
  tokensIn,
  tokensOut,
  success,
  error,
  metadata,
}) {
  const logId = buildLogId();
  const timestamp = new Date().toISOString();

  const entry = {
    log_id: logId,
    timestamp,
    task,
    model,
    prompt,
    response,
    processing_time_ms: processingTimeMs,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    success,
    error,
    metadata: metadata ?? {},
  };

  // 1. Ghi DB (bảng ai_matching_log) — best effort, không block nếu fail.
  try {
    const client = getSupabaseClient();
    if (client) {
      const { error: dbErr } = await client.from('ai_matching_log').insert({
        job_seeker_id: metadata?.job_seeker_id ?? null,
        prompt_text: prompt,
        response_text: response,
        model_name: model,
        total_jobs_sent: metadata?.total_jobs_sent ?? null,
        processing_time_ms: processingTimeMs,
      });
      if (dbErr) logger.warn({ err: dbErr }, 'ai_matching_log insert failed');
    }
  } catch (e) {
    logger.warn({ err: e }, 'Supabase log failed (ignored)');
  }

  // 2. Ghi file ai-lab/logs/<log_id>.json
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
    const filePath = path.join(LOGS_DIR, `${logId}.json`);
    await fs.writeFile(filePath, JSON.stringify(entry, null, 2), 'utf8');
  } catch (e) {
    logger.warn({ err: e }, 'File log write failed (ignored)');
  }

  return entry;
}

export default { logAiCall };

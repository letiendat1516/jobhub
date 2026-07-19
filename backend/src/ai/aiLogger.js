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

  // Truncate large text fields in the file log to reduce PII stored on disk.
  // The DB stores the full text; files are for quick offline inspection only.
  const MAX_TEXT_LEN = 2000;
  const truncate = (str) =>
    (str || '').length > MAX_TEXT_LEN
      ? (str || '').slice(0, MAX_TEXT_LEN) + '\n…[truncated for log file]'
      : (str || '');

  const entry = {
    log_id: logId,
    timestamp,
    task,
    model,
    prompt: truncate(prompt),
    response: truncate(response),
    processing_time_ms: processingTimeMs,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    success,
    error,
    metadata: metadata ?? {},
  };

  // Sanitize: PostgreSQL không chấp nhận \u0000 (null byte) trong text
  // eslint-disable-next-line no-control-regex
  const sanitize = (str) => (str || '').replace(/\u0000/g, '').replace(/\0/g, '');
  const cleanPrompt = sanitize(prompt);
  const cleanResponse = sanitize(response);

  // 1. Ghi DB (bảng ai_matching_log) — best effort, không block nếu fail.
  try {
    const client = getSupabaseClient();
    if (client) {
      const { error: dbErr } = await client.from('ai_matching_log').insert({
        job_seeker_id: metadata?.job_seeker_id ?? null,
        prompt_text: cleanPrompt,
        response_text: cleanResponse,
        model_name: model,
        total_jobs_sent: metadata?.total_jobs_sent ?? null,
        processing_time_ms: processingTimeMs,
        task: task ?? null,
        tokens_in: tokensIn ?? 0,
        tokens_out: tokensOut ?? 0,
        success: success ?? true,
        error: sanitize(error) || null,
      });
      if (dbErr) {
        logger.error(
          { err: dbErr, task, code: dbErr.code },
          '❌ ai_matching_log DB insert FAILED — check if Migration 002 was run (DROP NOT NULL on job_seeker_id)',
        );
        logger.warn({ task, code: dbErr.code }, '[aiLogger] DB insert failed');
      } else {
        logger.info({ task }, '✓ ai_matching_log DB insert OK');
      }
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

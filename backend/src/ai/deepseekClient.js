/**
 * DeepSeek API client
 * ------------------------------------------------------------------
 * Wrapper duy nhất gọi DeepSeek chat completion. Service layer
 * (ResumeService, RecommendationService) gọi qua đây, không gọi
 * fetch/axios trực tiếp.
 *
 * Đọc config từ `config/index.js`:
 *   - DEEPSEEK_API_KEY
 *   - DEEPSEEK_BASE_URL  (mặc định https://api.deepseek.com)
 *   - DEEPSEEK_MODEL     (mặc định deepseek-chat)
 *
 * Mọi lần gọi đều được log qua aiLogger (DB + file ai-lab/logs/).
 * Implemented trong Phase 9 (AI Resume Analysis).
 */
import config from '../config/index.js';
import logger from '../utils/logger.js';
import { logAiCall } from './aiLogger.js';
import { getApiKey } from './deepseekKeyStore.js';

/** Endpoint chat completion (OpenAI-compatible). */
const CHAT_URL = () => `${config.deepseek.baseUrl}/chat/completions`;

/**
 * Gọi DeepSeek chat completion.
 *
 * @param {object} params
 * @param {string} params.task        - 'resume_extraction' | 'job_matching'
 * @param {Array<{role:string,content:string}>} params.messages
 * @param {object} [params.metadata]  - thông tin thêm để log
 *                                       (resume_id, user_id, total_jobs_sent, ...)
 * @returns {Promise<{content:string, tokensIn:number, tokensOut:number}>}
 */
export async function chatCompletion({ task, messages, metadata = {} }) {
  const startedAt = Date.now();
  const body = {
    model: config.deepseek.model,
    messages,
    temperature: 0, // 0 = deterministic — cùng input luôn ra cùng kết quả
    response_format: { type: 'json_object' },
  };

  let response;
  let success = true;
  let error = null;

  try {
    const res = await fetch(CHAT_URL(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Đọc key tại mỗi lần gọi → override từ UI áp dụng ngay, không cần restart.
        Authorization: `Bearer ${getApiKey()}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`DeepSeek ${res.status}: ${text}`);
    }

    const json = await res.json();
    response = {
      content: json.choices?.[0]?.message?.content ?? '',
      tokensIn: json.usage?.prompt_tokens ?? 0,
      tokensOut: json.usage?.completion_tokens ?? 0,
    };
    return response;
  } catch (err) {
    success = false;
    error = err.message;
    logger.error({ err, task }, 'DeepSeek call failed');
    throw err;
  } finally {
    const processingTimeMs = Date.now() - startedAt;
    // Luôn log (thành công hay thất bại) để phân tích.
    await logAiCall({
      task,
      model: config.deepseek.model,
      // Lưu prompt = nội dung messages join lại (để offline phân tích)
      prompt: messages.map((m) => `[${m.role}]\n${m.content}`).join('\n\n'),
      response: response?.content ?? '',
      processingTimeMs,
      tokensIn: response?.tokensIn ?? 0,
      tokensOut: response?.tokensOut ?? 0,
      success,
      error,
      metadata,
    }).catch((e) => logger.error({ err: e }, 'Failed to log AI call'));
  }
}

export default { chatCompletion };

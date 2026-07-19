/**
 * DeepSeek API Key Store (runtime override)
 * ------------------------------------------------------------------
 * Cho phép đổi DeepSeek API key lúc runtime (từ UI AiStatsPage) mà
 * KHÔNG cần sửa `.env` hay restart backend.
 *
 * Thứ tự ưu tiên key khi gọi DeepSeek:
 *   1. Override (lưu trong backend/.runtime/deepseek-key.json)  ← nếu có
 *   2. `DEEPSEEK_API_KEY` từ .env  (config.deepseek.apiKey)
 *
 * Override được persist ra file (gitignored) để sống sót qua restart;
 * đồng thời giữ cache in-memory để đọc nhanh + áp dụng ngay.
 *
 * Bảo mật: getStatus() CHỈ trả key dạng masked (sk-••••abcd), không bao
 * giờ trả key đầy đủ ra API.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import config from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// backend/src/ai/ → lên 2 cấp → backend/ → .runtime/deepseek-key.json
const OVERRIDE_FILE = path.resolve(__dirname, '../../.runtime/deepseek-key.json');

/** Cache in-memory của override, load 1 lần khi module import. */
let cache = null;

/** Đọc override từ file (nếu có). Best-effort, không throw. */
async function loadOverride() {
  try {
    const raw = await fs.readFile(OVERRIDE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.apiKey === 'string' && parsed.apiKey) {
      cache = { apiKey: parsed.apiKey, updatedAt: parsed.updatedAt ?? null };
    } else {
      cache = null;
    }
  } catch {
    cache = null;
  }
  return cache;
}

// Nạp override lần đầu khi module được import.
loadOverride();

/** Mask key: giữ 4 ký tự đầu + 4 ký tự cuối, giữa là ••••. */
const mask = (key) => {
  if (!key) return null;
  if (key.length <= 8) return '••••';
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
};

/**
 * Key đang hiệu lực (override nếu có, ngược lại từ .env).
 * Đọc tại mỗi lần gọi → đổi key có tác dụng ngay, không cần restart.
 */
export function getApiKey() {
  if (cache?.apiKey) return cache.apiKey;
  return config.deepseek.apiKey;
}

/**
 * Trạng thái key để hiển thị lên UI (không bao giờ trả key đầy đủ).
 * @returns {{source:'override'|'env'|'none', masked:string|null, updatedAt:string|null, hasOverride:boolean}}
 */
export function getStatus() {
  if (cache?.apiKey) {
    return { source: 'override', masked: mask(cache.apiKey), updatedAt: cache.updatedAt, hasOverride: true };
  }
  if (config.deepseek.apiKey) {
    return { source: 'env', masked: mask(config.deepseek.apiKey), updatedAt: null, hasOverride: false };
  }
  return { source: 'none', masked: null, updatedAt: null, hasOverride: false };
}

/**
 * Lưu override key (ghi cache + file).
 * @param {string} apiKey
 * @returns {Promise<{updatedAt:string}>}
 */
export async function setApiKey(apiKey) {
  const updatedAt = new Date().toISOString();
  cache = { apiKey, updatedAt };
  await fs.mkdir(path.dirname(OVERRIDE_FILE), { recursive: true });
  await fs.writeFile(OVERRIDE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  return { updatedAt };
}

/**
 * Xoá override (revert về key trong .env).
 * Best-effort xoá file; không throw nếu file không tồn tại.
 */
export async function clearApiKey() {
  cache = null;
  try {
    await fs.unlink(OVERRIDE_FILE);
  } catch {
    // file chưa từng được tạo — bỏ qua
  }
}

export default { getApiKey, getStatus, setApiKey, clearApiKey };

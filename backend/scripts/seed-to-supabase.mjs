/**
 * Seed jobs + employer accounts lên Supabase
 * ------------------------------------------------------------------
 * Đọc dataset thật từ scripts/crawl-topcv/data/jobs-raw.json (~9850 jobs),
 * tạo tài khoản employer tương ứng (dedupe theo company_name) rồi insert
 * employers + categories + jobs vào Supabase qua JS client.
 *
 * Mapping mirror scripts/crawl-topcv/transform.js (source-of-truth).
 * Script nằm trong backend/ để resolve bcryptjs / @supabase/supabase-js /
 * dotenv từ backend/node_modules. Chạy:
 *
 *   cd backend
 *   node scripts/seed-to-supabase.mjs            # insert (idempotent cho employer/category)
 *   node scripts/seed-to-supabase.mjs --reset     # xoá seed employer (cascade job) rồi insert lại
 *   node scripts/seed-to-supabase.mjs --dry-run   # chỉ in mapping, không ghi DB
 *
 * Employer accounts (DEV ONLY — password chung):
 *   email:    employer{N}@seed.jobhub.local   (N = 1..2979)
 *   password: seed12345
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// backend/.env — script chạy từ backend/, cwd = backend/
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// backend/scripts/ → lên 2 cấp → repo root → scripts/crawl-topcv/data/
const RAW_FILE = path.resolve(__dirname, '../../scripts/crawl-topcv/data/jobs-raw.json');
const SUMMARY_FILE = path.resolve(
  __dirname,
  '../../scripts/crawl-topcv/data/seed-supabase-summary.json',
);

const SEED_PASSWORD = 'seed12345';
const SEED_EMAIL_DOMAIN = '@seed.jobhub.local';
const BATCH = 200;
const SALT_ROUNDS = 10;

const args = new Set(process.argv.slice(2));
const RESET = args.has('--reset');
const DRY_RUN = args.has('--dry-run');

// ---------- parsers (mirror transform.js; raw đã có field `_` sẵn) ----------
const parseCity = (text) => {
  if (!text) return null;
  const c = text.replace(/\s*\(mới\)\s*/g, '').split('&')[0].split(',')[0].trim();
  return c || null;
};
const parsePostedDays = (text) => {
  if (!text) return null;
  const t = text.toLowerCase();
  let m = t.match(/(\d+)\s*ngày/);
  if (m) return parseInt(m[1], 10);
  m = t.match(/(\d+)\s*tuần/);
  if (m) return parseInt(m[1], 10) * 7;
  return null;
};
const isoDaysAgo = (days) =>
  days ? new Date(Date.now() - days * 86400000).toISOString() : new Date().toISOString();
const DEADLINE = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chunk = (arr, n) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};

async function main() {
  // ---- 1. env + client ----
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('❌ Thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong backend/.env');
    process.exit(1);
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // ---- 2. read raw ----
  const raw = JSON.parse(readFileSync(RAW_FILE, 'utf8'));
  console.log(`Loaded ${raw.length} raw jobs from ${RAW_FILE}`);

  // ---- 3. dedupe employers (giữ thứ tự xuất hiện để N ổn định) ----
  const employerMap = new Map(); // company_name -> row
  let n = 0;
  for (const j of raw) {
    if (!j.company_name) continue;
    if (!employerMap.has(j.company_name)) {
      n += 1;
      employerMap.set(j.company_name, {
        company_name: j.company_name,
        email: `employer${n}${SEED_EMAIL_DOMAIN}`,
        city: parseCity(j.location_text),
        is_verified: true,
        is_active: true,
      });
    }
  }
  const employerRows = [...employerMap.values()];

  // ---- 4. dedupe categories ----
  const categoryNames = [...new Set(raw.map((j) => j.category_name).filter(Boolean))];

  // ---- 5. build job templates ----
  const jobTemplates = raw
    .filter((j) => j.job_title && j.company_name)
    .map((j) => {
      let min = j._salary_min ?? null;
      let max = j._salary_max ?? null;
      if (min != null && max != null && Number(min) > Number(max)) [min, max] = [max, min];
      return {
        employer_company: j.company_name,
        category_name: j.category_name || null,
        job_title: j.job_title,
        job_description: j.job_detail ? JSON.stringify(j.job_detail) : null,
        salary_min: min,
        salary_max: max,
        is_salary_negotiable: j._is_negotiable ?? false,
        salary_currency: 'VND',
        salary_period: 'MONTH',
        city: parseCity(j.location_text),
        location: j.location_text || null,
        work_mode: j._work_mode || 'ONSITE',
        job_type: j._job_type || 'FULL_TIME',
        experience_level: j._experience_enum || null,
        positions_available: 1,
        application_deadline: DEADLINE,
        status: 'OPEN',
        is_approved: true,
        created_at: isoDaysAgo(parsePostedDays(j.posted_text)),
      };
    });

  console.log(
    `→ ${employerRows.length} unique employers, ${categoryNames.length} categories, ${jobTemplates.length} jobs`,
  );

  if (DRY_RUN) {
    console.log('\n[DRY-RUN] Không ghi DB. Mẫu employer:');
    console.log(JSON.stringify(employerRows[0], null, 2));
    console.log('\nMẫu job template:');
    const t = { ...jobTemplates[0] };
    if (t.job_description) t.job_description = t.job_description.slice(0, 120) + '…';
    console.log(JSON.stringify(t, null, 2));
    return;
  }

  // ---- 6. reset (xoá seed employer → job cascade qua FK ON DELETE CASCADE) ----
  if (RESET) {
    console.log('\n[--reset] Xoá seed employers (job cascade)…');
    let deleted = 0;
    let page = 0;
    while (true) {
      const from = page * 1000;
      const { data: ids, error } = await supabase
        .from('employer')
        .select('employer_id')
        .like('email', `%${SEED_EMAIL_DOMAIN}`)
        .range(from, from + 999);
      if (error) throw new Error('reset fetch employers: ' + error.message);
      if (!ids.length) break;
      for (const c of chunk(ids.map((r) => r.employer_id), 200)) {
        const { count, error: de } = await supabase
          .from('employer')
          .delete({ count: 'exact' })
          .in('employer_id', c);
        if (de) throw new Error('reset delete: ' + de.message);
        deleted += count ?? 0;
      }
      if (ids.length < 1000) break;
      page += 1;
    }
    console.log(`   đã xoá ${deleted} seed employers (job cascade theo).`);
  } else {
    // ---- safety: từ chối nếu đã có seed jobs (tránh duplicate) ----
    let seedJobs = 0;
    let page = 0;
    while (true) {
      const { data: ids, error } = await supabase
        .from('employer')
        .select('employer_id')
        .like('email', `%${SEED_EMAIL_DOMAIN}`)
        .range(page * 1000, page * 1000 + 999);
      if (error) throw new Error('safety fetch: ' + error.message);
      if (!ids.length) break;
      for (const c of chunk(ids.map((r) => r.employer_id), 200)) {
        const { count, error: ce } = await supabase
          .from('job')
          .select('*', { count: 'exact', head: true })
          .in('employer_id', c);
        if (ce) throw new Error('safety count: ' + ce.message);
        seedJobs += count ?? 0;
      }
      if (ids.length < 1000) break;
      page += 1;
    }
    if (seedJobs > 0) {
      console.error(
        `\n❌ Đã có ${seedJobs} seed jobs trong DB. Chạy lại với --reset để xoá sạch rồi insert:\n` +
          `   node scripts/seed-to-supabase.mjs --reset`,
      );
      process.exit(1);
    }
  }

  // ---- 7. hash password 1 lần ----
  console.log('\nHashing shared password…');
  const password_hash = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

  // ---- 8. upsert employers, build company_name -> employer_id ----
  console.log(`\nUpserting ${employerRows.length} employers (batch ${BATCH})…`);
  const companyToId = new Map();
  let done = 0;
  for (const c of chunk(employerRows, BATCH)) {
    const payload = c.map((e) => ({ ...e, password_hash }));
    const { data, error } = await supabase
      .from('employer')
      .upsert(payload, { onConflict: 'email' })
      .select('employer_id, company_name');
    if (error) throw new Error('employer upsert: ' + error.message);
    for (const r of data) companyToId.set(r.company_name, r.employer_id);
    done += c.length;
    console.log(`   employers ${done}/${employerRows.length}`);
  }

  // ---- 9. upsert categories, build name -> category_id ----
  console.log(`\nUpserting ${categoryNames.length} categories…`);
  const catToId = new Map();
  for (const c of chunk(categoryNames, BATCH)) {
    const payload = c.map((name) => ({ name }));
    const { data, error } = await supabase
      .from('category')
      .upsert(payload, { onConflict: 'name' })
      .select('category_id, name');
    if (error) throw new Error('category upsert: ' + error.message);
    for (const r of data) catToId.set(r.name, r.category_id);
  }

  // ---- 10. map + insert jobs ----
  console.log(`\nInserting ${jobTemplates.length} jobs (batch ${BATCH})…`);
  let inserted = 0;
  let failedBatches = 0;
  let batchIdx = 0;
  const batches = chunk(jobTemplates, BATCH);
  for (const c of batches) {
    const rows = c.map((t) => {
      const employer_id = companyToId.get(t.employer_company);
      if (!employer_id) throw new Error(`Không tìm employer cho "${t.employer_company}"`);
      const { employer_company, category_name, ...rest } = t;
      return {
        employer_id,
        category_id: category_name ? catToId.get(category_name) ?? null : null,
        ...rest,
      };
    });
    let ok = false;
    for (let attempt = 0; attempt < 2 && !ok; attempt++) {
      const { error } = await supabase.from('job').insert(rows);
      if (!error) {
        ok = true;
      } else if (attempt === 1) {
        console.warn(`   ⚠ batch ${batchIdx + 1} lỗi sau retry: ${error.message}`);
        failedBatches += 1;
      } else {
        await sleep(1500);
      }
    }
    inserted += ok ? rows.length : 0;
    batchIdx += 1;
    if (batchIdx % 5 === 0 || batchIdx === batches.length) {
      console.log(`   jobs ${inserted}/${jobTemplates.length} (batch ${batchIdx}/${batches.length})`);
    }
  }

  // ---- 11. summary ----
  const summary = {
    ran_at: new Date().toISOString(),
    reset: RESET,
    raw_jobs: raw.length,
    employers: employerRows.length,
    categories: categoryNames.length,
    jobs_inserted: inserted,
    failed_batches: failedBatches,
    sample_credentials: [
      { email: 'employer1' + SEED_EMAIL_DOMAIN, password: SEED_PASSWORD },
      { email: 'employer2' + SEED_EMAIL_DOMAIN, password: SEED_PASSWORD },
    ],
  };
  writeFileSync(SUMMARY_FILE, JSON.stringify(summary, null, 2));

  console.log('\n✓ DONE');
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nSummary file: ${SUMMARY_FILE}`);
  console.log(`Đăng nhập employer mẫu: ${summary.sample_credentials[0].email} / ${SEED_PASSWORD}`);
  if (failedBatches > 0) {
    console.warn(
      `\n⚠ ${failedBatches} batch lỗi — chạy lại script (không --reset) nếu thiếu; hoặc --reset để làm lại.`,
    );
  }
}

main().catch((e) => {
  console.error('\n💥 Seed thất bại:', e.message);
  process.exit(1);
});

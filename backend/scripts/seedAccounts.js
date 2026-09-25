/**
 * Seed 3 tài khoản mẫu: admin, employer, job_seeker.
 *
 * Usage:  cd backend && node scripts/seedAccounts.js
 *
 * Idempotent — bỏ qua email đã tồn tại.
 * Passwords được hash bằng bcryptjs (SALT_ROUNDS=10) giống AuthService.
 */
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SALT_ROUNDS = 10;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong .env');
  process.exit(1);
}

const ACCOUNTS = [
  {
    table: 'admin',
    payload: { full_name: 'System Admin', email: 'admin@jobhub.local' },
    password: 'Admin@123456',
    label: 'Admin',
  },
  {
    table: 'employer',
    payload: {
      company_name: 'JobHub Demo Company',
      email: 'employer@jobhub.local',
      city: 'Hồ Chí Minh',
      contact_name: 'HR Department',
      phone: '0900000000',
      is_verified: true,
    },
    password: 'Employer@123456',
    label: 'Employer',
  },
  {
    table: 'job_seeker',
    payload: {
      full_name: 'Ứng Viên Demo',
      email: 'jobseeker@jobhub.local',
      headline: 'Backend Developer',
      city: 'Hà Nội',
      is_open_to_work: true,
    },
    password: 'Seeker@123456',
    label: 'Job Seeker',
  },
];

async function supabaseRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function main() {
  console.log('🌱 Seeding accounts...\n');

  for (const acc of ACCOUNTS) {
    // Kiểm tra email đã tồn tại chưa
    const { body: existing } = await supabaseRequest(
      `${acc.table}?email=eq.${encodeURIComponent(acc.payload.email)}&select=1`,
    );

    if (Array.isArray(existing) && existing.length > 0) {
      console.log(`⏭️  ${acc.label}: ${acc.payload.email} đã tồn tại — bỏ qua`);
      continue;
    }

    const password_hash = await bcrypt.hash(acc.password, SALT_ROUNDS);

    const { status, body } = await supabaseRequest(acc.table, {
      method: 'POST',
      body: JSON.stringify({ ...acc.payload, password_hash }),
    });

    if (status >= 400) {
      console.error(`❌ ${acc.label}:`, body?.message || body);
      continue;
    }

    console.log(`✅ ${acc.label}: ${acc.payload.email} / ${acc.password}`);
  }

  console.log('\n🎉 Done. Đăng nhập tại http://localhost:5173/dang-nhap');
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});

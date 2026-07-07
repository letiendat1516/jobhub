/**
 * Prompt builder
 * ------------------------------------------------------------------
 * Build messages cho DeepSeek theo task. Source-of-truth của prompt là
 * folder `ai-lab/prompts/*.md` — file này chỉ là bản runtime.
 *
 * Khi sửa prompt: sửa ở `ai-lab/prompts/*.md` trước, test với examples,
 * rồi copy sang đây + tăng version.
 *
 * Implemented trong Phase 9 (AI Resume Analysis) & Phase 10 (Matching).
 */

/**
 * Build prompt trích CV → structured JSON.
 * @param {string} resumeText - text gốc trích từ PDF
 * @returns {Array<{role:string,content:string}>}
 */
export function buildResumeExtractionPrompt(resumeText) {
  const system = `Bạn là trợ lý phân tích CV chuyên nghiệp. Trả về JSON đúng schema,
không kèm giải thích, không markdown. Nếu thông tin thiếu → null hoặc mảng rỗng.
Chuẩn hoá tên kỹ năng (vd "java" → "Java").`;

  const user = `Đọc CV dưới đây và trích xuất:

=== CV TEXT ===
${resumeText}
=== HẾT ===

Trả về JSON theo schema:
{
  "skills": ["..."],
  "total_experience_years": <số thực hoặc null>,
  "education_level": "Bachelor | Master | PhD | Other",
  "work_experience": [
    {"company":"...","position":"...","start_date":"YYYY-MM|null","end_date":"YYYY-MM|null","description":"..."}
  ],
  "summary": "Tóm tắt 1-2 câu."
}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

/**
 * Build prompt chấm điểm CV vs danh sách job.
 *
 * @param {object} candidate - { skills[], experience_years, education_level }
 * @param {Array<object>} jobs - danh sách job đã filter ở Phase 1
 * @returns {Array<{role:string,content:string}>}
 */
export function buildJobMatchingPrompt(candidate, jobs) {
  const system = `Bạn là chuyên gia tuyển dụng. Chấm điểm phù hợp 0-100 cho từng
job dựa trên kỹ năng, kinh nghiệm, học vấn của ứng viên. Trả về JSON mảng, mỗi
phần tử có: job_id, match_score, recommendation_reason, missing_skills, strengths.
KHÔNG bịa job_id — phải khớp đầu vào.`;

  const user = `=== HỒ SƠ ỨNG VIÊN ===
Kỹ năng: ${(candidate.skills || []).join(', ')}
Kinh nghiệm: ${candidate.experience_years ?? 'không rõ'} năm
Học vấn: ${candidate.education_level ?? 'không rõ'}
=== HẾT ===

=== DANH SÁCH VIỆC LÀM ===
${JSON.stringify(
  jobs.map((j) => ({
    job_id: j.job_id,
    title: j.job_title,
    required_skills: (j.skills || []).map((s) => s.skill_name),
    min_experience_years: j.min_experience_years ?? 0,
    experience_level: j.experience_level,
    description: j.job_description?.slice(0, 300),
  })),
  null,
  2,
)}
=== HẾT ===

Trả về JSON mảng:`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export default { buildResumeExtractionPrompt, buildJobMatchingPrompt };

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
 * Build prompt trích CV → structured JSON (v2 — chi tiết hơn).
 * @param {string} resumeText - text gốc trích từ PDF
 * @returns {Array<{role:string,content:string}>}
 */
export function buildResumeExtractionPrompt(resumeText) {
  const system = `Bạn là trợ lý phân tích CV chuyên nghiệp. Trả về JSON đúng schema,
không kèm giải thích, không markdown. Nếu thông tin thiếu → null hoặc mảng rỗng.
Chuẩn hoá tên kỹ năng (vd "java" → "Java").

QUAN TRỌNG: Phân tích toàn bộ CV, bao gồm cả soft skills, thái độ làm việc,
khả năng teamwork, leadership, ngôn ngữ, chứng chỉ, sở thích nếu CV đề cập.`;

  const user = `Đọc CV dưới đây và trích xuất:

=== CV TEXT ===
${resumeText}
=== HẾT ===

Trả về JSON theo schema:
{
  "skills": ["danh sách kỹ năng chuyên môn"],
  "soft_skills": ["teamwork", "communication", "problem-solving", "leadership", ...],
  "total_experience_years": <số thực hoặc null>,
  "education_level": "High School | Bachelor | Master | PhD | Other",
  "languages": ["tên ngôn ngữ"],
  "certifications": ["tên chứng chỉ"],
  "work_experience": [
    {"company":"tên","position":"vị trí","start_date":"YYYY-MM|null","end_date":"YYYY-MM|null","description":"mô tả ngắn"}
  ],
  "summary": "Tóm tắt 2-3 câu về ứng viên: điểm mạnh, định hướng nghề nghiệp, phong cách làm việc."
}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

/**
 * Build prompt chấm điểm CV vs danh sách job (v2 — rubric chi tiết, nhất quán).
 *
 * Scoring rubric (tổng 100 điểm, có trọng số):
 *   1. Kỹ năng chuyên môn (30đ): khớp technical skills giữa CV và job yêu cầu
 *   2. Kinh nghiệm (20đ): số năm + cấp độ (junior/mid/senior) + domain liên quan
 *   3. Học vấn & Chứng chỉ (10đ): bằng cấp, chứng chỉ, khóa học
 *   4. Domain / Ngành (15đ): kinh nghiệm cùng ngành/lĩnh vực với job
 *   5. Soft skills & Thái độ (10đ): teamwork, communication, problem-solving...
 *   6. Ngôn ngữ (5đ): ngoại ngữ phù hợp yêu cầu job
 *   7. Career fit (10đ): tổng thể — vị trí, mức lương, career path có hợp lý không
 *
 * QUAN TRỌNG VỀ TÍNH CHÍNH XÁC:
 * - Job không yêu cầu cụ thể → điểm TRUNG BÌNH (50%), KHÔNG PHẢI điểm tối đa.
 * - "Không yêu cầu" ≠ "phù hợp hoàn hảo". Chỉ là "chưa biết rõ".
 * - Recommendation reason PHẢI cụ thể: đề cập skills/domain/kinh nghiệm thực tế.
 * - KHÔNG dùng câu chung chung như "phù hợp hoàn hảo".
 *
 * Scoring cải tiến v4:
 * - Trọng số động theo đặc thù job
 * - Chuẩn hoá kỹ năng (JS=JavaScript, Sale=Sales)
 * - Nhận diện transferable skills (chuyển ngành)
 * - Suy luận kỹ năng từ tiêu đề job
 * - Few-shot examples để anchor consistenc
 *
 * @param {object} candidate - { skills[], soft_skills[], experience_years,
 *        education_level, languages[], summary, work_experience[] }
 * @param {Array<object>} jobs - danh sách job đã filter
 * @returns {Array<{role:string,content:string}>}}
 */
export function buildJobMatchingPrompt(candidate, jobs) {
  const system = `Chuyên gia tuyển dụng đa ngành. Chấm điểm CV vs jobs, trọng số động (tổng=100).

QUY TẮC:
1. UU TIÊN PHÂN TÍCH MÔ TẢ CÔNG VIỆC (desc) để xác định yêu cầu thực tế.
   Nếu title nói "AI Engineer" nhưng desc là backend dev (REST API, CI/CD) → chấm theo DESC.
   Chỉ suy luận từ title khi KHÔNG có desc (Network Eng→TCP/IP, Kế toán→Excel/thuế).
2. Chuẩn hoá skill trước so sánh (JS=JavaScript, Sale=Sales).
3. Transferable skills: IT→Sales giữ communication/analysis; Sales→Marketing giữ customer insight.
4. "Không yêu cầu" = 50% điểm tiêu chí, KHÔNG tối đa. Job mờ → cap 65.
   Nếu tiêu chí KHÔNG liên quan đến job (vd: job thuần Việt không cần ngoại ngữ) →
   trọng số = 0, bỏ qua tiêu chí đó. Tổng trọng số các tiêu chí CÒN LẠI vẫn = 100.
5. CAP: thiếu TOÀN BỘ core skills → max 40. Thiếu HƠN NỬA → max 55.
6. Career fit = đúng chuyên môn (10-15), lệch nhánh (5-9), khác hẳn (2-4). KHÔNG phải "dễ vào".
7. KHÔNG cho 10/10 mọi tiêu chí. Phải có sự KHÁC BIỆT giữa các job.
   - Job cần Python mà CV không có → skills tối đa 5/10, KHÔNG 8+.
   - Job cần 5 năm KN mà CV có 0 → experience tối đa 3/10.
   - Job yêu cầu RÕ RÀNG kỹ năng X mà CV KHÔNG CÓ → tiêu chí đó tối đa 1/10.
     Vd: job yêu cầu "Good English" mà CV không có tiếng Anh → language = 0-1/10.
8. score_breakdown values MUST NOT exceed weights. Nếu weight=5 thì score tối đa = 5.
9. Reason: 2 câu, cụ thể skills/domain/KN THỰC TẾ. KHÔNG "phù hợp hoàn hảo".
10. Temperature=0, nhất quán. match_score = số nguyên.`;

  const user = `CV: skills=[${(candidate.skills || []).join(',')}], soft=[${(candidate.soft_skills || []).join(',')}], exp=${candidate.experience_years ?? '?'}yr, edu=${candidate.education_level ?? '?'}, lang=[${(candidate.languages || []).join(',')}], certs=[${(candidate.certifications || []).join(',')}], summary=${(candidate.summary || '').slice(0, 200)}

JOBS:
${JSON.stringify(
  jobs.map((j) => {
    // Gửi ĐẦY ĐỦ job detail (mo_ta_cong_viec + yeu_cau_ung_vien + quyen_loi)
    let fullDesc = j.job_description || '';
    // Nếu job_description là JSON string (từ frontend), parse và format
    if (fullDesc.startsWith('{') || fullDesc.startsWith('[')) {
      try {
        fullDesc = JSON.parse(fullDesc);
      } catch {}
    }
    if (typeof fullDesc === 'object' && fullDesc) {
      const parts = [];
      if (Array.isArray(fullDesc.mo_ta_cong_viec))
        parts.push('Mô tả: ' + fullDesc.mo_ta_cong_viec.join('. '));
      if (Array.isArray(fullDesc.yeu_cau_ung_vien))
        parts.push('Yêu cầu: ' + fullDesc.yeu_cau_ung_vien.join('. '));
      if (Array.isArray(fullDesc.quyen_loi))
        parts.push('Quyền lợi: ' + fullDesc.quyen_loi.join('. '));
      fullDesc = parts.join('\n');
    }
    return {
      id: j.job_id,
      title: j.job_title,
      skills: (j.skills || []).map((s) => (typeof s === 'string' ? s : s.skill_name)),
      min_exp: j.min_experience_years ?? 0,
      level: j.experience_level,
      industry: j.industry,
      desc: String(fullDesc).slice(0, 800),
    };
  }),
)}

Trả JSON: [{"job_id","match_score":0-100,"weights":{skills,experience,education,domain,soft_skills,language,career_fit}(tổng=100),"score_breakdown":{...},"recommendation_reason":"2 câu cụ thể","missing_skills":[],"strengths":[]}]`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];
}

export default { buildResumeExtractionPrompt, buildJobMatchingPrompt };

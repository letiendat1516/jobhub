# Prompt: Job Matching (CV vs Jobs)

**Version**: v1
**Task**: Chấm điểm phù hợp giữa 1 hồ sơ ứng viên và 1 danh sách tin tuyển dụng
**Model**: deepseek-chat

## Mục tiêu

Nhận vào:
- Hồ sơ ứng viên (đã extract từ CV ở task trước): kỹ năng, kinh nghiệm, học vấn
- Danh sách N tin tuyển dụng đã qua rule-based filter (Phase 1)

Trả về:
- `match_score`: 0–100 cho mỗi job
- `recommendation_reason`: lý do phù hợp (kỹ năng khớp, kinh nghiệm đủ, ...)
- `missing_skills`: kỹ năng thiếu
- `strengths`: điểm mạnh của ứng viên so với job

## Prompt template

```
Bạn là chuyên gia tuyển dụng. Dưới đây là hồ sơ ứng viên và danh sách việc làm.
Hãy chấm điểm phù hợp (0-100) cho từng việc làm, kèm lý do ngắn gọn.

Quy tắc chấm điểm:
- 90-100: khớp gần như hoàn toàn (kỹ năng + kinh nghiệm + học vấn đều đủ)
- 70-89:  khớp tốt, thiếu 1-2 kỹ năng phụ
- 50-69:  khớp trung bình, thiếu nhiều kỹ năng hoặc thiếu kinh nghiệm
- 0-49:   không phù hợp

=== HỒ SƠ ỨNG VIÊN ===
Kỹ năng: {{candidate_skills}}
Kinh nghiệm: {{candidate_experience_years}} năm
Học vấn: {{candidate_education}}
=== HẾT HỒ SƠ ===

=== DANH SÁCH VIỆC LÀM ===
{{jobs_list_json}}
=== HẾT DANH SÁCH ===

Trả về JSON mảng, mỗi phần tử ứng 1 job theo thứ tự đầu vào:

[
  {
    "job_id": <id>,
    "match_score": <0-100>,
    "recommendation_reason": "1-2 câu",
    "missing_skills": ["kỹ năng thiếu"],
    "strengths": ["điểm mạnh so với job"]
  }
]
```

## Lưu ý

- KHÔNG bịa job_id — phải khớp đúng với đầu vào
- `missing_skills`: kỹ năng job yêu cầu mà ứng viên KHÔNG có
- `strengths`: kỹ năng/khinh nghiệm ứng viên CÓ VƯỢT TRỘI so với yêu cầu
- Giữ response gọn để tiết kiệm token

## Version history

- **v1** (2026-07-06): bản đầu

import ResumeService from '../services/ResumeService.js';
import ApiResponse from '../utils/ApiResponse.js';

class ResumeController {
  static async uploadResume(req, res) {
    return ApiResponse.created(
      res,
      await ResumeService.uploadResume(req.user.sub, req.file, req.body),
    );
  }
  static async getMyResume(req, res) {
    return ApiResponse.ok(res, await ResumeService.getResumes(req.user.sub));
  }
  static async updateResume(req, res) {
    return ApiResponse.ok(
      res,
      await ResumeService.updateResume(req.user.sub, req.params.id, req.body),
    );
  }
  static async deleteResume(req, res) {
    return ApiResponse.ok(res, await ResumeService.deleteResume(req.user.sub, req.params.id));
  }
  static async downloadResume(req, res) {
    const resume = await ResumeService.getResume(req.user.sub, req.params.id);
    return res.download(resume.file_path, resume.file_name);
  }
}

export default ResumeController;

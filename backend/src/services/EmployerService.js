/**
 * EmployerService
 * ------------------------------------------------------------------
 * Business logic for employer/company accounts: registration,
 * company profile management, and visibility of owned job postings.
 *
 * Delegates persistence to EmployerRepository. Implemented in
 * Phase 5 (Employer).
 */
import ApiError from '../utils/ApiError.js';
import EmployerRepository from '../repositories/EmployerRepository.js';
import JobRepository from '../repositories/JobRepository.js';

const mapProfilePayload = (payload) => {
  const mapped = {
    company_name: payload.companyName,
    phone: payload.phone,
    website: payload.website,
    company_description: payload.companyDescription,
    city: payload.city,
    contact_name: payload.contactName,
    gender: payload.gender,
  };

  Object.keys(mapped).forEach((key) => {
    if (mapped[key] === undefined) {
      delete mapped[key];
    }
  });

  return mapped;
};

class EmployerService {
  static async setAccountActive(employerId, isActive) {
    const existing = await EmployerRepository.findEmployerById(employerId);
    if (!existing) throw ApiError.notFound('Không tìm thấy tài khoản nhà tuyển dụng.');
    return EmployerRepository.updateAccountStatus(employerId, isActive);
  }

  static async setVerification(employerId, isVerified) {
    const existing = await EmployerRepository.findEmployerById(employerId);
    if (!existing) throw ApiError.notFound('Không tìm thấy nhà tuyển dụng.');
    return EmployerRepository.updateVerification(employerId, isVerified);
  }

  static async getProfile(employerId) {
    const employer = await EmployerRepository.findEmployerById(employerId);

    if (!employer) {
      throw ApiError.notFound('Không tìm thấy hồ sơ công ty.');
    }

    return employer;
  }

  static async updateProfile(employerId, payload) {
    const existing = await EmployerRepository.findEmployerById(employerId);

    if (!existing) {
      throw ApiError.notFound('Không tìm thấy hồ sơ công ty.');
    }

    const updatePayload = mapProfilePayload(payload);

    if (Object.keys(updatePayload).length === 0) {
      return existing;
    }

    return EmployerRepository.updateEmployer(employerId, updatePayload);
  }

  static async getPublicProfile(employerId) {
    const employer = await EmployerRepository.findEmployerById(employerId);

    if (!employer) {
      throw ApiError.notFound('Không tìm thấy công ty.');
    }

    return employer;
  }

  static async listEmployers(query = {}) {
    return EmployerRepository.listEmployers({
      keyword: query.keyword,
      city: query.city,
      page: query.page || 1,
      limit: query.limit || 20,
    });
  }

  static async getEmployerJobs(employerId) {
    const employer = await EmployerRepository.findEmployerById(employerId);

    if (!employer) {
      throw ApiError.notFound('Không tìm thấy công ty.');
    }

    return JobRepository.searchJobs({
      employerId,
      includeUnapproved: false,
      limit: 100,
    });
  }
}

export default EmployerService;

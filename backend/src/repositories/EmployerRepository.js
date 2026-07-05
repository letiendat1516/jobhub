/**
 * EmployerRepository
 * ------------------------------------------------------------------
 * Data access for employer/company accounts and public company data.
 * Only this layer issues SQL for these tables. Implemented in
 * Phase 5 (Employer).
 */
import ApiError from '../utils/ApiError.js';

class EmployerRepository {
  static async createEmployer(_payload) {
    throw ApiError.notImplemented('EmployerRepository.createEmployer');
  }

  static async findEmployerById(_id) {
    throw ApiError.notImplemented('EmployerRepository.findEmployerById');
  }

  static async updateEmployer(_id, _payload) {
    throw ApiError.notImplemented('EmployerRepository.updateEmployer');
  }

  static async listEmployers(_query) {
    throw ApiError.notImplemented('EmployerRepository.listEmployers');
  }
}

export default EmployerRepository;

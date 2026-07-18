import AdminRepository from '../repositories/AdminRepository.js';
import EmployerService from './EmployerService.js';
import JobSeekerService from './JobSeekerService.js';

const activeFromAction = (action) => action === 'activate';
const verifiedFromAction = (action) => action === 'verify';

class AdminService {
  static listJobSeekers(query) {
    return AdminRepository.listJobSeekers(query);
  }

  static listUserEmployers(query) {
    return AdminRepository.listEmployers({ ...query, verification: 'all' });
  }

  static listEmployers(query) {
    return AdminRepository.listEmployers(query);
  }

  static updateJobSeekerStatus(jobSeekerId, action) {
    return JobSeekerService.setAccountActive(jobSeekerId, activeFromAction(action));
  }

  static updateEmployerStatus(employerId, action) {
    return EmployerService.setAccountActive(employerId, activeFromAction(action));
  }

  static updateEmployerVerification(employerId, action) {
    return EmployerService.setVerification(employerId, verifiedFromAction(action));
  }
}

export default AdminService;

import { Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout.jsx';
import HashScroll from './HashScroll.jsx';
import RoleGuard from './RoleGuard.jsx';

import HomePage from '../pages/HomePage.jsx';
import JobsPage from '../pages/JobsPage.jsx';
import JobDetailPage from '../pages/JobDetailPage.jsx';
import AiLogsPage from '../pages/AiLogsPage.jsx';
import AiStatsPage from '../pages/AiStatsPage.jsx';
import RecommendedPage, { SessionDetailPage } from '../pages/RecommendedPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import RegisterEmployerPage from '../pages/RegisterEmployerPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

import EmployerJobsPage from '../pages/EmployerJobsPage.jsx';
import CreateJobPage from '../pages/CreateJobPage.jsx';
import EmployerCompanyProfilePage from '../pages/EmployerCompanyProfilePage.jsx';
import AdminPendingJobsPage from '../pages/AdminPendingJobsPage.jsx';
import CatalogManagementPage from '../pages/CatalogManagementPage.jsx';
import MyApplicationsPage, { MyApplicationDetailPage } from '../pages/MyApplicationsPage.jsx';
import EmployerApplicationsPage, {
  EmployerApplicationReviewPage,
} from '../pages/EmployerApplicationsPage.jsx';
import ResumePage from '../pages/ResumePage.jsx';
import CompanyDetailPage from '../pages/CompanyDetailPage.jsx';
import AdminSystemConfigurationPage from '../pages/AdminSystemConfigurationPage.jsx';
import AdminUsersPage from '../pages/AdminUsersPage.jsx';
import AdminEmployersPage from '../pages/AdminEmployersPage.jsx';
/**
 * AppRoutes — application route table.
 *
 * Auth pages dùng layout riêng, không qua PublicLayout.
 * Các trang còn lại dùng PublicLayout để có Navbar + Footer.
 */
export default function AppRoutes() {
  return (
    <>
      <HashScroll />

      <Routes>
        {/* Auth pages */}
        <Route path="/dang-nhap" element={<LoginPage />} />
        <Route path="/dang-ky" element={<RegisterPage />} />
        <Route path="/dang-ky-nha-tuyen-dung" element={<RegisterEmployerPage />} />

        {/* Public pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/viec-lam" element={<JobsPage />} />
          <Route path="/viec-lam/:id" element={<JobDetailPage />} />
          <Route path="/cong-ty/:id" element={<CompanyDetailPage />} />
          <Route path="/ai-logs" element={<AiLogsPage />} />
          <Route
            path="/admin/ai-stats"
            element={
              <RoleGuard roles={['admin']}>
                <AiStatsPage />
              </RoleGuard>
            }
          />
          <Route path="/de-xuat" element={<RecommendedPage />} />
          <Route path="/de-xuat/:sessionId" element={<SessionDetailPage />} />
          <Route
            path="/ho-so"
            element={
              <RoleGuard roles={['job_seeker']}>
                <ResumePage />
              </RoleGuard>
            }
          />

          <Route
            path="/applications"
            element={
              <RoleGuard roles={['job_seeker']}>
                <MyApplicationsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/applications/:applicationId"
            element={
              <RoleGuard roles={['job_seeker']}>
                <MyApplicationDetailPage />
              </RoleGuard>
            }
          />

          {/* Employer pages */}
          <Route
            path="/employer/company-profile"
            element={
              <RoleGuard roles={['employer']}>
                <EmployerCompanyProfilePage />
              </RoleGuard>
            }
          />

          <Route
            path="/employer/jobs"
            element={
              <RoleGuard roles={['employer']}>
                <EmployerJobsPage />
              </RoleGuard>
            }
          />

          <Route
            path="/employer/jobs/create"
            element={
              <RoleGuard roles={['employer']}>
                <CreateJobPage />
              </RoleGuard>
            }
          />
          <Route
            path="/employer/applications"
            element={
              <RoleGuard roles={['employer', 'admin']}>
                <EmployerApplicationsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/employer/applications/:applicationId"
            element={
              <RoleGuard roles={['employer', 'admin']}>
                <EmployerApplicationReviewPage />
              </RoleGuard>
            }
          />

          {/* Admin pages */}
          <Route
            path="/admin/users"
            element={
              <RoleGuard roles={['admin']}>
                <AdminUsersPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/employers"
            element={
              <RoleGuard roles={['admin']}>
                <AdminEmployersPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/pending-jobs"
            element={
              <RoleGuard roles={['admin']}>
                <AdminPendingJobsPage />
              </RoleGuard>
            }
          />

          <Route
            path="/admin/catalog"
            element={
              <RoleGuard roles={['admin']}>
                <CatalogManagementPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/system-configurations"
            element={
              <RoleGuard roles={['admin']}>
                <AdminSystemConfigurationPage />
              </RoleGuard>
            }
            />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

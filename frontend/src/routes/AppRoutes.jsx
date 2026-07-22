import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout.jsx';
import HashScroll from './HashScroll.jsx';
import RoleGuard from './RoleGuard.jsx';
import { RouteErrorBoundary as ErrorBoundary } from '../components/ErrorBoundary.jsx';

/* ---------- Lazy-loaded pages (code-split per route) ---------- */
const HomePage           = lazy(() => import('../pages/HomePage.jsx'));
const JobsPage           = lazy(() => import('../pages/JobsPage.jsx'));
const JobDetailPage      = lazy(() => import('../pages/JobDetailPage.jsx'));
const AiLogsPage         = lazy(() => import('../pages/AiLogsPage.jsx'));
const AiStatsPage        = lazy(() => import('../pages/AiStatsPage.jsx'));
const MyApplicationsPage = lazy(() => import('../pages/MyApplicationsPage.jsx'));
const MyApplicationDetailPage = lazy(() =>
  import('../pages/MyApplicationsPage.jsx').then((m) => ({ default: m.MyApplicationDetailPage })),
);
const EmployerApplicationsPage = lazy(() => import('../pages/EmployerApplicationsPage.jsx'));
const EmployerApplicationReviewPage = lazy(() =>
  import('../pages/EmployerApplicationsPage.jsx').then((m) => ({ default: m.EmployerApplicationReviewPage })),
);
const RecommendedPage    = lazy(() => import('../pages/RecommendedPage.jsx'));
const SessionDetailPage  = lazy(() =>
  import('../pages/RecommendedPage.jsx').then((m) => ({ default: m.SessionDetailPage })),
);
const LoginPage          = lazy(() => import('../pages/LoginPage.jsx'));
const RegisterPage       = lazy(() => import('../pages/RegisterPage.jsx'));
const RegisterEmployerPage = lazy(() => import('../pages/RegisterEmployerPage.jsx'));
const NotFoundPage       = lazy(() => import('../pages/NotFoundPage.jsx'));
const EmployerJobsPage   = lazy(() => import('../pages/EmployerJobsPage.jsx'));
const CreateJobPage      = lazy(() => import('../pages/CreateJobPage.jsx'));
const EmployerCompanyProfilePage = lazy(() => import('../pages/EmployerCompanyProfilePage.jsx'));
const AdminPendingJobsPage = lazy(() => import('../pages/AdminPendingJobsPage.jsx'));
const CatalogManagementPage = lazy(() => import('../pages/CatalogManagementPage.jsx'));
const ResumePage         = lazy(() => import('../pages/ResumePage.jsx'));
const CompanyDetailPage  = lazy(() => import('../pages/CompanyDetailPage.jsx'));
const AdminSystemConfigurationPage = lazy(() => import('../pages/AdminSystemConfigurationPage.jsx'));
const AdminUsersPage     = lazy(() => import('../pages/AdminUsersPage.jsx'));
const AdminEmployersPage = lazy(() => import('../pages/AdminEmployersPage.jsx'));

/** Full-screen route loading skeleton */
function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
    </div>
  );
}

/**
 * AppRoutes — application route table.
 *
 * Every page is lazy-loaded so only the current route's JS is downloaded,
 * significantly reducing the initial bundle size.
 * ErrorBoundary per-route means a broken page never crashes the whole app.
 */
export default function AppRoutes() {
  return (
    <>
      <HashScroll />

      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Auth pages */}
          <Route path="/dang-nhap" element={
            <ErrorBoundary><LoginPage /></ErrorBoundary>
          } />
          <Route path="/dang-ky" element={
            <ErrorBoundary><RegisterPage /></ErrorBoundary>
          } />
          <Route path="/dang-ky-nha-tuyen-dung" element={
            <ErrorBoundary><RegisterEmployerPage /></ErrorBoundary>
          } />

          {/* Public pages */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<ErrorBoundary><HomePage /></ErrorBoundary>} />
            <Route path="/viec-lam" element={<ErrorBoundary><JobsPage /></ErrorBoundary>} />
            <Route path="/viec-lam/:id" element={<ErrorBoundary><JobDetailPage /></ErrorBoundary>} />
            <Route path="/cong-ty/:id" element={<ErrorBoundary><CompanyDetailPage /></ErrorBoundary>} />
            <Route path="/ai-logs" element={
              <RoleGuard roles={['admin']}>
                <ErrorBoundary><AiLogsPage /></ErrorBoundary>
              </RoleGuard>
            } />
            <Route path="/admin/ai-stats" element={
              <RoleGuard roles={['admin']}>
                <ErrorBoundary><AiStatsPage /></ErrorBoundary>
              </RoleGuard>
            } />
            <Route path="/de-xuat" element={<ErrorBoundary><RecommendedPage /></ErrorBoundary>} />
            <Route path="/de-xuat/:sessionId" element={
              <ErrorBoundary><SessionDetailPage /></ErrorBoundary>
            } />

            <Route path="/ho-so" element={
              <RoleGuard roles={['job_seeker']}>
                <ErrorBoundary><ResumePage /></ErrorBoundary>
              </RoleGuard>
            } />
            <Route path="/applications" element={
              <RoleGuard roles={['job_seeker']}>
                <ErrorBoundary><MyApplicationsPage /></ErrorBoundary>
              </RoleGuard>
            } />
            <Route path="/applications/:applicationId" element={
              <RoleGuard roles={['job_seeker']}>
                <ErrorBoundary><MyApplicationDetailPage /></ErrorBoundary>
              </RoleGuard>
            } />

            {/* Employer pages */}
            <Route path="/employer/company-profile" element={
              <RoleGuard roles={['employer']}>
                <ErrorBoundary><EmployerCompanyProfilePage /></ErrorBoundary>
              </RoleGuard>
            } />
            <Route path="/employer/jobs" element={
              <RoleGuard roles={['employer']}>
                <ErrorBoundary><EmployerJobsPage /></ErrorBoundary>
              </RoleGuard>
            } />
            <Route path="/employer/jobs/create" element={
              <RoleGuard roles={['employer']}>
                <ErrorBoundary><CreateJobPage /></ErrorBoundary>
              </RoleGuard>
            } />
            <Route path="/employer/applications" element={
              <RoleGuard roles={['employer', 'admin']}>
                <ErrorBoundary><EmployerApplicationsPage /></ErrorBoundary>
              </RoleGuard>
            } />
            <Route path="/employer/applications/:applicationId" element={
              <RoleGuard roles={['employer', 'admin']}>
                <ErrorBoundary><EmployerApplicationReviewPage /></ErrorBoundary>
              </RoleGuard>
            } />

            {/* Admin pages */}
            <Route path="/admin/users" element={
              <RoleGuard roles={['admin']}>
                <ErrorBoundary><AdminUsersPage /></ErrorBoundary>
              </RoleGuard>
            } />
            <Route path="/admin/employers" element={
              <RoleGuard roles={['admin']}>
                <ErrorBoundary><AdminEmployersPage /></ErrorBoundary>
              </RoleGuard>
            } />
            <Route path="/admin/pending-jobs" element={
              <RoleGuard roles={['admin']}>
                <ErrorBoundary><AdminPendingJobsPage /></ErrorBoundary>
              </RoleGuard>
            } />
            <Route path="/admin/catalog" element={
              <RoleGuard roles={['admin']}>
                <ErrorBoundary><CatalogManagementPage /></ErrorBoundary>
              </RoleGuard>
            } />
            <Route path="/admin/system-configurations" element={
              <RoleGuard roles={['admin']}>
                <ErrorBoundary><AdminSystemConfigurationPage /></ErrorBoundary>
              </RoleGuard>
            } />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

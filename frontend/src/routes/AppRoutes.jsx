import { Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout.jsx';
import HashScroll from './HashScroll.jsx';
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

/**
 * AppRoutes — application route table.
 *
 * Auth pages (login/register) dùng AuthShell riêng (không navbar/footer),
 * nằm NGOÀI PublicLayout. Các trang public còn lại dùng PublicLayout
 * (Navbar + Footer chung).
 */
export default function AppRoutes() {
  return (
    <>
      <HashScroll />
      <Routes>
        {/* Auth — không qua PublicLayout */}
        <Route path="/dang-nhap" element={<LoginPage />} />
        <Route path="/dang-ky" element={<RegisterPage />} />
        <Route path="/dang-ky-nha-tuyen-dung" element={<RegisterEmployerPage />} />

        {/* Public pages — có Navbar + Footer chung */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/viec-lam" element={<JobsPage />} />
          <Route path="/viec-lam/:id" element={<JobDetailPage />} />
          <Route path="/ai-logs" element={<AiLogsPage />} />
          <Route path="/admin/ai-stats" element={<AiStatsPage />} />
          <Route path="/de-xuat" element={<RecommendedPage />} />
          <Route path="/de-xuat/:sessionId" element={<SessionDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

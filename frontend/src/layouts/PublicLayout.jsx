import { Outlet } from 'react-router-dom';

import Navbar from '../components/navbar/Navbar.jsx';
import Footer from '../components/footer/Footer.jsx';

/**
 * PublicLayout — shell shared by all public pages.
 * Renders the sticky Navbar, the routed page via <Outlet/>, and the Footer.
 */
export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

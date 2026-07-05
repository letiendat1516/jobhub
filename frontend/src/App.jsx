import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

/**
 * App — top-level component.
 * AuthProvider bọc toàn app để useAuth() truy cập được ở mọi nơi
 * (Navbar, các route bảo vệ, ...).
 */
export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

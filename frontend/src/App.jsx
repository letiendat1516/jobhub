import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { useLocation } from 'react-router-dom';

/**
 * App — top-level component.
 * ErrorBoundary wraps the whole tree so any uncaught render error shows
 * a safe fallback instead of a blank white screen.
 */
export default function App() {
  const location = useLocation();

  return (
    <ErrorBoundary resetKey={location.key}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

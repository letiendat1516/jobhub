import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

/**
 * App — top-level component.
 * ErrorBoundary wraps the whole tree so any uncaught render error shows
 * a safe fallback instead of a blank white screen.
 */
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

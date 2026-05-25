import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LandingPage from '../../pages/LandingPage/LandingPage';
import RouteLoader from './RouteLoader';

export default function RootRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <RouteLoader minHeight="100vh" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return <LandingPage />;
}

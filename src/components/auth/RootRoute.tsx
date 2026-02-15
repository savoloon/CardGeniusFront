import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LandingPage from '../../pages/LandingPage/LandingPage';

export default function RootRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid var(--color-bg-input)',
            borderTopColor: 'var(--color-accent)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/profile" replace />;
  }

  return <LandingPage />;
}

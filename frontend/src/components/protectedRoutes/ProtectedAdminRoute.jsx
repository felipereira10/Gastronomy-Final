import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedAdminRoute({ children }) {
  const { authData } = useAuth();

  if (!authData?.user) {
    return <Navigate to="/auth" />;
  }

  if (authData?.user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user?.systemUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default AdminRoute;

import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function PrivateRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;

import { Routes, Route, Navigate } from 'react-router-dom'
import LottoApp from '../components/LottoApp'
import PrivateRoute from '../components/PrivateRoute'
import LoginPage from '../pages/LoginPage'
import ProfilePage from '../pages/ProfilePage'
import ProductsPage from '../pages/ProductsPage'
import CartPage from '../pages/CartPage'
import PatternsPage from '../pages/PatternsPage'
import MethodsPage from '../pages/MethodsPage'
import MethodsPage2 from '../pages/MethodsPage2'
import DashboardPage from '../pages/DashboardPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LottoApp />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/patterns" element={<PatternsPage />} />
      <Route path="/methods" element={<MethodsPage />} />
      <Route path="/methods2" element={<MethodsPage2 />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

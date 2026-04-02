import { createBrowserRouter, Navigate } from 'react-router-dom'
import App from '../App'
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
import ComponentDesignPage from '../pages/ComponentDesignPage'

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <LottoApp /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/patterns', element: <PatternsPage /> },
      { path: '/methods', element: <MethodsPage /> },
      { path: '/methods2', element: <MethodsPage2 /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/design', element: <ComponentDesignPage /> },
      {
        path: '/profile',
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default router

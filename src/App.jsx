import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LottoGenerator from './components/LottoGenerator'
import LottoHistory from './components/LottoHistory'
import NavBar from './components/NavBar'
import PrivateRoute from './components/PrivateRoute'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import ProductsPage from './pages/ProductsPage'
import CartPage from './pages/CartPage'
import PatternsPage from './pages/PatternsPage'
import MethodsPage from './pages/MethodsPage'
import useLottoStore from './store/lottoStore'

function LottoApp() {
  const { historyLottoNumbers } = useLottoStore();

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🎰 로또 번호 생성기</h1>
      </div>

      <div className="content-wrapper">
        <div className="generator-card">
          <LottoGenerator />
        </div>

        <div className="history-card">
          <LottoHistory historyLottoNumbers={historyLottoNumbers} />
        </div>
      </div>
    </div>
  );
}

function App() {
  const { isDarkMode } = useLottoStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<LottoApp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/patterns" element={<PatternsPage />} />
        <Route path="/methods" element={<MethodsPage />} />
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
    </>
  );
}

export default App

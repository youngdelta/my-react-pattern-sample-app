import { useEffect } from 'react'
import './App.css'
import NavBar from './components/NavBar'
import AppRoutes from './routers'
import useLottoStore from './store/lottoStore'

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
      <AppRoutes />
    </>
  );
}

export default App

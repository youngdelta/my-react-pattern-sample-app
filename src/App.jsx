import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import './App.css'
import NavBar from '@/components/NavBar'
import useLottoStore from '@/store/lottoStore'

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
      <Outlet />
    </>
  );
}

export default App

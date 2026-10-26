import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import History from './pages/History';
import SafeZones from './pages/SafeZones';
import SocketManager from './components/SocketManager';

function App() {
  const { user } = useSelector((state) => state.auth);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    console.log("Theme updated:", isDarkMode ? "DARK" : "LIGHT", "HTML ClassList:", root.classList.toString());
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  return (
    <div id="theme-wrapper" className="relative min-h-screen bg-transparent">
      <SocketManager />

      <div className="pointer-events-none fixed left-1/2 top-0 z-[100] -translate-x-1/2">
        <div className="mt-2 rounded-b-[1.1rem] border border-pink-100/80 bg-white/75 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-pink-500 shadow-[0_18px_35px_-24px_rgba(214,120,172,0.9)] backdrop-blur-md dark:border-pink-400/20 dark:bg-slate-900/75 dark:text-pink-300">
          {windowWidth}px • {isDarkMode ? 'Dark mode' : 'Light mode'}
        </div>
      </div>

      <Routes>
        <Route
          path="/"
          element={user ? <Dashboard toggleTheme={toggleTheme} isDarkMode={isDarkMode} /> : <Navigate to="/login" />}
        />
        <Route
          path="/contacts"
          element={user ? <Contacts /> : <Navigate to="/login" />}
        />
        <Route
          path="/history"
          element={user ? <History /> : <Navigate to="/login" />}
        />
        <Route
          path="/safe-zones"
          element={user ? <SafeZones /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;

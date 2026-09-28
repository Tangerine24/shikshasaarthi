import { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AppRouter } from './router';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { initMobileApp } from './lib/mobile';

function MobileBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    initMobileApp(() => navigate(-1));
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <MobileBridge />
          <AppRouter />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;

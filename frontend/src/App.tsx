import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}

export default App;

import { useState } from 'react';
import NISTMatrix from './components/NISTMatrix';
import LoginScreen from './components/LoginScreen';
import { authService, type AuthUser } from './services/auth';

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getUser());

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (!user) {
    return <LoginScreen onAuthenticated={setUser} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060a10' }}>
      <NISTMatrix currentUser={user} onLogout={handleLogout} />
    </div>
  );
}

export default App;

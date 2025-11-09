import React, { useState, useContext } from 'react';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import { UserProvider, UserContext } from './contexts/UserContext';
import MainLayout from './components/MainLayout';

const AppContent: React.FC = () => {
  const { currentUser } = useContext(UserContext);
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'forgotPassword'>('login');

  const navigateToSignUp = () => setCurrentView('signup');
  const navigateToLogin = () => setCurrentView('login');
  const navigateToForgotPassword = () => setCurrentView('forgotPassword');

  if (currentUser) {
    return <MainLayout />;
  }

  if (currentView === 'signup') {
    return <SignUpPage onNavigateToLogin={navigateToLogin} />;
  }
  
  if (currentView === 'forgotPassword') {
    return <ForgotPasswordPage onNavigateToLogin={navigateToLogin} />;
  }

  return <LoginPage onNavigateToSignUp={navigateToSignUp} onNavigateToForgotPassword={navigateToForgotPassword} />;
};


const App: React.FC = () => {
  return (
    <UserProvider>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        <AppContent />
      </div>
    </UserProvider>
  );
};

export default App;
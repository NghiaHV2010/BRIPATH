import { Route, Routes } from 'react-router-dom';
import './App.css';
import { ForgotPasswordPage, LoginPage, RegisterPage, PersonalityQuizPage, SubscriptionPlansPage, SubscriptionDetailPage } from './pages';
import { useAuthStore } from './store/auth';
import { useEffect } from 'react';
import { Loader } from 'lucide-react';


function App() {
  // @ts-ignore
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader className='size-10 animate-spin' />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/quiz" element={<PersonalityQuizPage />} />
      <Route path="/subscriptions" element={<SubscriptionPlansPage />} />
      <Route path="/subscriptions/:planId" element={<SubscriptionDetailPage />} />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}

export default App;

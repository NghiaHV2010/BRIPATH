import { Route, Routes } from 'react-router-dom';
import './App.css';
import { ForgotPasswordPage, LoginPage, RegisterPage, EmailVerificationPage, PersonalityQuizPage, SubscriptionPlansPage, SubscriptionDetailPage } from './pages';


function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register/email/:token" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/quiz" element={<PersonalityQuizPage />} />
      <Route path="/subscriptions" element={<SubscriptionPlansPage />} />
      <Route path="/subscriptions/:planId" element={<SubscriptionDetailPage />} />
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}

export default App;

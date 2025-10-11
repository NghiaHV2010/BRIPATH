import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  EmailVerificationPage,
  SubscriptionPlansPage,
  SubscriptionDetailPage,
  AboutPage,
  ContactPage,
  QuizLandingPage,
  QuizPage,
  QuizResultsPage,
  ProfilePageWrapper,
  HomePage,
  CompaniesPage,
  AdminPage,
} from "./pages";
import JobsPage from "./pages/job/JobsPage";
import JobDetailsPage from "./pages/job/JobDetailsPage";
import GuestOnly from "./components/auth/GuestOnly";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import SettingsPage from "./pages/settings/settingsPage";
import AppliedJobsPage from "./pages/jobs/appliedJobsPage";
import SavedJobsPageProfile from "./pages/profile/savedJobsPage";
import CVSuitableJobsPage from "./pages/jobs/cvSuitableJobsPage";
import { useAuthStore } from "./store/auth";
import { Loader } from "lucide-react";
import { CompanyDetailsPage } from "./pages/company";

function App() {
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  // Smart scroll behavior
  useEffect(() => {
    // Override browser scroll restoration for SPA
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  // Scroll to top only on route changes (different pathname)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]); // ✅ Only when navigating to different routes

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      {/* <Route path="/sms" element={<VerifySMS />} /> */}
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/register/email/:token"
        element={<EmailVerificationPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/quiz" element={<QuizLandingPage />} />
      <Route path="/quiz/test" element={<QuizPage />} />
      <Route path="/quiz/results" element={<QuizResultsPage />} />
      <Route path="/companies" element={<CompaniesPage />} />
      <Route path="/companies/:companyId" element={<CompanyDetailsPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:jobId" element={<JobDetailsPage />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePageWrapper />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/applied"
        element={
          <ProtectedRoute>
            <AppliedJobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/saved-jobs"
        element={
          <ProtectedRoute>
            <SavedJobsPageProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cv/suitable"
        element={
          <ProtectedRoute>
            <CVSuitableJobsPage />
          </ProtectedRoute>
        }
      />
      {/* <Route
        path="/companies-create"
        element={
          <ProtectedRoute>
            <CompanyRegistrationPage />
          </ProtectedRoute>
        }
      /> */}
      <Route path="/subscriptions" element={<SubscriptionPlansPage />} />
      <Route
        path="/subscriptions/:planId"
        element={<SubscriptionDetailPage />}
      />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />

      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}

export default App;

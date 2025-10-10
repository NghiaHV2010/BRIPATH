import { useEffect, useRef } from "react";
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
  QuizLandingPageWrapper,
  QuizTestPageWrapper,
  QuizResultsPageWrapper,
  JobsPageWrapper,
  JobDetailsPageWrapper,
  ProfilePageWrapper,
  HomePage,
  CompaniesPage,
} from "./pages";
import GuestOnly from "./components/auth/GuestOnly";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SettingsPage from "./pages/settings/settingsPage";
import AppliedJobsPage from "./pages/jobs/appliedJobsPage";
import SavedJobsPage from "./pages/jobs/savedJobsPage";
import CVSuitableJobsPage from "./pages/jobs/cvSuitableJobsPage";
import { useAuthStore } from "./store/auth";
import { Loader } from "lucide-react";

function App() {
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();
  const location = useLocation();
  const prevPathnameRef = useRef<string>("");

  // Smart scroll behavior
  useEffect(() => {
    // Override browser scroll restoration for SPA
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  // Scroll to top only on REAL route changes (different pathname)
  useEffect(() => {
    // Only scroll if pathname actually changed (not just query params)
    if (prevPathnameRef.current !== location.pathname) {
      window.scrollTo(0, 0);
      prevPathnameRef.current = location.pathname;
    }
  }, [location.pathname, location.search]); // Watch both pathname and search

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
      <Route path="/quiz" element={<QuizLandingPageWrapper />} />
      <Route path="/quiz/test" element={<QuizTestPageWrapper />} />
      <Route path="/quiz/results" element={<QuizResultsPageWrapper />} />
      <Route path="/companies" element={<CompaniesPage />} />
      {/* <Route
        path="/companies/:companyId"
        element={<CompanyDetailsPageWrapper />}
      /> */}
      <Route path="/jobs" element={<JobsPageWrapper />} />
      <Route path="/jobs/:jobId" element={<JobDetailsPageWrapper />} />

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
        path="/jobs/saved"
        element={
          <ProtectedRoute>
            <SavedJobsPage />
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
      <Route path="*" element={<LoginPage />} />
    </Routes>
  );
}

export default App;

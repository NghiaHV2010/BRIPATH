import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
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

  // Force scroll to top on app load/reload with multiple methods
  useEffect(() => {
    // Method 1: Immediate scroll
    window.scrollTo(0, 0);

    // Method 2: Force scroll after a brief delay
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 0);

    // Method 3: Override browser scroll restoration
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Method 4: Force scroll on window load
    const handleLoad = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener("load", handleLoad);
    window.addEventListener("beforeunload", () => {
      window.scrollTo(0, 0);
    });

    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, []);

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
      <Route path="/companies" element={<CompaniesPageWrapper />} />
      <Route
        path="/companies/:companyId"
        element={<CompanyDetailsPageWrapper />}
      />
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

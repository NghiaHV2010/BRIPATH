import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  EmailVerificationPage,
  SubscriptionPlansPage,
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
import { PaymentProcessPage, PaymentSuccessPage } from "./pages/payment";
import PostComposerDemo from "./pages/demo/PostComposerDemo";
import JobsPage from "./pages/job/JobsPage";
import JobDetailsPage from "./pages/job/JobDetailsPage";
import GuestOnly from "./components/auth/GuestOnly";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CompanyRoute from "./components/auth/CompanyRoute";
import AdminRoute from "./components/auth/AdminRoute";
import SettingsPage from "./pages/settings/settingsPage";
import AppliedJobsPage from "./pages/jobs/appliedJobsPage";
import SavedJobsPageProfile from "./pages/profile/savedJobsPage";
import FollowedCompaniesPage from "./pages/profile/followedCompaniesPage";
import CVSuitableJobsPage from "./pages/jobs/cvSuitableJobsPage";
import { useAuthStore } from "./store/auth";
import { CompanyDetailsPage } from "./pages/company";
import { NotificationList } from "./components/notification/NotificationList";
import Layout from "./components/layout/layout";
import { Toaster } from "./components/ui/toaster";
import ProfileLayout from "./components/layout/profileLayout";
import CareerPathPage from "./pages/quiz/CareerPathPage";
import { BlogPage } from "./pages/blog/BlogPage";
import BlogDetail from "./pages/blog/BlogDetail";
import { CompanyJobs } from "./pages/profile/company/CompanyJobs";
import { JobApplicationsPage } from "./pages/profile/company/JobApplicationsPage";
import { UserSubscription } from "./components/profile/userSubscriptions";
import { CompanyReviews } from "./pages/profile/company/CompanyReviews";
import VerifyPhone from "./components/auth/verifyPhone";
import EventsPage from "./pages/event/EventPage";
import VerifySMS from "./components/VerifySMS";
import Setup2FAPage from "./pages/auth/Setup2FAPage";
import Verify2FAPage from "./pages/auth/Verify2FAPage";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

function App() {
  const { checkAuth, authUser, isCheckingAuth } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

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

  // Handle Google OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const loginStatus = urlParams.get("login");

    if (loginStatus === "success") {
      // Clear the URL parameter and check auth status
      window.history.replaceState({}, document.title, window.location.pathname);
      // Re-check auth to get updated user data
      checkAuth();
    }
  }, [location.search, checkAuth]);

  // Handle Google OAuth errors
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const error = params.get("error");

    if (error) {
      if (error === "authentication_failed") {
        toast.error("Xác thực Google thất bại");
      } else if (error === "server_error") {
        toast.error("Lỗi hệ thống");
      }

      // Clean up URL
      navigate("/login", { replace: true });
    }
  }, [location.search, navigate]);

  if (isCheckingAuth && !authUser) {
    return <Loader className="animate-spin m-auto mt-20 size-12" />;
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Layout showFooter={false}>
              <HomePage />
            </Layout>
          }
        />
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
        <Route path="/sms" element={<VerifySMS />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/register/email/:token"
          element={<EmailVerificationPage />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        {/* Alias route: some emails may include this older path format */}
        <Route path="/forgot/password/:token" element={<ResetPasswordPage />} />
        <Route path="/quiz" element={<QuizLandingPage />} />
        <Route path="/quiz/test" element={<QuizPage />} />
        <Route path="/quiz/results" element={<QuizResultsPage />} />
        <Route path="/quiz/career-path" element={<CareerPathPage />} />

        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/companies/:companyId" element={<CompanyDetailsPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
        <Route path="/verify-phone" element={<VerifyPhone />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/event" element={<EventsPage />} />

        {/* Profile Routes - Parent with nested children */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfilePageWrapper />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="applied/jobs" element={<AppliedJobsPage />} />
          <Route path="saved/jobs" element={<SavedJobsPageProfile />} />
          <Route path="suitable/jobs" element={<CVSuitableJobsPage />} />
          <Route path="followed/companies" element={<FollowedCompaniesPage />} />
          <Route path="notifications" element={<NotificationList />} />
          <Route path="subscriptions" element={<UserSubscription />} />
          {/* Company-specific routes */}
          <Route
            path="jobs"
            element={
              <CompanyRoute>
                <CompanyJobs />
              </CompanyRoute>
            }
          />
          <Route
            path="reviews"
            element={
              <CompanyRoute>
                <CompanyReviews />
              </CompanyRoute>
            }
          />
          <Route
            path="applications"
            element={
              <CompanyRoute>
                <JobApplicationsPage />
              </CompanyRoute>
            }
          />
        </Route>

        <Route path="/subscriptions" element={<SubscriptionPlansPage />} />

        {/* Payment Routes */}
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentProcessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Demo Routes */}
        <Route path="/demo/post-composer" element={<PostComposerDemo />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        {/* 2FA Setup Route */}
        <Route
          path="/setup-2fa"
          element={
            <ProtectedRoute>
              <Setup2FAPage />
            </ProtectedRoute>
          }
        />

        {/* 2FA Disable Route */}
        <Route path="/verify-2fa" element={<Verify2FAPage />} />

        {/* Catch-all Route */}
        <Route
          path="*"
          element={
            <Layout showFooter={false}>
              <HomePage />
            </Layout>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;

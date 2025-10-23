import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
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
import { PaymentPage, PaymentProcessPage, PaymentSuccessPage } from "./pages/payment";
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
import { Loader } from "lucide-react";
import { CompanyDetailsPage } from "./pages/company";
import { NotificationList } from "./components/notification/NotificationList";
import Layout from "./components/layout/layout";
import { Toaster } from "./components/ui/toaster";
import ProfileLayout from "./components/layout/profileLayout";
import CareerPathPage from "./pages/quiz/CareerPathPage";
import { BlogPage } from "./pages/blog/BlogPage";
import { CompanyProfile } from "./pages/profile/company/CompanyProfile";
import { JobApplicationsPage } from "./pages/profile/company/JobApplicationsPage";
import { UserSubscription } from "./components/profile/userSubscriptions";
import { CompanyReviews } from "./pages/profile/company/CompanyReviews";

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
        {/* <Route path="/sms" element={<VerifySMS />} /> */}
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

        <Route path="/blog" element={<BlogPage />} />

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
          <Route path="jobs" element={<CompanyRoute><CompanyProfile /></CompanyRoute>} />
          <Route path="reviews" element={<CompanyRoute><CompanyReviews /></CompanyRoute>} />
          <Route path="applications" element={<CompanyRoute><JobApplicationsPage /></CompanyRoute>} />
        </Route>

        <Route path="/subscriptions" element={<SubscriptionPlansPage />} />

        {/* Payment Routes */}
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/process"
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

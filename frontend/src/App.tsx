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
  CompaniesPageWrapper,
  JobsPageWrapper,
  UploadCVPageWrapper,
} from "./pages";

function App() {
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

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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
      <Route path="/jobs" element={<JobsPageWrapper />} />
      <Route path="/upload-cv" element={<UploadCVPageWrapper />} />
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

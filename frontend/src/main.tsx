import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

// // Force scroll to top immediately when script loads
// window.scrollTo(0, 0);

// // Disable scroll restoration
// if ("scrollRestoration" in history) {
//   history.scrollRestoration = "manual";
// }

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <BrowserRouter>
        <App />
        <Toaster position="top-center" richColors closeButton duration={2600} />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);

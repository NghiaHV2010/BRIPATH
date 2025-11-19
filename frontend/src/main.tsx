import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 2500,
            style: {
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "14px",
              maxWidth: "400px",
            },
            success: {
              style: {
                background: "#10B981",
                color: "white",
              },
              iconTheme: {
                primary: "white",
                secondary: "#10B981",
              },
            },
            error: {
              style: {
                background: "#EF4444",
                color: "white",
              },
              iconTheme: {
                primary: "white",
                secondary: "#EF4444",
              },
            },
          }}
        />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);

import { useEffect, useState } from "react";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "../../config/firebase.config";
import axiosConfig from "../../config/axios.config";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function VerifyPhone() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);

  /** 🔹 Initialize reCAPTCHA (runs once) */
  useEffect(() => {
    const initRecaptcha = async () => {
      try {
        if (window.recaptchaVerifier) return; // already exists

        const container = document.getElementById("recaptcha-container");
        if (container) container.innerHTML = "";

        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "normal", // visible but clean
            callback: () => {
              setIsRecaptchaReady(true);
              console.log("✅ reCAPTCHA verified");
            },
            "expired-callback": () => {
              setIsRecaptchaReady(false);
              setErrorMsg("reCAPTCHA expired, please tick again.");
            },
          }
        );

        await window.recaptchaVerifier.render();
        console.log("🔧 reCAPTCHA ready");
      } catch (err) {
        console.error("reCAPTCHA init error:", err);
        setErrorMsg("Failed to initialize reCAPTCHA.");
      }
    };

    initRecaptcha();

    // Cleanup when unmount
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = undefined;
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  /** 🔹 Helper: Format phone */
  const formatPhone = (phone: string) => {
    if (!phone) return "";
    return phone.startsWith("+")
      ? phone
      : `+84${phone.startsWith("0") ? phone.slice(1) : phone}`;
  };

  /** 🔹 Send OTP */
  const sendOTP = async () => {
    if (!phone) return alert("Please enter phone number");

    const appVerifier = window.recaptchaVerifier;
    if (!appVerifier || !isRecaptchaReady)
      return alert("Please verify reCAPTCHA first");

    try {
      setLoading(true);
      setErrorMsg("");

      const formatted = formatPhone(phone);
      const result = await signInWithPhoneNumber(auth, formatted, appVerifier);
      setConfirmationResult(result);

      alert("OTP has been sent to your phone!");
    } catch (err: any) {
      console.error(err);
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Verify OTP */
  const verifyOTP = async () => {
    if (!confirmationResult) return alert("Please send OTP first");
    if (!otp) return alert("Enter OTP");

    try {
      setLoading(true);
      setErrorMsg("");

      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const idToken = await user.getIdToken();

      const res = await axiosConfig.post("/verify-sms", { token: idToken });
      const data = res.data;

      if (data.success) {
        alert("✅ Phone verified successfully!");
        resetForm();
      } else {
        alert("❌ Verification failed!");
      }
    } catch (err: any) {
      console.error(err);
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Error handler */
  const handleFirebaseError = (error: any) => {
    let msg = "Unexpected error occurred.";

    switch (error.code) {
      case "auth/invalid-phone-number":
        msg = "Invalid phone number format.";
        break;
      case "auth/too-many-requests":
        msg = "Too many requests. Please wait a few minutes.";
        break;
      case "auth/invalid-verification-code":
        msg = "Incorrect OTP code.";
        break;
      case "auth/code-expired":
        msg = "OTP has expired. Please resend.";
        break;
      case "auth/captcha-check-failed":
        msg = "reCAPTCHA verification failed. Please retry.";
        break;
      default:
        msg = error.message || msg;
    }

    setErrorMsg(msg);
    alert(msg);
  };

  /** 🔹 Reset form */
  const resetForm = () => {
    setPhone("");
    setOtp("");
    setConfirmationResult(null);
  };

  return (
    <div className="p-4 max-w-sm mx-auto bg-white shadow-xl rounded-xl">
      <h2 className="text-xl font-bold text-center mb-4 text-gray-800">
        Phone Verification
      </h2>

      <div id="recaptcha-container" className="mb-3 flex justify-center"></div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {errorMsg}
        </div>
      )}

      <input
        type="text"
        placeholder="e.g. 0334327096"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        disabled={loading || !!confirmationResult}
        className="mb-4 p-3 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        onClick={sendOTP}
        disabled={loading || !!confirmationResult || !isRecaptchaReady}
        className={`p-3 w-full rounded-lg font-semibold ${
          loading || !!confirmationResult || !isRecaptchaReady
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>

      {confirmationResult && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            disabled={loading}
            className="mt-4 p-3 w-full border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          />
          <button
            onClick={verifyOTP}
            disabled={loading}
            className={`p-3 w-full rounded-lg font-semibold mt-2 ${
              loading
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </>
      )}
    </div>
  );
}

// import { useRef, useState } from "react";
// import {
//   auth,
//   RecaptchaVerifier,
//   signInWithPhoneNumber,
//   type ConfirmationResult,
// } from "../config/firebase.config";
// import axiosConfig from "../config/axios.config";

// const VerifySMS = () => {
//   const [phone, setPhone] = useState("");
//   const [otp, setOtp] = useState("");
//   const [confirmationResult, setConfirmationResult] =
//     useState<ConfirmationResult | null>(null);
//   const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

//   // Render invisible reCAPTCHA
//   // const setupRecaptcha = () => {
//   //   if (!recaptchaVerifier.current) {
//   //     recaptchaVerifier.current = new RecaptchaVerifier(
//   //       auth,
//   //       "recaptcha-container",
//   //       {
//   //         size: "invisible",
//   //       }
//   //     );
//   //   }
//   // };

//   const setupRecaptcha = () => {
//     if (!recaptchaVerifier.current) {
//       recaptchaVerifier.current = new RecaptchaVerifier(auth, "recaptcha-container", {
//         size: "normal", // Use 'normal' for testing, change to 'invisible' later
//         callback: (response: any) => {
//           console.log("reCAPTCHA solved:", response);
//         },
//         "error-callback": (error: any) => {
//           console.error("reCAPTCHA error:", error);
//         }
//       });

//       recaptchaVerifier.current.render().catch((error) => {
//         console.error("Error rendering reCAPTCHA:", error);
//       });
//     }
//   };


//   // const sendOTP = async () => {
//   //   setupRecaptcha();
//   //   try {
//   //     const appVerifier = recaptchaVerifier.current!;
//   //     const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
//   //     setConfirmationResult(confirmation);
//   //     alert("OTP sent!");
//   //   } catch (err) {
//   //     console.error("Error sending OTP:", err);
//   //   }
//   // };

//   const sendOTP = async () => {
//     try {
//       // Clear existing verifier if any
//       if (recaptchaVerifier.current) {
//         recaptchaVerifier.current.clear();
//         recaptchaVerifier.current = null;
//       }

//       setupRecaptcha();
//       const appVerifier = recaptchaVerifier.current!;
//       const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
//       setConfirmationResult(confirmation);
//       alert("OTP sent!");
//     } catch (err: any) {
//       console.error("Error sending OTP:", err);
//       alert(`Error: ${err.message}`);

//       // Clear verifier on error
//       if (recaptchaVerifier.current) {
//         recaptchaVerifier.current.clear();
//         recaptchaVerifier.current = null;
//       }
//     }
//   };

//   const verifyOTP = async () => {
//     if (!confirmationResult) {
//       return;
//     }

//     try {
//       const result = await confirmationResult.confirm(otp);
//       const user = result.user;
//       const idToken = await user.getIdToken(); // lấy idToken để gửi cho backend

//       const res = await axiosConfig.post("/verify-sms", {
//         token: idToken,
//       });

//       const data = await res.data?.data;
//       console.log(data);

//       if (data.success) {
//         alert("Phone verified on backend!");
//       } else {
//         alert("Backend verification failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Invalid OTP");
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Firebase Phone Verification</h2>
//       <input
//         type="text"
//         placeholder="+84912345678"
//         value={phone}
//         onChange={e => setPhone(e.target.value)}
//       />
//       <button onClick={sendOTP}>Send OTP</button>

//       <div id="recaptcha-container"></div>

//       <input
//         type="text"
//         placeholder="Enter OTP"
//         value={otp}
//         onChange={e => setOtp(e.target.value)}
//       />
//       <button onClick={verifyOTP}>Verify OTP</button>
//     </div>
//   );
// };

// export default VerifySMS;

import { useState } from "react";
import axiosConfig from "@/config/axios.config";

const VerifySMS = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);

  const sendOTP = async () => {
    const response = await axiosConfig.post("/send-sms-otp", { phone });
    setSent(response.data.success);
    alert("OTP sent!");
  };

  const verifyOTP = async () => {
    const res = await axiosConfig.post("/verify-sms-otp", { otp });
    alert(res.data.data);
  };

  return (
    <div style={{ padding: 20 }}>
      <input
        type="text"
        placeholder="+84912345678"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button onClick={sendOTP}>Send OTP</button>

      {sent && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOTP}>Verify</button>
        </>
      )}
    </div>
  );
};

export default VerifySMS;

import { useRef, useState } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "../config/firebase.config";
import axiosConfig from "../config/axios.config";

const VerifySMS = () => {
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

    // Render invisible reCAPTCHA
    const setupRecaptcha = () => {
        if (!recaptchaVerifier.current) {
            recaptchaVerifier.current = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
            });
        }
    };

    const sendOTP = async () => {
        setupRecaptcha();
        try {
            const result = await signInWithPhoneNumber(auth, phone, recaptchaVerifier.current as RecaptchaVerifier);
            setConfirmationResult(result);
            alert("OTP sent!");
        } catch (err) {
            console.error(err);
            alert("Error sending OTP");
        }
    };

    const verifyOTP = async () => {
        if (!confirmationResult) {
            return;
        }

        try {
            const result = await confirmationResult.confirm(otp);
            const user = result.user;
            const idToken = await user.getIdToken(); // lấy idToken để gửi cho backend

            const res = await axiosConfig.post('/verify-sms', {
                token: idToken
            });

            const data = await res.data?.data;
            console.log(data);

            if (data.success) {
                alert("Phone verified on backend!");
            } else {
                alert("Backend verification failed");
            }
        } catch (err) {
            console.error(err);
            alert("Invalid OTP");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Firebase Phone Verification</h2>
            <input
                type="text"
                placeholder="+84912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <button onClick={sendOTP}>Send OTP</button>

            <div id="recaptcha-container"></div>

            <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={verifyOTP}>Verify OTP</button>
        </div>
    );
}

export default VerifySMS
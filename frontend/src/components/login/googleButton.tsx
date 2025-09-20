import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

interface GoogleButtonProps {
  onSuccess: (token: string) => void;
}

export default function GoogleButton({ onSuccess }: GoogleButtonProps) {
  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={(res: CredentialResponse) => {
          if (res.credential) onSuccess(res.credential);
        }}
        onError={() => console.log("Google login failed")}
        width="300"
        useOneTap
      />
    </div>
  );
}

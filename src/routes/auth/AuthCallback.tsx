import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useZkLogin } from "../../state/ZkLoginProvider";

/**
 * AuthCallback Component
 *
 * This component handles the OAuth callback from Google after user authentication.
 * It's the final step in the zkLogin flow where we receive the JWT token and
 * complete the authentication process.
 *
 * Flow:
 * 1. User clicks "Connect Wallet" → redirected to Google
 * 2. User authenticates with Google → Google redirects back here
 * 3. This component extracts JWT from URL and completes zkLogin
 * 4. User is redirected to their intended destination
 */
export default function AuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeLogin } = useZkLogin();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple processing in React StrictMode
    if (processedRef.current) {
      return;
    }

    const processCallback = async () => {
      try {
        // Parse both query params and fragment params
        // Google OAuth can return data in either location depending on configuration
        const queryParams = new URLSearchParams(window.location.search);
        const fragmentParams = new URLSearchParams(
          window.location.hash.substring(1)
        );

        // Extract JWT token and return URL from OAuth response
        const idToken =
          queryParams.get("id_token") || fragmentParams.get("id_token");
        const state = queryParams.get("state") || fragmentParams.get("state");
        const returnTo = state ? decodeURIComponent(state) : "/";

        // Check if we're already logged in and this is a duplicate callback
        const existingJwt = sessionStorage.getItem("zk:jwt");
        if (existingJwt && !idToken) {
          navigate("/dashboard", { replace: true });
          return;
        }

        if (!idToken) {
          console.error("Missing id_token in OAuth callback");
          console.log("This usually means:");
          console.log("1. Google OAuth is not configured to return id_token");
          console.log('2. The response_type should be "id_token" not "code"');
          console.log("3. Check your Google OAuth client configuration");
          console.log(
            "4. There might be too many redirects causing the token to be lost"
          );
          console.log("5. You might already be logged in");
          navigate("/", { replace: true });
          return;
        }

        // Mark as processed before starting to prevent duplicate processing
        processedRef.current = true;

        // Complete the zkLogin process with the received JWT
        await completeLogin(idToken, returnTo);

        // Redirect user to their intended destination
        navigate(returnTo || "/", { replace: true });
      } catch (err) {
        console.error("Error in OAuth callback:", err);
        navigate("/", { replace: true });
      }
    };

    processCallback();
  }, [completeLogin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-effect rounded-2xl p-12 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Completing Login</h2>
        <p className="text-white/70">
          Please wait while we authenticate your account...
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/50">
          <span>Powered by</span>
          <span className="font-bold gradient-text">Sui zkLogin</span>
        </div>
      </div>
    </div>
  );
}

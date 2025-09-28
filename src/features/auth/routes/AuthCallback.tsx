import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useZkLogin } from '@/features/auth';
import { useNotifications } from '@/app';

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
  const [_params] = useSearchParams();
  const navigate = useNavigate();
  const { completeLogin, status, error, clearError } = useZkLogin();
  const { showError } = useNotifications();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple processing in React StrictMode
    if (processedRef.current) {
      return;
    }

    const processCallback = async () => {
      // Parse both query params and fragment params
      // Google OAuth can return data in either location depending on configuration
      const queryParams = new URLSearchParams(window.location.search);
      const fragmentParams = new URLSearchParams(window.location.hash.substring(1));

      // Extract JWT token and return URL from OAuth response
      const idToken = queryParams.get('id_token') || fragmentParams.get('id_token');
      const state = queryParams.get('state') || fragmentParams.get('state');
      const returnTo = state ? decodeURIComponent(state) : '/';

      // Check if we're already logged in and this is a duplicate callback
      const existingJwt = sessionStorage.getItem('zk:jwt');
      if (existingJwt && !idToken) {
        navigate('/profile', { replace: true });
        return;
      }

      if (!idToken) {
        showError({
          kind: 'OAuth',
          message: 'Missing authentication token from Google',
          details: {
            possibleCauses: [
              'Google OAuth is not configured to return id_token',
              'The response_type should be "id_token" not "code"',
              'Check your Google OAuth client configuration',
              'There might be too many redirects causing the token to be lost',
              'You might already be logged in',
            ],
          },
        });
        navigate('/', { replace: true });
        return;
      }

      // Mark as processed before starting to prevent duplicate processing
      processedRef.current = true;

      // Complete the zkLogin process with the received JWT
      await completeLogin(idToken, returnTo);
    };

    processCallback();
  }, [completeLogin, navigate]);

  // Handle success state - redirect to intended destination
  useEffect(() => {
    if (status === 'success') {
      const queryParams = new URLSearchParams(window.location.search);
      const fragmentParams = new URLSearchParams(window.location.hash.substring(1));
      const state = queryParams.get('state') || fragmentParams.get('state');
      const returnTo = state ? decodeURIComponent(state) : '/';
      navigate(returnTo, { replace: true });
    }
  }, [status, navigate]);

  // Show error state
  if (status === 'error' && error) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='glass-effect rounded-2xl p-12 text-center max-w-md mx-auto'>
          <div className='w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6'>
            <svg
              className='w-8 h-8 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </div>
          <h2 className='text-2xl font-bold text-white mb-3'>Authentication Failed</h2>
          <p className='text-white/70 mb-4'>{error}</p>

          <div className='flex gap-3 justify-center'>
            <button
              onClick={() => navigate('/', { replace: true })}
              className='px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors'
            >
              Go Home
            </button>
            <button
              onClick={() => {
                clearError();
                // Retry the process
                window.location.reload();
              }}
              className='px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg transition-colors'
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='glass-effect rounded-2xl p-12 text-center max-w-md mx-auto'>
        <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6'>
          <div className='w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
        </div>
        <h2 className='text-2xl font-bold text-white mb-3'>Completing Login</h2>
        <p className='text-white/70'>Please wait while we authenticate your account...</p>
        <div className='mt-6 flex items-center justify-center gap-2 text-sm text-white/50'>
          <span>Powered by</span>
          <span className='font-bold gradient-text'>Sui zkLogin</span>
        </div>
      </div>
    </div>
  );
}

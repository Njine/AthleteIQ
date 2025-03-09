'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useEphemeralKeyPair from '../../lib/useEphemeralKeyPair';
import { GOOGLE_CLIENT_ID, REDIRECT_URI } from '../../lib/constants';
import { useKeylessAccounts } from '../../lib/useKeylessAccounts';

export default function LoginPage() {
  const router = useRouter();
  const ephemeralKeyPair = useEphemeralKeyPair();
  const { activeAccount } = useKeylessAccounts();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (activeAccount) {
      router.push('/home');
      return;
    }

    // Build the Google OAuth URL
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    const searchParams = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'id_token',
      scope: 'openid email profile',
      nonce: ephemeralKeyPair.nonce,
    });
    url.search = searchParams.toString();
    console.log(url);
    setRedirectUrl(url.toString());
  }, [ephemeralKeyPair, router, activeAccount]);

  return (
    <div className="flex items-center justify-center h-screen w-screen px-4">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome to Sepolia Login</h1>
        <p className="text-lg mb-8">
          Sign in with your Google account to continue
        </p>
        {redirectUrl && (
          <a
            href={redirectUrl}
            className="flex justify-center items-center border rounded-lg px-8 py-2 hover:bg-gray-100 hover:shadow-sm active:bg-gray-50 active:scale-95 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="mr-2"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Sign in with Google
          </a>
        )}
      </div>
    </div>
  );
}
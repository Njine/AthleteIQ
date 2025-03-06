'use client'
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useKeylessAccounts } from '../../../lib/useKeylessAccounts';

export default function CallbackPage() {
  const isLoading = useRef(false);
  const switchKeylessAccount = useKeylessAccounts(
    (state) => state.switchKeylessAccount
  );
  const router = useRouter();

  useEffect(() => {
    // This is a workaround to prevent firing twice due to strict mode
    if (isLoading.current) return;
    isLoading.current = true;

    // Function to extract the id_token from URL fragment
    const getIdTokenFromHash = () => {
      if (typeof window === 'undefined') return null;
      
      const fragmentParams = new URLSearchParams(
        window.location.hash.substring(1)
      );
      return fragmentParams.get('id_token');
    };

    async function deriveAccount(idToken: string) {
      try {
        await switchKeylessAccount(idToken);
        router.push('/home');
      } catch (error) {
        console.error('Error switching account:', error);
        router.push('/login');
      }
    }

    const idToken = getIdTokenFromHash();
    if (!idToken) {
      router.push('/login');
      return;
    }

    deriveAccount(idToken);
  }, [router, switchKeylessAccount]);

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      <div className="relative flex justify-center items-center border rounded-lg px-8 py-2 shadow-sm cursor-not-allowed tracking-wider">
        <span className="absolute flex h-3 w-3 -top-1 -right-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
        Redirecting...
      </div>
    </div>
  );
}
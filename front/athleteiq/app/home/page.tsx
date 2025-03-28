'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKeylessAccounts } from '@/lib/useKeylessAccounts';
import { collapseAddress } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const { activeAccount, disconnectKeylessAccount } = useKeylessAccounts();

  useEffect(() => {
    if (!activeAccount) router.push('/login');
  }, [activeAccount, router]);

  useEffect(() => {
    if (!activeAccount) {
      router.push('/login');
    } else {
      const timeout = setTimeout(() => {
        router.push('/register');
      }, 3000);
  
      return () => clearTimeout(timeout);
    }
  }, [activeAccount, router]);
  

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen px-4">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome to Sepolia!</h1>
        <p className="text-lg mb-8">You are now logged in</p>

        <div className="grid gap-2">
          {activeAccount ? (
            <div className="flex justify-center items-center border rounded-lg px-8 py-2 shadow-sm cursor-not-allowed">
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
              {collapseAddress(activeAccount.address)}
            </div>
          ) : (
            <p>Not logged in</p>
          )}
          
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Your Ethereum Address</h2>
            <p className="border p-2 rounded break-all">{activeAccount?.address}</p>
          </div>
          
          <button
            className="flex justify-center bg-red-500 items-center border border-red-200 rounded-lg px-8 py-2 shadow-sm shadow-red-300 hover:bg-red-300 active:scale-95 transition-all mt-4"
            onClick={disconnectKeylessAccount}
          >
            Logout
          </button>
          <br></br>
          <h2 className="text-xl font-semibold mb-2">Redirecting to Register....</h2>
        </div>
      </div>
    </div>
  );
}
'use client'

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import Link from 'next/link';

export default function LoginPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.push(redirectTo || '/dashboard');
    }
  }, [currentUser, isLoading, redirectTo, router]);

  const handleSuccess = () => {
    router.push(redirectTo || '/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (currentUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/">
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            AI Maturity Assessment
          </h2>
        </Link>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Evaluate your organization's AI readiness
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {mode === 'login' ? (
          <LoginForm 
            onSuccess={handleSuccess}
            onSignUpClick={() => router.push('/login?mode=signup' + (redirectTo ? `&redirectTo=${redirectTo}` : ''))}
          />
        ) : (
          <SignupForm 
            onSuccess={handleSuccess}
            onLoginClick={() => router.push('/login' + (redirectTo ? `?redirectTo=${redirectTo}` : ''))}
          />
        )}
      </div>
    </div>
  );
}

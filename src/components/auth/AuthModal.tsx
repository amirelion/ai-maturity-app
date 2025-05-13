'use client'

import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  redirectUrl?: string;
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = 'login',
  redirectUrl
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {mode === 'login' ? (
            <LoginForm 
              onSuccess={handleSuccess} 
              onSignUpClick={() => setMode('signup')} 
            />
          ) : (
            <SignupForm 
              onSuccess={handleSuccess} 
              onLoginClick={() => setMode('login')} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

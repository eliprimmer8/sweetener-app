import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { BrandIcon, UserIcon } from './Icons';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigateToLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { requestPasswordReset, loading } = useContext(UserContext);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!identifier) {
        return;
    }
    await requestPasswordReset(identifier);
    setSubmitted(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-800 dark:via-gray-900 dark:to-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl dark:bg-gray-800/90 backdrop-blur-sm m-4">
        <div className="text-center">
            <div className="flex items-center justify-center mb-4">
                <BrandIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                <h1 className="ml-3 text-3xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
            </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {submitted 
             ? "If an account with that identifier exists, we've sent a password reset link."
             : "Enter your account's email, phone, or username to receive a password reset link."}
          </p>
        </div>
        
        {!submitted ? (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="identifier-reset"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none rounded-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  placeholder="Email, phone, or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  aria-label="Email, phone, or username"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:bg-indigo-400 dark:focus:ring-offset-gray-900"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
        ) : null}

         <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
                Remembered your password?{' '}
                <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:underline"
                >
                    Back to Sign in
                </button>
            </p>
         </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

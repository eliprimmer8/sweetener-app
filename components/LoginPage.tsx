import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { UserIcon, LockIcon, BrandIcon } from './Icons';

interface LoginPageProps {
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToSignUp, onNavigateToForgotPassword }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useContext(UserContext);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      await login(identifier, password);
      // On success, the App component will re-render to show the profile
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-200 via-rose-200 to-fuchsia-200 dark:from-pink-900 dark:via-rose-900 dark:to-fuchsia-950">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl dark:bg-gray-800/90 backdrop-blur-sm m-4">
        <div className="text-center">
            <div className="flex items-center justify-center mb-4">
                <BrandIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                <h1 className="ml-3 text-3xl font-bold text-gray-900 dark:text-white">sweetener social</h1>
            </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Welcome back! Please sign in to your account.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-t-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Email, phone, or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                aria-label="Email, phone, or username"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LockIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-b-md relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center" role="alert">{error}</p>}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button 
                type="button" 
                onClick={onNavigateToForgotPassword}
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:underline"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:bg-indigo-400 dark:focus:ring-offset-gray-900"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
         <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
                Don't have an account?{' '}
                <button
                    type="button"
                    onClick={onNavigateToSignUp}
                    className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:underline"
                >
                    Sign up
                </button>
            </p>
         </div>
      </div>
    </div>
  );
};

export default LoginPage;
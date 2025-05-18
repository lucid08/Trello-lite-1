'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!credentials.email || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
  'http://localhost:5000/api/v1/user/login', 
  credentials, 
  { withCredentials: true }
);
      console.log(response)
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-xs md:max-w-sm p-6 md:p-8 bg-white rounded-xl shadow-2xl space-y-6
        transition-all duration-300 hover:shadow-3xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <EnvelopeIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                id="email"
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg
                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                  transition-all duration-200"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <LockClosedIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="password"
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg
                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                  transition-all duration-200"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
          </div>
          {error && (
            <div className="flex items-center justify-center p-3 bg-red-50 rounded-lg">
              <span className="text-red-600 text-sm">⚠️ {error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg
              hover:bg-blue-700 transition-all duration-200
              disabled:opacity-70 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
          <div className="text-center text-sm text-gray-600">
            New user?{' '}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800 underline underline-offset-4"
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
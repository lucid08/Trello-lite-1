'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/v1/user/register', formData);
      setSuccess('Registration successful! Redirecting...');
      setTimeout(() => router.push('/login'), 1500);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-xs md:max-w-sm p-6 md:p-8 bg-white rounded-xl shadow-2xl space-y-6
        transition-all duration-300 hover:shadow-3xl">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
          <p className="text-gray-500 text-sm">Create your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <div className="relative">
              <UserIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="fullName"
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg
                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                  transition-all duration-200"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
          </div>
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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <LockClosedIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm Password"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg
                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                  transition-all duration-200"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            {error && (
              <div className="flex items-center justify-center p-3 bg-red-50 rounded-lg">
                <span className="text-red-600 text-sm">⚠️ {error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-600 text-sm">✅ {success}</span>
              </div>
            )}
          </div>
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
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
          <div className="text-center text-sm text-gray-600">
            Already registered?{' '}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 underline underline-offset-4"
            >
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
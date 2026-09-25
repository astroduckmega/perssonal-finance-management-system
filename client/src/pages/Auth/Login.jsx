import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Wallet, Sparkles, ArrowRight, Lock, Mail, ShieldAlert } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register, seedDemoData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    const demoEmail = 'demo@finvibe.io';
    const demoPassword = 'password123';

    try {
      try {
        await login(demoEmail, demoPassword);
      } catch (loginErr) {
        await register('Demo User', demoEmail, demoPassword, 'INR');
        await seedDemoData(false);
      }
      navigate('/');
    } catch (err) {
      setError('Could not initialize demo account. Please register manually.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f5f5]">
      <div className="w-full max-w-md">
        {/* Logo and Tagline */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E8450A] shadow-sm mb-3">
            <Wallet className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Fin<span className="text-[#E8450A]">Vibe</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Intelligent Personal Finance Tracker
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-xs text-gray-400 mb-6">Enter your credentials to access your dashboard</p>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8450A] focus:ring-2 focus:ring-[#E8450A]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#E8450A] focus:ring-2 focus:ring-[#E8450A]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#E8450A] hover:bg-[#d03d08] shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase font-bold">
              <span className="bg-white px-3 text-gray-400">Or Explore Instantly</span>
            </div>
          </div>

          {/* 1-Click Demo Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading || demoLoading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-[#E8450A] bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-[#E8450A]" />
            <span>{demoLoading ? 'Setting up demo...' : 'Try 1-Click Demo Account'}</span>
          </button>

          {/* Sign Up Link */}
          <div className="mt-6 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#E8450A] hover:underline transition-colors">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

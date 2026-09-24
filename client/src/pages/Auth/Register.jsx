import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Wallet, ArrowRight, Lock, Mail, User, ShieldAlert, Sparkles } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [seedSample, setSeedSample] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, seedDemoData } = useAuth();
  const { CURRENCIES } = useCurrency();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, currency);
      if (seedSample) {
        try {
          await seedDemoData(false);
        } catch (seedErr) {
          console.warn('Could not auto-seed demo data:', seedErr);
        }
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#090d16]">
      {/* Background Neon Blurs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 shadow-glow mb-4">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Fin<span className="text-brand-400">Vibe</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">Create your personal wealth tracker account</p>
        </div>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-700/70 shadow-2xl">
          <h2 className="text-xl font-extrabold text-white mb-1">Create Account</h2>
          <p className="text-xs text-slate-400 mb-6">Start taking full control of your finances</p>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Primary Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs text-white bg-slate-900"
              >
                {Object.keys(CURRENCIES).map((code) => (
                  <option key={code} value={code} className="bg-slate-900 text-white">
                    {CURRENCIES[code].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="seedSample"
                checked={seedSample}
                onChange={(e) => setSeedSample(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
              <label htmlFor="seedSample" className="text-xs text-slate-300 cursor-pointer flex items-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1" />
                Seed sample financial data for a complete dashboard experience
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-glow transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-400 hover:text-brand-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

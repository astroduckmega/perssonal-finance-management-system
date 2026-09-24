import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  User,
  Mail,
  DollarSign,
  ShieldCheck,
  Database,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function Profile() {
  const { user, updateProfile, seedDemoData } = useAuth();
  const { currency, setCurrency, CURRENCIES, currentSymbol } = useCurrency();

  const [name, setName] = useState(user?.name || '');
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || currency || 'INR');
  const [monthlyIncomeGoal, setMonthlyIncomeGoal] = useState(user?.monthlyIncomeGoal || '');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSavedSuccess(false);

    try {
      setLoading(true);
      await updateProfile({
        name,
        currency: selectedCurrency,
        monthlyIncomeGoal: monthlyIncomeGoal ? Number(monthlyIncomeGoal) : 0,
      });
      await setCurrency(selectedCurrency);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReloadDemo = async (clearExisting) => {
    if (seeding) return;
    try {
      setSeeding(true);
      await seedDemoData(clearExisting);
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to seed:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Account & System Settings</h1>
        <p className="text-xs text-slate-400">
          Manage your personal profile, currency preferences, and database configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Profile Card */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white text-3xl font-black shadow-glow mb-4">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h3 className="text-lg font-bold text-white">{user?.name}</h3>
          <p className="text-xs text-slate-400 mb-4">{user?.email}</p>

          <div className="w-full pt-4 border-t border-slate-800 space-y-2 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-slate-400">Active Currency:</span>
              <strong className="text-brand-400">{currency} ({currentSymbol})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Account Type:</span>
              <span className="text-emerald-400 font-bold">Standard Member</span>
            </div>
          </div>
        </div>

        {/* Right Settings Form */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800">
          <h3 className="text-base font-bold text-white mb-1">Preferences & Targets</h3>
          <p className="text-xs text-slate-400 mb-5">Update your personal preferences</p>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile settings saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-brand-400" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" /> Email (Registered)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-slate-400 opacity-70 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-1 text-brand-400" /> Display Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs text-white bg-slate-900"
                >
                  {Object.keys(CURRENCIES).map((code) => (
                    <option key={code} value={code} className="bg-slate-900 text-white">
                      {CURRENCIES[code].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Monthly Target Savings / Income
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100000"
                  value={monthlyIncomeGoal}
                  onChange={(e) => setMonthlyIncomeGoal(e.target.value)}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-glow transition-all"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MongoDB Atlas Connection Status Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-emerald-400">
          <Database className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Database Connection Status</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Cluster</span>
            <strong className="text-white font-mono">cluster0.7m7ss7v.mongodb.net</strong>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Database</span>
            <strong className="text-white font-mono">personal_finance</strong>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Status</span>
            <strong className="text-emerald-400 flex items-center font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Connected & Active
            </strong>
          </div>
        </div>
      </div>

      {/* Demo Data Actions */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-amber-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Demo Data Management</h3>
        </div>
        <p className="text-xs text-slate-400">
          Easily reset or append rich realistic transactions, monthly category budgets, and savings goals.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleReloadDemo(false)}
            disabled={seeding}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            {seeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
            <span>Append Demo Sample Dataset</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('This will replace your current transactions with a fresh demo dataset. Continue?')) {
                handleReloadDemo(true);
              }
            }}
            disabled={seeding}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Reset & Replace with Fresh Demo Data</span>
          </button>

          {seedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Demo data loaded successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

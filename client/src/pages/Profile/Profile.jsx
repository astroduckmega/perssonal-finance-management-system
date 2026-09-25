import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  User,
  Mail,
  DollarSign,
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
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Account & System Settings</h1>
        <p className="text-xs text-gray-500">
          Manage your personal profile, currency preferences, and database configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Profile Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-[#1f2937] flex items-center justify-center text-white text-3xl font-bold shadow-sm mb-4">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
          <p className="text-xs text-gray-400 mb-4">{user?.email}</p>

          <div className="w-full pt-4 border-t border-gray-100 space-y-2 text-xs text-left">
            <div className="flex justify-between">
              <span className="text-gray-500">Active Currency:</span>
              <strong className="text-[#E8450A]">{currency} ({currentSymbol})</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account Type:</span>
              <span className="text-emerald-600 font-bold">Standard Member</span>
            </div>
          </div>
        </div>

        {/* Right Settings Form */}
        <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-1">Preferences & Targets</h3>
          <p className="text-xs text-gray-400 mb-5">Update your personal preferences</p>

          {error && (
            <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          {savedSuccess && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile settings saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-[#E8450A]" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#E8450A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center">
                <Mail className="w-3.5 h-3.5 mr-1 text-gray-400" /> Email (Registered)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-400 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-1 text-[#E8450A]" /> Display Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#E8450A]"
                >
                  {Object.keys(CURRENCIES).map((code) => (
                    <option key={code} value={code}>
                      {CURRENCIES[code].label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Monthly Target Savings / Income
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100000"
                  value={monthlyIncomeGoal}
                  onChange={(e) => setMonthlyIncomeGoal(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#E8450A]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#E8450A] hover:bg-[#d03d08] shadow-sm transition-all"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MongoDB Atlas Connection Status Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-emerald-600">
          <Database className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Database Connection Status</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-gray-400 block mb-1">Cluster</span>
            <strong className="text-gray-800 font-mono">cluster0.7m7ss7v.mongodb.net</strong>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-gray-400 block mb-1">Database</span>
            <strong className="text-gray-800 font-mono">personal_finance</strong>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-gray-400 block mb-1">Status</span>
            <strong className="text-emerald-600 flex items-center font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Connected & Active
            </strong>
          </div>
        </div>
      </div>

      {/* Demo Data Actions */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 text-[#E8450A]">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Demo Data Management</h3>
        </div>
        <p className="text-xs text-gray-500">
          Easily reset or append realistic transactions, monthly category budgets, and savings goals.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleReloadDemo(false)}
            disabled={seeding}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors"
          >
            {seeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E8450A]" /> : <Sparkles className="w-3.5 h-3.5 text-[#E8450A]" />}
            <span>Append Demo Sample Dataset</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('This will replace your current transactions with a fresh demo dataset. Continue?')) {
                handleReloadDemo(true);
              }
            }}
            disabled={seeding}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span>Reset & Replace with Fresh Demo Data</span>
          </button>

          {seedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1" /> Demo data loaded successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

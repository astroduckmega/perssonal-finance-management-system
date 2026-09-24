import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Plus,
  Sparkles,
  DollarSign,
  Menu,
  ChevronDown,
  User,
  LogOut,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({
  onOpenAddTransaction,
  onToggleMobileSidebar,
  sidebarCollapsed = false,
  onToggleSidebarCollapse,
  onRefreshData,
}) {
  const { user, logout, seedDemoData } = useAuth();
  const { currency, setCurrency, CURRENCIES } = useCurrency();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleSeed = async () => {
    if (seeding) return;
    try {
      setSeeding(true);
      await seedDemoData(false);
      setSeedSuccess(true);
      if (onRefreshData) onRefreshData();
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to seed:', err);
    } finally {
      setSeeding(false);
    }
  };

  const handleToggleMenu = () => {
    if (window.innerWidth < 1024) {
      if (onToggleMobileSidebar) onToggleMobileSidebar();
    } else {
      if (onToggleSidebarCollapse) onToggleSidebarCollapse();
    }
  };

  return (
    <header className="h-16 lg:h-20 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      {/* Left Greeting & Mobile/Desktop Sidebar Toggle */}
      <div className="flex items-center space-x-3 lg:space-x-4">
        <button
          onClick={handleToggleMenu}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-white tracking-tight flex items-center">
            {getGreeting()},{' '}
            <span className="gradient-text ml-1.5 font-black">
              {user?.name?.split(' ')[0] || 'Member'}
            </span>
            <span className="hidden sm:inline-block ml-2 text-sm font-normal text-slate-400">👋</span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Track expenses, manage budgets, and build your wealth.
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Seed Demo Data Button */}
        <button
          onClick={handleSeed}
          disabled={seeding}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
            seedSuccess
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-800/80 text-amber-300 border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-500/50'
          }`}
          title="Populate your dashboard with realistic demo transactions & budgets"
        >
          {seeding ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : seedSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden md:inline">{seedSuccess ? 'Demo Loaded!' : 'Seed Demo Data'}</span>
        </button>

        {/* Currency Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setCurrencyOpen(!currencyOpen);
              setProfileOpen(false);
            }}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-200 border border-slate-700/70 hover:bg-slate-700/60 transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5 text-brand-400" />
            <span>{currency}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {currencyOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-panel rounded-xl shadow-2xl border border-slate-700 py-1 z-50 animate-slide-up">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Select Currency
              </div>
              {Object.keys(CURRENCIES).map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setCurrency(code);
                    setCurrencyOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    currency === code
                      ? 'bg-brand-600/20 text-brand-300 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <span>{CURRENCIES[code].label}</span>
                  {currency === code && <span className="text-brand-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Add Transaction Button */}
        <button
          onClick={onOpenAddTransaction}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-glow transition-all duration-200 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setCurrencyOpen(false);
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-md border border-white/20 hover:scale-105 transition-transform"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 glass-panel rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50 animate-slide-up">
              <div className="px-3.5 py-2 border-b border-slate-800">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center space-x-2 px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <User className="w-4 h-4 text-brand-400" />
                <span>Account Settings</span>
              </Link>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-slate-800/80 mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

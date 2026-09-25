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
    <header className="h-16 lg:h-20 bg-white border-b border-gray-100 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left Greeting & Mobile/Desktop Sidebar Toggle */}
      <div className="flex items-center space-x-3 lg:space-x-4">
        <button
          onClick={handleToggleMenu}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 tracking-tight flex items-center">
            {getGreeting()},{' '}
            <span className="text-[#E8450A] ml-1.5 font-bold">
              {user?.name?.split(' ')[0] || 'Member'}
            </span>
            <span className="hidden sm:inline-block ml-2 text-sm font-normal text-gray-400">👋</span>
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">
            Stay on top of your finances, track spending, and build wealth.
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
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-orange-50 text-[#E8450A] border-orange-200 hover:bg-orange-100'
          }`}
          title="Populate your dashboard with realistic demo transactions & budgets"
        >
          {seeding ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E8450A]" />
          ) : seedSuccess ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-[#E8450A]" />
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
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#E8450A]" />
            <span>{currency}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {currencyOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-slide-up">
              <div className="px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                Select Currency
              </div>
              {Object.keys(CURRENCIES).map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setCurrency(code);
                    setCurrencyOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                    currency === code
                      ? 'bg-orange-50 text-[#E8450A] font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{CURRENCIES[code].label}</span>
                  {currency === code && <span className="text-[#E8450A] text-xs font-bold">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Add Transaction Button */}
        <button
          onClick={onOpenAddTransaction}
          className="flex items-center space-x-1.5 bg-[#E8450A] hover:bg-[#d03d08] text-white text-xs sm:text-sm font-bold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-sm transition-all duration-200 active:scale-95"
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
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-bold text-sm shadow-sm hover:scale-105 transition-transform"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-slide-up">
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center space-x-2 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-[#E8450A]" />
                <span>Account Settings</span>
              </Link>

              <button
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 mt-1"
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

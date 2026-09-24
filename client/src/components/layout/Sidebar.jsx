import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  BarChart3,
  User,
  LogOut,
  Sparkles,
  Wallet,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Savings Goals', path: '/goals', icon: Target },
  { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
  { name: 'Profile & Settings', path: '/profile', icon: User },
];

export default function Sidebar({ mobileOpen, onCloseMobile, collapsed = false, onToggleCollapse }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-slate-900/95 lg:bg-slate-900/80 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          collapsed ? 'w-64 lg:w-20' : 'w-64 lg:w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Logo */}
        <div>
          <div className={`h-16 lg:h-20 flex items-center border-b border-slate-800/80 transition-all duration-300 ${
            collapsed ? 'justify-center px-2' : 'justify-between px-5'
          }`}>
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 min-w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-glow">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div className="transition-opacity duration-200 whitespace-nowrap">
                  <span className="text-xl font-black text-white tracking-tight">
                    Fin<span className="text-brand-400">Vibe</span>
                  </span>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                    Atlas Edition
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {!collapsed && (
              <div className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Main Menu
              </div>
            )}
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onCloseMobile}
                  title={collapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl text-sm font-semibold transition-all duration-200 group ${
                      collapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-3'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-600/30 to-brand-600/10 text-brand-300 border border-brand-500/40 shadow-glow font-bold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 min-w-5 transition-transform duration-200 group-hover:scale-110" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Financial Tip & Logout */}
        <div className="p-3 space-y-3">
          {/* Financial Tip Widget */}
          {!collapsed && (
            <div className="glass-panel p-4 rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-950/40 to-slate-900/60 transition-all duration-200">
              <div className="flex items-center space-x-2 text-brand-400 mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Smart Tip</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aim to follow the <strong className="text-brand-300">50/30/20 rule</strong>: 50% for needs, 30% wants, 20% savings & investments.
              </p>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title={collapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 ${
              collapsed ? 'justify-center px-2' : 'justify-center space-x-2 px-3'
            }`}
          >
            <LogOut className="w-4 h-4 min-w-4" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

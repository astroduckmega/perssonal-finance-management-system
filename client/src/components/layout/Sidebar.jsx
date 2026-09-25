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
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-gray-100 flex flex-col justify-between transition-all duration-300 ease-in-out shadow-sm ${
          collapsed ? 'w-64 lg:w-20' : 'w-64 lg:w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header & Logo */}
        <div>
          <div className={`h-16 lg:h-20 flex items-center border-b border-gray-100 transition-all duration-300 ${
            collapsed ? 'justify-center px-2' : 'justify-between px-5'
          }`}>
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 min-w-10 rounded-xl bg-[#E8450A] flex items-center justify-center shadow-sm">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              {!collapsed && (
                <div className="transition-opacity duration-200 whitespace-nowrap">
                  <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Fin<span className="text-[#E8450A]">Vibe</span>
                  </span>
                  <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                    Finance Hub
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            )}

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {!collapsed && (
              <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
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
                        ? 'bg-[#E8450A] text-white shadow-sm font-bold'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 min-w-5 transition-transform duration-200 group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.name}</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Financial Tip & Logout */}
        <div className="p-3 space-y-3">
          {/* Financial Tip Widget */}
          {!collapsed && (
            <div className="p-4 rounded-2xl border border-orange-100 bg-orange-50/70 transition-all duration-200">
              <div className="flex items-center space-x-2 text-[#E8450A] mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Smart Tip</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Follow the <strong className="text-[#E8450A] font-semibold">50/30/20 rule</strong>: 50% needs, 30% wants, 20% savings & investments.
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
            className={`w-full flex items-center py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-200 ${
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

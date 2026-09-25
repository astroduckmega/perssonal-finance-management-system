import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowRight,
  PieChart,
  Target,
  BarChart3,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  CreditCard,
  Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: PieChart,
    title: 'Smart Budgets',
    desc: 'Set monthly category spending limits with real-time alerts when you approach your threshold.',
    color: '#E8450A',
  },
  {
    icon: TrendingUp,
    title: 'Cash Flow Analytics',
    desc: 'Visualize income vs expenses over time with interactive area and bar charts.',
    color: '#10b981',
  },
  {
    icon: Target,
    title: 'Savings Goals',
    desc: 'Create milestone-based goals, track contributions, and celebrate when you hit targets.',
    color: '#3b82f6',
  },
  {
    icon: CreditCard,
    title: 'Multi-Currency',
    desc: 'Switch between INR, USD, EUR, GBP, and JPY with a single click from anywhere.',
    color: '#f59e0b',
  },
  {
    icon: BarChart3,
    title: 'Financial Reports',
    desc: 'Deep-dive analytics with category breakdowns, payment channel stats, and daily timelines.',
    color: '#8b5cf6',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Cloud',
    desc: 'Your data is securely stored on MongoDB Atlas with JWT authentication and encrypted at rest.',
    color: '#06b6d4',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 px-6 lg:px-16 py-4 flex items-center justify-between sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#E8450A] flex items-center justify-center shadow-sm">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-extrabold text-gray-900 tracking-tight">
            Fin<span className="text-[#E8450A]">Vibe</span>
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#E8450A] hover:bg-[#d03d08] shadow-sm transition-all"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 lg:px-16 py-16 lg:py-24 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#E8450A] text-[11px] font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personal Finance Intelligence — Powered by MongoDB Atlas</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-5">
          Take Full Control of{' '}
          <span className="text-[#E8450A]">Your Finances</span>
        </h1>

        <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8">
          Track every rupee, set smart budgets, achieve savings goals, and gain deep financial insights — all in one beautiful, modern dashboard.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="flex items-center space-x-2 bg-[#E8450A] hover:bg-[#d03d08] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <span>Start Tracking Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold px-6 py-3 rounded-xl border border-gray-200 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#E8450A]" />
            <span>Try 1-Click Demo</span>
          </Link>
        </div>

        {/* Trust Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-14">
          <div>
            <div className="text-2xl font-extrabold text-gray-900">100%</div>
            <div className="text-[11px] text-gray-400 font-semibold">Free to Use</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">5+</div>
            <div className="text-[11px] text-gray-400 font-semibold">Currencies</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">Real-time</div>
            <div className="text-[11px] text-gray-400 font-semibold">Analytics</div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="px-6 lg:px-16 pb-16 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Balance Card Mock */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold mb-1">Total Balance</div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">$689,372</div>
              <div className="flex items-center space-x-1 mt-2 text-xs">
                <span className="text-emerald-600 font-bold">↑ 15%</span>
                <span className="text-gray-400">than last month</span>
              </div>
            </div>

            {/* Total Earnings Card Mock */}
            <div className="bg-[#E8450A] rounded-2xl p-5 text-white">
              <div className="text-xs text-white/80 font-semibold mb-1">Total Earnings</div>
              <div className="text-3xl font-extrabold tracking-tight">$950</div>
              <div className="text-[11px] text-white/80 mt-2">↑ 7% This month</div>
            </div>

            {/* Total Spending Card Mock */}
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold mb-1">Total Spending</div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">$700</div>
              <div className="flex items-center space-x-1 mt-2 text-xs">
                <span className="text-red-500 font-bold">↓ 5%</span>
                <span className="text-gray-400">This month</span>
              </div>
            </div>
          </div>

          {/* Chart bars mock */}
          <div className="mt-6 flex items-end justify-around h-24 px-4">
            {[40, 65, 35, 80, 55, 70, 45, 90].map((h, i) => (
              <div key={i} className="flex flex-col items-center space-y-1">
                <div
                  className="w-5 sm:w-7 rounded-t-md transition-all"
                  style={{
                    height: `${h}%`,
                    backgroundColor: i % 2 === 0 ? '#E8450A' : '#1f2937',
                  }}
                />
                <span className="text-[9px] text-gray-400">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="px-6 lg:px-16 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Everything You Need to{' '}
            <span className="text-[#E8450A]">Master Your Money</span>
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            FinVibe comes packed with powerful tools designed to give you complete visibility and control over your personal finances.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${f.color}15`, color: f.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 lg:px-16 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Get Started in <span className="text-[#E8450A]">3 Steps</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Create Account', desc: 'Sign up in seconds — or try our 1-click demo account instantly.' },
            { step: '02', title: 'Add Transactions', desc: 'Record income and expenses, or seed realistic demo data to explore.' },
            { step: '03', title: 'Gain Insights', desc: 'View charts, set budgets, track goals, and download CSV reports.' },
          ].map((s) => (
            <div key={s.step} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="text-3xl font-extrabold text-[#E8450A] mb-3">{s.step}</div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-16 py-16 max-w-4xl mx-auto">
        <div className="bg-[#1f2937] rounded-3xl p-8 sm:p-12 text-center text-white shadow-lg">
          <Zap className="w-8 h-8 text-[#E8450A] mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
            Ready to Take Control?
          </h2>
          <p className="text-sm text-gray-300 max-w-md mx-auto mb-6 leading-relaxed">
            Join FinVibe and transform how you manage, track, and grow your personal wealth. It's free, powerful, and beautiful.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center space-x-2 bg-[#E8450A] hover:bg-[#d03d08] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-6 lg:px-16 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#E8450A] flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">
              Fin<span className="text-[#E8450A]">Vibe</span>
            </span>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} FinVibe. Built with React, Node.js & MongoDB Atlas.
          </p>
        </div>
      </footer>
    </div>
  );
}

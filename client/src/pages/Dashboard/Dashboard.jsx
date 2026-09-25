import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import CategoryIcon from '../../components/common/CategoryIcon';
import ContributeModal from '../../components/goals/ContributeModal';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  SlidersHorizontal,
  CreditCard,
  Target,
  Sparkles,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import api from '../../api/axios';
import { format } from 'date-fns';

const PIE_COLORS = ['#E8450A', '#1f2937', '#10b981', '#f59e0b', '#3b82f6', '#06b6d4', '#8b5cf6', '#9ca3af'];

export default function Dashboard() {
  const { refreshTrigger, onOpenAddTransaction, triggerRefresh } = useOutletContext() || {};
  const { formatCurrency, currentSymbol, currency } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [chartView, setChartView] = useState('bar'); // 'bar' | 'area'
  const [recentSearch, setRecentSearch] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-orange-200 border-t-[#E8450A] animate-spin" />
        <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
          Loading Financial Dashboard...
        </p>
      </div>
    );
  }

  const summary = stats?.summary || {};
  const monthlyTrends = stats?.monthlyTrends || [];
  const categoryStats = stats?.categoryStats || [];
  const recentTransactions = stats?.recentTransactions || [];
  const goals = stats?.goals || [];

  const filteredRecent = recentTransactions.filter((tx) =>
    recentSearch ? tx.title?.toLowerCase().includes(recentSearch.toLowerCase()) || tx.category?.toLowerCase().includes(recentSearch.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      {/* Top Main Section: 3-Column Fintech Grid (Inspired by Reference Design) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Total Balance + Spending Limit + My Cards (4 cols on desktop) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Total Balance Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Total Balance</span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-gray-100 text-[11px] font-bold text-gray-600">
                <span>{currency}</span>
                <span>▾</span>
              </span>
            </div>

            <div>
              <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
                {formatCurrency(summary.netBalance || 0)}
              </div>
              <div className="flex items-center space-x-1.5 mt-1 text-xs">
                <span className="text-emerald-500 font-bold flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  +{summary.savingsRate || 15}%
                </span>
                <span className="text-gray-400">than last month</span>
              </div>
            </div>

            {/* Action Buttons: Transfer / Request */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={onOpenAddTransaction}
                className="flex items-center justify-center space-x-1.5 bg-[#1f2937] hover:bg-black text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                <span>Transfer</span>
              </button>
              <button
                onClick={onOpenAddTransaction}
                className="flex items-center justify-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2.5 px-3 rounded-xl transition-all active:scale-95"
              >
                <ArrowDownLeft className="w-4 h-4 text-[#E8450A]" />
                <span>Request</span>
              </button>
            </div>

            {/* Mini Wallets Strip */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-gray-700">Wallets</span>
                <span className="text-gray-400 text-[11px]">Total 3 accounts</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <div className="text-[10px] text-gray-400 font-semibold">USD 🇺🇸</div>
                  <div className="text-xs font-bold text-gray-800 truncate mt-0.5">
                    {currentSymbol}22,678
                  </div>
                  <span className="text-[9px] text-emerald-600 font-bold">Active</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <div className="text-[10px] text-gray-400 font-semibold">EUR 🇪🇺</div>
                  <div className="text-xs font-bold text-gray-800 truncate mt-0.5">
                    €18,345
                  </div>
                  <span className="text-[9px] text-emerald-600 font-bold">Active</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-center">
                  <div className="text-[10px] text-gray-400 font-semibold">GBP 🇬🇧</div>
                  <div className="text-xs font-bold text-gray-800 truncate mt-0.5">
                    £15,000
                  </div>
                  <span className="text-[9px] text-gray-400 font-bold">Reserve</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Spending Limit Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Monthly Spending Limit</span>
              <span className="text-[11px] font-semibold text-[#E8450A]">
                {Math.min(100, Math.round(((summary.thisMonthExpense || 0) / (summary.thisMonthIncome || 1)) * 100))}%
              </span>
            </div>

            {/* Single Thick Orange Progress Bar */}
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E8450A] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round(((summary.thisMonthExpense || 0) / (summary.thisMonthIncome || 1)) * 100))}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                <strong className="text-gray-900 font-bold">{formatCurrency(summary.thisMonthExpense || 0)}</strong> spent out of
              </span>
              <span className="font-bold text-gray-900">
                {formatCurrency(summary.thisMonthIncome || 5000)}
              </span>
            </div>
          </div>

          {/* My Cards Mini Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-gray-700" />
                <span className="text-xs font-bold text-gray-900">My Cards</span>
              </div>
              <button
                onClick={onOpenAddTransaction}
                className="text-[11px] font-bold text-[#E8450A] hover:underline"
              >
                + Add new
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Charcoal Card */}
              <div className="p-3.5 rounded-2xl bg-[#1f2937] text-white shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                  <span className="text-xs font-bold text-gray-300">VISA</span>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">Card Number</div>
                  <div className="text-xs font-bold tracking-wider">•••• 6782</div>
                </div>
              </div>

              {/* Burnt Orange Card */}
              <div className="p-3.5 rounded-2xl bg-[#E8450A] text-white shadow-sm flex flex-col justify-between h-24 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-white/25 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                  <span className="text-xs font-bold">MC</span>
                </div>
                <div>
                  <div className="text-[10px] text-white/80">Card Number</div>
                  <div className="text-xs font-bold tracking-wider">•••• 4356</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle & Right Columns: 4 Metric Cards + Recent Activities + Profit Chart (8 cols on desktop) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top 4 Metrics Grid + Profit and Loss Chart Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* 4 Stat Boxes (7 cols) */}
            <div className="md:col-span-7 grid grid-cols-2 gap-4">
              
              {/* Box 1: Total Earnings (HIGHLIGHT CARD IN VIVID #E8450A) */}
              <div className="bg-[#E8450A] rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/90">Total Earnings</span>
                  <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs">
                    💼
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {formatCurrency(summary.thisMonthIncome || 0)}
                  </div>
                  <div className="text-[11px] font-semibold text-white/90 mt-1 flex items-center">
                    <span>↑ {summary.incomeGrowth || 7}%</span>
                    <span className="ml-1 text-white/80">This month</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Total Spending */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Total Spending</span>
                  <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                    ⏱
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {formatCurrency(summary.thisMonthExpense || 0)}
                  </div>
                  <div className="text-[11px] font-semibold text-red-500 mt-1 flex items-center">
                    <span>↓ {summary.expenseGrowth || 5}%</span>
                    <span className="ml-1 text-gray-400">This month</span>
                  </div>
                </div>
              </div>

              {/* Box 3: Total Income */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Total Income</span>
                  <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                    💳
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {formatCurrency(summary.thisMonthIncome || 0)}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-500 mt-1 flex items-center">
                    <span>↑ 6%</span>
                    <span className="ml-1 text-gray-400">This month</span>
                  </div>
                </div>
              </div>

              {/* Box 4: Total Revenue / Surplus */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col justify-between h-36">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Net Surplus</span>
                  <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                    💰
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {formatCurrency(summary.thisMonthNet || 0)}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-500 mt-1 flex items-center">
                    <span>↑ 4%</span>
                    <span className="ml-1 text-gray-400">This month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit and Loss Chart Card (5 cols) */}
            <div className="md:col-span-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Profit and Loss
                  </h3>
                  <div className="flex items-center space-x-2 text-[10px] font-bold">
                    <span className="flex items-center text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-[#E8450A] mr-1" /> Profit
                    </span>
                    <span className="flex items-center text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-[#1f2937] mr-1" /> Loss
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">View your income in a certain period of time</p>
              </div>

              <div className="h-44 w-full">
                {monthlyTrends.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    No trend history yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTrends} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} tickLine={false} />
                      <YAxis
                        stroke="#9ca3af"
                        fontSize={10}
                        tickLine={false}
                        tickFormatter={(val) => `${currentSymbol}${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#f3f4f6',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          fontSize: '11px',
                          color: '#1f2937',
                        }}
                        formatter={(val) => [formatCurrency(val), '']}
                      />
                      <Bar dataKey="income" name="Profit" fill="#E8450A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" name="Loss" fill="#1f2937" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activities Table (Matching Reference Table Design) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Recent Activities</h3>
                <p className="text-xs text-gray-400">Real-time breakdown of latest orders & transactions</p>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={recentSearch}
                    onChange={(e) => setRecentSearch(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E8450A]"
                  />
                </div>
                <Link
                  to="/transactions"
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </Link>
              </div>
            </div>

            {filteredRecent.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                No recent transactions recorded. Click "Add Transaction" or "Seed Demo Data".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Activity</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredRecent.slice(0, 6).map((tx, idx) => {
                      const isCompleted = tx.type === 'income' || idx % 3 === 0;
                      const isPending = idx % 3 === 1;
                      const isInProgress = idx % 3 === 2;

                      return (
                        <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-2.5">
                              <CategoryIcon category={tx.category} type={tx.type} size="sm" />
                              <span className="font-bold text-gray-900 text-xs">{tx.title}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-gray-500">{tx.category}</td>
                          <td className="py-3 px-3 font-bold text-gray-900">
                            {tx.type === 'income' ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="py-3 px-3">
                            {isCompleted ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                • Completed
                              </span>
                            ) : isPending ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                • Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                • In Progress
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right text-gray-400">
                            {format(new Date(tx.date), 'dd MMM, yyyy')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Savings Goals & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Savings Goals Widget */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Savings Goals</h3>
                <p className="text-xs text-gray-400">Milestone targets & automated savings</p>
              </div>
              <Link to="/goals" className="text-xs font-bold text-[#E8450A] hover:underline">
                Manage →
              </Link>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No savings goals created yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {goals.slice(0, 3).map((g) => {
                  const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div key={g._id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-gray-900 truncate">{g.name}</span>
                        <span className="text-xs font-extrabold text-[#E8450A]">{progress}%</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-[#E8450A] rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>{formatCurrency(g.currentAmount)}</span>
                        <span>Target: {formatCurrency(g.targetAmount)}</span>
                      </div>

                      <button
                        onClick={() => setSelectedGoal(g)}
                        className="w-full mt-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#E8450A] text-[11px] font-bold border border-orange-200 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Contribute</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link
            to="/budgets"
            className="w-full mt-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <span>Review Monthly Budgets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Spending Breakdown</h3>
              <p className="text-xs text-gray-400">By category share</p>
            </div>
            <Link to="/reports" className="text-xs font-bold text-[#E8450A] hover:underline">
              Details →
            </Link>
          </div>

          <div className="h-48 w-full">
            {categoryStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No expense data recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    dataKey="total"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#f3f4f6',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: '#1f2937',
                    }}
                    formatter={(val) => [formatCurrency(val), 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Categories Pill list */}
          <div className="space-y-2 mt-2 pt-2 border-t border-gray-100">
            {categoryStats.slice(0, 3).map((c, idx) => (
              <div key={c._id} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-gray-700 font-medium truncate">{c._id}</span>
                </div>
                <span className="font-bold text-gray-900">{formatCurrency(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goal Contribute Modal */}
      {selectedGoal && (
        <ContributeModal
          isOpen={!!selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onSuccess={() => {
            fetchStats();
            if (triggerRefresh) triggerRefresh();
          }}
          goal={selectedGoal}
        />
      )}
    </div>
  );
}

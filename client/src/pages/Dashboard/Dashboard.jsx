import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import StatsCard from '../../components/common/StatsCard';
import CategoryIcon from '../../components/common/CategoryIcon';
import ContributeModal from '../../components/goals/ContributeModal';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Activity,
  ArrowRight,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
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

const PIE_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#06b6d4', '#ef4444', '#64748b'];

export default function Dashboard() {
  const { refreshTrigger, onOpenAddTransaction, triggerRefresh } = useOutletContext() || {};
  const { formatCurrency, currentSymbol } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [chartView, setChartView] = useState('area'); // 'area' | 'bar'

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
        <div className="w-12 h-12 rounded-full border-4 border-brand-500/20 border-t-brand-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Loading Financial Insights...
        </p>
      </div>
    );
  }

  const summary = stats?.summary || {};
  const monthlyTrends = stats?.monthlyTrends || [];
  const categoryStats = stats?.categoryStats || [];
  const recentTransactions = stats?.recentTransactions || [];
  const goals = stats?.goals || [];

  return (
    <div className="space-y-6">
      {/* Top Banner Stat Card (Net Worth Focus) */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 glass-panel border border-brand-500/30 bg-gradient-to-r from-brand-950/60 via-slate-900/80 to-slate-900/90 shadow-glow">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-brand-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-extrabold uppercase tracking-wider">Total Net Balance</span>
            </div>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {formatCurrency(summary.netBalance || 0)}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-300">
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                Savings Rate: <strong className="text-emerald-400">{summary.savingsRate || 0}%</strong>
              </span>
              <span className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                Financial Score: <strong className="text-brand-400">{summary.financialHealthScore || 50}/100</strong>
              </span>
              <span className="text-slate-400">
                {summary.totalTransactions || 0} Total Transactions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onOpenAddTransaction}
              className="flex-1 md:flex-initial flex items-center justify-center space-x-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-glow transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
            <Link
              to="/reports"
              className="flex items-center justify-center space-x-1.5 px-4 py-3 rounded-2xl text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-colors"
            >
              <span>Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="This Month Income"
          value={formatCurrency(summary.thisMonthIncome || 0)}
          icon={TrendingUp}
          color="emerald"
          trend={summary.incomeGrowth}
          trendLabel="vs last mo"
        />
        <StatsCard
          title="This Month Expenses"
          value={formatCurrency(summary.thisMonthExpense || 0)}
          icon={TrendingDown}
          color="rose"
          trend={summary.expenseGrowth}
          trendLabel="vs last mo"
        />
        <StatsCard
          title="This Month Net Savings"
          value={formatCurrency(summary.thisMonthNet || 0)}
          icon={PiggyBank}
          color={summary.thisMonthNet >= 0 ? 'brand' : 'rose'}
          subtitle={summary.thisMonthNet >= 0 ? 'Surplus cash flow' : 'Deficit this month'}
        />
        <StatsCard
          title="Financial Health"
          value={`${summary.financialHealthScore || 50}/100`}
          icon={Activity}
          color="cyan"
          badge={
            summary.financialHealthScore >= 75
              ? 'Excellent'
              : summary.financialHealthScore >= 50
              ? 'Good'
              : 'Needs Focus'
          }
          subtitle="Based on savings & budgets"
        />
      </div>

      {/* Charts Grid: Monthly Trend & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Income vs Expense Chart (2 columns) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Cash Flow & Trends
              </h3>
              <p className="text-xs text-slate-400">Past 6 months income vs. expense flow</p>
            </div>

            <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setChartView('area')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  chartView === 'area'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartView('bar')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  chartView === 'bar'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bar
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {monthlyTrends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No transaction history yet. Add transactions or click "Seed Demo Data".
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'area' ? (
                  <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `${currentSymbol}${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      formatter={(val) => [formatCurrency(val), '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
                  </AreaChart>
                ) : (
                  <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `${currentSymbol}${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      formatter={(val) => [formatCurrency(val), '']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown (1 column) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Top Spending
              </h3>
              <p className="text-xs text-slate-400">By category share</p>
            </div>
            <Link to="/reports" className="text-xs font-bold text-brand-400 hover:text-brand-300">
              Details →
            </Link>
          </div>

          <div className="h-52 w-full">
            {categoryStats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
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
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(val) => [formatCurrency(val), 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top 3 Categories Pill list */}
          <div className="space-y-2 mt-2 pt-2 border-t border-slate-800/80">
            {categoryStats.slice(0, 3).map((c, idx) => (
              <div key={c._id} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  <span className="text-slate-300 font-medium truncate">{c._id}</span>
                </div>
                <span className="font-bold text-white">{formatCurrency(c.total)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List (2 columns) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-400">Latest financial activities</p>
            </div>
            <Link
              to="/transactions"
              className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No transactions found. Click "Add Transaction" or "Seed Demo Data" above.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {recentTransactions.map((tx) => (
                <div
                  key={tx._id}
                  className="py-3 flex items-center justify-between hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <CategoryIcon category={tx.category} type={tx.type} size="md" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white">{tx.title}</h4>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{tx.category}</span>
                        <span>•</span>
                        <span>{format(new Date(tx.date), 'MMM dd, yyyy')}</span>
                        <span>•</span>
                        <span className="text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded text-[10px]">
                          {tx.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs sm:text-sm font-extrabold ${
                        tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Savings Goals Widget (1 column) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Savings Goals
                </h3>
                <p className="text-xs text-slate-400">Milestone targets</p>
              </div>
              <Link to="/goals" className="text-xs font-bold text-brand-400 hover:text-brand-300">
                Manage →
              </Link>
            </div>

            {goals.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No savings goals created yet.
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((g) => {
                  const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                  return (
                    <div key={g._id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-white truncate">{g.name}</span>
                        <span className="text-xs font-black text-brand-400">{progress}%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: g.color || '#8b5cf6',
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{formatCurrency(g.currentAmount)}</span>
                        <span>Target: {formatCurrency(g.targetAmount)}</span>
                      </div>

                      <button
                        onClick={() => setSelectedGoal(g)}
                        className="w-full mt-2 py-1.5 rounded-lg bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 text-[11px] font-bold border border-brand-500/30 transition-colors flex items-center justify-center space-x-1"
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
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-bold border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
          >
            <span>Review Monthly Budgets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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

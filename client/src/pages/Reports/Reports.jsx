import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  CreditCard,
  Calendar,
  Sparkles,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import api from '../../api/axios';
import { format, subDays, startOfYear, startOfMonth } from 'date-fns';

const COLORS = [
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#3b82f6',
  '#06b6d4',
  '#ef4444',
  '#84cc16',
  '#d946ef',
  '#64748b',
];

export default function Reports() {
  const { formatCurrency, currentSymbol } = useCurrency();
  const [timeframe, setTimeframe] = useState('30days'); // '30days' | '90days' | 'year' | 'all' | 'custom'
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
    const today = new Date();
    const endStr = format(today, 'yyyy-MM-dd');
    setEndDate(endStr);

    if (tf === '30days') {
      setStartDate(format(subDays(today, 30), 'yyyy-MM-dd'));
    } else if (tf === '90days') {
      setStartDate(format(subDays(today, 90), 'yyyy-MM-dd'));
    } else if (tf === 'year') {
      setStartDate(format(startOfYear(today), 'yyyy-MM-dd'));
    } else if (tf === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/dashboard/reports', { params });
      setReportData(res.data.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  const categoryBreakdown = reportData?.categoryBreakdown || [];
  const incomeBreakdown = reportData?.incomeBreakdown || [];
  const paymentMethodStats = reportData?.paymentMethodStats || [];
  const dailyStats = reportData?.dailyStats || [];

  // Flatten daily stats for chart
  const dailyChartMap = {};
  dailyStats.forEach((item) => {
    const d = item._id.dateStr;
    if (!dailyChartMap[d]) dailyChartMap[d] = { date: d, income: 0, expense: 0 };
    if (item._id.type === 'income') dailyChartMap[d].income = item.total;
    if (item._id.type === 'expense') dailyChartMap[d].expense = item.total;
  });
  const dailyChartData = Object.values(dailyChartMap).sort((a, b) => a.date.localeCompare(b.date));

  const totalExpensePeriod = categoryBreakdown.reduce((acc, c) => acc + c.total, 0);
  const totalIncomePeriod = incomeBreakdown.reduce((acc, c) => acc + c.total, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Financial Intelligence & Analytics</h1>
          <p className="text-xs text-slate-400">
            Deep-dive visual analytics of spending categories, income streams, and payment distribution.
          </p>
        </div>

        {/* Timeframe Presets */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          {[
            { id: '30days', label: 'Last 30 Days' },
            { id: '90days', label: 'Last 90 Days' },
            { id: 'year', label: 'This Year' },
            { id: 'all', label: 'All Time' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTimeframeChange(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === item.id
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-brand-400" />
          <span className="text-slate-300 font-bold">Custom Analysis Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setTimeframe('custom');
              setStartDate(e.target.value);
            }}
            className="glass-input rounded-lg px-2.5 py-1 text-xs text-white"
          />
          <span className="text-slate-500">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setTimeframe('custom');
              setEndDate(e.target.value);
            }}
            className="glass-input rounded-lg px-2.5 py-1 text-xs text-white"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <span className="text-slate-400">Period Income: </span>
            <strong className="text-emerald-400">{formatCurrency(totalIncomePeriod)}</strong>
          </div>
          <div>
            <span className="text-slate-400">Period Expenses: </span>
            <strong className="text-rose-400">{formatCurrency(totalExpensePeriod)}</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs font-semibold text-slate-400 animate-pulse">
          Aggregating financial data...
        </div>
      ) : (
        <>
          {/* Charts Row 1: Category Breakdown & Income Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Category Breakdown Donut */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Expense Distribution by Category
                  </h3>
                  <p className="text-xs text-slate-400">Where your money went in this period</p>
                </div>
                <PieIcon className="w-5 h-5 text-brand-400" />
              </div>

              <div className="h-64 w-full">
                {categoryBreakdown.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No expense data found for this period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="total"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

              {/* Table Breakdown */}
              <div className="space-y-2 mt-4 max-h-44 overflow-y-auto pr-1">
                {categoryBreakdown.map((c, idx) => {
                  const pct = totalExpensePeriod > 0 ? Math.round((c.total / totalExpensePeriod) * 100) : 0;
                  return (
                    <div key={c._id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-none">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-slate-300 font-medium">{c._id}</span>
                        <span className="text-[10px] text-slate-500">({c.count} items)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white">{formatCurrency(c.total)}</span>
                        <span className="text-[10px] text-slate-400 ml-2 font-mono">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Income Streams Breakdown */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Income Streams Breakdown
                  </h3>
                  <p className="text-xs text-slate-400">Total earned across revenue categories</p>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>

              <div className="h-64 w-full">
                {incomeBreakdown.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No income records found for this period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="_id" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) => `${currentSymbol}${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val) => [formatCurrency(val), 'Earned']}
                      />
                      <Bar dataKey="total" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="space-y-2 mt-4 max-h-44 overflow-y-auto pr-1">
                {incomeBreakdown.map((c) => (
                  <div key={c._id} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-none">
                    <span className="text-slate-300 font-medium">{c._id}</span>
                    <span className="font-bold text-emerald-400">{formatCurrency(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Daily Cash Flow Timeline & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Timeline (2 columns) */}
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Daily Cash Flow Timeline
                  </h3>
                  <p className="text-xs text-slate-400">Day-by-day income and expense spikes</p>
                </div>
                <BarChart3 className="w-5 h-5 text-brand-400" />
              </div>

              <div className="h-64 w-full">
                {dailyChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No timeline points recorded in this range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(val) => `${currentSymbol}${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(val) => [formatCurrency(val), '']}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Payment Method Distribution (1 column) */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide">
                      Payment Channels
                    </h3>
                    <p className="text-xs text-slate-400">UPI, Cards, Cash shares</p>
                  </div>
                  <CreditCard className="w-5 h-5 text-amber-400" />
                </div>

                <div className="space-y-3 mt-4">
                  {paymentMethodStats.map((p, idx) => (
                    <div key={p._id} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-white">{p._id}</span>
                        <span className="text-slate-300">{formatCurrency(p.total)}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.count} transactions recorded
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Takeaway Note */}
              <div className="p-3.5 mt-4 rounded-2xl bg-brand-950/40 border border-brand-500/20 text-xs text-brand-300 leading-relaxed">
                💡 <strong>Optimization Insight:</strong> Regularly tracking payment channels helps identify subscription leaks and credit card reward opportunities.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

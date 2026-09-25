import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  CreditCard,
  Calendar,
  Sparkles,
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
import { format, subDays, startOfYear } from 'date-fns';

const COLORS = [
  '#E8450A',
  '#1f2937',
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#64748b',
];

export default function Reports() {
  const { formatCurrency, currentSymbol } = useCurrency();
  const [timeframe, setTimeframe] = useState('30days');
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financial Intelligence & Analytics</h1>
          <p className="text-xs text-gray-500">
            Deep-dive visual analytics of spending categories, income streams, and payment distribution.
          </p>
        </div>

        {/* Timeframe Presets */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-gray-100 rounded-xl border border-gray-200">
          {[
            { id: '30days', label: 'Last 30 Days' },
            { id: '90days', label: 'Last 90 Days' },
            { id: 'year', label: 'This Year' },
            { id: 'all', label: 'All Time' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleTimeframeChange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === item.id
                  ? 'bg-[#E8450A] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-[#E8450A]" />
          <span className="text-gray-700 font-bold">Custom Analysis Range:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setTimeframe('custom');
              setStartDate(e.target.value);
            }}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:border-[#E8450A]"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setTimeframe('custom');
              setEndDate(e.target.value);
            }}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:border-[#E8450A]"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <span className="text-gray-400">Period Income: </span>
            <strong className="text-emerald-600 font-bold">{formatCurrency(totalIncomePeriod)}</strong>
          </div>
          <div>
            <span className="text-gray-400">Period Expenses: </span>
            <strong className="text-red-600 font-bold">{formatCurrency(totalExpensePeriod)}</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs font-semibold text-gray-400 animate-pulse">
          Aggregating financial data...
        </div>
      ) : (
        <>
          {/* Charts Row 1: Category Breakdown & Income Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Category Breakdown Donut */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-wide">
                    Expense Distribution by Category
                  </h3>
                  <p className="text-xs text-gray-400">Where your money went in this period</p>
                </div>
                <PieIcon className="w-5 h-5 text-[#E8450A]" />
              </div>

              <div className="h-64 w-full">
                {categoryBreakdown.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
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
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#f3f4f6',
                          borderRadius: '12px',
                          fontSize: '11px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          color: '#1f2937',
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
                    <div key={c._id} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-none">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-gray-700 font-medium">{c._id}</span>
                        <span className="text-[10px] text-gray-400">({c.count} items)</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{formatCurrency(c.total)}</span>
                        <span className="text-[10px] text-gray-400 ml-2 font-mono">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Income Streams Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-wide">
                    Income Streams Breakdown
                  </h3>
                  <p className="text-xs text-gray-400">Total earned across revenue categories</p>
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>

              <div className="h-64 w-full">
                {incomeBreakdown.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    No income records found for this period.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={incomeBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="_id" stroke="#9ca3af" fontSize={10} tickLine={false} />
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
                          fontSize: '11px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          color: '#1f2937',
                        }}
                        formatter={(val) => [formatCurrency(val), 'Earned']}
                      />
                      <Bar dataKey="total" name="Income" fill="#E8450A" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="space-y-2 mt-4 max-h-44 overflow-y-auto pr-1">
                {incomeBreakdown.map((c) => (
                  <div key={c._id} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-none">
                    <span className="text-gray-700 font-medium">{c._id}</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Daily Cash Flow Timeline & Payment Channels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Timeline (2 columns) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 tracking-wide">
                    Daily Cash Flow Timeline
                  </h3>
                  <p className="text-xs text-gray-400">Day-by-day income and expense spikes</p>
                </div>
                <BarChart3 className="w-5 h-5 text-[#E8450A]" />
              </div>

              <div className="h-64 w-full">
                {dailyChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    No timeline points recorded in this range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} />
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
                          fontSize: '11px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                          color: '#1f2937',
                        }}
                        formatter={(val) => [formatCurrency(val), '']}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Line type="monotone" dataKey="income" name="Income" stroke="#E8450A" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="expense" name="Expense" stroke="#1f2937" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Payment Method Distribution (1 column) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 tracking-wide">
                      Payment Channels
                    </h3>
                    <p className="text-xs text-gray-400">UPI, Cards, Cash shares</p>
                  </div>
                  <CreditCard className="w-5 h-5 text-amber-500" />
                </div>

                <div className="space-y-3 mt-4">
                  {paymentMethodStats.map((p) => (
                    <div key={p._id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-gray-900">{p._id}</span>
                        <span className="text-gray-700">{formatCurrency(p.total)}</span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {p.count} transactions recorded
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Takeaway Note */}
              <div className="p-3.5 mt-4 rounded-xl bg-orange-50 border border-orange-100 text-xs text-gray-700 leading-relaxed">
                💡 <strong className="text-[#E8450A]">Insight:</strong> Regularly tracking payment channels helps identify recurring subscription leaks and cash flow patterns.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

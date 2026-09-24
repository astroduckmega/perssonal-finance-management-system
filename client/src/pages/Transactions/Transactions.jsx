import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import CategoryIcon from '../../components/common/CategoryIcon';
import TransactionModal from '../../components/transactions/TransactionModal';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../../utils/constants';
import {
  Search,
  Plus,
  Filter,
  Download,
  Trash2,
  Edit2,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  X,
  CreditCard,
  Tag,
} from 'lucide-react';
import api from '../../api/axios';
import { format } from 'date-fns';

export default function Transactions() {
  const { refreshTrigger, triggerRefresh, onOpenAddTransaction } = useOutletContext() || {};
  const { formatCurrency, currentSymbol } = useCurrency();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Edit modal state
  const [editTx, setEditTx] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 15,
        sortBy,
        sortOrder,
      };

      if (search) params.search = search;
      if (type !== 'all') params.type = type;
      if (category !== 'all') params.category = category;
      if (paymentMethod !== 'all') params.paymentMethod = paymentMethod;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/transactions', { params });
      setTransactions(res.data.data || []);
      setSummary(res.data.summary || { totalIncome: 0, totalExpense: 0, netBalance: 0 });
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, type, category, paymentMethod, startDate, endDate, sortBy, sortOrder, refreshTrigger]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setCategory('all');
    setPaymentMethod('all');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Date', 'Title', 'Type', 'Category', 'Amount', 'Payment Method', 'Notes'];
    const rows = transactions.map((t) => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      `"${t.category}"`,
      t.amount,
      t.paymentMethod,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinVibe_Transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allCategories = [
    ...new Set([...EXPENSE_CATEGORIES.map((c) => c.name), ...INCOME_CATEGORIES.map((c) => c.name)]),
  ];

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Transactions Ledger</h1>
          <p className="text-xs text-slate-400">
            View, filter, manage, and export all recorded income and expenses.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Filtered Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Filtered Income</div>
            <div className="text-lg font-bold text-emerald-400">{formatCurrency(summary.totalIncome)}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:border-l sm:border-slate-800 sm:pl-4">
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Filtered Expenses</div>
            <div className="text-lg font-bold text-rose-400">{formatCurrency(summary.totalExpense)}</div>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:border-l sm:border-slate-800 sm:pl-4">
          <div className="p-2.5 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400">
            <ArrowUpDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">Net Difference</div>
            <div
              className={`text-lg font-bold ${
                summary.netBalance >= 0 ? 'text-white' : 'text-rose-400'
              }`}
            >
              {formatCurrency(summary.netBalance, { showSign: true })}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, notes, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500"
            />
          </form>

          {/* Type Toggle Tabs */}
          <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
            {['all', 'expense', 'income'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  setCurrentPage(1);
                }}
                className={`flex-1 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                  type === t
                    ? t === 'income'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : t === 'expense'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white bg-slate-900"
            >
              <option value="all" className="bg-slate-900 text-white">
                All Categories
              </option>
              {allCategories.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs text-white bg-slate-900"
            >
              <option value="all" className="bg-slate-900 text-white">
                All Payment Methods
              </option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m} className="bg-slate-900 text-white">
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-brand-400" /> Range:
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input rounded-lg px-2.5 py-1 text-xs text-white"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="glass-input rounded-lg px-2.5 py-1 text-xs text-white"
            />
          </div>

          {(search || type !== 'all' || category !== 'all' || paymentMethod !== 'all' || startDate || endDate) && (
            <button
              onClick={handleResetFilters}
              className="flex items-center space-x-1 text-rose-400 hover:text-rose-300 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-slate-400 animate-pulse">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm font-bold text-white mb-1">No transactions found</p>
            <p className="text-xs text-slate-400 mb-4">
              Try adjusting your filters or record a new transaction.
            </p>
            <button
              onClick={onOpenAddTransaction}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-glow transition-all"
            >
              Add First Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Transaction</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Title + Notes */}
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex items-center space-x-3">
                        <CategoryIcon category={tx.category} type={tx.type} size="sm" />
                        <div>
                          <span className="font-bold text-white text-xs sm:text-sm">{tx.title}</span>
                          {tx.notes && (
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">{tx.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-300">{tx.category}</span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-4">
                      <span className="bg-slate-800/90 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded-lg text-[11px] font-medium">
                        {tx.paymentMethod}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400">
                      {format(new Date(tx.date), 'MMM dd, yyyy')}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-black text-xs sm:text-sm ${
                          tx.type === 'income' ? 'text-emerald-400' : 'text-slate-100'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setEditTx(tx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page <strong className="text-white">{currentPage}</strong> of{' '}
              <strong className="text-white">{totalPages}</strong> ({totalCount} items)
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      {editTx && (
        <TransactionModal
          isOpen={!!editTx}
          onClose={() => setEditTx(null)}
          onSuccess={() => {
            fetchTransactions();
            if (triggerRefresh) triggerRefresh();
          }}
          initialData={editTx}
        />
      )}
    </div>
  );
}

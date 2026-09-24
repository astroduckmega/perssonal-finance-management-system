import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import CategoryIcon from '../../components/common/CategoryIcon';
import BudgetModal from '../../components/budgets/BudgetModal';
import {
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  PieChart,
} from 'lucide-react';
import api from '../../api/axios';
import { format, addMonths, subMonths } from 'date-fns';

export default function Budgets() {
  const { refreshTrigger, triggerRefresh } = useOutletContext() || {};
  const { formatCurrency } = useCurrency();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [budgets, setBudgets] = useState([]);
  const [summary, setSummary] = useState({ totalBudgeted: 0, totalSpentInBudgets: 0, remainingBudget: 0, overallPercentage: 0 });
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editBudget, setEditBudget] = useState(null);

  const monthStr = format(currentDate, 'yyyy-MM');

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/budgets?month=${monthStr}`);
      setBudgets(res.data.data || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [monthStr, refreshTrigger]);

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this category budget?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error('Failed to delete budget:', err);
    }
  };

  const exceededBudgets = budgets.filter((b) => b.isExceeded);
  const warningBudgets = budgets.filter((b) => b.isWarning && !b.isExceeded);

  return (
    <div className="space-y-6">
      {/* Header with Month Navigator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Monthly Budgets</h1>
          <p className="text-xs text-slate-400">
            Set spending guardrails and stay in control of category expenses.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Month Switcher */}
          <div className="flex items-center space-x-1 glass-panel px-3 py-1.5 rounded-xl border border-slate-700">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-white px-2">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditBudget(null);
              setModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-xs font-bold text-white shadow-glow transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Overall Month Budget Overview Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {format(currentDate, 'MMMM')} Budget Utilization
            </span>
            <div className="text-2xl font-black text-white mt-0.5">
              {formatCurrency(summary.totalSpentInBudgets || 0)}{' '}
              <span className="text-sm font-semibold text-slate-400">
                / {formatCurrency(summary.totalBudgeted || 0)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Remaining Budget</div>
            <div
              className={`text-lg font-bold ${
                summary.remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(summary.remainingBudget || 0)}
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              summary.overallPercentage >= 100
                ? 'bg-rose-500 shadow-glow-rose'
                : summary.overallPercentage >= 80
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-brand-500 to-emerald-500'
            }`}
            style={{ width: `${Math.min(100, summary.overallPercentage || 0)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>{summary.overallPercentage || 0}% spent across all categories</span>
          <span>{budgets.length} active category budgets</span>
        </div>
      </div>

      {/* Over-budget alerts if any */}
      {exceededBudgets.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-300 text-xs animate-shake">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <div>
            <strong className="font-bold">Over-Budget Alert: </strong>
            You have exceeded your limit in{' '}
            {exceededBudgets.map((b) => b.category).join(', ')}.
          </div>
        </div>
      )}

      {/* Category Budget Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-slate-400 animate-pulse">
          Loading budgets...
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center border border-slate-800">
          <PieChart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">
            No Budgets Set for {format(currentDate, 'MMMM yyyy')}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
            Create monthly spending limits for categories like Groceries, Dining, Rent, or Shopping to stay disciplined.
          </p>
          <button
            onClick={() => {
              setEditBudget(null);
              setModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white shadow-glow transition-all"
          >
            Create First Category Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const isExceeded = b.isExceeded;
            const isWarning = b.isWarning && !isExceeded;

            return (
              <div
                key={b._id}
                className={`glass-panel rounded-3xl p-5 border transition-all duration-300 relative overflow-hidden ${
                  isExceeded
                    ? 'border-rose-500/50 shadow-glow-rose'
                    : isWarning
                    ? 'border-amber-500/40 hover:border-amber-500/60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <CategoryIcon category={b.category} type="expense" size="md" />
                    <div>
                      <h4 className="text-sm font-bold text-white">{b.category}</h4>
                      <span className="text-[11px] text-slate-400">Monthly Cap</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditBudget(b);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount info */}
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-xl font-extrabold text-white">
                      {formatCurrency(b.spent)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">
                      / {formatCurrency(b.amount)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-black ${
                      isExceeded
                        ? 'text-rose-400'
                        : isWarning
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {b.rawPercentage}%
                  </span>
                </div>

                {/* Meter Bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded
                        ? 'bg-rose-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  />
                </div>

                {/* Footer Status */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                  <div className="flex items-center space-x-1">
                    {isExceeded ? (
                      <span className="flex items-center text-rose-400 font-bold">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Over by {formatCurrency(b.spent - b.amount)}
                      </span>
                    ) : isWarning ? (
                      <span className="flex items-center text-amber-400 font-bold">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Approaching limit
                      </span>
                    ) : (
                      <span className="flex items-center text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Within budget
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400">
                    {b.remaining >= 0 ? `${formatCurrency(b.remaining)} left` : 'Exceeded'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Budget Create / Edit Modal */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditBudget(null);
        }}
        onSuccess={() => {
          fetchBudgets();
          if (triggerRefresh) triggerRefresh();
        }}
        initialData={editBudget}
        defaultMonth={monthStr}
      />
    </div>
  );
}

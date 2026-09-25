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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Monthly Budgets</h1>
          <p className="text-xs text-gray-500">
            Set spending guardrails and stay in control of category expenses.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Month Switcher */}
          <div className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-gray-800 px-2">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditBudget(null);
              setModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#E8450A] hover:bg-[#d03d08] text-xs font-bold text-white shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Set Budget</span>
          </button>
        </div>
      </div>

      {/* Overall Month Budget Overview Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {format(currentDate, 'MMMM')} Budget Utilization
            </span>
            <div className="text-2xl font-extrabold text-gray-900 mt-0.5">
              {formatCurrency(summary.totalSpentInBudgets || 0)}{' '}
              <span className="text-sm font-semibold text-gray-400">
                / {formatCurrency(summary.totalBudgeted || 0)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-gray-400">Remaining Budget</div>
            <div
              className={`text-lg font-bold ${
                summary.remainingBudget >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(summary.remainingBudget || 0)}
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              summary.overallPercentage >= 100
                ? 'bg-red-500'
                : summary.overallPercentage >= 80
                ? 'bg-amber-500'
                : 'bg-[#E8450A]'
            }`}
            style={{ width: `${Math.min(100, summary.overallPercentage || 0)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
          <span>{summary.overallPercentage || 0}% spent across all categories</span>
          <span>{budgets.length} active category budgets</span>
        </div>
      </div>

      {/* Over-budget alerts if any */}
      {exceededBudgets.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center space-x-3 text-red-700 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
          <div>
            <strong className="font-bold">Over-Budget Alert: </strong>
            You have exceeded your limit in{' '}
            {exceededBudgets.map((b) => b.category).join(', ')}.
          </div>
        </div>
      )}

      {/* Category Budget Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-gray-400 animate-pulse">
          Loading budgets...
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">
            No Budgets Set for {format(currentDate, 'MMMM yyyy')}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Create monthly spending limits for categories like Groceries, Dining, Rent, or Shopping to stay disciplined.
          </p>
          <button
            onClick={() => {
              setEditBudget(null);
              setModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#E8450A] hover:bg-[#d03d08] text-xs font-bold text-white shadow-sm transition-all"
          >
            Create First Category Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((b) => {
            const isExceeded = b.isExceeded;
            const isWarning = b.isWarning && !b.isExceeded;

            return (
              <div
                key={b._id}
                className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-sm ${
                  isExceeded
                    ? 'border-red-200 bg-red-50/20'
                    : isWarning
                    ? 'border-amber-200'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <CategoryIcon category={b.category} type="expense" size="md" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{b.category}</h4>
                      <span className="text-[11px] text-gray-400">Monthly Cap</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditBudget(b);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amount info */}
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(b.spent)}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      / {formatCurrency(b.amount)}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      isExceeded
                        ? 'text-red-600'
                        : isWarning
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {b.rawPercentage}%
                  </span>
                </div>

                {/* Meter Bar */}
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded
                        ? 'bg-red-500'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-[#E8450A]'
                    }`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  />
                </div>

                {/* Footer Status */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    {isExceeded ? (
                      <span className="flex items-center text-red-600 font-bold">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Over by {formatCurrency(b.spent - b.amount)}
                      </span>
                    ) : isWarning ? (
                      <span className="flex items-center text-amber-600 font-bold">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Approaching limit
                      </span>
                    ) : (
                      <span className="flex items-center text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Within budget
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400">
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

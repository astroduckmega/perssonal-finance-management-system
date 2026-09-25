import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import GoalModal from '../../components/goals/GoalModal';
import ContributeModal from '../../components/goals/ContributeModal';
import {
  Target,
  Plus,
  Trophy,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import api from '../../api/axios';
import { format } from 'date-fns';

export default function Goals() {
  const { refreshTrigger, triggerRefresh } = useOutletContext() || {};
  const { formatCurrency } = useCurrency();

  const [goals, setGoals] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [expandedHistory, setExpandedHistory] = useState({});

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/goals');
      setGoals(res.data.data || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const toggleHistory = (goalId) => {
    setExpandedHistory((prev) => ({
      ...prev,
      [goalId]: !prev[goalId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Savings Goals</h1>
          <p className="text-xs text-gray-500">
            Set ambitious targets, track milestones, and turn your financial dreams into reality.
          </p>
        </div>

        <button
          onClick={() => {
            setEditGoal(null);
            setModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#E8450A] hover:bg-[#d03d08] text-xs font-bold text-white shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Summary Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase mb-1">
            <span>Total Saved</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {formatCurrency(summary.totalSaved || 0)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Across all savings goals</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase mb-1">
            <span>Combined Target</span>
            <Target className="w-4 h-4 text-[#E8450A]" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            {formatCurrency(summary.totalTarget || 0)}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Overall target sum</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase mb-1">
            <span>Overall Progress</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">
            {summary.overallProgress || 0}%
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Total funded ratio</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase mb-1">
            <span>Completed</span>
            <Trophy className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900">
            {summary.completedGoals || 0}{' '}
            <span className="text-xs font-semibold text-gray-400">
              / {summary.totalGoals || 0}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Goals fully funded</p>
        </div>
      </div>

      {/* Goals Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-semibold text-gray-400 animate-pulse">
          Loading savings goals...
        </div>
      ) : goals.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 mb-1">No Savings Goals Set Yet</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
            Create a goal like an Emergency Fund, a dream vacation, or a gadget upgrade to track your milestone savings.
          </p>
          <button
            onClick={() => {
              setEditGoal(null);
              setModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#E8450A] hover:bg-[#d03d08] text-xs font-bold text-white shadow-sm transition-all"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((g) => {
            const isCompleted = g.isCompleted;
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);
            const historyExpanded = !!expandedHistory[g._id];

            return (
              <div
                key={g._id}
                className={`bg-white rounded-2xl p-6 border transition-all duration-200 shadow-sm flex flex-col justify-between ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs font-bold"
                        style={{ backgroundColor: g.color || '#E8450A' }}
                      >
                        {isCompleted ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-gray-900 tracking-tight">{g.name}</h3>
                        <span className="text-xs text-gray-400 font-medium">{g.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditGoal(g);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        title="Edit Goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(g._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts & Percent */}
                  <div className="flex items-baseline justify-between mb-2">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {formatCurrency(g.currentAmount)}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">
                        / {formatCurrency(g.targetAmount)}
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold"
                      style={{ color: isCompleted ? '#10b981' : g.color || '#E8450A' }}
                    >
                      {g.progress}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${g.progress}%`,
                        backgroundColor: isCompleted ? '#10b981' : g.color || '#E8450A',
                      }}
                    />
                  </div>

                  {/* Status & Deadline */}
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>Due {format(new Date(g.deadline), 'MMM dd, yyyy')}</span>
                    </div>

                    <div>
                      {isCompleted ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Completed 🎉
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
                          <Clock className="w-3 h-3 mr-1 text-[#E8450A]" />
                          {g.daysRemaining} days left
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Contribute & History Toggle */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setContributeGoal(g)}
                      className="flex-1 py-2 px-4 rounded-xl text-xs font-bold text-white bg-[#E8450A] hover:bg-[#d03d08] shadow-sm transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Add More Funds' : 'Contribute Funds'}</span>
                    </button>

                    {g.contributions?.length > 0 && (
                      <button
                        onClick={() => toggleHistory(g._id)}
                        className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold border border-gray-200 flex items-center space-x-1 transition-colors"
                        title="View Contributions Log"
                      >
                        <span>{g.contributions.length} log</span>
                        {historyExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expanded Contributions History */}
                  {historyExpanded && g.contributions?.length > 0 && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2 max-h-40 overflow-y-auto text-xs animate-slide-up">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Contribution History
                      </div>
                      {g.contributions.map((c, i) => (
                        <div key={i} className="flex items-center justify-between text-gray-700 py-1 border-b border-gray-200/60 last:border-none">
                          <div>
                            <span className="font-bold text-emerald-600">+{formatCurrency(c.amount)}</span>
                            {c.notes && <span className="text-gray-400 ml-2">({c.notes})</span>}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {format(new Date(c.date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Create / Edit Modal */}
      <GoalModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditGoal(null);
        }}
        onSuccess={() => {
          fetchGoals();
          if (triggerRefresh) triggerRefresh();
        }}
        initialData={editGoal}
      />

      {/* Goal Contribution Modal */}
      <ContributeModal
        isOpen={!!contributeGoal}
        onClose={() => setContributeGoal(null)}
        onSuccess={() => {
          fetchGoals();
          if (triggerRefresh) triggerRefresh();
        }}
        goal={contributeGoal}
      />
    </div>
  );
}

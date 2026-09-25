import React from 'react';
import {
  Home,
  ShoppingCart,
  Utensils,
  Zap,
  Car,
  ShoppingBag,
  Film,
  HeartPulse,
  Plane,
  GraduationCap,
  Sparkles,
  CircleDot,
  Briefcase,
  Laptop,
  TrendingUp,
  Building2,
  Gift,
  Wallet,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../utils/constants';

const ICON_MAP = {
  Home,
  ShoppingCart,
  Utensils,
  Zap,
  Car,
  ShoppingBag,
  Film,
  HeartPulse,
  Plane,
  GraduationCap,
  Sparkles,
  CircleDot,
  Briefcase,
  Laptop,
  TrendingUp,
  Building2,
  Gift,
  Wallet,
  Target,
  ShieldCheck,
};

export default function CategoryIcon({ category, type = 'expense', size = 'md' }) {
  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  const catObj = allCategories.find((c) => c.name === category) || {
    icon: type === 'income' ? 'Wallet' : 'CircleDot',
    color: type === 'income' ? '#10b981' : '#E8450A',
  };

  const IconComp = ICON_MAP[catObj.icon] || (type === 'income' ? Wallet : CircleDot);

  const sizeClasses = {
    sm: 'w-7 h-7 p-1.5 text-xs',
    md: 'w-9 h-9 p-2 text-sm',
    lg: 'w-11 h-11 p-2.5 text-base',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4.5 h-4.5',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`rounded-xl flex items-center justify-center font-bold shadow-xs ${sizeClasses[size] || sizeClasses.md}`}
      style={{
        backgroundColor: `${catObj.color}15`,
        color: catObj.color,
        border: `1px solid ${catObj.color}30`,
      }}
    >
      <IconComp className={iconSizes[size] || iconSizes.md} />
    </div>
  );
}

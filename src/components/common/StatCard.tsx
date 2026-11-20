import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'purple' | 'slate';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
  onClick,
}) => {
  const colorStyles = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-400',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-400',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-400',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-400',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'hover:border-indigo-400',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-400',
    },
    slate: {
      bg: 'bg-slate-100 dark:bg-slate-800',
      text: 'text-slate-600 dark:text-slate-400',
      border: 'hover:border-slate-400',
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + colorStyles.border : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={`text-xs font-medium mt-2 flex items-center gap-1 ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span> {trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorStyles.bg} ${colorStyles.text}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

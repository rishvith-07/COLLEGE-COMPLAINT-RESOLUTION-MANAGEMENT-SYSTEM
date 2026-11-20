import React from 'react';
import { ComplaintPriority } from '../../types';
import { AlertCircle, Flame, ShieldAlert, Clock } from 'lucide-react';

interface PriorityBadgeProps {
  priority: ComplaintPriority;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true }) => {
  const getConfig = (pr: ComplaintPriority) => {
    switch (pr) {
      case 'LOW':
        return {
          label: 'Low',
          classes: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          icon: Clock,
        };
      case 'MEDIUM':
        return {
          label: 'Medium',
          classes: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
          icon: AlertCircle,
        };
      case 'HIGH':
        return {
          label: 'High',
          classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
          icon: ShieldAlert,
        };
      case 'URGENT':
        return {
          label: 'Urgent',
          classes: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 font-bold',
          icon: Flame,
        };
      default:
        return {
          label: pr,
          classes: 'bg-gray-100 text-gray-700',
          icon: AlertCircle,
        };
    }
  };

  const config = getConfig(priority);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium uppercase tracking-wider ${config.classes}`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  );
};

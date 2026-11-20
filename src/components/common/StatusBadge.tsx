import React from 'react';
import { ComplaintStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (st: ComplaintStatus) => {
    switch (st) {
      case 'SUBMITTED':
        return {
          label: 'Submitted',
          classes: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500',
        };
      case 'UNDER_REVIEW':
        return {
          label: 'Under Review',
          classes: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-950/50 dark:text-yellow-300 dark:border-yellow-800',
          dot: 'bg-yellow-500',
        };
      case 'ASSIGNED':
        return {
          label: 'Assigned',
          classes: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
          dot: 'bg-blue-500',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          classes: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800',
          dot: 'bg-indigo-500 animate-pulse',
        };
      case 'WAITING_FOR_STUDENT':
        return {
          label: 'Waiting for Student',
          classes: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
          dot: 'bg-purple-500',
        };
      case 'ESCALATED':
        return {
          label: 'Escalated',
          classes: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
          dot: 'bg-rose-600 animate-ping',
        };
      case 'RESOLVED':
        return {
          label: 'Resolved',
          classes: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'CLOSED':
        return {
          label: 'Closed',
          classes: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
      case 'REJECTED':
        return {
          label: 'Rejected',
          classes: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800',
          dot: 'bg-red-500',
        };
      default:
        return {
          label: st,
          classes: 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300',
          dot: 'bg-gray-400',
        };
    }
  };

  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-semibold px-3 py-1.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${config.classes} ${sizeClasses} transition-colors`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

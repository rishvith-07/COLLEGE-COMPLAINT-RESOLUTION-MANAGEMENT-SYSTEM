import React from 'react';
import { ComplaintHistory } from '../../types';
import {
  CheckCircle,
  Clock,
  UserCheck,
  Search,
  HelpCircle,
  Flame,
  RotateCcw,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface ComplaintTimelineProps {
  history: ComplaintHistory[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ history }) => {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'SUBMITTED':
        return <FileCheck className="w-4 h-4 text-blue-600" />;
      case 'ASSIGNED':
        return <UserCheck className="w-4 h-4 text-indigo-600" />;
      case 'STATUS_CHANGE':
        return <Search className="w-4 h-4 text-amber-600" />;
      case 'INFO_REQUESTED':
        return <HelpCircle className="w-4 h-4 text-purple-600" />;
      case 'ESCALATED':
        return <Flame className="w-4 h-4 text-rose-600" />;
      case 'RESOLVED':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'REOPENED':
        return <RotateCcw className="w-4 h-4 text-orange-600" />;
      case 'CLOSED':
        return <CheckCircle className="w-4 h-4 text-slate-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getActionTitle = (item: ComplaintHistory) => {
    if (item.action === 'SUBMITTED') return 'Complaint Lodged';
    if (item.action === 'ASSIGNED') return 'Assigned for Redressal';
    if (item.action === 'INFO_REQUESTED') return 'Clarification Requested';
    if (item.action === 'ESCALATED') return 'Escalated to Higher Authority';
    if (item.action === 'RESOLVED') return 'Resolution Provided';
    if (item.action === 'REOPENED') return 'Complaint Reopened by Student';
    if (item.action === 'CLOSED') return 'Complaint Formally Closed';
    if (item.newStatus) return `Status Transition: ${item.newStatus.replace('_', ' ')}`;
    return item.action;
  };

  if (!history || history.length === 0) {
    return <div className="text-xs text-slate-400 py-3">No history recorded yet.</div>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {history.map((item) => (
        <div key={item.id} className="relative group">
          {/* Node Icon */}
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-500 transition-colors">
            {getActionIcon(item.action)}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 transition-all hover:shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {getActionTitle(item)}
              </span>
              <span className="text-[11px] text-slate-400">
                {new Date(item.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {item.notes && (
              <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {item.notes}
              </p>
            )}

            <div className="mt-2 text-[10px] text-slate-400 font-medium">
              Action by: <span className="text-slate-600 dark:text-slate-300">{item.performedBy?.fullName || 'Campus Staff'}</span>
              {item.performedBy?.role && (
                <span className="ml-1 text-slate-400">({item.performedBy.role})</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

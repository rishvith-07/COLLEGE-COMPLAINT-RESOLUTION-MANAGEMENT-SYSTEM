import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
    </div>
    <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-12 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className="h-14 border-b border-slate-100 dark:border-slate-800/60 px-6 flex items-center justify-between"
      >
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6"></div>
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20"></div>
      </div>
    ))}
  </div>
);

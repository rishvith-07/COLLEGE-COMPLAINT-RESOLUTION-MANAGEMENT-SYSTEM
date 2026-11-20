import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4">
      <div className="p-4 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-4">
        <ShieldAlert className="w-12 h-12" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">404</h1>
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mt-1">
        Page Not Found
      </h2>
      <p className="text-xs text-slate-500 max-w-sm mt-2">
        The grievance record, view, or portal destination you requested does not exist or may have been relocated.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Portal
      </Link>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Mail, Lock, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login(email, password);
      if (res.success) {
        // AuthContext automatically stores user & token; redirect to home/dashboard router
        navigate('/');
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-blue-600 text-white shadow-lg mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Sign in to CampusResolve
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your grievance dashboard, submit complaints, or review redressed requests.
          </p>
        </div>

        {/* Demo Credentials Quick-Fill Panel */}
        <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-4 text-xs">
          <p className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 mb-2">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Quick Demo Accounts (Click to test roles):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('student@college.edu')}
              className="text-left p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-2xs"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200">Student</div>
              <div className="text-[10px] text-slate-400 truncate">student@college.edu</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('staff.cs@college.edu')}
              className="text-left p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-2xs"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200">Faculty/Staff</div>
              <div className="text-[10px] text-slate-400 truncate">staff.cs@college.edu</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('hod.cs@college.edu')}
              className="text-left p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-2xs"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200">Dept Head (HOD)</div>
              <div className="text-[10px] text-slate-400 truncate">hod.cs@college.edu</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemo('admin@college.edu')}
              className="text-left p-2 rounded-lg bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 hover:border-blue-500 transition-colors shadow-2xs"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200">Administrator</div>
              <div className="text-[10px] text-slate-400 truncate">admin@college.edu</div>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Password for all demo accounts: <code className="font-mono font-bold">password123</code>
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                College Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-50 transition-all"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Register as Student
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

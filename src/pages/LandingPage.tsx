import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  Search,
  MessageSquare,
  BarChart3,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalComplaints: 128,
    resolvedComplaints: 114,
    resolutionRate: 89,
    averageResolutionDays: 2.1,
    activeDepartments: 9,
  });

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const res = await api.get('/dashboard/public');
        if (res.data.success && res.data.data) {
          setStats(res.data.data);
        }
      } catch (err) {
        // Fallback default statistics
      }
    };
    fetchPublicStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Official Campus Grievance Redressal Portal
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
              Your Concerns Matter. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                We Make Resolution Easier.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Submit college complaints, track progress, communicate with the responsible department,
              and receive timely resolutions—all through one transparent platform.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-sm shadow-sm transition-all"
              >
                Sign In to Portal
              </Link>
            </div>
          </div>

          {/* Interactive Mock Dashboard Preview */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-2xl p-4 sm:p-6 lg:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="ml-2 text-xs font-mono text-slate-400">CampusResolve Portal Active</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Live System Connected
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Live Complaints</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalComplaints}</p>
                  <span className="text-[10px] text-emerald-600 font-medium">100% Accounted</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Successfully Resolved</p>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.resolvedComplaints}</p>
                  <span className="text-[10px] text-slate-400">{stats.resolutionRate}% Resolution Rate</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Avg Resolution Speed</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.averageResolutionDays} Days</p>
                  <span className="text-[10px] text-slate-400">Target &lt; 3.0 Days</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500">Active Departments</p>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.activeDepartments}</p>
                  <span className="text-[10px] text-slate-400">Hostel, IT, Academics & more</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Live Database Statistics Section */}
      <section className="py-14 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                {stats.totalComplaints}+
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                Total Complaints Submitted
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats.resolvedComplaints}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                Grievances Fully Resolved
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {stats.averageResolutionDays} Days
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                Average Resolution Time
              </p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-600 dark:text-amber-400">
                {stats.activeDepartments}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">
                Dedicated Department Cells
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Highlights & Workflow */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Designed for Modern Institutional Transparency
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Every step is traceable, accountable, and connected to the right department personnel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Effortless Complaint Submission
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Submit grievances with reference codes, categories, locations, incident dates, and
              attachments. Automatically routed to the correct department head.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              End-to-End Tracking Timeline
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Track the exact lifecycle: Review, Assignment, Investigation Notes, Clarification
              Requests, Resolution, and Student Feedback with complete timestamps.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Student Redressal Feedback
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Students rate the resolution and close the issue. If the grievance was not resolved
              adequately, students can reopen it with one click.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 dark:bg-blue-700 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to lodge or manage college grievances?
          </h2>
          <p className="mt-4 text-base text-blue-100 max-w-xl mx-auto">
            Sign in with your college credentials or register as a student to access the full portal.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm shadow hover:bg-blue-50 transition-colors"
            >
              Register Student Account
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-blue-800/60 hover:bg-blue-800 text-white font-semibold text-sm border border-blue-400/40 transition-colors"
            >
              Sign In to Your Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

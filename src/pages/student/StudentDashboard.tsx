import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Complaint, DashboardStats } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [awaitingResponse, setAwaitingResponse] = useState<Complaint[]>([]);
  const [dateRange, setDateRange] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/student?dateRange=${dateRange}`);
      if (res.data.success) {
        setStats(res.data.data.stats);
        setRecentComplaints(res.data.data.recentComplaints || []);
        setAwaitingResponse(res.data.data.awaitingStudent || []);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 mb-2">
            Student Redressal Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 mt-1 max-w-xl">
            {user?.course} • Roll ID: <span className="font-mono font-medium">{user?.studentOrEmpId}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/submit-complaint"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            Lodge New Complaint
          </Link>
        </div>
      </div>

      {/* Date Range Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-blue-600" />
          Filter Analytics Range:
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Time' },
            { id: 'MONTH', label: 'This Month' },
            { id: '3_MONTHS', label: 'Last 3 Months' },
            { id: '6_MONTHS', label: 'Last 6 Months' },
            { id: 'YEAR', label: 'This Year' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateRange(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                dateRange === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Complaints"
            value={stats?.total || 0}
            icon={FileText}
            color="blue"
            subtitle="Registered by you"
          />
          <StatCard
            title="In Progress"
            value={stats?.inProgress || 0}
            icon={Clock}
            color="indigo"
            subtitle="Under investigation"
          />
          <StatCard
            title="Action Needed"
            value={awaitingResponse.length}
            icon={HelpCircle}
            color="amber"
            subtitle="Staff awaiting reply"
          />
          <StatCard
            title="Resolved"
            value={stats?.resolved || 0}
            icon={CheckCircle2}
            color="emerald"
            subtitle={`${stats?.resolutionRate || 0}% resolution rate`}
          />
          <StatCard
            title="Rejected"
            value={stats?.rejected || 0}
            icon={AlertCircle}
            color="slate"
            subtitle="Non-applicable"
          />
        </div>
      )}

      {/* Urgent Alert Banner: Complaints Awaiting Student Response */}
      {awaitingResponse.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            Attention Needed: The department requested information on {awaitingResponse.length} complaint(s)
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400 mb-3">
            Please review the inquiry message and provide details so staff can proceed with resolving your issue.
          </p>
          <div className="space-y-2">
            {awaitingResponse.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 mr-2">
                    {c.referenceNumber}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{c.title}</span>
                </div>
                <Link
                  to={`/complaints/${c.id}`}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-xs transition-colors shrink-0"
                >
                  Reply Now →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Breakdown Donut Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Complaint Status Distribution
              </h3>
              <p className="text-xs text-slate-500">Live breakdown of your filed complaints</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              {stats?.total || 0} Total
            </span>
          </div>

          <div className="h-64 w-full">
            {stats && stats.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No complaint status data for selected range.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Complaints by Category
              </h3>
              <p className="text-xs text-slate-500">Frequency of issues reported across cells</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {stats && stats.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" name="Complaints" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category data recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Submission vs Resolution Velocity
            </h3>
            <p className="text-xs text-slate-500">Tracking monthly grievances handled</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Last 6 Months</span>
        </div>

        <div className="h-60 w-full">
          {stats && stats.monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSub)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorRes)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No trend data available.
            </div>
          )}
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Complaints
            </h3>
            <p className="text-xs text-slate-500">Your latest submitted grievances and their status</p>
          </div>
          <Link
            to="/my-complaints"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All My Complaints <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentComplaints.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No complaints filed yet"
              description="Have an academic, hostel, food, or campus infrastructure concern? Lodge your first complaint to start resolution."
              actionText="Lodge Complaint"
              onAction={() => (window.location.href = '/submit-complaint')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Reference No</th>
                  <th className="px-6 py-3">Title & Category</th>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Submitted</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentComplaints.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {c.referenceNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-400">{c.category?.name}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {c.department?.name || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        to={`/complaints/${c.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-medium text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

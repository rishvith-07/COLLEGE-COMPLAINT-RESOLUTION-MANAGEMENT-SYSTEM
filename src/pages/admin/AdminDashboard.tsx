import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { DashboardStats, Complaint, AuditLog } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Users,
  Building,
  Tag,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertOctagon,
  Download,
  Flame,
  ArrowRight,
  Activity,
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
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLog[]>([]);
  const [dateRange, setDateRange] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAdminDashboard();
  }, [dateRange]);

  const loadAdminDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dashboard/admin?dateRange=${dateRange}`);
      if (res.data.success) {
        setStats(res.data.data.stats);
        setRecentComplaints(res.data.data.recentComplaints || []);
        setRecentAuditLogs(res.data.data.recentAuditLogs || []);
      }
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/reports/export/csv', '_blank');
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-navy-900 to-blue-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 mb-2">
            Administrator Control Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Campus Grievance System Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Real-time tracking of institutional compliance, student grievances, and resolution benchmarks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all"
          >
            <Download className="w-4 h-4" />
            Export Complaints CSV
          </button>
          <Link
            to="/admin/complaints"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
          >
            Manage Master Register
          </Link>
        </div>
      </div>

      {/* Primary Institutional Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            title="Total Grievances"
            value={stats?.total || 0}
            icon={FileText}
            color="blue"
            subtitle="Logged across campus"
          />
          <StatCard
            title="Resolved"
            value={stats?.resolved || 0}
            icon={CheckCircle2}
            color="emerald"
            subtitle={`${stats?.resolutionRate || 0}% completion`}
          />
          <StatCard
            title="Urgent Escalate"
            value={stats?.escalated || 0}
            icon={Flame}
            color="rose"
            subtitle="High institutional level"
          />
          <StatCard
            title="Registered Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            color="indigo"
            subtitle={`${stats?.totalStudents || 0} students`}
          />
          <StatCard
            title="Active Depts"
            value={stats?.totalDepartments || 0}
            icon={Building}
            color="purple"
            subtitle="Staffed redressal units"
          />
          <StatCard
            title="Avg Resolution"
            value={`${stats?.avgResolutionDays || 0}d`}
            icon={Activity}
            color="amber"
            subtitle="Turnaround metric"
          />
        </div>
      )}

      {/* Quick Access Admin Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/admin/users"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all group"
        >
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">User Directory</h3>
          <p className="text-xs text-slate-500 mt-1">
            Manage students, faculty, staff roles, and account statuses.
          </p>
        </Link>

        <Link
          to="/admin/departments"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all group"
        >
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Departments</h3>
          <p className="text-xs text-slate-500 mt-1">
            Configure grievance cells, assign HODs, and office locations.
          </p>
        </Link>

        <Link
          to="/admin/categories"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all group"
        >
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
            <Tag className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Categories</h3>
          <p className="text-xs text-slate-500 mt-1">
            Maintain issue categories, default departments, and priority tags.
          </p>
        </Link>

        <Link
          to="/reports"
          className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all group"
        >
          <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Reports & Analytics</h3>
          <p className="text-xs text-slate-500 mt-1">
            Audit resolution performance, workloads, and download CSV reports.
          </p>
        </Link>
      </div>

      {/* Visual Analytics: Department Performance & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Comparison Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Department Redressal Workload
              </h3>
              <p className="text-xs text-slate-500">Total complaints assigned vs resolved per cell</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {stats && stats.departmentBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.departmentBreakdown}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
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
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="total" name="Total Assigned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No department breakdown available.
              </div>
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Campus-Wide Status Distribution
              </h3>
              <p className="text-xs text-slate-500">Ratio of grievances across operational stages</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              {stats?.total || 0} Total
            </span>
          </div>

          <div className="h-72 w-full">
            {stats && stats.statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
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
                No status data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Master Recent Complaints Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Latest Grievances Across College
            </h3>
            <p className="text-xs text-slate-500">Real-time submissions and assignments</p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Open Master Register <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Ref No</th>
                <th className="px-6 py-3.5">Title & Student</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Submitted</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentComplaints.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {c.referenceNumber}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                      {c.title}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {c.student?.fullName} ({c.student?.studentOrEmpId})
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
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
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold text-[11px] hover:bg-blue-100 transition-colors"
                    >
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

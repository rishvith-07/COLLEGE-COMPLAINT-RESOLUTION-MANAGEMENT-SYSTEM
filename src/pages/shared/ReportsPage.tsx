import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DashboardStats } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';
import {
  BarChart2,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  TrendingUp,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dateRange, setDateRange] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/overview?dateRange=${dateRange}`);
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.open(`/api/reports/export/csv?dateRange=${dateRange}`, '_blank');
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Grievance Redressal Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time data reporting on complaint resolution efficiency, department performance, and categories.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          Export Report as CSV
        </button>
      </div>

      {/* Date Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-blue-600" />
          Report Range:
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All Records' },
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

      {/* High-Level Benchmark Metrics */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Handled"
            value={stats?.total || 0}
            icon={BarChart2}
            color="blue"
            subtitle="Registered grievances"
          />
          <StatCard
            title="Resolution Rate"
            value={`${stats?.resolutionRate || 0}%`}
            icon={CheckCircle2}
            color="emerald"
            subtitle={`${stats?.resolved || 0} complaints resolved`}
          />
          <StatCard
            title="Average Turnaround"
            value={`${stats?.avgResolutionDays || 0} Days`}
            icon={Clock}
            color="indigo"
            subtitle="Benchmark: < 3.0 days"
          />
          <StatCard
            title="Overdue Targets"
            value={stats?.overdue || 0}
            icon={AlertTriangle}
            color="rose"
            subtitle="Exceeded resolution SLA"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Submission & Resolution Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Grievances Lodged vs Resolved (Trend)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Volume comparison across previous 6 months</p>

          <div className="h-72 w-full">
            {stats && stats.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="areaRes" x1="0" y1="0" x2="0" y2="1">
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
                  <Area
                    type="monotone"
                    dataKey="submitted"
                    name="Submitted"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#areaSub)"
                  />
                  <Area
                    type="monotone"
                    dataKey="resolved"
                    name="Resolved"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#areaRes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly trend data.
              </div>
            )}
          </div>
        </div>

        {/* Department Comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Department Performance Comparison
          </h3>
          <p className="text-xs text-slate-500 mb-4">Complaints logged vs resolved by college units</p>

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
                No department comparison data.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Category-Wise Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">Frequency of grievances by classification</p>

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
                  <Bar dataKey="count" name="Grievances" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No category data available.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Status Share
          </h3>
          <p className="text-xs text-slate-500 mb-4">Overall breakdown by resolution phase</p>

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
                No status data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

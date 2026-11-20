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
import { AssignModal } from '../../components/complaints/AssignModal';
import { ResolutionModal } from '../../components/complaints/ResolutionModal';
import {
  Briefcase,
  AlertOctagon,
  Clock,
  CheckCircle2,
  HelpCircle,
  Building,
  Flame,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [assignedComplaints, setAssignedComplaints] = useState<Complaint[]>([]);
  const [departmentComplaints, setDepartmentComplaints] = useState<Complaint[]>([]);
  const [urgentComplaints, setUrgentComplaints] = useState<Complaint[]>([]);
  const [overdueComplaints, setOverdueComplaints] = useState<Complaint[]>([]);
  const [activeTab, setActiveTab] = useState<'ASSIGNED' | 'DEPARTMENT'>('ASSIGNED');
  const [loading, setLoading] = useState<boolean>(true);

  // Quick Action Modals
  const [assignModalTarget, setAssignModalTarget] = useState<Complaint | null>(null);
  const [resolutionModalTarget, setResolutionModalTarget] = useState<Complaint | null>(null);

  useEffect(() => {
    loadStaffDashboard();
  }, []);

  const loadStaffDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/staff');
      if (res.data.success) {
        setStats(res.data.data.stats);
        setAssignedComplaints(res.data.data.assignedComplaints || []);
        setDepartmentComplaints(res.data.data.departmentComplaints || []);
        setUrgentComplaints(res.data.data.urgentComplaints || []);
        setOverdueComplaints(res.data.data.overdueComplaints || []);
      }
    } catch (err) {
      console.error('Failed to load staff dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentList = activeTab === 'ASSIGNED' ? assignedComplaints : departmentComplaints;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Staff Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 mb-2">
            {user?.role.replace('_', ' ')} Workstation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Officer Dashboard: {user?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200/80 mt-1">
            Department ID: <span className="font-mono">{user?.departmentId || 'General Redressal'}</span> • Employee ID: <span className="font-mono">{user?.studentOrEmpId}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/reports"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all"
          >
            Resolution Analytics
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title="Assigned to Me"
            value={assignedComplaints.length}
            icon={Briefcase}
            color="blue"
            subtitle="Pending your investigation"
          />
          <StatCard
            title="Dept In-Progress"
            value={departmentComplaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length}
            icon={Clock}
            color="indigo"
            subtitle="Under department action"
          />
          <StatCard
            title="Urgent Grievances"
            value={urgentComplaints.length}
            icon={Flame}
            color="rose"
            subtitle="High institutional priority"
          />
          <StatCard
            title="Overdue Targets"
            value={overdueComplaints.length}
            icon={AlertOctagon}
            color="amber"
            subtitle="Target date exceeded"
          />
          <StatCard
            title="Resolved"
            value={stats?.resolved || 0}
            icon={CheckCircle2}
            color="emerald"
            subtitle={`${stats?.resolutionRate || 0}% department score`}
          />
        </div>
      )}

      {/* Urgent or Overdue Attention Alert */}
      {(urgentComplaints.length > 0 || overdueComplaints.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {urgentComplaints.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-5 shadow-sm text-xs">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold mb-2">
                <Flame className="w-5 h-5 text-rose-600 shrink-0" />
                {urgentComplaints.length} Urgent Priority Grievances
              </div>
              <p className="text-rose-700 dark:text-rose-400 mb-3">
                Immediate intervention required as per student welfare mandate.
              </p>
              <div className="space-y-2">
                {urgentComplaints.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-slate-800"
                  >
                    <div className="truncate mr-2">
                      <span className="font-mono font-bold text-rose-600 mr-1.5">{c.referenceNumber}</span>
                      <span className="text-slate-800 dark:text-slate-200">{c.title}</span>
                    </div>
                    <Link
                      to={`/complaints/${c.id}`}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shrink-0"
                    >
                      Inspect →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {overdueComplaints.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-5 shadow-sm text-xs">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold mb-2">
                <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0" />
                {overdueComplaints.length} Overdue Resolution Deadlines
              </div>
              <p className="text-amber-700 dark:text-amber-400 mb-3">
                Target resolution timeframe passed. Update status or notify student.
              </p>
              <div className="space-y-2">
                {overdueComplaints.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800"
                  >
                    <div className="truncate mr-2">
                      <span className="font-mono font-bold text-amber-600 mr-1.5">{c.referenceNumber}</span>
                      <span className="text-slate-800 dark:text-slate-200">{c.title}</span>
                    </div>
                    <Link
                      to={`/complaints/${c.id}`}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shrink-0"
                    >
                      Resolve →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs and Complaints Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Tab Controls */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('ASSIGNED')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'ASSIGNED'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              My Assigned Complaints ({assignedComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab('DEPARTMENT')}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === 'DEPARTMENT'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              All Department Complaints ({departmentComplaints.length})
            </button>
          </div>

          <span className="text-xs text-slate-500">
            Showing <strong>{currentList.length}</strong> complaints
          </span>
        </div>

        {/* Table */}
        {currentList.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={activeTab === 'ASSIGNED' ? 'No assigned complaints' : 'No department complaints'}
              description="New student complaints submitted under your department will show here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Ref No</th>
                  <th className="px-6 py-3.5">Title & Student</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Target Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {currentList.map((c) => (
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
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Student: {c.student?.fullName || 'Student'} • {c.location || 'Campus'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {c.category?.name}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {c.expectedResolutionDate
                        ? new Date(c.expectedResolutionDate).toLocaleDateString()
                        : 'Not assigned'}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-1.5">
                      {(user?.role === 'DEPARTMENT_HEAD' || user?.role === 'ADMIN') && (
                        <button
                          onClick={() => setAssignModalTarget(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] hover:bg-indigo-100 transition-colors"
                        >
                          Assign
                        </button>
                      )}

                      {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                        <button
                          onClick={() => setResolutionModalTarget(c)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-sm transition-colors"
                        >
                          Resolve
                        </button>
                      )}

                      <Link
                        to={`/complaints/${c.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-[11px] text-slate-700 dark:text-slate-200 transition-colors"
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

      {/* Modals */}
      {assignModalTarget && (
        <AssignModal
          isOpen={!!assignModalTarget}
          onClose={() => setAssignModalTarget(null)}
          complaintId={assignModalTarget.id}
          currentDepartmentId={assignModalTarget.departmentId}
          currentAssignedUserId={assignModalTarget.assignedToUserId}
          onSuccess={() => {
            setAssignModalTarget(null);
            loadStaffDashboard();
          }}
        />
      )}

      {resolutionModalTarget && (
        <ResolutionModal
          isOpen={!!resolutionModalTarget}
          onClose={() => setResolutionModalTarget(null)}
          complaintId={resolutionModalTarget.id}
          referenceNumber={resolutionModalTarget.referenceNumber}
          onSuccess={() => {
            setResolutionModalTarget(null);
            loadStaffDashboard();
          }}
        />
      )}
    </div>
  );
};

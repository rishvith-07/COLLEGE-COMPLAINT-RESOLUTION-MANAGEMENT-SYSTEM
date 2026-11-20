import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Complaint, Department, ComplaintCategory, ComplaintStatus, ComplaintPriority } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { AssignModal } from '../../components/complaints/AssignModal';
import { ResolutionModal } from '../../components/complaints/ResolutionModal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Search,
  Filter,
  Download,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

export const AllComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [dateRange, setDateRange] = useState('ALL');

  // Modals
  const [assignTarget, setAssignTarget] = useState<Complaint | null>(null);
  const [resolutionTarget, setResolutionTarget] = useState<Complaint | null>(null);

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [search, statusFilter, priorityFilter, deptFilter, catFilter, dateRange]);

  const loadMetadata = async () => {
    try {
      const [deptRes, catRes] = await Promise.all([
        api.get('/departments'),
        api.get('/categories'),
      ]);
      if (deptRes.data.success) setDepartments(deptRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (deptFilter) params.append('departmentId', deptFilter);
      if (catFilter) params.append('categoryId', catFilter);
      if (dateRange && dateRange !== 'ALL') params.append('dateRange', dateRange);

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (statusFilter) params.append('status', statusFilter);
    if (priorityFilter) params.append('priority', priorityFilter);
    if (deptFilter) params.append('departmentId', deptFilter);
    if (catFilter) params.append('categoryId', catFilter);
    if (dateRange) params.append('dateRange', dateRange);

    window.open(`/api/reports/export/csv?${params.toString()}`, '_blank');
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setDeptFilter('');
    setCatFilter('');
    setDateRange('ALL');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Master Complaints Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Institutional overview of all student grievances, department assignments, and resolution statuses.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          Export Filtered CSV
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference #, title, or student..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          {/* Department */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_STUDENT">Waiting for Student</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>

        {(search || statusFilter || priorityFilter || deptFilter || catFilter) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500">
              Found <strong>{complaints.length}</strong> matching records
            </span>
            <button
              onClick={resetFilters}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints match filters"
          description="Try broadening your search or resetting category filters."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Ref No</th>
                  <th className="px-6 py-3.5">Title & Student</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Assigned Staff</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Submitted</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {complaints.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {c.referenceNumber}
                      {c.isReopened && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          Reopened
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {c.student?.fullName || 'Student'} • {c.location || 'Campus'}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                      {c.department?.name || 'General'}
                    </td>

                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {c.assignedTo ? (
                        <span className="font-medium text-slate-900 dark:text-white">
                          {c.assignedTo.fullName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setAssignTarget(c)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] hover:bg-indigo-100 transition-colors"
                      >
                        Assign
                      </button>

                      <Link
                        to={`/complaints/${c.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-[11px] text-slate-700 dark:text-slate-200 transition-colors"
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
      )}

      {/* Modals */}
      {assignTarget && (
        <AssignModal
          isOpen={!!assignTarget}
          onClose={() => setAssignTarget(null)}
          complaintId={assignTarget.id}
          currentDepartmentId={assignTarget.departmentId}
          currentAssignedUserId={assignTarget.assignedToUserId}
          onSuccess={() => {
            setAssignTarget(null);
            loadComplaints();
          }}
        />
      )}

      {resolutionTarget && (
        <ResolutionModal
          isOpen={!!resolutionTarget}
          onClose={() => setResolutionTarget(null)}
          complaintId={resolutionTarget.id}
          referenceNumber={resolutionTarget.referenceNumber}
          onSuccess={() => {
            setResolutionTarget(null);
            loadComplaints();
          }}
        />
      )}
    </div>
  );
};

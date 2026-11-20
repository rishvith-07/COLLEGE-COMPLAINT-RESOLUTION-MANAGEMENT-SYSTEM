import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Complaint, ComplaintCategory, ComplaintStatus, ComplaintPriority } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { FeedbackModal } from '../../components/complaints/FeedbackModal';
import { ReopenModal } from '../../components/complaints/ReopenModal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Search,
  Filter,
  PlusCircle,
  Star,
  RotateCcw,
  Clock,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

export const MyComplaintsPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Modals
  const [feedbackComplaint, setFeedbackComplaint] = useState<Complaint | null>(null);
  const [reopenComplaint, setReopenComplaint] = useState<Complaint | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [search, statusFilter, priorityFilter, categoryFilter]);

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
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
      if (categoryFilter) params.append('categoryId', categoryFilter);

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPriorityFilter('');
    setCategoryFilter('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My Complaints History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track grievances, reply to department queries, review solutions, and provide feedback.
          </p>
        </div>

        <Link
          to="/submit-complaint"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Lodge New Complaint
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference #, title, or location..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(search || statusFilter || priorityFilter || categoryFilter) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500">
              Showing filtered results: <strong>{complaints.length}</strong> matching complaint(s)
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

      {/* Complaints Listing */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description="Try adjusting your search criteria or lodge a new complaint."
          actionText="Lodge New Complaint"
          onAction={() => (window.location.href = '/submit-complaint')}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Reference No</th>
                  <th className="px-6 py-3.5">Complaint Title</th>
                  <th className="px-6 py-3.5">Department & Category</th>
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
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {c.location || 'Campus'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {c.department?.name || 'General'}
                      </div>
                      <div className="text-[11px] text-slate-400">{c.category?.name}</div>
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
                      {/* If Resolved and feedback not yet given */}
                      {c.status === 'RESOLVED' && !c.feedback && (
                        <button
                          onClick={() => setFeedbackComplaint(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-sm transition-colors"
                        >
                          <Star className="w-3 h-3 fill-white" /> Rate Fix
                        </button>
                      )}

                      {/* If Resolved or Closed, can Reopen */}
                      {(c.status === 'RESOLVED' || c.status === 'CLOSED') && (
                        <button
                          onClick={() => setReopenComplaint(c)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950 text-slate-700 dark:text-slate-300 font-semibold text-[11px] transition-colors"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-500" /> Reopen
                        </button>
                      )}

                      <Link
                        to={`/complaints/${c.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-600 dark:text-blue-400 font-semibold text-[11px] transition-colors"
                      >
                        Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackComplaint && (
        <FeedbackModal
          isOpen={!!feedbackComplaint}
          onClose={() => setFeedbackComplaint(null)}
          complaintId={feedbackComplaint.id}
          referenceNumber={feedbackComplaint.referenceNumber}
          onSuccess={() => {
            setFeedbackComplaint(null);
            loadComplaints();
          }}
        />
      )}

      {/* Reopen Modal */}
      {reopenComplaint && (
        <ReopenModal
          isOpen={!!reopenComplaint}
          onClose={() => setReopenComplaint(null)}
          complaintId={reopenComplaint.id}
          referenceNumber={reopenComplaint.referenceNumber}
          onSuccess={() => {
            setReopenComplaint(null);
            loadComplaints();
          }}
        />
      )}
    </div>
  );
};

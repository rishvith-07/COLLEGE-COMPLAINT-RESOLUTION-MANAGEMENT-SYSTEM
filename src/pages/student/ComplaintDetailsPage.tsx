import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Complaint, ComplaintHistory, ComplaintComment, ComplaintStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { ComplaintTimeline } from '../../components/complaints/ComplaintTimeline';
import { ComplaintCommentThread } from '../../components/complaints/ComplaintCommentThread';
import { AssignModal } from '../../components/complaints/AssignModal';
import { ResolutionModal } from '../../components/complaints/ResolutionModal';
import { FeedbackModal } from '../../components/complaints/FeedbackModal';
import { ReopenModal } from '../../components/complaints/ReopenModal';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  Tag,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Star,
  ShieldCheck,
  Send,
  Flame,
} from 'lucide-react';

export const ComplaintDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [history, setHistory] = useState<ComplaintHistory[]>([]);
  const [comments, setComments] = useState<ComplaintComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('IN_PROGRESS');
  const [statusNotes, setStatusNotes] = useState('');

  useEffect(() => {
    if (id) {
      loadComplaintData();
    }
  }, [id]);

  const loadComplaintData = async () => {
    try {
      setLoading(true);
      setError('');
      const [compRes, histRes, commRes] = await Promise.all([
        api.get(`/complaints/${id}`),
        api.get(`/complaints/${id}/history`),
        api.get(`/complaints/${id}/comments`),
      ]);

      if (compRes.data.success) {
        setComplaint(compRes.data.data);
      }
      if (histRes.data.success) {
        setHistory(histRes.data.data);
      }
      if (commRes.data.success) {
        setComments(commRes.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (message: string, isInternal: boolean) => {
    if (!complaint) return;
    const res = await api.post(`/complaints/${complaint.id}/comments`, {
      message,
      isInternal,
    });
    if (res.data.success) {
      setComments((prev) => [...prev, res.data.data]);
    }
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    try {
      const res = await api.put(`/complaints/${complaint.id}/status`, {
        status: newStatus,
        notes: statusNotes || undefined,
      });
      if (res.data.success) {
        setStatusUpdateOpen(false);
        setStatusNotes('');
        loadComplaintData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleEscalate = async () => {
    if (!complaint) return;
    const reason = prompt('Please enter reason for escalation to administration:');
    if (!reason) return;
    try {
      const res = await api.post(`/complaints/${complaint.id}/escalate`, { reason });
      if (res.data.success) {
        loadComplaintData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to escalate complaint.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-400">
        Loading complaint record and lifecycle logs...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Complaint Record Not Found
        </h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'This record might not exist or access is restricted.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isStaffOrAdmin =
    user?.role === 'STAFF' ||
    user?.role === 'FACULTY' ||
    user?.role === 'DEPARTMENT_HEAD' ||
    user?.role === 'ADMIN';

  const isMyComplaint = user?.id === complaint.studentId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Complaints
      </button>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md">
                {complaint.referenceNumber}
              </span>
              <StatusBadge status={complaint.status} size="md" />
              <PriorityBadge priority={complaint.priority} />
              {complaint.isReopened && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Reopened ({complaint.reopenCount}x)
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {complaint.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Student Actions */}
            {isMyComplaint && (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') && (
              <>
                {!complaint.feedback && (
                  <button
                    onClick={() => setFeedbackModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                  >
                    <Star className="w-4 h-4 fill-white" /> Rate Resolution
                  </button>
                )}
                <button
                  onClick={() => setReopenModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Reopen Grievance
                </button>
              </>
            )}

            {/* Staff / Admin Actions */}
            {isStaffOrAdmin && (
              <>
                <button
                  onClick={() => setAssignModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors"
                >
                  Assign Staff
                </button>
                <button
                  onClick={() => setStatusUpdateOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  Update Status
                </button>
                <button
                  onClick={() => setResolutionModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  Provide Resolution
                </button>
                <button
                  onClick={handleEscalate}
                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 transition-colors"
                  title="Escalate to Dean/Admin"
                >
                  <Flame className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Key Metadata Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Building className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Department</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {complaint.department?.name || 'General'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Tag className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Category</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {complaint.category?.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Location</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {complaint.location || 'Campus Facilities'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">Lodged Date</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Content & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Description, Resolution, Feedback, Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Grievance Description */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Grievance Description
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
          </div>

          {/* Official Resolution Card (if resolved) */}
          {complaint.resolution && (
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Official Redressal Resolution
                </div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {new Date(complaint.resolution.resolvedAt).toLocaleString()}
                </span>
              </div>

              <div className="text-xs text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
                <p className="font-semibold mb-1 text-emerald-900 dark:text-emerald-300">
                  Resolution Actions Taken:
                </p>
                <p className="leading-relaxed whitespace-pre-line">
                  {complaint.resolution.resolutionDescription}
                </p>

                {complaint.resolution.investigationSummary && (
                  <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900 text-slate-600 dark:text-slate-300">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-300 mb-0.5">
                      Investigation & Prevention Findings:
                    </p>
                    <p>{complaint.resolution.investigationSummary}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Student Feedback Card (if provided) */}
          {complaint.feedback && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Student Resolution Feedback
                </h3>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < complaint.feedback!.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                    {complaint.feedback.rating}/5
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                "{complaint.feedback.comments || 'No written comment provided.'}"
              </p>
            </div>
          )}

          {/* Discussion & Communication Thread */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Discussion & Redressal Inquiry Thread
            </h3>
            {user && (
              <ComplaintCommentThread
                comments={comments}
                currentUser={user}
                onPostComment={handlePostComment}
              />
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Personnel & Lifecycle Timeline */}
        <div className="space-y-6">
          {/* Assignment Information Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-xs space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100 dark:border-slate-800">
              Assigned Personnel
            </h4>

            <div>
              <span className="text-[10px] text-slate-400 uppercase">Assigned Staff</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {complaint.assignedTo ? complaint.assignedTo.fullName : 'Unassigned to individual'}
              </p>
              {complaint.assignedTo?.email && (
                <p className="text-[11px] text-slate-400">{complaint.assignedTo.email}</p>
              )}
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase">Expected Resolution Target</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {complaint.expectedResolutionDate
                  ? new Date(complaint.expectedResolutionDate).toLocaleDateString()
                  : 'Pending assignment'}
              </p>
            </div>

            {/* Student Info (for staff/admins) */}
            {isStaffOrAdmin && complaint.student && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Lodging Student</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {complaint.student.fullName} ({complaint.student.studentOrEmpId})
                </p>
                <p className="text-[11px] text-slate-400">{complaint.student.email}</p>
                {complaint.student.course && (
                  <p className="text-[11px] text-slate-400">{complaint.student.course}</p>
                )}
              </div>
            )}
          </div>

          {/* Lifecycle Tracking Timeline */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              Audit & Lifecycle Tracking
            </h4>
            <ComplaintTimeline history={history} />
          </div>
        </div>
      </div>

      {/* Staff Status Update Modal */}
      {statusUpdateOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setStatusUpdateOpen(false)} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Update Complaint Status
              </h3>
              <form onSubmit={handleStatusSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
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
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Investigation Log / Status Reason
                  </label>
                  <textarea
                    rows={3}
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="Enter reason for status transition or notes on current stage..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStatusUpdateOpen(false)}
                    className="px-4 py-2 text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl"
                  >
                    Save Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Specialized Action Modals */}
      <AssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        complaintId={complaint.id}
        currentDepartmentId={complaint.departmentId}
        currentAssignedUserId={complaint.assignedToUserId}
        onSuccess={loadComplaintData}
      />

      <ResolutionModal
        isOpen={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
        complaintId={complaint.id}
        referenceNumber={complaint.referenceNumber}
        onSuccess={loadComplaintData}
      />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        complaintId={complaint.id}
        referenceNumber={complaint.referenceNumber}
        onSuccess={loadComplaintData}
      />

      <ReopenModal
        isOpen={reopenModalOpen}
        onClose={() => setReopenModalOpen(false)}
        complaintId={complaint.id}
        referenceNumber={complaint.referenceNumber}
        onSuccess={loadComplaintData}
      />
    </div>
  );
};

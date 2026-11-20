import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import { CheckCircle2 } from 'lucide-react';

interface ResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string;
  referenceNumber: string;
  onSuccess: () => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  isOpen,
  onClose,
  complaintId,
  referenceNumber,
  onSuccess,
}) => {
  const [resolutionDescription, setResolutionDescription] = useState('');
  const [investigationSummary, setInvestigationSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionDescription.trim()) {
      setError('Resolution description is required.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.post(`/complaints/${complaintId}/resolve`, {
        resolutionDescription: resolutionDescription.trim(),
        investigationSummary: investigationSummary.trim() || null,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit resolution.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolve Complaint"
      subtitle={`Provide formal resolution details for complaint ${referenceNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Resolution Details & Corrective Action Taken <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={resolutionDescription}
            onChange={(e) => setResolutionDescription(e.target.value)}
            placeholder="Explain specifically what actions were performed to rectify the grievance (e.g. equipment replacement, technician repair, schedule adjustment)..."
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Investigation Findings & Root Cause Summary
          </label>
          <textarea
            rows={3}
            value={investigationSummary}
            onChange={(e) => setInvestigationSummary(e.target.value)}
            placeholder="Describe what inspection occurred, identified causes, or preventative guidelines..."
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Submitting this resolution marks the status as <strong>RESOLVED</strong>, creates an audit
            entry, and notifies the student to review the fix and submit satisfaction feedback.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Mark as Resolved'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

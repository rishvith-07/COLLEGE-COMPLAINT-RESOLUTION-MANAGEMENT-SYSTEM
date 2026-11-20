import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface ReopenModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string;
  referenceNumber: string;
  onSuccess: () => void;
}

export const ReopenModal: React.FC<ReopenModalProps> = ({
  isOpen,
  onClose,
  complaintId,
  referenceNumber,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please explain why you are reopening this complaint.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.post(`/complaints/${complaintId}/reopen`, {
        reason: reason.trim(),
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reopen complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reopen Grievance"
      subtitle={`Re-activate complaint ${referenceNumber} for further investigation`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Reopening changes the complaint status back to <strong>IN PROGRESS</strong>, preserves all
            historical resolution logs, and alerts the department head and assigned officer.
          </p>
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Reason for Reopening <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why the initial resolution was incomplete or if the problem has recurred..."
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
          />
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {submitting ? 'Reopening...' : 'Reopen Complaint'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string;
  referenceNumber: string;
  onSuccess: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  complaintId,
  referenceNumber,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [isSatisfied, setIsSatisfied] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const res = await api.post(`/complaints/${complaintId}/feedback`, {
        rating,
        comments: comments.trim() || null,
        isSatisfied,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resolution Feedback & Rating"
      subtitle={`Rate your redressal experience for complaint ${referenceNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <div className="text-center py-2">
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Overall Satisfaction Rating
          </label>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 text-slate-300 dark:text-slate-700 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-8 h-8 ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="inline-block mt-1 text-xs font-medium text-slate-500">
            {rating === 5 && '🌟 Exceptional Resolution'}
            {rating === 4 && '👍 Satisfactory & Helpful'}
            {rating === 3 && '😐 Average Resolution'}
            {rating === 2 && '👎 Below Expectation'}
            {rating === 1 && '⚠️ Highly Unsatisfactory'}
          </span>
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Was your concern fully resolved to your satisfaction?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsSatisfied(true)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold transition-all ${
                isSatisfied
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ThumbsUp className="w-4 h-4" /> Yes, Fully Resolved
            </button>
            <button
              type="button"
              onClick={() => setIsSatisfied(false)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-semibold transition-all ${
                !isSatisfied
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ThumbsDown className="w-4 h-4" /> No, Partially Resolved
            </button>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Comments & Feedback
          </label>
          <textarea
            rows={3}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Share your feedback on the staff response, promptness, or campus service quality..."
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit & Close Complaint'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

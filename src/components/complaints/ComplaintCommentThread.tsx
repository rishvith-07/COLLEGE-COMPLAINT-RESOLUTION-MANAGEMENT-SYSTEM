import React, { useState } from 'react';
import { ComplaintComment, SafeUser } from '../../types';
import { Send, Lock, User as UserIcon } from 'lucide-react';

interface ComplaintCommentThreadProps {
  comments: ComplaintComment[];
  currentUser: SafeUser;
  onPostComment: (message: string, isInternal: boolean) => Promise<void>;
  disabled?: boolean;
}

export const ComplaintCommentThread: React.FC<ComplaintCommentThreadProps> = ({
  comments,
  currentUser,
  onPostComment,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canPostInternal = currentUser.role !== 'STUDENT';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onPostComment(message.trim(), isInternal);
      setMessage('');
      setIsInternal(false);
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Messages List */}
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No discussion messages on this complaint yet.
          </div>
        ) : (
          comments.map((c) => {
            const isMe = c.authorId === currentUser.id;
            return (
              <div
                key={c.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {c.author?.fullName || 'User'}
                  </span>
                  <span className="text-[10px] text-slate-400">({c.author?.role})</span>
                  <span>•</span>
                  <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {c.isInternal && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      <Lock className="w-2.5 h-2.5" /> Internal
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                    c.isInternal
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800'
                      : isMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{c.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Box */}
      {!disabled && (
        <form onSubmit={handleSubmit} className="pt-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                currentUser.role === 'STUDENT'
                  ? 'Ask a question or provide requested information...'
                  : 'Write a response to student or internal staff note...'
              }
              className="w-full text-xs text-slate-900 dark:text-white bg-transparent border-0 focus:ring-0 resize-none placeholder-slate-400"
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              {canPostInternal ? (
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                  />
                  <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-400">
                    <Lock className="w-3 h-3" /> Internal Staff Note Only
                  </span>
                </label>
              ) : (
                <span className="text-[10px] text-slate-400">Visible to assigned department staff</span>
              )}

              <button
                type="submit"
                disabled={!message.trim() || isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

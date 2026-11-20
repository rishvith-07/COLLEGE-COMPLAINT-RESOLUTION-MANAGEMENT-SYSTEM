import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, CheckCheck, Clock, ExternalLink, Filter } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');
  const navigate = useNavigate();

  const filtered =
    filter === 'UNREAD' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time status alerts, assignment updates, information requests, and resolution notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs font-semibold">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            filter === 'UNREAD'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications received yet'}
            </p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.isRead) markRead(n.id);
                if (n.relatedComplaintId) {
                  navigate(`/complaints/${n.relatedComplaintId}`);
                }
              }}
              className={`p-5 text-xs transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start justify-between gap-4 ${
                !n.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                  <h4 className="font-bold text-slate-900 dark:text-white">{n.title}</h4>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {n.relatedComplaintId && (
                <span className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 shrink-0">
                  <ExternalLink className="w-4 h-4" />
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

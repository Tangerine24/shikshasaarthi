import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationApi } from '../../api';
import { NotificationItem } from '../../types';
import { Bell, CheckCircle2, Clock, Sparkles, CheckCheck } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const res = await notificationApi.list();
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      fetchNotifs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 font-body pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-surface p-6 rounded-card border border-border shadow-xs flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            <h1 className="font-heading font-bold text-2xl text-primary-dark">
              {t('nav.notifications', 'Notifications')}
            </h1>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Real-time updates regarding scholarship deadlines, eligibility matches, and application reviews.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1.5 p-2 rounded hover:bg-stone-100 transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="p-8 text-center text-text-muted">{t('common.loading', 'Loading notifications...')}</div>
      ) : notifications.length === 0 ? (
        <div className="bg-surface p-12 text-center rounded-card border border-border shadow-xs">
          <Bell className="w-12 h-12 text-text-muted mx-auto mb-2 opacity-40" />
          <p className="text-sm text-text-secondary">No notifications right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-card border transition flex items-start justify-between gap-4 shadow-xs ${
                n.isRead ? 'bg-surface border-border opacity-85' : 'bg-highlight border-emerald-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    n.isRead ? 'bg-stone-100 text-text-muted' : 'bg-primary text-surface'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-text-primary">{n.title}</h4>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{n.body}</p>
                  <span className="text-[11px] text-text-muted block mt-2">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="text-xs font-semibold text-primary hover:underline shrink-0"
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

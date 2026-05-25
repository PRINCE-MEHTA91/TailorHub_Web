import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL;

const NOTIF_ICONS = {
  order_placed:    { icon: '📦', bg: 'bg-blue-100',   ring: 'ring-blue-200',   text: 'text-blue-700'   },
  order_update:    { icon: '🔄', bg: 'bg-amber-100',  ring: 'ring-amber-200',  text: 'text-amber-700'  },
  order_completed: { icon: '✅', bg: 'bg-green-100',  ring: 'ring-green-200',  text: 'text-green-700'  },
  order_delivered: { icon: '🚚', bg: 'bg-emerald-100',ring: 'ring-emerald-200',text: 'text-emerald-700'},
  new_message:     { icon: '💬', bg: 'bg-indigo-100', ring: 'ring-indigo-200', text: 'text-indigo-700' },
  new_order:       { icon: '🛍️', bg: 'bg-purple-100', ring: 'ring-purple-200', text: 'text-purple-700' },
  payment:         { icon: '💰', bg: 'bg-orange-100', ring: 'ring-orange-200', text: 'text-orange-700' },
  feedback:        { icon: '⭐', bg: 'bg-yellow-100', ring: 'ring-yellow-200', text: 'text-yellow-700' },
  system:          { icon: '🔔', bg: 'bg-stone-100',  ring: 'ring-stone-200',  text: 'text-stone-700'  },
};

const timeAgo = (dateStr) => {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const groupByDate = (notifications) => {
  const groups = {};
  notifications.forEach(n => {
    const d = new Date(n.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let label;
    if (d.toDateString() === today.toDateString()) label = 'Today';
    else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
    else label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    if (!groups[label]) groups[label] = [];
    groups[label].push(n);
  });
  return groups;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount((data.notifications || []).filter(n => !n.is_read).length);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: 'POST',
        credentials: 'include',
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const markOneRead = async (id) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        credentials: 'include',
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) markOneRead(notif.id);
    // Navigate based on type
    if (notif.type === 'new_message') navigate('/chat');
    else if (notif.action_url) navigate(notif.action_url);
  };

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => n.type?.startsWith('order') || n.type === 'new_order');

  const grouped = groupByDate(filtered);
  const groupKeys = Object.keys(grouped);

  const dashboardPath = user?.role === 'tailor' ? '/tailor/dashboard' : '/customer/dashboard';

  const meta = (type) => NOTIF_ICONS[type] || NOTIF_ICONS.system;

  return (
    <div
      style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d1b2a 100%)' }}
      className="flex flex-col"
    >
      {/* ── Header ── */}
      <header
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        className="sticky top-0 z-50 flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'rgba(255,255,255,0.08)' }}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition"
          >
            ←
          </button>
          <div>
            <h1 className="text-white font-black text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-white/50 text-xs">{unreadCount} unread</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)' }}
              className="text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-indigo-500/30 transition"
            >
              Mark all read
            </button>
          )}
        </div>
      </header>

      {/* ── Filter Pills ── */}
      <div className="px-5 pt-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {[
          { id: 'all',    label: 'All',    emoji: '🔔' },
          { id: 'unread', label: 'Unread', emoji: '✨' },
          { id: 'orders', label: 'Orders', emoji: '📦' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={filter === f.id
              ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: '1px solid rgba(99,102,241,0.5)' }
              : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }
            }
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === f.id ? 'text-white shadow-lg' : 'text-white/60 hover:text-white/90'}`}
          >
            <span>{f.emoji}</span>
            {f.label}
            {f.id === 'unread' && unreadCount > 0 && (
              <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <main className="flex-1 px-4 py-3 pb-24 space-y-6 overflow-y-auto">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                className="rounded-2xl p-4 flex items-start gap-3 animate-pulse"
              >
                <div className="w-11 h-11 rounded-2xl bg-white/10 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 bg-white/10 rounded-full" />
                  <div className="h-2.5 w-1/2 bg-white/10 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              🔕
            </div>
            <p className="text-white/60 font-bold text-base mb-1">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </p>
            <p className="text-white/30 text-sm">
              {filter === 'unread' ? 'You have no unread notifications.' : 'Notifications will appear here when you get them.'}
            </p>
          </div>
        ) : (
          groupKeys.map(dateLabel => (
            <div key={dateLabel}>
              {/* Date separator */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <span className="text-white/40 text-[11px] font-bold uppercase tracking-widest">{dateLabel}</span>
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* Notification cards */}
              <div className="space-y-2">
                {grouped[dateLabel].map(notif => {
                  const m = meta(notif.type);
                  const isUnread = !notif.is_read;
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className="w-full text-left"
                    >
                      <div
                        style={{
                          background: isUnread
                            ? 'rgba(99, 102, 241, 0.12)'
                            : 'rgba(255,255,255,0.04)',
                          border: isUnread
                            ? '1px solid rgba(99, 102, 241, 0.3)'
                            : '1px solid rgba(255,255,255,0.07)',
                          transition: 'all 0.2s',
                        }}
                        className="rounded-2xl p-4 flex items-start gap-3 hover:brightness-110 active:scale-[0.99]"
                      >
                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-2xl ${m.bg} ring-2 ${m.ring} flex items-center justify-center text-xl flex-shrink-0`}>
                          {m.icon}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-bold leading-tight ${isUnread ? 'text-white' : 'text-white/70'}`}>
                              {notif.title}
                            </p>
                            <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                              <span className="text-white/30 text-[10px]">{timeAgo(notif.created_at)}</span>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                              )}
                            </div>
                          </div>
                          {notif.body && (
                            <p className={`text-xs mt-1 leading-relaxed ${isUnread ? 'text-white/60' : 'text-white/35'}`}>
                              {notif.body}
                            </p>
                          )}
                          {notif.action_label && (
                            <span
                              className={`inline-block mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full ${m.bg} ${m.text}`}
                            >
                              {notif.action_label} →
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>

      {/* ── Back to Dashboard Bar ── */}
      <div
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        className="fixed bottom-0 left-0 right-0 px-5 py-3 flex items-center justify-center gap-3"
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          className="flex items-center gap-2 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition"
        >
          ← Back to Dashboard
        </button>
        <button
          onClick={fetchNotifications}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition"
          title="Refresh"
        >
          🔄
        </button>
      </div>
    </div>
  );
}

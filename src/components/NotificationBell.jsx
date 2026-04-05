import { useState, useEffect } from 'react';
import { Bell, X, Clock, AlertTriangle, MapPin, Info, History, Bus, Timer } from 'lucide-react';
import { getSocket } from '../utils/socket';
import api from '../utils/api';

const typeConfig = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', emoji: 'ℹ️' },
  arrival: { icon: Bus, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', emoji: '🚌' },
  delay: { icon: Timer, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', emoji: '⏰' },
  warning: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', emoji: '⚠️' },
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    api.get('/notifications')
      .then(res => {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      })
      .catch(() => { });

    const socket = getSocket();
    if (socket) {
      socket.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }

    return () => {
      if (socket) socket.off('notification');
    };
  }, []);

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const markAllRead = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const recentNotifications = notifications.filter(n => {
    const age = (Date.now() - new Date(n.createdAt).getTime()) / 1000;
    return age < 86400; // last 24h
  });

  const displayList = showHistory ? notifications : recentNotifications;

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAllRead(); }}
        className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
      >
        <Bell className="w-5 h-5 text-white/70" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full animate-bounce-soft">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-14 w-[340px] sm:w-[420px] z-50 glass-card p-0 overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-white/10">
              <h3 className="text-base font-semibold text-white tracking-tight">Notifications</h3>
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex items-center gap-1 text-xs transition-colors ${showHistory ? 'text-primary-400' : 'text-white/40 hover:text-white/70'}`}
                >
                  <History className="w-3.5 h-3.5" />
                  {showHistory ? 'Recent' : 'History'}
                </button>
                {notifications.length > 0 && (
                  <button onClick={clearAll} className="text-xs text-white/40 hover:text-red-400 transition-colors">
                    Clear all
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white/70 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-[460px] overflow-y-auto">
              {displayList.length === 0 ? (
                <div className="p-10 text-center text-white/30">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-base font-medium mb-1">No notifications</p>
                  <p className="text-xs text-white/20">You're all caught up!</p>
                </div>
              ) : (
                displayList.slice(0, 30).map((notif, i) => {
                  const config = typeConfig[notif.type] || typeConfig.info;
                  const Icon = config.icon;
                  return (
                    <div
                      key={notif.id || i}
                      className={`flex gap-3.5 p-4 border-b border-white/5 hover:bg-white/5 transition-all duration-200 ${!notif.read ? 'bg-primary-500/5' : ''
                        }`}
                    >
                      <div className={`p-2.5 rounded-xl border flex-shrink-0 ${config.bg} ${config.border}`}>
                        <Icon className={`w-4.5 h-4.5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-relaxed text-white/85 font-normal">
                          <span className="mr-1">{config.emoji}</span>
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 text-white/30 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(notif.createdAt)}</span>
                          {!notif.read && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-primary-500" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {displayList.length > 0 && (
              <div className="p-3 border-t border-white/5 text-center">
                <p className="text-xs text-white/30">
                  Showing {Math.min(displayList.length, 30)} of {displayList.length} {showHistory ? 'all' : 'recent'} notifications
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

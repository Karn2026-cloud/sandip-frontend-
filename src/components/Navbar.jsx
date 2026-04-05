import { useAuth } from '../context/AuthContext';
import { LogOut, Bus } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();

  const roleLabels = { student: 'Student', driver: 'Driver', admin: 'Administrator' };
  const roleColors = {
    student: 'from-blue-500 to-indigo-600',
    driver: 'from-emerald-500 to-teal-600',
    admin: 'from-purple-500 to-pink-600',
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-gradient-to-r ${roleColors[user?.role] || roleColors.student} shadow-lg`}>
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Sandip Bus Tracker</h1>
              <p className="text-xs text-white/40 -mt-0.5">{roleLabels[user?.role] || 'Dashboard'}</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            {/* User info */}
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-white/10">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-white/40">{user?.id}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${roleColors[user?.role] || roleColors.student} flex items-center justify-center text-white font-semibold text-sm`}>
                {user?.name?.charAt(0) || '?'}
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-white/50 transition-all duration-300"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

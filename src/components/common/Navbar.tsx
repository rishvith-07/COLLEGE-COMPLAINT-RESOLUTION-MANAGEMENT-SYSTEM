import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  ShieldCheck,
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  PlusCircle,
  FileText,
  BarChart2,
  Users,
  Building,
  Tag,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, notifications, markRead, markAllRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserDropdownOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'DEPARTMENT_HEAD' || user.role === 'STAFF' || user.role === 'FACULTY')
      return '/staff';
    return '/dashboard';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to={getDashboardPath()} className="flex items-center gap-2.5 group">
              <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md group-hover:bg-blue-700 transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                  Campus<span className="text-blue-600 dark:text-blue-400">Resolve</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500">
                  Grievance Redressal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && user && (
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
              <Link
                to={getDashboardPath()}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  isActive(getDashboardPath())
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Dashboard
              </Link>

              {user.role === 'STUDENT' && (
                <>
                  <Link
                    to="/submit-complaint"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive('/submit-complaint')
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-blue-600" />
                    Lodge Complaint
                  </Link>
                  <Link
                    to="/my-complaints"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive('/my-complaints')
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    My Complaints
                  </Link>
                </>
              )}

              {(user.role === 'STAFF' || user.role === 'FACULTY' || user.role === 'DEPARTMENT_HEAD') && (
                <>
                  <Link
                    to="/staff/complaints"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      isActive('/staff/complaints')
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Manage Complaints
                  </Link>
                </>
              )}

              {user.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/complaints"
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      isActive('/admin/complaints')
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    All Complaints
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive('/admin/users')
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Users
                  </Link>
                  <Link
                    to="/admin/departments"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive('/admin/departments')
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    Depts
                  </Link>
                  <Link
                    to="/admin/categories"
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                      isActive('/admin/categories')
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    Categories
                  </Link>
                </>
              )}

              <Link
                to="/reports"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                  isActive('/reports')
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                Reports
              </Link>
            </div>
          )}

          {/* Right Controls: Theme, Notifications, Profile, Mobile Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated && (
              <>
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setUserDropdownOpen(false);
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50">
                      <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">
                          Notifications ({unreadCount} new)
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllRead()}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                        {notifications.length === 0 ? (
                          <div className="py-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                markRead(n.id);
                                if (n.relatedComplaintId) {
                                  navigate(`/complaints/${n.relatedComplaintId}`);
                                  setNotifDropdownOpen(false);
                                }
                              }}
                              className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                !n.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                  {n.title}
                                </span>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="pt-2 px-4 border-t border-slate-100 dark:border-slate-800 text-center">
                        <Link
                          to="/notifications"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(!userDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {user?.fullName.charAt(0)}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                        {user?.fullName.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">
                        {user?.role.replace('_', ' ')}
                      </span>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {user?.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {user?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/settings"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          Profile & Settings
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && isAuthenticated && user && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          <Link
            to={getDashboardPath()}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Dashboard
          </Link>
          {user.role === 'STUDENT' && (
            <>
              <Link
                to="/submit-complaint"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40"
              >
                + Lodge New Complaint
              </Link>
              <Link
                to="/my-complaints"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                My Complaints
              </Link>
            </>
          )}

          {(user.role === 'STAFF' || user.role === 'FACULTY' || user.role === 'DEPARTMENT_HEAD') && (
            <Link
              to="/staff/complaints"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Manage Department Complaints
            </Link>
          )}

          {user.role === 'ADMIN' && (
            <>
              <Link
                to="/admin/complaints"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                All Complaints Master
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                User Management
              </Link>
              <Link
                to="/admin/departments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Departments
              </Link>
              <Link
                to="/admin/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Complaint Categories
              </Link>
            </>
          )}

          <Link
            to="/reports"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Analytics & Reports
          </Link>
          <Link
            to="/settings"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

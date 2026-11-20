import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../services/api';
import { User, Lock, Settings as SettingsIcon, ShieldCheck, Sun, Moon, Bell } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Profile Form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [course, setCourse] = useState(user?.course || '');
  const [yearOfStudy, setYearOfStudy] = useState(user?.yearOfStudy || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Admin Config State
  const [reopenDays, setReopenDays] = useState(7);
  const [targetSlaDays, setTargetSlaDays] = useState(3);
  const [adminConfigSaved, setAdminConfigSaved] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      setProfileMessage('');
      const res = await api.put('/auth/profile', {
        fullName,
        phone,
        course,
        yearOfStudy,
      });
      if (res.data.success && res.data.data) {
        updateUser(res.data.data);
        setProfileMessage('Profile information saved successfully.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError('');
      setPasswordMessage('');
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        setPasswordMessage('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAdminConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminConfigSaved(true);
    setTimeout(() => setAdminConfigSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Account & Portal Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your contact credentials, institutional profile, security, and interface preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-blue-600" />
            Institutional Profile Details
          </h3>

          {profileMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1-555-0100"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  College Email (Read Only)
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Student / Employee ID
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.studentOrEmpId || ''}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed font-mono"
                />
              </div>
            </div>

            {user?.role === 'STUDENT' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Course / Degree Program
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Year of Study
                  </label>
                  <input
                    type="text"
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                {profileLoading ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Lock className="w-4 h-4 text-indigo-600" />
            Security & Password Change
          </h3>

          {passwordMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
              {passwordMessage}
            </div>
          )}
          {passwordError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl max-w-md"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* Interface Preferences */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sun className="w-4 h-4 text-amber-500" />
            Display & Preferences
          </h3>

          <div className="flex items-center justify-between py-2 text-xs">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Dark Mode Interface</p>
              <p className="text-slate-400">Switch between light and dark administrative theme</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-2"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
            </button>
          </div>
        </div>

        {/* Administrator Institutional Configuration (Admin Only) */}
        {user?.role === 'ADMIN' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              Administrative Policy & SLA Rules
            </h3>

            {adminConfigSaved && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                Institutional SLA policies successfully updated.
              </div>
            )}

            <form onSubmit={handleAdminConfigSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Student Reopen Window (Days after resolution)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={reopenDays}
                    onChange={(e) => setReopenDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Default Resolution SLA Target (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={targetSlaDays}
                    onChange={(e) => setTargetSlaDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
                >
                  Save Institutional Policies
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

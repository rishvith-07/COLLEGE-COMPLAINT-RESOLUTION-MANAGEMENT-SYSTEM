import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { SafeUser, Department, UserRole, UserStatus } from '../../types';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Building,
  CheckCircle,
  XCircle,
  Edit2,
  Mail,
  Hash,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<SafeUser | null>(null);

  // Create Form State
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    studentOrEmpId: '',
    role: 'STAFF' as UserRole,
    departmentId: '',
    phone: '',
  });

  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, deptFilter]);

  const loadDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (deptFilter) params.append('departmentId', deptFilter);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      setCreateError('');
      const res = await api.post('/users', createForm);
      if (res.data.success) {
        setCreateModalOpen(false);
        setCreateForm({
          fullName: '',
          email: '',
          password: '',
          studentOrEmpId: '',
          role: 'STAFF',
          departmentId: '',
          phone: '',
        });
        loadUsers();
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      const res = await api.put(`/users/${editUser.id}`, {
        fullName: editUser.fullName,
        role: editUser.role,
        departmentId: editUser.departmentId || null,
        phone: editUser.phone || null,
        status: editUser.status,
      });
      if (res.data.success) {
        setEditUser(null);
        loadUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const toggleStatus = async (user: SafeUser) => {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/users/${user.id}`, { status: nextStatus });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Institutional User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage administrative roles, department heads, faculty members, and registered students.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Add Faculty / Staff / Admin
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or Roll/Emp ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Institutional Roles</option>
            <option value="STUDENT">Student</option>
            <option value="STAFF">Staff</option>
            <option value="FACULTY">Faculty</option>
            <option value="DEPARTMENT_HEAD">Department Head</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">User & Roll / Emp ID</th>
                  <th className="px-6 py-3.5">College Email</th>
                  <th className="px-6 py-3.5">Institutional Role</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Registered</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {users.map((u) => {
                  const dept = departments.find((d) => d.id === u.departmentId);
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {u.fullName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          {u.studentOrEmpId}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {u.email}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : u.role === 'DEPARTMENT_HEAD'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : u.role === 'STAFF' || u.role === 'FACULTY'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {dept ? dept.name : 'Not assigned'}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? (
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-slate-400" />
                          )}
                          {u.status}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditUser(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Institutional User"
        subtitle="Provision an authorized faculty, department head, staff, or administrator account"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          {createError && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
              {createError}
            </div>
          )}

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={createForm.fullName}
              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
              placeholder="e.g. Dr. Vikram Patel"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Institutional Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="staff@college.edu"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Employee ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={createForm.studentOrEmpId}
                onChange={(e) => setCreateForm({ ...createForm, studentOrEmpId: e.target.value })}
                placeholder="EMP-FAC-099"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={createForm.role}
                onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="STAFF">Staff</option>
                <option value="FACULTY">Faculty</option>
                <option value="DEPARTMENT_HEAD">Department Head</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Assigned Department
              </label>
              <select
                value={createForm.departmentId}
                onChange={(e) => setCreateForm({ ...createForm, departmentId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="">-- No Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Temporary Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              placeholder="Min 6 characters"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
            >
              {createLoading ? 'Creating User...' : 'Provision Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      {editUser && (
        <Modal
          isOpen={!!editUser}
          onClose={() => setEditUser(null)}
          title="Edit User Permissions"
          subtitle={`Alter role or department access for ${editUser.fullName}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                required
                value={editUser.fullName}
                onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Role
                </label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="STUDENT">Student</option>
                  <option value="STAFF">Staff</option>
                  <option value="FACULTY">Faculty</option>
                  <option value="DEPARTMENT_HEAD">Department Head</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Department
                </label>
                <select
                  value={editUser.departmentId || ''}
                  onChange={(e) => setEditUser({ ...editUser, departmentId: e.target.value || null })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">-- No Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Account Status
              </label>
              <select
                value={editUser.status}
                onChange={(e) =>
                  setEditUser({ ...editUser, status: e.target.value as UserStatus })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

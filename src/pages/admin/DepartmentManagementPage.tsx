import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Department, SafeUser } from '../../types';
import { Modal } from '../../components/common/Modal';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { Building, Plus, Edit2, Mail, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';

export const DepartmentManagementPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staffList, setStaffList] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);

  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    officeLocation: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deptRes, staffRes] = await Promise.all([
        api.get('/departments'),
        api.get('/users/staff'),
      ]);
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
      }
      if (staffRes.data.success) {
        setStaffList(staffRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/departments', createForm);
      if (res.data.success) {
        setCreateModalOpen(false);
        setCreateForm({
          name: '',
          code: '',
          description: '',
          contactEmail: '',
          contactPhone: '',
          officeLocation: '',
        });
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create department.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDept) return;
    try {
      const res = await api.put(`/departments/${editDept.id}`, editDept);
      if (res.data.success) {
        setEditDept(null);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update department.');
    }
  };

  const toggleStatus = async (dept: Department) => {
    const nextStatus = dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/departments/${dept.id}`, { status: nextStatus });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Campus Departments & Redressal Units
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Maintain institutional branches, department head leadership, and official contact offices.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Department Cell
        </button>
      </div>

      {/* Departments Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Department Name & Code</th>
                  <th className="px-6 py-3.5">Department Head</th>
                  <th className="px-6 py-3.5">Office Location</th>
                  <th className="px-6 py-3.5">Contact Email & Phone</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {departments.map((d) => {
                  const hod = staffList.find((s) => s.id === d.headUserId);
                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{d.name}</div>
                        <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                          {d.code}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {hod ? hod.fullName : 'Head of Department Not Assigned'}
                        </div>
                        {hod && <div className="text-[11px] text-slate-400">{hod.email}</div>}
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        {d.officeLocation || 'Main Campus'}
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                        <div>{d.contactEmail || 'N/A'}</div>
                        <div className="text-[11px] text-slate-400">{d.contactPhone}</div>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(d)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                            d.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {d.status === 'ACTIVE' ? (
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-slate-400" />
                          )}
                          {d.status}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditDept(d)}
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

      {/* Create Department Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Department / Redressal Unit"
        subtitle="Create an official college unit capable of handling student complaints"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="e.g. Electrical Engineering"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={createForm.code}
                onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                placeholder="EE"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Department Mandate & Description
            </label>
            <textarea
              rows={2}
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Responsibilities and types of grievances handled..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Contact Email
              </label>
              <input
                type="email"
                value={createForm.contactEmail}
                onChange={(e) => setCreateForm({ ...createForm, contactEmail: e.target.value })}
                placeholder="dept@college.edu"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Contact Phone
              </label>
              <input
                type="text"
                value={createForm.contactPhone}
                onChange={(e) => setCreateForm({ ...createForm, contactPhone: e.target.value })}
                placeholder="+1-555-0199"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Office Location
            </label>
            <input
              type="text"
              value={createForm.officeLocation}
              onChange={(e) => setCreateForm({ ...createForm, officeLocation: e.target.value })}
              placeholder="Building B, Room 204"
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
            >
              Create Department
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Department Modal */}
      {editDept && (
        <Modal
          isOpen={!!editDept}
          onClose={() => setEditDept(null)}
          title="Edit Department Unit"
          subtitle={`Update configuration for ${editDept.name}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Department Name
              </label>
              <input
                type="text"
                required
                value={editDept.name}
                onChange={(e) => setEditDept({ ...editDept, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Designated Head of Department (HOD)
              </label>
              <select
                value={editDept.headUserId || ''}
                onChange={(e) => setEditDept({ ...editDept, headUserId: e.target.value || null })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="">-- No HOD Assigned --</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.role}) - {s.studentOrEmpId}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={editDept.contactEmail || ''}
                  onChange={(e) => setEditDept({ ...editDept, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Office Location
                </label>
                <input
                  type="text"
                  value={editDept.officeLocation || ''}
                  onChange={(e) => setEditDept({ ...editDept, officeLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditDept(null)}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Save Department
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

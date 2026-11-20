import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Department, SafeUser } from '../../types';
import api from '../../services/api';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  complaintId: string;
  currentDepartmentId: string;
  currentAssignedUserId?: string | null;
  onSuccess: () => void;
}

export const AssignModal: React.FC<AssignModalProps> = ({
  isOpen,
  onClose,
  complaintId,
  currentDepartmentId,
  currentAssignedUserId,
  onSuccess,
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [staffList, setStaffList] = useState<SafeUser[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(currentDepartmentId);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(currentAssignedUserId || '');
  const [expectedDate, setExpectedDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedDeptId(currentDepartmentId);
      setSelectedStaffId(currentAssignedUserId || '');
      loadDepartments();
      loadStaff(currentDepartmentId);
    }
  }, [isOpen, currentDepartmentId, currentAssignedUserId]);

  const loadDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.data.filter((d: Department) => d.status === 'ACTIVE'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadStaff = async (deptId?: string) => {
    try {
      setLoading(true);
      const url = deptId ? `/users/staff?departmentId=${deptId}` : '/users/staff';
      const res = await api.get(url);
      if (res.data.success) {
        setStaffList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeptChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setSelectedStaffId('');
    loadStaff(deptId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const res = await api.post(`/complaints/${complaintId}/assign`, {
        departmentId: selectedDeptId,
        assignedToUserId: selectedStaffId || null,
        expectedResolutionDate: expectedDate ? new Date(expectedDate).toISOString() : null,
        notes,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to assign complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Complaint to Staff"
      subtitle="Dispatch grievance to responsible department & designated investigation officer"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Department
          </label>
          <select
            value={selectedDeptId}
            onChange={(e) => handleDeptChange(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name} ({dept.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Assigned Investigation Officer / Staff
          </label>
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Assign to Entire Department / Unassigned Staff --</option>
            {staffList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.fullName} ({st.role.replace('_', ' ')}) - {st.studentOrEmpId}
              </option>
            ))}
          </select>
          {loading && <p className="text-[10px] text-slate-400 mt-1">Loading staff roster...</p>}
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Expected Resolution Target Date
          </label>
          <input
            type="date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
            Assignment Directive & Notes
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add instructions, initial inspection findings, or urgency reminders..."
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-50"
          >
            {submitting ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ComplaintCategory, Department, ComplaintPriority } from '../../types';
import { Modal } from '../../components/common/Modal';
import { PriorityBadge } from '../../components/common/PriorityBadge';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';
import { Tag, Plus, Edit2, CheckCircle, XCircle } from 'lucide-react';

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<ComplaintCategory | null>(null);

  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    defaultDepartmentId: '',
    defaultPriority: 'MEDIUM' as ComplaintPriority,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [catRes, deptRes] = await Promise.all([
        api.get('/categories'),
        api.get('/departments'),
      ]);
      if (catRes.data.success) {
        setCategories(catRes.data.data);
      }
      if (deptRes.data.success) {
        setDepartments(deptRes.data.data);
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
      const res = await api.post('/categories', createForm);
      if (res.data.success) {
        setCreateModalOpen(false);
        setCreateForm({
          name: '',
          description: '',
          defaultDepartmentId: '',
          defaultPriority: 'MEDIUM',
        });
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    try {
      const res = await api.put(`/categories/${editCategory.id}`, editCategory);
      if (res.data.success) {
        setEditCategory(null);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update category.');
    }
  };

  const toggleStatus = async (cat: ComplaintCategory) => {
    const nextStatus = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/categories/${cat.id}`, { status: nextStatus });
      loadData();
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
            Complaint Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure grievance domains, default routing departments, and severity levels.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Category Name</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Default Redressal Dept</th>
                  <th className="px-6 py-3.5">Default Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {categories.map((cat) => {
                  const dept = departments.find((d) => d.id === cat.defaultDepartmentId);
                  return (
                    <tr
                      key={cat.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        {cat.name}
                      </td>

                      <td className="px-6 py-4 text-slate-500 max-w-sm">
                        {cat.description || 'No description provided.'}
                      </td>

                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                        {dept ? dept.name : 'General Selection'}
                      </td>

                      <td className="px-6 py-4">
                        <PriorityBadge priority={cat.defaultPriority} />
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(cat)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                            cat.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {cat.status === 'ACTIVE' ? (
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3 h-3 text-slate-400" />
                          )}
                          {cat.status}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditCategory(cat)}
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

      {/* Create Category Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Complaint Category"
        subtitle="Introduce a new grievance category with preset department and priority"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="e.g. Laboratory Equipment & Software"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={2}
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="What grievances belong under this classification..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Default Redressal Dept
              </label>
              <select
                value={createForm.defaultDepartmentId}
                onChange={(e) =>
                  setCreateForm({ ...createForm, defaultDepartmentId: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="">-- No Default Department --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Default Priority
              </label>
              <select
                value={createForm.defaultPriority}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    defaultPriority: e.target.value as ComplaintPriority,
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
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
              Create Category
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      {editCategory && (
        <Modal
          isOpen={!!editCategory}
          onClose={() => setEditCategory(null)}
          title="Edit Category"
          subtitle={`Update settings for ${editCategory.name}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Category Name
              </label>
              <input
                type="text"
                required
                value={editCategory.name}
                onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Default Department
                </label>
                <select
                  value={editCategory.defaultDepartmentId || ''}
                  onChange={(e) =>
                    setEditCategory({
                      ...editCategory,
                      defaultDepartmentId: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">-- No Default Department --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Default Priority
                </label>
                <select
                  value={editCategory.defaultPriority}
                  onChange={(e) =>
                    setEditCategory({
                      ...editCategory,
                      defaultPriority: e.target.value as ComplaintPriority,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditCategory(null)}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl"
              >
                Save Category
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

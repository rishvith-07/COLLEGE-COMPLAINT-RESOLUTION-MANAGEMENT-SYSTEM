import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Department, ComplaintCategory, ComplaintPriority } from '../../types';
import {
  FileText,
  Building,
  Tag,
  MapPin,
  Calendar,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  X,
  FileCheck,
  ArrowRight,
} from 'lucide-react';

export const SubmitComplaintPage: React.FC = () => {
  const navigate = useNavigate();

  const defaultCategories: ComplaintCategory[] = [
    { id: 'cat-wifi', name: 'Wi-Fi & Internet Connectivity', description: 'Network issues', defaultDepartmentId: 'dept-it', defaultPriority: 'HIGH', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    { id: 'cat-hostel', name: 'Hostel Maintenance & Cleanliness', description: 'Hostel issues', defaultDepartmentId: 'dept-hostel', defaultPriority: 'MEDIUM', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    { id: 'cat-lab', name: 'Lab Hardware / Software Equipment', description: 'Laboratory issues', defaultDepartmentId: 'dept-cs', defaultPriority: 'MEDIUM', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    { id: 'cat-acad', name: 'Academic Course Grievance', description: 'Academic issues', defaultDepartmentId: 'dept-acad', defaultPriority: 'HIGH', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    { id: 'cat-water', name: 'Drinking Water & Sanitation', description: 'Sanitation issues', defaultDepartmentId: 'dept-estate', defaultPriority: 'URGENT', status: 'ACTIVE', createdAt: '', updatedAt: '' },
  ];

  const defaultDepartments: Department[] = [
    { id: 'dept-cs', name: 'Computer Science & Engineering', code: 'CSE', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    { id: 'dept-it', name: 'IT & Campus Networking', code: 'ITNET', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    { id: 'dept-hostel', name: 'Hostel Administration', code: 'HOSTEL', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    { id: 'dept-estate', name: 'Estate & Campus Maintenance', code: 'ESTATE', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    { id: 'dept-acad', name: 'Academic Affairs & Examinations', code: 'ACAD', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    { id: 'dept-library', name: 'Central Library', code: 'LIB', status: 'ACTIVE', createdAt: '', updatedAt: '' },
  ];

  const [categories, setCategories] = useState<ComplaintCategory[]>(defaultCategories);
  const [departments, setDepartments] = useState<Department[]>(defaultDepartments);
  const [formData, setFormData] = useState({
    title: '',
    categoryId: 'cat-wifi',
    departmentId: 'dept-it',
    location: '',
    priority: 'HIGH' as ComplaintPriority,
    incidentDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [attachments, setAttachments] = useState<
    { name: string; size: string; type: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedComplaint, setSubmittedComplaint] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, deptRes] = await Promise.all([
          api.get('/categories'),
          api.get('/departments'),
        ]);

        if (catRes.data.success && deptRes.data.success) {
          const activeCats = catRes.data.data.filter((c: ComplaintCategory) => c.status === 'ACTIVE');
          const activeDepts = deptRes.data.data.filter((d: Department) => d.status === 'ACTIVE');

          setCategories(activeCats);
          setDepartments(activeDepts);

          if (activeCats.length > 0) {
            const firstCat = activeCats[0];
            setFormData((prev) => ({
              ...prev,
              categoryId: firstCat.id,
              departmentId: firstCat.defaultDepartmentId || activeDepts[0]?.id || '',
              priority: firstCat.defaultPriority || 'MEDIUM',
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load complaint metadata:', err);
      }
    };

    fetchData();
  }, []);

  const handleCategoryChange = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    setFormData((prev) => ({
      ...prev,
      categoryId: catId,
      departmentId: cat?.defaultDepartmentId || prev.departmentId,
      priority: cat?.defaultPriority || prev.priority,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setAttachments([
        ...attachments,
        {
          name: file.name,
          size: `${sizeMb} MB`,
          type: file.type || 'Document',
        },
      ]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a descriptive complaint title.');
      return;
    }
    if (formData.description.trim().length < 15) {
      setError('Please provide a detailed description (minimum 15 characters).');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const res = await api.post('/complaints', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        departmentId: formData.departmentId,
        location: formData.location.trim() || null,
        priority: formData.priority,
        incidentDate: formData.incidentDate,
      });

      if (res.data.success) {
        setSubmittedComplaint(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Lodge Grievance / Complaint
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Submit official college grievances regarding campus facilities, academics, hostel, Wi-Fi, or sanitation.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Complaint Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Complaint Title */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Complaint Subject / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Wi-Fi dropping in Boys Hostel Block C 3rd floor"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                Target Redressal Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location, Priority & Incident Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Campus Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Block B, Room 304, Lab 2"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as ComplaintPriority })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low (Minor inconvenience)</option>
                <option value="MEDIUM">Medium (Normal daily issue)</option>
                <option value="HIGH">High (Disrupts classes / hostel)</option>
                <option value="URGENT">Urgent (Immediate safety / hazard)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                Date of Incident
              </label>
              <input
                type="date"
                value={formData.incidentDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-800 dark:text-slate-200">
                Detailed Grievance Description <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.description.length} characters (min 15)
              </span>
            </div>
            <textarea
              required
              rows={5}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide thorough details of what happened, equipment involved, recurring behavior, and any prior communication with department staff..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          {/* Attachments Upload */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Supporting Evidence / Documents / Photos (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-colors relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*,.pdf,.doc,.docx"
              />
              <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Click or drag & drop files here
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, PDF, or DOC up to 10MB
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-200">{file.name}</span>
                      <span className="text-slate-400">({file.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Submitting Grievance...' : 'Submit Official Complaint'}
            </button>
          </div>
        </form>
      </div>

      {/* Post-Submission Confirmation Modal */}
      {submittedComplaint && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Complaint Successfully Lodged!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Your grievance has been safely saved in the database and dispatched to the designated department cell.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Unique Reference Tracking Number:
                </div>
                <div className="text-xl font-mono font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                  {submittedComplaint.referenceNumber}
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 mt-2 font-medium">
                  {submittedComplaint.title}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => navigate(`/complaints/${submittedComplaint.id}`)}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                >
                  Track Complaint Progress <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/my-complaints')}
                  className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Return to My Complaints
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

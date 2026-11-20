export type UserRole = 'STUDENT' | 'STAFF' | 'FACULTY' | 'DEPARTMENT_HEAD' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface SafeUser {
  id: string;
  fullName: string;
  email: string;
  studentOrEmpId: string;
  role: UserRole;
  departmentId?: string | null;
  course?: string | null;
  yearOfStudy?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  headUserId?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  officeLocation?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_STUDENT'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED';

export interface ComplaintCategory {
  id: string;
  name: string;
  description?: string | null;
  defaultDepartmentId?: string | null;
  defaultPriority: ComplaintPriority;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintResolution {
  id: string;
  complaintId: string;
  resolvedByUserId: string;
  resolutionDescription: string;
  investigationSummary?: string | null;
  supportingDocumentUrl?: string | null;
  supportingDocumentName?: string | null;
  resolvedAt: string;
  updatedAt: string;
  resolvedBy?: SafeUser;
}

export interface ComplaintFeedback {
  id: string;
  complaintId: string;
  studentId: string;
  rating: number;
  comments?: string | null;
  isSatisfied: boolean;
  createdAt: string;
}

export interface ComplaintAttachment {
  id: string;
  complaintId: string;
  uploadedByUserId: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  fileUrl: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  referenceNumber: string;
  studentId: string;
  title: string;
  description: string;
  categoryId: string;
  departmentId: string;
  location?: string | null;
  priority: ComplaintPriority;
  incidentDate?: string | null;
  status: ComplaintStatus;
  assignedToUserId?: string | null;
  expectedResolutionDate?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  isReopened: boolean;
  reopenCount: number;
  createdAt: string;
  updatedAt: string;
  student?: SafeUser;
  category?: ComplaintCategory;
  department?: Department;
  assignedTo?: SafeUser;
  resolution?: ComplaintResolution;
  feedback?: ComplaintFeedback;
  attachments?: ComplaintAttachment[];
}

export interface ComplaintHistory {
  id: string;
  complaintId: string;
  action: string;
  previousStatus?: ComplaintStatus | null;
  newStatus?: ComplaintStatus | null;
  performedByUserId: string;
  notes?: string | null;
  metadata?: any;
  createdAt: string;
  performedBy?: SafeUser;
}

export interface ComplaintComment {
  id: string;
  complaintId: string;
  authorId: string;
  message: string;
  isInternal: boolean;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  createdAt: string;
  author?: SafeUser;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedComplaintId?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
  escalated: number;
  overdue: number;
  avgResolutionDays: number;
  resolutionRate: number;
  totalUsers?: number;
  totalStudents?: number;
  totalStaff?: number;
  totalDepartments?: number;
  statusDistribution: { name: string; value: number; color: string }[];
  categoryBreakdown: { name: string; count: number }[];
  monthlyTrend: { month: string; submitted: number; resolved: number }[];
  departmentBreakdown: { name: string; total: number; resolved: number }[];
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  targetEntity: string;
  targetId?: string | null;
  details?: any;
  ipAddress?: string | null;
  createdAt: string;
  user?: SafeUser;
}

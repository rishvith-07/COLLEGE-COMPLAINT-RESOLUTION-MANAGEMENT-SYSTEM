-- ==========================================================
-- COLLEGE COMPLAINT RESOLUTION SYSTEM (CAMPUSRESOLVE)
-- COMPLETE SUPABASE POSTGRESQL SCRIPT (SCHEMA + SEED DATA)
-- 
-- Copy and paste this ENTIRE file into:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Default password for all seed accounts: password123
-- ==========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables with CASCADE to ensure clean setup without old conflicting columns
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS complaint_satisfaction CASCADE;
DROP TABLE IF EXISTS complaint_escalations CASCADE;
DROP TABLE IF EXISTS complaint_timeline CASCADE;
DROP TABLE IF EXISTS complaint_comments CASCADE;
DROP TABLE IF EXISTS complaint_attachments CASCADE;
DROP TABLE IF EXISTS department_staff CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS complaint_categories CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================================
-- 1. CREATE ALL TABLES (IF NOT EXIST)
-- ==========================================================

-- 1.1 DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    head_user_id VARCHAR(50),
    contact_email VARCHAR(150),
    contact_phone VARCHAR(50),
    office_location VARCHAR(150),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.2 USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    student_or_emp_id VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('STUDENT', 'STAFF', 'FACULTY', 'DEPARTMENT_HEAD', 'ADMIN')),
    department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
    course VARCHAR(100),
    year_of_study VARCHAR(20),
    phone VARCHAR(30),
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for department head
ALTER TABLE departments
    DROP CONSTRAINT IF EXISTS fk_departments_head;
ALTER TABLE departments
    ADD CONSTRAINT fk_departments_head
    FOREIGN KEY (head_user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 1.3 COMPLAINT CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS complaint_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    default_department_id VARCHAR(50) REFERENCES departments(id) ON DELETE SET NULL,
    default_priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (default_priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.4 COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(50) PRIMARY KEY,
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id VARCHAR(50) NOT NULL REFERENCES complaint_categories(id) ON DELETE RESTRICT,
    department_id VARCHAR(50) NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    location VARCHAR(150),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    incident_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED' CHECK (
        status IN (
            'SUBMITTED',
            'UNDER_REVIEW',
            'ASSIGNED',
            'IN_PROGRESS',
            'WAITING_FOR_STUDENT',
            'ESCALATED',
            'RESOLVED',
            'CLOSED',
            'REJECTED'
        )
    ),
    assigned_to_user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    expected_resolution_date TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    is_reopened BOOLEAN DEFAULT FALSE,
    reopen_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.5 COMPLAINT ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS complaint_assignments (
    id VARCHAR(50) PRIMARY KEY,
    complaint_id VARCHAR(50) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    department_id VARCHAR(50) NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    assigned_to_user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    assigned_by_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    notes TEXT,
    expected_resolution_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.6 COMPLAINT HISTORY (AUDIT LIFECYCLE) TABLE
CREATE TABLE IF NOT EXISTS complaint_history (
    id VARCHAR(50) PRIMARY KEY,
    complaint_id VARCHAR(50) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    previous_status VARCHAR(30),
    new_status VARCHAR(30),
    performed_by_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.7 COMPLAINT COMMENTS (COMMUNICATION THREAD) TABLE
CREATE TABLE IF NOT EXISTS complaint_comments (
    id VARCHAR(50) PRIMARY KEY,
    complaint_id VARCHAR(50) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    author_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachment_url TEXT,
    attachment_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.8 COMPLAINT ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id VARCHAR(50) PRIMARY KEY,
    complaint_id VARCHAR(50) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    uploaded_by_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.9 COMPLAINT RESOLUTIONS TABLE
CREATE TABLE IF NOT EXISTS complaint_resolutions (
    id VARCHAR(50) PRIMARY KEY,
    complaint_id VARCHAR(50) NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    resolved_by_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    resolution_description TEXT NOT NULL,
    investigation_summary TEXT,
    supporting_document_url TEXT,
    supporting_document_name VARCHAR(255),
    resolved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.10 COMPLAINT FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS complaint_feedback (
    id VARCHAR(50) PRIMARY KEY,
    complaint_id VARCHAR(50) NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    student_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    is_satisfied BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.11 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    related_complaint_id VARCHAR(50) REFERENCES complaints(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.12 USER SETTINGS & PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS user_settings (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    email_notifications BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    default_dashboard_range VARCHAR(30) DEFAULT 'ALL',
    preferences JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.13 AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_entity VARCHAR(50) NOT NULL,
    target_id VARCHAR(50),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1.14 SYSTEM APP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================================
-- 2. CREATE INDEXES
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);

CREATE INDEX IF NOT EXISTS idx_complaints_student ON complaints(student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_department ON complaints(department_id);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category_id);
CREATE INDEX IF NOT EXISTS idx_complaints_assigned_to ON complaints(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_complaints_ref ON complaints(reference_number);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);

CREATE INDEX IF NOT EXISTS idx_complaint_history_complaint ON complaint_history(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_comments_complaint ON complaint_comments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_assignments_complaint ON complaint_assignments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- ==========================================================
-- 3. INSERT SEED DATA
-- ==========================================================

-- 3.1 DEPARTMENTS SEED
INSERT INTO departments (id, name, code, description, contact_email, contact_phone, office_location, status)
VALUES
('dept-cs', 'Computer Science & Engineering', 'CSE', 'Handles CS academic grievances, computer labs, and department facilities.', 'cs.dept@college.edu', '+1-555-0101', 'Academic Block A, 3rd Floor', 'ACTIVE'),
('dept-hostel', 'Hostel Administration', 'HOSTEL', 'Manages student accommodation, warden inquiries, mess services, and hostel maintenance.', 'hostel.admin@college.edu', '+1-555-0102', 'Hostel Office, Block Central', 'ACTIVE'),
('dept-it', 'IT & Campus Networking', 'ITNET', 'Responsible for campus-wide Wi-Fi, LAN, server infrastructure, student portals, and email services.', 'it.support@college.edu', '+1-555-0103', 'Server Facility, Tech Wing', 'ACTIVE'),
('dept-estate', 'Estate & Campus Maintenance', 'ESTATE', 'Maintains campus buildings, classrooms, water supply, electricity, and sanitation.', 'estate.maintenance@college.edu', '+1-555-0104', 'Facilities Building, Ground Floor', 'ACTIVE'),
('dept-food', 'Cafeteria & Dining Services', 'FOOD', 'Oversees food hygiene, canteen menu pricing, meal quality, and dining facility cleanliness.', 'food.services@college.edu', '+1-555-0105', 'Main Student Center, 1st Floor', 'ACTIVE'),
('dept-trans', 'Transport & Fleet Operations', 'TRANS', 'Coordinates college bus routes, vehicle fleet schedule, student transport passes, and drivers.', 'transport@college.edu', '+1-555-0106', 'Logistics Terminal, Gate 3', 'ACTIVE'),
('dept-lib', 'Central Library Services', 'LIB', 'Manages physical and digital collections, quiet study rooms, journal subscriptions, and book lending.', 'library@college.edu', '+1-555-0107', 'Central Library Building', 'ACTIVE'),
('dept-exam', 'Examination & Evaluation Cell', 'EXAM', 'Oversees semester examinations, grades, hall tickets, re-evaluations, and degree certificates.', 'exams@college.edu', '+1-555-0108', 'Admin Block, Room 104', 'ACTIVE'),
('dept-affairs', 'Student Affairs & Grievance Redressal', 'AFFAIRS', 'High-level student welfare, anti-ragging redressal, student council, and code of conduct.', 'student.affairs@college.edu', '+1-555-0109', 'Student Center, Dean Office', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3.2 USERS SEED (password is 'password123' for all)
INSERT INTO users (id, full_name, email, password_hash, student_or_emp_id, role, department_id, course, year_of_study, phone, status)
VALUES
('usr-admin', 'Dr. Arthur Vance', 'admin@college.edu', '$2a$10$GJ8Pbi5gjChWp1pmxGyxvu6gL3rjZLuFmzpz0RjxGg.86cVDfAr0u', 'EMP-ADM-001', 'ADMIN', 'dept-affairs', NULL, NULL, '+1-555-1001', 'ACTIVE'),
('usr-hod-cs', 'Prof. Ramesh Gupta', 'hod.cs@college.edu', '$2a$10$GJ8Pbi5gjChWp1pmxGyxvu6gL3rjZLuFmzpz0RjxGg.86cVDfAr0u', 'EMP-FAC-014', 'DEPARTMENT_HEAD', 'dept-cs', NULL, NULL, '+1-555-1002', 'ACTIVE'),
('usr-hod-hostel', 'Col. Sunita Rao', 'hod.hostel@college.edu', '$2a$10$GJ8Pbi5gjChWp1pmxGyxvu6gL3rjZLuFmzpz0RjxGg.86cVDfAr0u', 'EMP-ADM-020', 'DEPARTMENT_HEAD', 'dept-hostel', NULL, NULL, '+1-555-1003', 'ACTIVE'),
('usr-staff-cs', 'Dr. Vikram Patel', 'staff.cs@college.edu', '$2a$10$GJ8Pbi5gjChWp1pmxGyxvu6gL3rjZLuFmzpz0RjxGg.86cVDfAr0u', 'EMP-FAC-045', 'STAFF', 'dept-cs', NULL, NULL, '+1-555-1004', 'ACTIVE'),
('usr-staff-hostel', 'Mr. Rajesh Nair', 'staff.hostel@college.edu', '$2a$10$GJ8Pbi5gjChWp1pmxGyxvu6gL3rjZLuFmzpz0RjxGg.86cVDfAr0u', 'EMP-STF-088', 'STAFF', 'dept-hostel', NULL, NULL, '+1-555-1005', 'ACTIVE'),
('usr-staff-it', 'Eng. Amit Sharma', 'staff.network@college.edu', '$2a$10$GJ8Pbi5gjChWp1pmxGyxvu6gL3rjZLuFmzpz0RjxGg.86cVDfAr0u', 'EMP-STF-092', 'STAFF', 'dept-it', NULL, NULL, '+1-555-1006', 'ACTIVE'),
('usr-student-1', 'Priya Sharma', 'student@college.edu', '$2a$10$GJ8Pbi5gjChWp1pmxGyxvu6gL3rjZLuFmzpz0RjxGg.86cVDfAr0u', 'STU-2023-CS-042', 'STUDENT', 'dept-cs', 'B.Tech Computer Science', '3rd Year', '+1-555-2001', 'ACTIVE'),
('usr-student-2', 'Rahul Verma', 'rahul.verma@college.edu', '$2a$10$GJ8Pbi5gjChWp1pmxGyxvu6gL3rjZLuFmzpz0RjxGg.86cVDfAr0u', 'STU-2024-ME-118', 'STUDENT', 'dept-estate', 'B.Tech Mechanical', '2nd Year', '+1-555-2002', 'ACTIVE'),
('usr-student-3', 'Ananya Iyer', 'ananya.iyer@college.edu', '$2a$10$GJ8Pbi5gjChWp1pmxGyxvu6gL3rjZLuFmzpz0RjxGg.86cVDfAr0u', 'STU-2022-EE-015', 'STUDENT', 'dept-cs', 'B.Tech Electrical', '4th Year', '+1-555-2003', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- Link Department Heads
UPDATE departments SET head_user_id = 'usr-hod-cs' WHERE id = 'dept-cs';
UPDATE departments SET head_user_id = 'usr-hod-hostel' WHERE id = 'dept-hostel';

-- 3.3 COMPLAINT CATEGORIES SEED
INSERT INTO complaint_categories (id, name, description, default_department_id, default_priority, status)
VALUES
('cat-wifi', 'Wi-Fi & Internet Connectivity', 'Issues regarding campus or hostel Wi-Fi, DNS, authentication portal, or slow bandwidth.', 'dept-it', 'HIGH', 'ACTIVE'),
('cat-hostel-maint', 'Hostel Room Maintenance', 'Repairs needed for electrical fittings, plumbing, bed fixtures, room locks, or window glass.', 'dept-hostel', 'MEDIUM', 'ACTIVE'),
('cat-food', 'Food Quality & Canteen Hygiene', 'Concerns about food cleanliness, fresh ingredients, pricing, or mess sanitation.', 'dept-food', 'HIGH', 'ACTIVE'),
('cat-class-av', 'Classroom Facilities & Projectors', 'Faulty AV equipment, non-working microphones, chalkboards, lighting, or broken seats in lectures.', 'dept-estate', 'MEDIUM', 'ACTIVE'),
('cat-lab', 'Laboratory Equipment & Software', 'Damaged lab instruments, missing software licenses, OS boot failure, or safety hazards.', 'dept-cs', 'HIGH', 'ACTIVE'),
('cat-exam', 'Examination & Grade Records', 'Grade discrepancy, exam hall ticket issues, timetable overlaps, or result delays.', 'dept-exam', 'URGENT', 'ACTIVE'),
('cat-trans', 'Transport & Bus Routes', 'Delayed college buses, overcrowding, driver conduct, route changes, or breakdown alerts.', 'dept-trans', 'MEDIUM', 'ACTIVE'),
('cat-lib', 'Library Resources & Environment', 'Noise disturbances, book availability, AC issues, or borrowing limit inquiries.', 'dept-lib', 'LOW', 'ACTIVE'),
('cat-antiragging', 'Ragging & Harassment Redressal', 'Strict and confidential grievances regarding harassment, bullying, or verbal misconduct.', 'dept-affairs', 'URGENT', 'ACTIVE'),
('cat-sanitation', 'Campus Cleanliness & Water Supply', 'Washroom hygiene, drinking water cooler filters, trash disposal, or pest control.', 'dept-estate', 'MEDIUM', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3.4 COMPLAINTS SEED
INSERT INTO complaints (id, reference_number, student_id, title, description, category_id, department_id, location, priority, incident_date, status, assigned_to_user_id, expected_resolution_date, resolved_at, is_reopened, reopen_count, created_at, updated_at)
VALUES
(
  'cmp-001',
  'CMP-2026-00101',
  'usr-student-1',
  'Wi-Fi repeatedly disconnecting in Boys Hostel Block C 3rd floor',
  'The access point AP-BH3-04 keeps resetting every 10 minutes. More than 40 students cannot attend online lab sessions or submit assignments on the campus portal.',
  'cat-wifi',
  'dept-it',
  'Boys Hostel Block C, 3rd Floor Corridor',
  'HIGH',
  '2026-11-15',
  'IN_PROGRESS',
  'usr-staff-it',
  '2026-11-21 18:00:00+00',
  NULL,
  false,
  0,
  '2026-11-16 09:30:00+00',
  '2026-11-18 14:15:00+00'
),
(
  'cmp-002',
  'CMP-2026-00102',
  'usr-student-1',
  'Water cooler filter foul smell and leakage in CS Department 2nd Floor',
  'The main drinking water cooler outside Room 204 smells like rust and has a heavy leak forming a puddle on the tiled corridor, posing a slipping hazard.',
  'cat-sanitation',
  'dept-estate',
  'CS Academic Block, 2nd Floor opposite Room 204',
  'HIGH',
  '2026-11-10',
  'RESOLVED',
  'usr-staff-hostel',
  '2026-11-14 17:00:00+00',
  '2026-11-13 16:30:00+00',
  false,
  0,
  '2026-11-10 11:20:00+00',
  '2026-11-13 16:30:00+00'
),
(
  'cmp-003',
  'CMP-2026-00103',
  'usr-student-1',
  'Lab 4 GPU workstations failing to load CUDA toolkit for Deep Learning practical',
  'Systems 12 through 20 in High-Performance Computing Lab 4 reboot on driver initialization. Semester project code deadline is approaching on Friday.',
  'cat-lab',
  'dept-cs',
  'Tech Block A, Computing Lab 4',
  'URGENT',
  '2026-11-18',
  'ASSIGNED',
  'usr-staff-cs',
  '2026-11-20 12:00:00+00',
  NULL,
  false,
  0,
  '2026-11-18 10:00:00+00',
  '2026-11-18 11:30:00+00'
),
(
  'cmp-004',
  'CMP-2026-00104',
  'usr-student-2',
  'Substandard hygiene and spoiled dairy observed at North Campus Canteen',
  'Several students experienced stomach discomfort after consuming paneer rolls sold on Wednesday. The refrigerator display does not appear to be cooling properly.',
  'cat-food',
  'dept-food',
  'North Canteen Counter 2',
  'URGENT',
  '2026-11-17',
  'ESCALATED',
  NULL,
  '2026-11-20 18:00:00+00',
  NULL,
  false,
  0,
  '2026-11-17 14:00:00+00',
  '2026-11-18 09:00:00+00'
),
(
  'cmp-005',
  'CMP-2026-00105',
  'usr-student-2',
  'Route 14 bus regularly arriving 40 minutes late causing attendance penalty',
  'The morning route bus from South City stops at 8:40 AM instead of the scheduled 7:55 AM, causing first period attendance loss for 35 regular pass holders.',
  'cat-trans',
  'dept-trans',
  'Bus Route 14 (South City to Campus)',
  'MEDIUM',
  '2026-11-14',
  'WAITING_FOR_STUDENT',
  NULL,
  '2026-11-22 17:00:00+00',
  NULL,
  false,
  0,
  '2026-11-14 16:45:00+00',
  '2026-11-17 15:30:00+00'
),
(
  'cmp-006',
  'CMP-2026-00106',
  'usr-student-3',
  'Air Conditioning breakdown in Central Library 2nd Floor Reading Section',
  'Temperature inside the quiet study hall exceeds 34C due to central AC blower trip, making prolonged study impossible before the upcoming midterms.',
  'cat-lib',
  'dept-lib',
  'Central Library, 2nd Floor Reading Hall B',
  'LOW',
  '2026-11-19',
  'SUBMITTED',
  NULL,
  NULL,
  NULL,
  false,
  0,
  '2026-11-19 08:30:00+00',
  '2026-11-19 08:30:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 3.5 RESOLUTIONS SEED
INSERT INTO complaint_resolutions (id, complaint_id, resolved_by_user_id, resolution_description, investigation_summary, resolved_at)
VALUES
(
  'res-002',
  'cmp-002',
  'usr-staff-hostel',
  'The RO filtration unit cartridge was replaced with a brand-new multi-stage sediment and carbon filter. Drainage pipe connection was resealed and pressure-tested for 4 hours with no leakage detected.',
  'Maintenance team inspected the unit on Nov 11. Old filter was clogged causing pressure backflow and leakage.',
  '2026-11-13 16:30:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 3.6 FEEDBACK SEED
INSERT INTO complaint_feedback (id, complaint_id, student_id, rating, comments, is_satisfied, created_at)
VALUES
(
  'fb-002',
  'cmp-002',
  'usr-student-1',
  5,
  'Prompt response! The water is completely clean now and the leaking puddle has been wiped dry. Thank you for fixing it quickly.',
  true,
  '2026-11-14 10:15:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- 3.7 COMPLAINT HISTORY SEED
INSERT INTO complaint_history (id, complaint_id, action, previous_status, new_status, performed_by_user_id, notes, created_at)
VALUES
('hist-001', 'cmp-001', 'SUBMITTED', NULL, 'SUBMITTED', 'usr-student-1', 'Complaint logged by student.', '2026-11-16 09:30:00+00'),
('hist-002', 'cmp-001', 'STATUS_CHANGE', 'SUBMITTED', 'UNDER_REVIEW', 'usr-admin', 'Reviewed by Dean of Student Affairs office.', '2026-11-16 11:00:00+00'),
('hist-003', 'cmp-001', 'ASSIGNED', 'UNDER_REVIEW', 'ASSIGNED', 'usr-admin', 'Assigned to IT & Networking department staff Amit Sharma.', '2026-11-16 14:00:00+00'),
('hist-004', 'cmp-001', 'STATUS_CHANGE', 'ASSIGNED', 'IN_PROGRESS', 'usr-staff-it', 'Technician on site inspecting Cisco AP-BH3-04 PoE injector and switch port.', '2026-11-18 14:15:00+00'),

('hist-005', 'cmp-002', 'SUBMITTED', NULL, 'SUBMITTED', 'usr-student-1', 'Complaint registered.', '2026-11-10 11:20:00+00'),
('hist-006', 'cmp-002', 'ASSIGNED', 'SUBMITTED', 'ASSIGNED', 'usr-admin', 'Dispatched to Estate & Maintenance crew.', '2026-11-11 09:00:00+00'),
('hist-007', 'cmp-002', 'STATUS_CHANGE', 'ASSIGNED', 'IN_PROGRESS', 'usr-staff-hostel', 'Plumbing team sourced new 10-inch RO cartridges.', '2026-11-12 10:30:00+00'),
('hist-008', 'cmp-002', 'RESOLVED', 'IN_PROGRESS', 'RESOLVED', 'usr-staff-hostel', 'Replacement completed and verified clean.', '2026-11-13 16:30:00+00'),

('hist-009', 'cmp-003', 'SUBMITTED', NULL, 'SUBMITTED', 'usr-student-1', 'Urgent lab issue submitted.', '2026-11-18 10:00:00+00'),
('hist-010', 'cmp-003', 'ASSIGNED', 'SUBMITTED', 'ASSIGNED', 'usr-hod-cs', 'Assigned to Lab In-charge Dr. Vikram Patel.', '2026-11-18 11:30:00+00'),

('hist-011', 'cmp-004', 'SUBMITTED', NULL, 'SUBMITTED', 'usr-student-2', 'Food quality grievance lodged.', '2026-11-17 14:00:00+00'),
('hist-012', 'cmp-004', 'ESCALATED', 'SUBMITTED', 'ESCALATED', 'usr-admin', 'Escalated to Food Safety Inspection Committee and Dean.', '2026-11-18 09:00:00+00'),

('hist-013', 'cmp-005', 'SUBMITTED', NULL, 'SUBMITTED', 'usr-student-2', 'Bus schedule complaint lodged.', '2026-11-14 16:45:00+00'),
('hist-014', 'cmp-005', 'INFO_REQUESTED', 'SUBMITTED', 'WAITING_FOR_STUDENT', 'usr-admin', 'Requested student to upload scanned bus pass and specify exact boarding stop.', '2026-11-17 15:30:00+00')
ON CONFLICT (id) DO NOTHING;

-- 3.8 COMPLAINT COMMENTS SEED
INSERT INTO complaint_comments (id, complaint_id, author_id, message, is_internal, created_at)
VALUES
('comm-001', 'cmp-001', 'usr-staff-it', 'Hello Priya, we tested the port remotely and saw multiple packet drops. A field engineer is dispatched with a replacement Aruba switch module.', false, '2026-11-18 14:20:00+00'),
('comm-002', 'cmp-001', 'usr-student-1', 'Thank you! Please note that room 312 to 318 have completely zero signal right now.', false, '2026-11-18 14:45:00+00'),
('comm-003', 'cmp-005', 'usr-admin', 'Please reply with the exact stop where you board and whether this happens on the return evening trip as well.', false, '2026-11-17 15:30:00+00')
ON CONFLICT (id) DO NOTHING;

-- 3.9 NOTIFICATIONS SEED
INSERT INTO notifications (id, user_id, title, message, type, related_complaint_id, is_read, created_at)
VALUES
('notif-001', 'usr-student-1', 'Status Updated: IN PROGRESS', 'Your complaint CMP-2026-00101 is now In Progress by IT & Campus Networking.', 'STATUS_UPDATE', 'cmp-001', false, '2026-11-18 14:15:00+00'),
('notif-002', 'usr-student-1', 'Complaint Resolved', 'Your complaint CMP-2026-00102 has been marked as Resolved. Please provide your feedback.', 'RESOLVED', 'cmp-002', true, '2026-11-13 16:30:00+00'),
('notif-003', 'usr-staff-cs', 'New Complaint Assigned', 'You have been assigned complaint CMP-2026-00103: Lab 4 GPU workstations failing.', 'ASSIGNMENT', 'cmp-003', false, '2026-11-18 11:30:00+00'),
('notif-004', 'usr-admin', 'High Priority Escalation', 'Complaint CMP-2026-00104 regarding Canteen Hygiene has been escalated to administration.', 'ESCALATION', 'cmp-004', false, '2026-11-18 09:00:00+00'),
('notif-005', 'usr-student-2', 'Additional Information Required', 'Administration requested details on bus pass and stop for complaint CMP-2026-00105.', 'INFO_REQUEST', 'cmp-005', false, '2026-11-17 15:30:00+00')
ON CONFLICT (id) DO NOTHING;

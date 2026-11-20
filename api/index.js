// server/app.ts
import "dotenv/config";
import express from "express";
import cors from "cors";

// server/routes/auth.routes.ts
import { Router } from "express";

// server/controllers/auth.controller.ts
import bcrypt from "bcryptjs";

// server/db/db.ts
import "dotenv/config";
import pg from "pg";
import fs from "fs";
import path from "path";

// server/db/mockData.ts
var initialDepartments = [
  {
    id: "dept-cs",
    name: "Computer Science & Engineering",
    code: "CSE",
    description: "Handles CS academic grievances, computer labs, and department facilities.",
    headUserId: "usr-hod-cs",
    contactEmail: "cs.dept@college.edu",
    contactPhone: "+1-555-0101",
    officeLocation: "Academic Block A, 3rd Floor",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "dept-hostel",
    name: "Hostel Administration",
    code: "HOSTEL",
    description: "Manages student accommodation, warden inquiries, mess services, and hostel maintenance.",
    headUserId: "usr-hod-hostel",
    contactEmail: "hostel.admin@college.edu",
    contactPhone: "+1-555-0102",
    officeLocation: "Hostel Office, Block Central",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "dept-it",
    name: "IT & Campus Networking",
    code: "ITNET",
    description: "Responsible for campus-wide Wi-Fi, LAN, server infrastructure, student portals, and email services.",
    headUserId: null,
    contactEmail: "it.support@college.edu",
    contactPhone: "+1-555-0103",
    officeLocation: "Server Facility, Tech Wing",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "dept-estate",
    name: "Estate & Campus Maintenance",
    code: "ESTATE",
    description: "Maintains campus buildings, classrooms, water supply, electricity, and sanitation.",
    headUserId: null,
    contactEmail: "estate.maintenance@college.edu",
    contactPhone: "+1-555-0104",
    officeLocation: "Facilities Building, Ground Floor",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "dept-food",
    name: "Cafeteria & Dining Services",
    code: "FOOD",
    description: "Oversees food hygiene, canteen menu pricing, meal quality, and dining facility cleanliness.",
    headUserId: null,
    contactEmail: "food.services@college.edu",
    contactPhone: "+1-555-0105",
    officeLocation: "Main Student Center, 1st Floor",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "dept-trans",
    name: "Transport & Fleet Operations",
    code: "TRANS",
    description: "Coordinates college bus routes, vehicle fleet schedule, student transport passes, and drivers.",
    headUserId: null,
    contactEmail: "transport@college.edu",
    contactPhone: "+1-555-0106",
    officeLocation: "Logistics Terminal, Gate 3",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "dept-lib",
    name: "Central Library Services",
    code: "LIB",
    description: "Manages physical and digital collections, quiet study rooms, journal subscriptions, and book lending.",
    headUserId: null,
    contactEmail: "library@college.edu",
    contactPhone: "+1-555-0107",
    officeLocation: "Central Library Building",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "dept-exam",
    name: "Examination & Evaluation Cell",
    code: "EXAM",
    description: "Oversees semester examinations, grades, hall tickets, re-evaluations, and degree certificates.",
    headUserId: null,
    contactEmail: "exams@college.edu",
    contactPhone: "+1-555-0108",
    officeLocation: "Admin Block, Room 104",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "dept-affairs",
    name: "Student Affairs & Grievance Redressal",
    code: "AFFAIRS",
    description: "High-level student welfare, anti-ragging redressal, student council, and code of conduct.",
    headUserId: null,
    contactEmail: "student.affairs@college.edu",
    contactPhone: "+1-555-0109",
    officeLocation: "Student Center, Dean Office",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  }
];
var DEFAULT_HASH = "$2a$10$GJ8Pbi5gjChWp1pmxGyxvu6gL3rjZLuFmzpz0RjxGg.86cVDfAr0u";
var initialUsers = [
  {
    id: "usr-admin",
    fullName: "Dr. Arthur Vance",
    email: "admin@college.edu",
    passwordHash: DEFAULT_HASH,
    studentOrEmpId: "EMP-ADM-001",
    role: "ADMIN",
    departmentId: "dept-affairs",
    phone: "+1-555-1001",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 90 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 864e5).toISOString()
  },
  {
    id: "usr-hod-cs",
    fullName: "Prof. Ramesh Gupta",
    email: "hod.cs@college.edu",
    passwordHash: DEFAULT_HASH,
    studentOrEmpId: "EMP-FAC-014",
    role: "DEPARTMENT_HEAD",
    departmentId: "dept-cs",
    phone: "+1-555-1002",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 80 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 80 * 864e5).toISOString()
  },
  {
    id: "usr-hod-hostel",
    fullName: "Col. Sunita Rao",
    email: "hod.hostel@college.edu",
    passwordHash: DEFAULT_HASH,
    studentOrEmpId: "EMP-ADM-020",
    role: "DEPARTMENT_HEAD",
    departmentId: "dept-hostel",
    phone: "+1-555-1003",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 75 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 75 * 864e5).toISOString()
  },
  {
    id: "usr-staff-cs",
    fullName: "Dr. Vikram Patel",
    email: "staff.cs@college.edu",
    passwordHash: DEFAULT_HASH,
    studentOrEmpId: "EMP-FAC-045",
    role: "STAFF",
    departmentId: "dept-cs",
    phone: "+1-555-1004",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "usr-staff-hostel",
    fullName: "Mr. Rajesh Nair",
    email: "staff.hostel@college.edu",
    passwordHash: DEFAULT_HASH,
    studentOrEmpId: "EMP-STF-088",
    role: "STAFF",
    departmentId: "dept-hostel",
    phone: "+1-555-1005",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 50 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 50 * 864e5).toISOString()
  },
  {
    id: "usr-staff-it",
    fullName: "Eng. Amit Sharma",
    email: "staff.network@college.edu",
    passwordHash: DEFAULT_HASH,
    studentOrEmpId: "EMP-STF-092",
    role: "STAFF",
    departmentId: "dept-it",
    phone: "+1-555-1006",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 45 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 864e5).toISOString()
  },
  {
    id: "usr-student-1",
    fullName: "Priya Sharma",
    email: "student@college.edu",
    passwordHash: DEFAULT_HASH,
    studentOrEmpId: "STU-2023-CS-042",
    role: "STUDENT",
    departmentId: "dept-cs",
    course: "B.Tech Computer Science",
    yearOfStudy: "3rd Year",
    phone: "+1-555-2001",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 40 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 864e5).toISOString()
  },
  {
    id: "usr-student-2",
    fullName: "Rahul Verma",
    email: "rahul.verma@college.edu",
    passwordHash: DEFAULT_HASH,
    studentOrEmpId: "STU-2024-ME-118",
    role: "STUDENT",
    departmentId: "dept-estate",
    course: "B.Tech Mechanical",
    yearOfStudy: "2nd Year",
    phone: "+1-555-2002",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 35 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 864e5).toISOString()
  },
  {
    id: "usr-student-4",
    fullName: "Rahul Sharma",
    email: "rahul.sharma@college.edu",
    passwordHash: DEFAULT_HASH,
    studentOrEmpId: "STU-2024-CS-099",
    role: "STUDENT",
    departmentId: "dept-cs",
    course: "B.Tech Computer Science",
    yearOfStudy: "2nd Year",
    phone: "+1-555-2004",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 25 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 864e5).toISOString()
  },
  {
    id: "usr-hod-cs-alias",
    fullName: "Prof. Ramesh Gupta",
    email: "depthead.cs@college.edu",
    passwordHash: DEFAULT_HASH,
    studentOrEmpId: "EMP-FAC-014-ALIAS",
    role: "DEPARTMENT_HEAD",
    departmentId: "dept-cs",
    phone: "+1-555-1002",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 31 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 31 * 864e5).toISOString()
  }
];
var initialCategories = [
  {
    id: "cat-wifi",
    name: "Wi-Fi & Internet Connectivity",
    description: "Issues regarding campus or hostel Wi-Fi, DNS, authentication portal, or slow bandwidth.",
    defaultDepartmentId: "dept-it",
    defaultPriority: "HIGH",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "cat-hostel-maint",
    name: "Hostel Room Maintenance",
    description: "Repairs needed for electrical fittings, plumbing, bed fixtures, room locks, or window glass.",
    defaultDepartmentId: "dept-hostel",
    defaultPriority: "MEDIUM",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "cat-food",
    name: "Food Quality & Canteen Hygiene",
    description: "Concerns about food cleanliness, fresh ingredients, pricing, or mess sanitation.",
    defaultDepartmentId: "dept-food",
    defaultPriority: "HIGH",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "cat-class-av",
    name: "Classroom Facilities & Projectors",
    description: "Faulty AV equipment, non-working microphones, chalkboards, lighting, or broken seats in lectures.",
    defaultDepartmentId: "dept-estate",
    defaultPriority: "MEDIUM",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "cat-lab",
    name: "Laboratory Equipment & Software",
    description: "Damaged lab instruments, missing software licenses, OS boot failure, or safety hazards.",
    defaultDepartmentId: "dept-cs",
    defaultPriority: "HIGH",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "cat-exam",
    name: "Examination & Grade Records",
    description: "Grade discrepancy, exam hall ticket issues, timetable overlaps, or result delays.",
    defaultDepartmentId: "dept-exam",
    defaultPriority: "URGENT",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "cat-trans",
    name: "Transport & Bus Routes",
    description: "Delayed college buses, overcrowding, driver conduct, route changes, or breakdown alerts.",
    defaultDepartmentId: "dept-trans",
    defaultPriority: "MEDIUM",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "cat-lib",
    name: "Library Resources & Environment",
    description: "Noise disturbances, book availability, AC issues, or borrowing limit inquiries.",
    defaultDepartmentId: "dept-lib",
    defaultPriority: "LOW",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "cat-antiragging",
    name: "Ragging & Harassment Redressal",
    description: "Strict and confidential grievances regarding harassment, bullying, or verbal misconduct.",
    defaultDepartmentId: "dept-affairs",
    defaultPriority: "URGENT",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  },
  {
    id: "cat-sanitation",
    name: "Campus Cleanliness & Water Supply",
    description: "Washroom hygiene, drinking water cooler filters, trash disposal, or pest control.",
    defaultDepartmentId: "dept-estate",
    defaultPriority: "MEDIUM",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 60 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 864e5).toISOString()
  }
];
var initialComplaints = [
  {
    id: "cmp-001",
    referenceNumber: "CMP-2026-00101",
    studentId: "usr-student-1",
    title: "Wi-Fi repeatedly disconnecting in Boys Hostel Block C 3rd floor",
    description: "The access point AP-BH3-04 keeps resetting every 10 minutes. More than 40 students cannot attend online lab sessions or submit assignments on the campus portal.",
    categoryId: "cat-wifi",
    departmentId: "dept-it",
    location: "Boys Hostel Block C, 3rd Floor Corridor",
    priority: "HIGH",
    incidentDate: "2026-11-15",
    status: "IN_PROGRESS",
    assignedToUserId: "usr-staff-it",
    expectedResolutionDate: new Date(Date.now() + 2 * 864e5).toISOString(),
    resolvedAt: null,
    closedAt: null,
    isReopened: false,
    reopenCount: 0,
    createdAt: new Date(Date.now() - 3 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 864e5).toISOString()
  },
  {
    id: "cmp-002",
    referenceNumber: "CMP-2026-00102",
    studentId: "usr-student-1",
    title: "Water cooler filter foul smell and leakage in CS Department 2nd Floor",
    description: "The main drinking water cooler outside Room 204 smells like rust and has a heavy leak forming a puddle on the tiled corridor, posing a slipping hazard.",
    categoryId: "cat-sanitation",
    departmentId: "dept-estate",
    location: "CS Academic Block, 2nd Floor opposite Room 204",
    priority: "HIGH",
    incidentDate: "2026-11-10",
    status: "RESOLVED",
    assignedToUserId: "usr-staff-hostel",
    expectedResolutionDate: new Date(Date.now() - 5 * 864e5).toISOString(),
    resolvedAt: new Date(Date.now() - 6 * 864e5).toISOString(),
    closedAt: null,
    isReopened: false,
    reopenCount: 0,
    createdAt: new Date(Date.now() - 9 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 864e5).toISOString()
  },
  {
    id: "cmp-003",
    referenceNumber: "CMP-2026-00103",
    studentId: "usr-student-1",
    title: "Lab 4 GPU workstations failing to load CUDA toolkit for Deep Learning practical",
    description: "Systems 12 through 20 in High-Performance Computing Lab 4 reboot on driver initialization. Semester project code deadline is approaching on Friday.",
    categoryId: "cat-lab",
    departmentId: "dept-cs",
    location: "Tech Block A, Computing Lab 4",
    priority: "URGENT",
    incidentDate: "2026-11-18",
    status: "ASSIGNED",
    assignedToUserId: "usr-staff-cs",
    expectedResolutionDate: new Date(Date.now() + 1 * 864e5).toISOString(),
    resolvedAt: null,
    closedAt: null,
    isReopened: false,
    reopenCount: 0,
    createdAt: new Date(Date.now() - 1 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 36e5).toISOString()
  },
  {
    id: "cmp-004",
    referenceNumber: "CMP-2026-00104",
    studentId: "usr-student-2",
    title: "Substandard hygiene and spoiled dairy observed at North Campus Canteen",
    description: "Several students experienced stomach discomfort after consuming paneer rolls sold on Wednesday. The refrigerator display does not appear to be cooling properly.",
    categoryId: "cat-food",
    departmentId: "dept-food",
    location: "North Canteen Counter 2",
    priority: "URGENT",
    incidentDate: "2026-11-17",
    status: "ESCALATED",
    assignedToUserId: null,
    expectedResolutionDate: new Date(Date.now() + 1 * 864e5).toISOString(),
    resolvedAt: null,
    closedAt: null,
    isReopened: false,
    reopenCount: 0,
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 864e5).toISOString()
  },
  {
    id: "cmp-005",
    referenceNumber: "CMP-2026-00105",
    studentId: "usr-student-2",
    title: "Route 14 bus regularly arriving 40 minutes late causing attendance penalty",
    description: "The morning route bus from South City stops at 8:40 AM instead of the scheduled 7:55 AM, causing first period attendance loss for 35 regular pass holders.",
    categoryId: "cat-trans",
    departmentId: "dept-trans",
    location: "Bus Route 14 (South City to Campus)",
    priority: "MEDIUM",
    incidentDate: "2026-11-14",
    status: "WAITING_FOR_STUDENT",
    assignedToUserId: null,
    expectedResolutionDate: new Date(Date.now() + 3 * 864e5).toISOString(),
    resolvedAt: null,
    closedAt: null,
    isReopened: false,
    reopenCount: 0,
    createdAt: new Date(Date.now() - 5 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 864e5).toISOString()
  },
  {
    id: "cmp-006",
    referenceNumber: "CMP-2026-00106",
    studentId: "usr-student-3",
    title: "Air Conditioning breakdown in Central Library 2nd Floor Reading Section",
    description: "Temperature inside the quiet study hall exceeds 34C due to central AC blower trip, making prolonged study impossible before the upcoming midterms.",
    categoryId: "cat-lib",
    departmentId: "dept-lib",
    location: "Central Library, 2nd Floor Reading Hall B",
    priority: "LOW",
    incidentDate: "2026-11-19",
    status: "SUBMITTED",
    assignedToUserId: null,
    expectedResolutionDate: null,
    resolvedAt: null,
    closedAt: null,
    isReopened: false,
    reopenCount: 0,
    createdAt: new Date(Date.now() - 8 * 36e5).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 36e5).toISOString()
  }
];
var initialResolutions = [
  {
    id: "res-002",
    complaintId: "cmp-002",
    resolvedByUserId: "usr-staff-hostel",
    resolutionDescription: "The RO filtration unit cartridge was replaced with a brand-new multi-stage sediment and carbon filter. Drainage pipe connection was resealed and pressure-tested for 4 hours with no leakage detected.",
    investigationSummary: "Maintenance team inspected the unit on Nov 11. Old filter was clogged causing pressure backflow and leakage.",
    resolvedAt: new Date(Date.now() - 6 * 864e5).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 864e5).toISOString()
  }
];
var initialFeedback = [
  {
    id: "fb-002",
    complaintId: "cmp-002",
    studentId: "usr-student-1",
    rating: 5,
    comments: "Prompt response! The water is completely clean now and the leaking puddle has been wiped dry. Thank you for fixing it quickly.",
    isSatisfied: true,
    createdAt: new Date(Date.now() - 5 * 864e5).toISOString()
  }
];
var initialHistory = [
  {
    id: "hist-001",
    complaintId: "cmp-001",
    action: "SUBMITTED",
    previousStatus: null,
    newStatus: "SUBMITTED",
    performedByUserId: "usr-student-1",
    notes: "Complaint logged by student.",
    createdAt: new Date(Date.now() - 3 * 864e5).toISOString()
  },
  {
    id: "hist-002",
    complaintId: "cmp-001",
    action: "STATUS_CHANGE",
    previousStatus: "SUBMITTED",
    newStatus: "UNDER_REVIEW",
    performedByUserId: "usr-admin",
    notes: "Reviewed by Dean of Student Affairs office.",
    createdAt: new Date(Date.now() - 2.8 * 864e5).toISOString()
  },
  {
    id: "hist-003",
    complaintId: "cmp-001",
    action: "ASSIGNED",
    previousStatus: "UNDER_REVIEW",
    newStatus: "ASSIGNED",
    performedByUserId: "usr-admin",
    notes: "Assigned to IT & Networking staff Eng. Amit Sharma.",
    createdAt: new Date(Date.now() - 2.5 * 864e5).toISOString()
  },
  {
    id: "hist-004",
    complaintId: "cmp-001",
    action: "STATUS_CHANGE",
    previousStatus: "ASSIGNED",
    newStatus: "IN_PROGRESS",
    performedByUserId: "usr-staff-it",
    notes: "Field technician dispatched with replacement Aruba module.",
    createdAt: new Date(Date.now() - 1 * 864e5).toISOString()
  },
  {
    id: "hist-005",
    complaintId: "cmp-002",
    action: "SUBMITTED",
    previousStatus: null,
    newStatus: "SUBMITTED",
    performedByUserId: "usr-student-1",
    notes: "Water cooler leakage reported.",
    createdAt: new Date(Date.now() - 9 * 864e5).toISOString()
  },
  {
    id: "hist-006",
    complaintId: "cmp-002",
    action: "ASSIGNED",
    previousStatus: "SUBMITTED",
    newStatus: "ASSIGNED",
    performedByUserId: "usr-admin",
    notes: "Assigned to Estate maintenance.",
    createdAt: new Date(Date.now() - 8 * 864e5).toISOString()
  },
  {
    id: "hist-007",
    complaintId: "cmp-002",
    action: "STATUS_CHANGE",
    previousStatus: "ASSIGNED",
    newStatus: "IN_PROGRESS",
    performedByUserId: "usr-staff-hostel",
    notes: "Filters being replaced.",
    createdAt: new Date(Date.now() - 7 * 864e5).toISOString()
  },
  {
    id: "hist-008",
    complaintId: "cmp-002",
    action: "RESOLVED",
    previousStatus: "IN_PROGRESS",
    newStatus: "RESOLVED",
    performedByUserId: "usr-staff-hostel",
    notes: "Unit repaired and verified operational.",
    createdAt: new Date(Date.now() - 6 * 864e5).toISOString()
  },
  {
    id: "hist-009",
    complaintId: "cmp-003",
    action: "SUBMITTED",
    previousStatus: null,
    newStatus: "SUBMITTED",
    performedByUserId: "usr-student-1",
    notes: "GPU lab crash reported.",
    createdAt: new Date(Date.now() - 1 * 864e5).toISOString()
  },
  {
    id: "hist-010",
    complaintId: "cmp-003",
    action: "ASSIGNED",
    previousStatus: "SUBMITTED",
    newStatus: "ASSIGNED",
    performedByUserId: "usr-hod-cs",
    notes: "Assigned to Dr. Vikram Patel.",
    createdAt: new Date(Date.now() - 18 * 36e5).toISOString()
  }
];
var initialComments = [
  {
    id: "comm-001",
    complaintId: "cmp-001",
    authorId: "usr-staff-it",
    message: "Hello Priya, we tested the port remotely and saw multiple packet drops. A field engineer is dispatched with a replacement Aruba switch module.",
    isInternal: false,
    createdAt: new Date(Date.now() - 1.2 * 864e5).toISOString()
  },
  {
    id: "comm-002",
    complaintId: "cmp-001",
    authorId: "usr-student-1",
    message: "Thank you! Please note that rooms 312 through 318 have completely zero signal right now.",
    isInternal: false,
    createdAt: new Date(Date.now() - 1.1 * 864e5).toISOString()
  },
  {
    id: "comm-003",
    complaintId: "cmp-005",
    authorId: "usr-admin",
    message: "Please reply with the exact stop where you board and whether this happens on the return evening trip as well.",
    isInternal: false,
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString()
  }
];
var initialNotifications = [
  {
    id: "notif-001",
    userId: "usr-student-1",
    title: "Status Updated: IN PROGRESS",
    message: "Your complaint CMP-2026-00101 is now In Progress by IT & Campus Networking.",
    type: "STATUS_UPDATE",
    relatedComplaintId: "cmp-001",
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 864e5).toISOString()
  },
  {
    id: "notif-002",
    userId: "usr-student-1",
    title: "Complaint Resolved",
    message: "Your complaint CMP-2026-00102 has been marked as Resolved. Please provide your feedback.",
    type: "RESOLVED",
    relatedComplaintId: "cmp-002",
    isRead: true,
    createdAt: new Date(Date.now() - 6 * 864e5).toISOString()
  },
  {
    id: "notif-003",
    userId: "usr-staff-cs",
    title: "New Complaint Assigned",
    message: "You have been assigned complaint CMP-2026-00103: Lab 4 GPU workstations failing.",
    type: "ASSIGNMENT",
    relatedComplaintId: "cmp-003",
    isRead: false,
    createdAt: new Date(Date.now() - 18 * 36e5).toISOString()
  },
  {
    id: "notif-004",
    userId: "usr-admin",
    title: "High Priority Escalation",
    message: "Complaint CMP-2026-00104 regarding Canteen Hygiene has been escalated to administration.",
    type: "ESCALATION",
    relatedComplaintId: "cmp-004",
    isRead: false,
    createdAt: new Date(Date.now() - 1 * 864e5).toISOString()
  },
  {
    id: "notif-005",
    userId: "usr-student-2",
    title: "Additional Information Required",
    message: "Administration requested details on bus pass and stop for complaint CMP-2026-00105.",
    type: "INFO_REQUEST",
    relatedComplaintId: "cmp-005",
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 864e5).toISOString()
  }
];
var initialAuditLogs = [
  {
    id: "audit-001",
    userId: "usr-admin",
    action: "STATUS_CHANGE",
    targetEntity: "COMPLAINT",
    targetId: "cmp-001",
    details: { from: "SUBMITTED", to: "UNDER_REVIEW" },
    ipAddress: "127.0.0.1",
    createdAt: new Date(Date.now() - 2.8 * 864e5).toISOString()
  },
  {
    id: "audit-002",
    userId: "usr-admin",
    action: "ASSIGNMENT",
    targetEntity: "COMPLAINT",
    targetId: "cmp-001",
    details: { assignedTo: "usr-staff-it" },
    ipAddress: "127.0.0.1",
    createdAt: new Date(Date.now() - 2.5 * 864e5).toISOString()
  }
];

// server/db/db.ts
var { Pool } = pg;
var DatabaseService = class {
  pool = null;
  store;
  storeFilePath;
  constructor() {
    this.storeFilePath = path.resolve(process.cwd(), "server/db/local_store.json");
    this.store = this.loadStore();
    this.initPostgres();
  }
  loadStore() {
    try {
      if (fs.existsSync(this.storeFilePath)) {
        const raw = fs.readFileSync(this.storeFilePath, "utf8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("Could not read local store file, initializing fresh store:", err);
    }
    return {
      users: [...initialUsers],
      departments: [...initialDepartments],
      categories: [...initialCategories],
      complaints: [...initialComplaints],
      resolutions: [...initialResolutions],
      feedback: [...initialFeedback],
      history: [...initialHistory],
      comments: [...initialComments],
      notifications: [...initialNotifications],
      auditLogs: [...initialAuditLogs]
    };
  }
  saveStore() {
    if (process.env.DATABASE_URL || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      return;
    }
    try {
      const dir = path.dirname(this.storeFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storeFilePath, JSON.stringify(this.store, null, 2), "utf8");
    } catch (err) {
    }
  }
  initPostgres() {
    if (this.pool) return this.pool;
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      return null;
    }
    try {
      this.pool = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false
        },
        max: 10,
        connectionTimeoutMillis: 5e3,
        idleTimeoutMillis: 3e4
      });
      return this.pool;
    } catch (err) {
      console.warn("Supabase PostgreSQL pool creation failed:", err);
      return null;
    }
  }
  getPool() {
    if (!process.env.DATABASE_URL) return null;
    if (!this.pool) {
      this.initPostgres();
    }
    return this.pool;
  }
  toSafeUser(user) {
    const { passwordHash, ...safe } = user;
    return safe;
  }
  mapUserRow(row) {
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      passwordHash: row.password_hash,
      studentOrEmpId: row.student_or_emp_id,
      role: row.role,
      departmentId: row.department_id,
      course: row.course,
      yearOfStudy: row.year_of_study,
      phone: row.phone,
      avatarUrl: row.avatar_url,
      status: row.status,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  // ================= USERS =================
  async findUserByEmail(email) {
    const normalized = email.toLowerCase().trim();
    const pool = this.getPool();
    if (pool) {
      const res = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [normalized]);
      if (res.rows.length) {
        return this.mapUserRow(res.rows[0]);
      }
      return null;
    }
    const found = this.store.users.find((u) => u.email.toLowerCase() === normalized);
    return found ? { ...found } : null;
  }
  async findUserById(id) {
    const pool = this.getPool();
    if (pool) {
      const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
      if (res.rows.length) {
        return this.mapUserRow(res.rows[0]);
      }
      return null;
    }
    const found = this.store.users.find((u) => u.id === id);
    return found ? { ...found } : null;
  }
  async findUserByStudentOrEmpId(studentOrEmpId) {
    const trimmed = studentOrEmpId.trim();
    const pool = this.getPool();
    if (pool) {
      const res = await pool.query("SELECT * FROM users WHERE LOWER(student_or_emp_id) = LOWER($1)", [trimmed]);
      if (res.rows.length) {
        return this.mapUserRow(res.rows[0]);
      }
      return null;
    }
    const found = this.store.users.find((u) => u.studentOrEmpId.toLowerCase() === trimmed.toLowerCase());
    return found ? { ...found } : null;
  }
  async createUser(user) {
    const pool = this.getPool();
    if (pool) {
      await pool.query(
        `INSERT INTO users (id, full_name, email, password_hash, student_or_emp_id, role, department_id, course, year_of_study, phone, avatar_url, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          user.id,
          user.fullName,
          user.email,
          user.passwordHash,
          user.studentOrEmpId,
          user.role,
          user.departmentId || null,
          user.course || null,
          user.yearOfStudy || null,
          user.phone || null,
          user.avatarUrl || null,
          user.status,
          user.createdAt,
          user.updatedAt
        ]
      );
      return user;
    }
    this.store.users.push(user);
    this.saveStore();
    return user;
  }
  async updateUser(id, updates) {
    const user = await this.findUserById(id);
    if (!user) return null;
    const updated = {
      ...user,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const pool = this.getPool();
    if (pool) {
      await pool.query(
        `UPDATE users SET full_name = $1, email = $2, role = $3, department_id = $4, course = $5, year_of_study = $6, phone = $7, status = $8, updated_at = $9 WHERE id = $10`,
        [
          updated.fullName,
          updated.email,
          updated.role,
          updated.departmentId || null,
          updated.course || null,
          updated.yearOfStudy || null,
          updated.phone || null,
          updated.status,
          updated.updatedAt,
          id
        ]
      );
      return updated;
    }
    const idx = this.store.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.store.users[idx] = updated;
      this.saveStore();
    }
    return updated;
  }
  async listUsers(role, departmentId, search) {
    const pool = this.getPool();
    if (pool) {
      let query = "SELECT * FROM users WHERE 1=1";
      const params = [];
      let pIdx = 1;
      if (role) {
        query += ` AND role = $${pIdx++}`;
        params.push(role);
      }
      if (departmentId) {
        query += ` AND department_id = $${pIdx++}`;
        params.push(departmentId);
      }
      if (search) {
        query += ` AND (LOWER(full_name) LIKE $${pIdx} OR LOWER(email) LIKE $${pIdx} OR LOWER(student_or_emp_id) LIKE $${pIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        pIdx++;
      }
      query += " ORDER BY created_at DESC";
      const res = await pool.query(query, params);
      return res.rows.map((r) => this.toSafeUser(this.mapUserRow(r)));
    }
    let result = this.store.users.map((u) => this.toSafeUser(u));
    if (role) {
      result = result.filter((u) => u.role === role);
    }
    if (departmentId) {
      result = result.filter((u) => u.departmentId === departmentId);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.studentOrEmpId.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  // ================= DEPARTMENTS =================
  async listDepartments() {
    const pool = this.getPool();
    if (pool) {
      const res = await pool.query("SELECT * FROM departments ORDER BY name ASC");
      return res.rows.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        description: row.description,
        headUserId: row.head_user_id,
        contactEmail: row.contact_email,
        contactPhone: row.contact_phone,
        officeLocation: row.office_location,
        status: row.status,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
      }));
    }
    return [...this.store.departments].sort((a, b) => a.name.localeCompare(b.name));
  }
  async findDepartmentById(id) {
    const pool = this.getPool();
    if (pool) {
      const res = await pool.query("SELECT * FROM departments WHERE id = $1", [id]);
      if (res.rows.length) {
        const row = res.rows[0];
        return {
          id: row.id,
          name: row.name,
          code: row.code,
          description: row.description,
          headUserId: row.head_user_id,
          contactEmail: row.contact_email,
          contactPhone: row.contact_phone,
          officeLocation: row.office_location,
          status: row.status,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      return null;
    }
    const found = this.store.departments.find((d) => d.id === id);
    return found ? { ...found } : null;
  }
  async createDepartment(department) {
    const pool = this.getPool();
    if (pool) {
      await pool.query(
        `INSERT INTO departments (id, name, code, description, head_user_id, contact_email, contact_phone, office_location, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          department.id,
          department.name,
          department.code,
          department.description || null,
          department.headUserId || null,
          department.contactEmail || null,
          department.contactPhone || null,
          department.officeLocation || null,
          department.status || "ACTIVE",
          department.createdAt,
          department.updatedAt
        ]
      );
      return department;
    }
    this.store.departments.push(department);
    this.saveStore();
    return department;
  }
  async updateDepartment(id, updates) {
    const dept = await this.findDepartmentById(id);
    if (!dept) return null;
    const updated = {
      ...dept,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const pool = this.getPool();
    if (pool) {
      await pool.query(
        `UPDATE departments SET name = $1, code = $2, description = $3, head_user_id = $4, contact_email = $5, contact_phone = $6, office_location = $7, status = $8, updated_at = $9 WHERE id = $10`,
        [
          updated.name,
          updated.code,
          updated.description || null,
          updated.headUserId || null,
          updated.contactEmail || null,
          updated.contactPhone || null,
          updated.officeLocation || null,
          updated.status,
          updated.updatedAt,
          id
        ]
      );
      return updated;
    }
    const idx = this.store.departments.findIndex((d) => d.id === id);
    if (idx !== -1) {
      this.store.departments[idx] = updated;
      this.saveStore();
    }
    return updated;
  }
  async deleteDepartment(id) {
    const pool = this.getPool();
    if (pool) {
      const chk = await pool.query("SELECT COUNT(*) FROM complaints WHERE department_id = $1", [id]);
      const count2 = parseInt(chk.rows[0].count, 10);
      if (count2 > 0) {
        throw new Error(`Cannot delete department with ${count2} active complaints. Deactivate it instead.`);
      }
      const res = await pool.query("DELETE FROM departments WHERE id = $1", [id]);
      return (res.rowCount || 0) > 0;
    }
    const count = this.store.complaints.filter((c) => c.departmentId === id).length;
    if (count > 0) {
      throw new Error(`Cannot delete department with ${count} active complaints. Deactivate it instead.`);
    }
    const prevLen = this.store.departments.length;
    this.store.departments = this.store.departments.filter((d) => d.id !== id);
    this.saveStore();
    return this.store.departments.length < prevLen;
  }
  // ================= CATEGORIES =================
  async listCategories() {
    const pool = this.getPool();
    if (pool) {
      const res = await pool.query("SELECT * FROM complaint_categories ORDER BY name ASC");
      return res.rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        defaultDepartmentId: row.default_department_id,
        defaultPriority: row.default_priority,
        status: row.status,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
      }));
    }
    return [...this.store.categories].sort((a, b) => a.name.localeCompare(b.name));
  }
  async findCategoryById(id) {
    const pool = this.getPool();
    if (pool) {
      const res = await pool.query("SELECT * FROM complaint_categories WHERE id = $1", [id]);
      if (res.rows.length) {
        const row = res.rows[0];
        return {
          id: row.id,
          name: row.name,
          description: row.description,
          defaultDepartmentId: row.default_department_id,
          defaultPriority: row.default_priority,
          status: row.status,
          createdAt: row.created_at ? new Date(row.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      return null;
    }
    const found = this.store.categories.find((c) => c.id === id);
    return found ? { ...found } : null;
  }
  async createCategory(cat) {
    const pool = this.getPool();
    if (pool) {
      await pool.query(
        `INSERT INTO complaint_categories (id, name, description, default_department_id, default_priority, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          cat.id,
          cat.name,
          cat.description || null,
          cat.defaultDepartmentId || null,
          cat.defaultPriority || "MEDIUM",
          cat.status || "ACTIVE",
          cat.createdAt,
          cat.updatedAt
        ]
      );
      return cat;
    }
    this.store.categories.push(cat);
    this.saveStore();
    return cat;
  }
  async updateCategory(id, updates) {
    const cat = await this.findCategoryById(id);
    if (!cat) return null;
    const updated = {
      ...cat,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const pool = this.getPool();
    if (pool) {
      await pool.query(
        `UPDATE complaint_categories SET name = $1, description = $2, default_department_id = $3, default_priority = $4, status = $5, updated_at = $6 WHERE id = $7`,
        [
          updated.name,
          updated.description || null,
          updated.defaultDepartmentId || null,
          updated.defaultPriority,
          updated.status,
          updated.updatedAt,
          id
        ]
      );
      return updated;
    }
    const idx = this.store.categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.store.categories[idx] = updated;
      this.saveStore();
    }
    return updated;
  }
  async deleteCategory(id) {
    const pool = this.getPool();
    if (pool) {
      const chk = await pool.query("SELECT COUNT(*) FROM complaints WHERE category_id = $1", [id]);
      const count2 = parseInt(chk.rows[0].count, 10);
      if (count2 > 0) {
        throw new Error(`Cannot delete category with ${count2} associated complaints. Deactivate it instead.`);
      }
      const res = await pool.query("DELETE FROM complaint_categories WHERE id = $1", [id]);
      return (res.rowCount || 0) > 0;
    }
    const count = this.store.complaints.filter((c) => c.categoryId === id).length;
    if (count > 0) {
      throw new Error(`Cannot delete category with ${count} associated complaints. Deactivate it instead.`);
    }
    const prevLen = this.store.categories.length;
    this.store.categories = this.store.categories.filter((c) => c.id !== id);
    this.saveStore();
    return this.store.categories.length < prevLen;
  }
  // ================= COMPLAINTS =================
  mapComplaintRow(row) {
    return {
      id: row.id,
      referenceNumber: row.reference_number,
      studentId: row.student_id,
      title: row.title,
      description: row.description,
      categoryId: row.category_id,
      departmentId: row.department_id,
      location: row.location,
      priority: row.priority,
      incidentDate: row.incident_date ? new Date(row.incident_date).toISOString().split("T")[0] : null,
      status: row.status,
      assignedToUserId: row.assigned_to_user_id,
      expectedResolutionDate: row.expected_resolution_date ? new Date(row.expected_resolution_date).toISOString() : null,
      resolvedAt: row.resolved_at ? new Date(row.resolved_at).toISOString() : null,
      closedAt: row.closed_at ? new Date(row.closed_at).toISOString() : null,
      isReopened: Boolean(row.is_reopened),
      reopenCount: Number(row.reopen_count || 0),
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async populateComplaintAsync(complaint) {
    const studentUser = await this.findUserById(complaint.studentId);
    const assignedUser = complaint.assignedToUserId ? await this.findUserById(complaint.assignedToUserId) : null;
    const category = await this.findCategoryById(complaint.categoryId);
    const department = await this.findDepartmentById(complaint.departmentId);
    const resolution = this.store.resolutions.find((r) => r.complaintId === complaint.id);
    const feedback = this.store.feedback.find((f) => f.complaintId === complaint.id);
    return {
      ...complaint,
      student: studentUser ? this.toSafeUser(studentUser) : void 0,
      assignedTo: assignedUser ? this.toSafeUser(assignedUser) : void 0,
      category: category || void 0,
      department: department || void 0,
      resolution,
      feedback
    };
  }
  populateComplaint(complaint) {
    const studentUser = this.store.users.find((u) => u.id === complaint.studentId);
    const assignedUser = complaint.assignedToUserId ? this.store.users.find((u) => u.id === complaint.assignedToUserId) : null;
    const category = this.store.categories.find((c) => c.id === complaint.categoryId);
    const department = this.store.departments.find((d) => d.id === complaint.departmentId);
    const resolution = this.store.resolutions.find((r) => r.complaintId === complaint.id);
    const feedback = this.store.feedback.find((f) => f.complaintId === complaint.id);
    return {
      ...complaint,
      student: studentUser ? this.toSafeUser(studentUser) : void 0,
      assignedTo: assignedUser ? this.toSafeUser(assignedUser) : void 0,
      category,
      department,
      resolution,
      feedback
    };
  }
  async listComplaints(filters) {
    const pool = this.getPool();
    if (pool) {
      let query = "SELECT * FROM complaints WHERE 1=1";
      const params = [];
      let pIdx = 1;
      if (filters.studentId) {
        query += ` AND student_id = $${pIdx++}`;
        params.push(filters.studentId);
      }
      if (filters.departmentId) {
        query += ` AND department_id = $${pIdx++}`;
        params.push(filters.departmentId);
      }
      if (filters.assignedToUserId) {
        query += ` AND assigned_to_user_id = $${pIdx++}`;
        params.push(filters.assignedToUserId);
      }
      if (filters.status) {
        query += ` AND status = $${pIdx++}`;
        params.push(filters.status);
      }
      if (filters.priority) {
        query += ` AND priority = $${pIdx++}`;
        params.push(filters.priority);
      }
      if (filters.categoryId) {
        query += ` AND category_id = $${pIdx++}`;
        params.push(filters.categoryId);
      }
      if (filters.search) {
        query += ` AND (LOWER(title) LIKE $${pIdx} OR LOWER(reference_number) LIKE $${pIdx} OR LOWER(description) LIKE $${pIdx} OR LOWER(location) LIKE $${pIdx})`;
        params.push(`%${filters.search.toLowerCase()}%`);
        pIdx++;
      }
      if (filters.startDate) {
        query += ` AND created_at >= $${pIdx++}`;
        params.push(new Date(filters.startDate).toISOString());
      }
      if (filters.endDate) {
        query += ` AND created_at <= $${pIdx++}`;
        params.push(new Date(filters.endDate).toISOString());
      }
      if (filters.dateRange && filters.dateRange !== "ALL") {
        const now = Date.now();
        let limitDays = 30;
        if (filters.dateRange === "MONTH") limitDays = 30;
        else if (filters.dateRange === "3_MONTHS") limitDays = 90;
        else if (filters.dateRange === "6_MONTHS") limitDays = 180;
        else if (filters.dateRange === "YEAR") limitDays = 365;
        const cutoff = new Date(now - limitDays * 864e5).toISOString();
        query += ` AND created_at >= $${pIdx++}`;
        params.push(cutoff);
      }
      query += " ORDER BY created_at DESC";
      const res = await pool.query(query, params);
      const complaints = res.rows.map((r) => this.mapComplaintRow(r));
      return Promise.all(complaints.map((c) => this.populateComplaintAsync(c)));
    }
    let result = [...this.store.complaints];
    if (filters.studentId) {
      result = result.filter((c) => c.studentId === filters.studentId);
    }
    if (filters.departmentId) {
      result = result.filter((c) => c.departmentId === filters.departmentId);
    }
    if (filters.assignedToUserId) {
      result = result.filter((c) => c.assignedToUserId === filters.assignedToUserId);
    }
    if (filters.status) {
      result = result.filter((c) => c.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter((c) => c.priority === filters.priority);
    }
    if (filters.categoryId) {
      result = result.filter((c) => c.categoryId === filters.categoryId);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.referenceNumber.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.location && c.location.toLowerCase().includes(q)
      );
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      result = result.filter((c) => new Date(c.createdAt).getTime() >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      result = result.filter((c) => new Date(c.createdAt).getTime() <= end);
    }
    if (filters.dateRange && filters.dateRange !== "ALL") {
      const now = Date.now();
      let limitDays = 30;
      if (filters.dateRange === "MONTH") limitDays = 30;
      else if (filters.dateRange === "3_MONTHS") limitDays = 90;
      else if (filters.dateRange === "6_MONTHS") limitDays = 180;
      else if (filters.dateRange === "YEAR") limitDays = 365;
      const cutoff = now - limitDays * 864e5;
      result = result.filter((c) => new Date(c.createdAt).getTime() >= cutoff);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((c) => this.populateComplaint(c));
  }
  async findComplaintById(id) {
    const pool = this.getPool();
    if (pool) {
      const res = await pool.query("SELECT * FROM complaints WHERE id = $1 OR reference_number = $1", [id]);
      if (res.rows.length) {
        return this.populateComplaintAsync(this.mapComplaintRow(res.rows[0]));
      }
      return null;
    }
    const found = this.store.complaints.find((c) => c.id === id || c.referenceNumber === id);
    if (!found) return null;
    return this.populateComplaint(found);
  }
  async createComplaint(complaint) {
    const pool = this.getPool();
    if (pool) {
      await pool.query(
        `INSERT INTO complaints (id, reference_number, student_id, title, description, category_id, department_id, location, priority, incident_date, status, assigned_to_user_id, expected_resolution_date, resolved_at, closed_at, is_reopened, reopen_count, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          complaint.id,
          complaint.referenceNumber,
          complaint.studentId,
          complaint.title,
          complaint.description,
          complaint.categoryId,
          complaint.departmentId,
          complaint.location || null,
          complaint.priority,
          complaint.incidentDate || null,
          complaint.status,
          complaint.assignedToUserId || null,
          complaint.expectedResolutionDate || null,
          complaint.resolvedAt || null,
          complaint.closedAt || null,
          complaint.isReopened || false,
          complaint.reopenCount || 0,
          complaint.createdAt,
          complaint.updatedAt
        ]
      );
      await this.addComplaintHistory({
        id: `hist-${Date.now()}`,
        complaintId: complaint.id,
        action: "SUBMITTED",
        previousStatus: null,
        newStatus: "SUBMITTED",
        performedByUserId: complaint.studentId,
        notes: "Complaint submitted by student.",
        createdAt: complaint.createdAt
      });
      await this.createNotification({
        id: `notif-${Date.now()}`,
        userId: "usr-admin",
        title: "New Complaint Submitted",
        message: `${complaint.referenceNumber}: ${complaint.title}`,
        type: "COMPLAINT_SUBMITTED",
        relatedComplaintId: complaint.id,
        isRead: false,
        createdAt: complaint.createdAt
      });
      return this.populateComplaintAsync(complaint);
    }
    this.store.complaints.unshift(complaint);
    this.addComplaintHistory({
      id: `hist-${Date.now()}`,
      complaintId: complaint.id,
      action: "SUBMITTED",
      previousStatus: null,
      newStatus: "SUBMITTED",
      performedByUserId: complaint.studentId,
      notes: "Complaint submitted by student.",
      createdAt: complaint.createdAt
    });
    this.createNotification({
      id: `notif-${Date.now()}`,
      userId: "usr-admin",
      title: "New Complaint Submitted",
      message: `${complaint.referenceNumber}: ${complaint.title}`,
      type: "COMPLAINT_SUBMITTED",
      relatedComplaintId: complaint.id,
      isRead: false,
      createdAt: complaint.createdAt
    });
    this.saveStore();
    return this.populateComplaint(complaint);
  }
  async updateComplaint(id, updates) {
    const complaint = await this.findComplaintById(id);
    if (!complaint) return null;
    const updated = {
      ...complaint,
      ...updates,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const pool = this.getPool();
    if (pool) {
      await pool.query(
        `UPDATE complaints SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          status = COALESCE($3, status),
          priority = COALESCE($4, priority),
          assigned_to_user_id = $5,
          expected_resolution_date = $6,
          resolved_at = $7,
          closed_at = $8,
          is_reopened = COALESCE($9, is_reopened),
          reopen_count = COALESCE($10, reopen_count),
          updated_at = $11
        WHERE id = $12`,
        [
          updated.title,
          updated.description,
          updated.status,
          updated.priority,
          updated.assignedToUserId || null,
          updated.expectedResolutionDate || null,
          updated.resolvedAt || null,
          updated.closedAt || null,
          updated.isReopened,
          updated.reopenCount,
          updated.updatedAt,
          id
        ]
      );
      return this.populateComplaintAsync(updated);
    }
    const idx = this.store.complaints.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.store.complaints[idx] = updated;
      this.saveStore();
    }
    return this.populateComplaint(updated);
  }
  // ================= RESOLUTIONS =================
  async upsertResolution(resolution) {
    const existingIdx = this.store.resolutions.findIndex((r) => r.complaintId === resolution.complaintId);
    if (existingIdx !== -1) {
      this.store.resolutions[existingIdx] = resolution;
    } else {
      this.store.resolutions.push(resolution);
    }
    const complaint = await this.findComplaintById(resolution.complaintId);
    if (complaint) {
      await this.updateComplaint(complaint.id, {
        status: "RESOLVED",
        resolvedAt: resolution.resolvedAt
      });
      this.addComplaintHistory({
        id: `hist-${Date.now()}`,
        complaintId: complaint.id,
        action: "RESOLVED",
        previousStatus: complaint.status,
        newStatus: "RESOLVED",
        performedByUserId: resolution.resolvedByUserId,
        notes: resolution.resolutionDescription,
        createdAt: resolution.resolvedAt
      });
      this.createNotification({
        id: `notif-${Date.now()}`,
        userId: complaint.studentId,
        title: "Complaint Resolved",
        message: `Your complaint ${complaint.referenceNumber} has been resolved. Please review and provide feedback.`,
        type: "RESOLVED",
        relatedComplaintId: complaint.id,
        isRead: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    this.saveStore();
    return resolution;
  }
  // ================= FEEDBACK =================
  async createFeedback(feedback) {
    const existingIdx = this.store.feedback.findIndex((f) => f.complaintId === feedback.complaintId);
    if (existingIdx !== -1) {
      this.store.feedback[existingIdx] = feedback;
    } else {
      this.store.feedback.push(feedback);
    }
    const complaint = await this.findComplaintById(feedback.complaintId);
    if (complaint) {
      await this.updateComplaint(complaint.id, {
        status: "CLOSED",
        closedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      this.addComplaintHistory({
        id: `hist-${Date.now()}`,
        complaintId: complaint.id,
        action: "CLOSED",
        previousStatus: complaint.status,
        newStatus: "CLOSED",
        performedByUserId: feedback.studentId,
        notes: `Student rated resolution ${feedback.rating}/5 stars. ${feedback.comments || ""}`,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    this.saveStore();
    return feedback;
  }
  // ================= REOPEN =================
  async reopenComplaint(complaintId, studentId, reason) {
    const complaint = await this.findComplaintById(complaintId);
    if (!complaint) throw new Error("Complaint not found");
    if (complaint.studentId !== studentId) throw new Error("Unauthorized to reopen this complaint");
    if (complaint.status !== "RESOLVED" && complaint.status !== "CLOSED") {
      throw new Error("Only resolved or closed complaints can be reopened");
    }
    const updated = await this.updateComplaint(complaint.id, {
      status: "IN_PROGRESS",
      isReopened: true,
      reopenCount: (complaint.reopenCount || 0) + 1,
      resolvedAt: null,
      closedAt: null
    });
    this.addComplaintHistory({
      id: `hist-${Date.now()}`,
      complaintId: complaint.id,
      action: "REOPENED",
      previousStatus: complaint.status,
      newStatus: "IN_PROGRESS",
      performedByUserId: studentId,
      notes: `Reopened by student: ${reason}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const notifyUser = complaint.assignedToUserId || "usr-admin";
    this.createNotification({
      id: `notif-${Date.now()}`,
      userId: notifyUser,
      title: "Complaint Reopened",
      message: `Student reopened complaint ${complaint.referenceNumber}: ${reason}`,
      type: "REOPENED",
      relatedComplaintId: complaint.id,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    this.saveStore();
    return updated;
  }
  // ================= HISTORY =================
  async listComplaintHistory(complaintId) {
    return this.store.history.filter((h) => h.complaintId === complaintId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((h) => {
      const user = this.store.users.find((u) => u.id === h.performedByUserId);
      return {
        ...h,
        performedBy: user ? this.toSafeUser(user) : void 0
      };
    });
  }
  async addComplaintHistory(historyItem) {
    this.store.history.push(historyItem);
    this.saveStore();
    return historyItem;
  }
  // ================= COMMENTS =================
  async listComplaintComments(complaintId, includeInternal = true) {
    return this.store.comments.filter((c) => c.complaintId === complaintId && (includeInternal || !c.isInternal)).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((c) => {
      const author = this.store.users.find((u) => u.id === c.authorId);
      return {
        ...c,
        author: author ? this.toSafeUser(author) : void 0
      };
    });
  }
  async createComplaintComment(comment) {
    this.store.comments.push(comment);
    const complaint = await this.findComplaintById(comment.complaintId);
    if (complaint) {
      if (comment.authorId === complaint.studentId) {
        const recipient = complaint.assignedToUserId || "usr-admin";
        this.createNotification({
          id: `notif-${Date.now()}`,
          userId: recipient,
          title: "Student Responded to Complaint",
          message: `Update on ${complaint.referenceNumber}: ${comment.message.slice(0, 100)}`,
          type: "COMMENT_ADDED",
          relatedComplaintId: complaint.id,
          isRead: false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      } else if (!comment.isInternal) {
        this.createNotification({
          id: `notif-${Date.now()}`,
          userId: complaint.studentId,
          title: "New Response on Your Complaint",
          message: `${comment.message.slice(0, 100)}`,
          type: "COMMENT_ADDED",
          relatedComplaintId: complaint.id,
          isRead: false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    this.saveStore();
    return comment;
  }
  // ================= NOTIFICATIONS =================
  async listNotifications(userId) {
    const pool = this.getPool();
    if (pool) {
      const res = await pool.query(
        "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC",
        [userId]
      );
      return res.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        title: r.title,
        message: r.message,
        type: r.type,
        relatedComplaintId: r.related_complaint_id,
        isRead: r.is_read,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
      }));
    }
    return this.store.notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  async markNotificationRead(id, userId) {
    const pool = this.getPool();
    if (pool) {
      const res = await pool.query(
        "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      return (res.rowCount || 0) > 0;
    }
    const notif = this.store.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      this.saveStore();
      return true;
    }
    return false;
  }
  async markAllNotificationsRead(userId) {
    const pool = this.getPool();
    if (pool) {
      const res = await pool.query(
        "UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false",
        [userId]
      );
      return res.rowCount || 0;
    }
    let count = 0;
    for (const notif of this.store.notifications) {
      if (notif.userId === userId && !notif.isRead) {
        notif.isRead = true;
        count++;
      }
    }
    if (count > 0) this.saveStore();
    return count;
  }
  async createNotification(notification) {
    const pool = this.getPool();
    if (pool) {
      await pool.query(
        `INSERT INTO notifications (id, user_id, title, message, type, related_complaint_id, is_read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          notification.id,
          notification.userId,
          notification.title,
          notification.message,
          notification.type,
          notification.relatedComplaintId || null,
          notification.isRead || false,
          notification.createdAt
        ]
      );
      return notification;
    }
    this.store.notifications.unshift(notification);
    this.saveStore();
    return notification;
  }
  // ================= AUDIT LOGS =================
  async createAuditLog(log) {
    const pool = this.getPool();
    if (pool) {
      await pool.query(
        `INSERT INTO audit_logs (id, user_id, action, target_entity, target_id, details, ip_address, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          log.id,
          log.userId || null,
          log.action,
          log.targetEntity,
          log.targetId || null,
          JSON.stringify(log.details || {}),
          log.ipAddress || null,
          log.createdAt
        ]
      );
      return log;
    }
    this.store.auditLogs.unshift(log);
    this.saveStore();
    return log;
  }
  async listAuditLogs(limit = 100) {
    const pool = this.getPool();
    if (pool) {
      const res = await pool.query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1", [limit]);
      return res.rows.map((r) => ({
        id: r.id,
        userId: r.user_id,
        action: r.action,
        targetEntity: r.target_entity,
        targetId: r.target_id,
        details: r.details,
        ipAddress: r.ip_address,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : (/* @__PURE__ */ new Date()).toISOString()
      }));
    }
    return this.store.auditLogs.slice(0, limit).map((log) => {
      const user = log.userId ? this.store.users.find((u) => u.id === log.userId) : null;
      return {
        ...log,
        user: user ? this.toSafeUser(user) : void 0
      };
    });
  }
  // ================= STATISTICS & REPORTS =================
  async getDashboardStatistics(user, dateRange = "ALL") {
    let complaints = await this.listComplaints({
      studentId: user.role === "STUDENT" ? user.id : void 0,
      departmentId: user.role === "DEPARTMENT_HEAD" || user.role === "STAFF" || user.role === "FACULTY" ? user.departmentId || void 0 : void 0,
      assignedToUserId: user.role === "STAFF" || user.role === "FACULTY" ? user.id : void 0,
      dateRange
    });
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "SUBMITTED" || c.status === "UNDER_REVIEW").length;
    const inProgress = complaints.filter(
      (c) => c.status === "IN_PROGRESS" || c.status === "ASSIGNED" || c.status === "WAITING_FOR_STUDENT"
    ).length;
    const resolved = complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
    const rejected = complaints.filter((c) => c.status === "REJECTED").length;
    const escalated = complaints.filter((c) => c.status === "ESCALATED").length;
    const now = Date.now();
    const overdue = complaints.filter(
      (c) => c.expectedResolutionDate && new Date(c.expectedResolutionDate).getTime() < now && c.status !== "RESOLVED" && c.status !== "CLOSED" && c.status !== "REJECTED"
    ).length;
    const resolvedList = complaints.filter((c) => c.resolvedAt);
    let avgResolutionDays = 0;
    if (resolvedList.length > 0) {
      const totalDays = resolvedList.reduce((acc, c) => {
        const start = new Date(c.createdAt).getTime();
        const end = new Date(c.resolvedAt).getTime();
        return acc + Math.max(0, (end - start) / (1e3 * 60 * 60 * 24));
      }, 0);
      avgResolutionDays = Number((totalDays / resolvedList.length).toFixed(1));
    }
    const statusDistribution = [
      { name: "Submitted", value: complaints.filter((c) => c.status === "SUBMITTED").length, color: "#f59e0b" },
      { name: "Under Review", value: complaints.filter((c) => c.status === "UNDER_REVIEW").length, color: "#eab308" },
      { name: "Assigned", value: complaints.filter((c) => c.status === "ASSIGNED").length, color: "#3b82f6" },
      { name: "In Progress", value: complaints.filter((c) => c.status === "IN_PROGRESS").length, color: "#6366f1" },
      {
        name: "Waiting Student",
        value: complaints.filter((c) => c.status === "WAITING_FOR_STUDENT").length,
        color: "#8b5cf6"
      },
      { name: "Escalated", value: escalated, color: "#ef4444" },
      { name: "Resolved", value: resolved, color: "#10b981" },
      { name: "Rejected", value: rejected, color: "#64748b" }
    ].filter((s) => s.value > 0);
    const categoryCounts = {};
    for (const c of complaints) {
      const catName = c.category?.name || "Other";
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    }
    const categoryBreakdown = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count
    }));
    const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
    const monthlyTrend = months.map((month, idx) => {
      const baseSubmissions = complaints.filter((c) => {
        const d = new Date(c.createdAt);
        return d.getMonth() === 5 + idx;
      }).length;
      return {
        month,
        submitted: baseSubmissions + (idx === 5 ? complaints.length : Math.max(1, idx * 2)),
        resolved: Math.max(0, baseSubmissions - 1 + idx)
      };
    });
    const deptCounts = {};
    for (const d of this.store.departments) {
      deptCounts[d.name] = { total: 0, resolved: 0 };
    }
    for (const c of complaints) {
      const deptName = c.department?.name || "General";
      if (!deptCounts[deptName]) deptCounts[deptName] = { total: 0, resolved: 0 };
      deptCounts[deptName].total++;
      if (c.status === "RESOLVED" || c.status === "CLOSED") {
        deptCounts[deptName].resolved++;
      }
    }
    const departmentBreakdown = Object.entries(deptCounts).map(([name, data]) => ({
      name,
      total: data.total,
      resolved: data.resolved
    })).filter((d) => d.total > 0 || user.role === "ADMIN");
    const totalUsers = this.store.users.length;
    const totalStudents = this.store.users.filter((u) => u.role === "STUDENT").length;
    const totalStaff = this.store.users.filter((u) => u.role !== "STUDENT").length;
    const totalDepartments = this.store.departments.length;
    return {
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      escalated,
      overdue,
      avgResolutionDays,
      resolutionRate: total > 0 ? Math.round(resolved / total * 100) : 0,
      totalUsers,
      totalStudents,
      totalStaff,
      totalDepartments,
      statusDistribution,
      categoryBreakdown,
      monthlyTrend,
      departmentBreakdown
    };
  }
};
var db = new DatabaseService();

// server/middleware/auth.middleware.ts
import "dotenv/config";
import jwt from "jsonwebtoken";
var getJwtSecret = () => process.env.JWT_SECRET || "campus_resolve_jwt_secret_key_2026_super_secure_college_portal";
var authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
      res.status(401).json({ success: false, message: "Authentication required. No token provided." });
      return;
    }
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await db.findUserById(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: "User account not found or token invalid." });
      return;
    }
    if (user.status !== "ACTIVE") {
      res.status(403).json({ success: false, message: "Account has been deactivated or suspended." });
      return;
    }
    req.user = db.toSafeUser(user);
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired session token.", error: err.message });
  }
};
var requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: ${allowedRoles.join(", ")}. Your role is ${req.user.role}.`
      });
      return;
    }
    next();
  };
};
var generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.fullName
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
};

// server/controllers/auth.controller.ts
var register = async (req, res) => {
  try {
    const { fullName, email, password, studentOrEmpId, departmentId, course, yearOfStudy, phone, role } = req.body;
    if (!fullName || !email || !password || !studentOrEmpId) {
      res.status(400).json({
        success: false,
        message: "Please provide full name, college email, password, and Student/Roll ID."
      });
      return;
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid college email address."
      });
      return;
    }
    if (String(password).length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long."
      });
      return;
    }
    let existingEmail = null;
    try {
      existingEmail = await db.findUserByEmail(normalizedEmail);
    } catch (dbErr) {
      console.error("Database error in findUserByEmail:", dbErr);
      res.status(503).json({
        success: false,
        message: "Database service is temporarily unavailable. Please try again in a few moments."
      });
      return;
    }
    if (existingEmail) {
      res.status(409).json({
        success: false,
        message: "An account with this college email already exists."
      });
      return;
    }
    let existingStudentId = null;
    try {
      existingStudentId = await db.findUserByStudentOrEmpId(String(studentOrEmpId).trim());
    } catch (dbErr) {
      console.error("Database error in findUserByStudentOrEmpId:", dbErr);
      res.status(503).json({
        success: false,
        message: "Database service is temporarily unavailable. Please try again in a few moments."
      });
      return;
    }
    if (existingStudentId) {
      res.status(409).json({
        success: false,
        message: "An account with this Student ID / Roll No already exists."
      });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const id = `usr-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
    const newUser = {
      id,
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      studentOrEmpId: String(studentOrEmpId).trim(),
      role: role || "STUDENT",
      departmentId: departmentId || null,
      course: course || null,
      yearOfStudy: yearOfStudy || null,
      phone: phone || null,
      status: "ACTIVE",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      await db.createUser(newUser);
    } catch (createErr) {
      console.error("Database error in createUser:", createErr);
      res.status(503).json({
        success: false,
        message: "Database service is temporarily unavailable. Failed to persist account."
      });
      return;
    }
    const safeUser = db.toSafeUser(newUser);
    const token = generateToken(safeUser);
    try {
      await db.createNotification({
        id: `notif-${Date.now()}`,
        userId: id,
        title: "Welcome to CampusResolve",
        message: "Your student account has been created. You can now lodge, track, and manage grievances.",
        type: "ACCOUNT_CREATED",
        isRead: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (notifErr) {
      console.warn("Initial notification could not be created:", notifErr);
    }
    res.status(201).json({
      success: true,
      message: "Registration successful.",
      data: {
        user: safeUser,
        token
      }
    });
  } catch (err) {
    const errorMsg = typeof err?.message === "string" ? err.message : "Failed to register account.";
    res.status(500).json({ success: false, message: errorMsg });
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required." });
      return;
    }
    const normalizedEmail = String(email).toLowerCase().trim();
    let user = null;
    try {
      user = await db.findUserByEmail(normalizedEmail);
    } catch (dbErr) {
      console.error("Database error in login:", dbErr);
      res.status(503).json({
        success: false,
        message: "Database service is temporarily unavailable. Please try again shortly."
      });
      return;
    }
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials. User not found." });
      return;
    }
    if (user.status !== "ACTIVE") {
      res.status(403).json({ success: false, message: "Your account has been deactivated or suspended by administration." });
      return;
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid email or password." });
      return;
    }
    const safeUser = db.toSafeUser(user);
    const token = generateToken(safeUser);
    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: safeUser,
        token
      }
    });
  } catch (err) {
    const errorMsg = typeof err?.message === "string" ? err.message : "Login failed.";
    res.status(500).json({ success: false, message: errorMsg });
  }
};
var getMe = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }
    const fullUser = await db.findUserById(req.user.id);
    if (!fullUser) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({
      success: true,
      data: db.toSafeUser(fullUser)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve user profile.", error: err.message });
  }
};
var logout = async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully." });
};
var forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: "Email is required." });
    return;
  }
  const user = await db.findUserByEmail(email);
  if (!user) {
    res.status(200).json({
      success: true,
      message: "If a matching college account was found, password reset instructions have been issued."
    });
    return;
  }
  res.status(200).json({
    success: true,
    message: "If a matching college account was found, password reset instructions have been issued.",
    demoResetToken: `reset-${user.id}-${Date.now()}`
  });
};
var resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    res.status(400).json({ success: false, message: "Email and new password are required." });
    return;
  }
  const user = await db.findUserByEmail(email);
  if (!user) {
    res.status(404).json({ success: false, message: "Account not found." });
    return;
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.updateUser(user.id, { passwordHash });
  res.status(200).json({
    success: true,
    message: "Password has been successfully reset. You may now log in."
  });
};
var updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }
    const { fullName, phone, course, yearOfStudy } = req.body;
    const updated = await db.updateUser(req.user.id, {
      fullName: fullName || req.user.fullName,
      phone: phone !== void 0 ? phone : req.user.phone,
      course: course !== void 0 ? course : req.user.course,
      yearOfStudy: yearOfStudy !== void 0 ? yearOfStudy : req.user.yearOfStudy
    });
    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updated ? db.toSafeUser(updated) : null
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update profile.", error: err.message });
  }
};
var changePassword = async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Not authenticated." });
      return;
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: "Current and new password are required." });
      return;
    }
    const user = await db.findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Current password does not match." });
      return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.updateUser(user.id, { passwordHash });
    res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to change password.", error: err.message });
  }
};

// server/routes/auth.routes.ts
var router = Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", authenticateToken, getMe);
router.put("/profile", authenticateToken, updateProfile);
router.post("/change-password", authenticateToken, changePassword);
var auth_routes_default = router;

// server/routes/complaint.routes.ts
import { Router as Router2 } from "express";

// server/controllers/complaint.controller.ts
var listComplaints = async (req, res) => {
  try {
    const user = req.user;
    const { status, priority, categoryId, departmentId, search, dateRange, startDate, endDate, staffAssignedOnly } = req.query;
    const filters = {
      status,
      priority,
      categoryId,
      departmentId,
      search,
      dateRange,
      startDate,
      endDate
    };
    if (user.role === "STUDENT") {
      filters.studentId = user.id;
    } else if (user.role === "STAFF" || user.role === "FACULTY") {
      if (staffAssignedOnly === "true") {
        filters.assignedToUserId = user.id;
      } else {
        filters.departmentId = user.departmentId || void 0;
      }
    } else if (user.role === "DEPARTMENT_HEAD") {
      filters.departmentId = user.departmentId || void 0;
    }
    const complaints = await db.listComplaints(filters);
    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve complaints.", error: err.message });
  }
};
var getComplaintById = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }
    if (user.role === "STUDENT" && complaint.studentId !== user.id) {
      res.status(403).json({ success: false, message: "Access denied. You can only view your own complaints." });
      return;
    }
    if ((user.role === "STAFF" || user.role === "FACULTY" || user.role === "DEPARTMENT_HEAD") && user.departmentId) {
      if (complaint.departmentId !== user.departmentId && complaint.assignedToUserId !== user.id) {
        res.status(403).json({ success: false, message: "Access denied. Complaint belongs to another department." });
        return;
      }
    }
    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve complaint details.", error: err.message });
  }
};
var createComplaint = async (req, res) => {
  try {
    const user = req.user;
    const { title, description, categoryId, departmentId, location, priority, incidentDate } = req.body;
    if (!title || !description || !categoryId || !departmentId) {
      res.status(400).json({
        success: false,
        message: "Title, description, category, and department are required fields."
      });
      return;
    }
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const randomDigits = Math.floor(1e4 + Math.random() * 9e4);
    const referenceNumber = `CMP-${year}-${randomDigits}`;
    const newComplaint = {
      id: `cmp-${Date.now()}`,
      referenceNumber,
      studentId: user.id,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      departmentId,
      location: location ? location.trim() : null,
      priority: priority || "MEDIUM",
      incidentDate: incidentDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      status: "SUBMITTED",
      assignedToUserId: null,
      expectedResolutionDate: null,
      resolvedAt: null,
      closedAt: null,
      isReopened: false,
      reopenCount: 0,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = await db.createComplaint(newComplaint);
    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: user.id,
      action: "CREATE_COMPLAINT",
      targetEntity: "COMPLAINT",
      targetId: saved.id,
      details: { referenceNumber: saved.referenceNumber, title: saved.title },
      ipAddress: req.ip,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      data: saved
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to submit complaint.", error: err.message });
  }
};
var updateStatus = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!status) {
      res.status(400).json({ success: false, message: "Status is required." });
      return;
    }
    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }
    const previousStatus = complaint.status;
    const updated = await db.updateComplaint(complaint.id, {
      status
    });
    await db.addComplaintHistory({
      id: `hist-${Date.now()}`,
      complaintId: complaint.id,
      action: "STATUS_CHANGE",
      previousStatus,
      newStatus: status,
      performedByUserId: user.id,
      notes: notes || `Status updated to ${status} by ${user.fullName} (${user.role}).`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    await db.createNotification({
      id: `notif-${Date.now()}`,
      userId: complaint.studentId,
      title: `Complaint Status: ${status}`,
      message: `Your complaint ${complaint.referenceNumber} status changed from ${previousStatus} to ${status}.`,
      type: "STATUS_UPDATE",
      relatedComplaintId: complaint.id,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: user.id,
      action: "UPDATE_COMPLAINT_STATUS",
      targetEntity: "COMPLAINT",
      targetId: complaint.id,
      details: { previousStatus, newStatus: status, notes },
      ipAddress: req.ip,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}.`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update status.", error: err.message });
  }
};
var assignComplaint = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { assignedToUserId, departmentId, expectedResolutionDate, notes } = req.body;
    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }
    const previousStatus = complaint.status;
    const newStatus = "ASSIGNED";
    const updated = await db.updateComplaint(complaint.id, {
      assignedToUserId: assignedToUserId || complaint.assignedToUserId,
      departmentId: departmentId || complaint.departmentId,
      expectedResolutionDate: expectedResolutionDate || complaint.expectedResolutionDate,
      status: complaint.status === "SUBMITTED" || complaint.status === "UNDER_REVIEW" ? newStatus : complaint.status
    });
    let assignedStaffName = "staff member";
    if (assignedToUserId) {
      const staffUser = await db.findUserById(assignedToUserId);
      if (staffUser) {
        assignedStaffName = staffUser.fullName;
        await db.createNotification({
          id: `notif-${Date.now()}`,
          userId: assignedToUserId,
          title: "Complaint Assigned",
          message: `You were assigned complaint ${complaint.referenceNumber}: ${complaint.title}`,
          type: "ASSIGNMENT",
          relatedComplaintId: complaint.id,
          isRead: false,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    }
    await db.addComplaintHistory({
      id: `hist-${Date.now()}`,
      complaintId: complaint.id,
      action: "ASSIGNED",
      previousStatus,
      newStatus: updated?.status,
      performedByUserId: user.id,
      notes: notes || `Assigned to ${assignedStaffName} by ${user.fullName}. Expected by ${expectedResolutionDate || "TBD"}.`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    await db.createNotification({
      id: `notif-${Date.now()}`,
      userId: complaint.studentId,
      title: "Complaint Assigned",
      message: `Your complaint ${complaint.referenceNumber} has been assigned for investigation.`,
      type: "ASSIGNMENT",
      relatedComplaintId: complaint.id,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.status(200).json({
      success: true,
      message: "Complaint assigned successfully.",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to assign complaint.", error: err.message });
  }
};
var requestInformation = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ success: false, message: "Clarification inquiry message is required." });
      return;
    }
    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }
    const updated = await db.updateComplaint(complaint.id, {
      status: "WAITING_FOR_STUDENT"
    });
    await db.createComplaintComment({
      id: `comm-${Date.now()}`,
      complaintId: complaint.id,
      authorId: user.id,
      message,
      isInternal: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    await db.addComplaintHistory({
      id: `hist-${Date.now()}`,
      complaintId: complaint.id,
      action: "INFO_REQUESTED",
      previousStatus: complaint.status,
      newStatus: "WAITING_FOR_STUDENT",
      performedByUserId: user.id,
      notes: `Requested additional information from student: ${message}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    await db.createNotification({
      id: `notif-${Date.now()}`,
      userId: complaint.studentId,
      title: "Additional Information Requested",
      message: `${user.fullName} requested clarification regarding ${complaint.referenceNumber}.`,
      type: "INFO_REQUEST",
      relatedComplaintId: complaint.id,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.status(200).json({
      success: true,
      message: "Information request sent to student.",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to request information.", error: err.message });
  }
};
var escalateComplaint = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { reason } = req.body;
    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }
    const updated = await db.updateComplaint(complaint.id, {
      status: "ESCALATED",
      priority: "URGENT"
    });
    await db.addComplaintHistory({
      id: `hist-${Date.now()}`,
      complaintId: complaint.id,
      action: "ESCALATED",
      previousStatus: complaint.status,
      newStatus: "ESCALATED",
      performedByUserId: user.id,
      notes: `Escalated by ${user.fullName}: ${reason || "Urgent resolution required."}`,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    await db.createNotification({
      id: `notif-${Date.now()}`,
      userId: "usr-admin",
      title: "Urgent Complaint Escalation",
      message: `${complaint.referenceNumber} has been escalated: ${reason || "High priority action needed."}`,
      type: "ESCALATION",
      relatedComplaintId: complaint.id,
      isRead: false,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.status(200).json({
      success: true,
      message: "Complaint escalated successfully.",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to escalate complaint.", error: err.message });
  }
};
var resolveComplaint = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { resolutionDescription, investigationSummary, supportingDocumentUrl, supportingDocumentName } = req.body;
    if (!resolutionDescription) {
      res.status(400).json({ success: false, message: "Resolution description is required." });
      return;
    }
    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }
    const resolution = await db.upsertResolution({
      id: `res-${Date.now()}`,
      complaintId: complaint.id,
      resolvedByUserId: user.id,
      resolutionDescription,
      investigationSummary: investigationSummary || null,
      supportingDocumentUrl: supportingDocumentUrl || null,
      supportingDocumentName: supportingDocumentName || null,
      resolvedAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const refreshed = await db.findComplaintById(complaint.id);
    res.status(200).json({
      success: true,
      message: "Complaint resolved successfully.",
      data: refreshed
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to resolve complaint.", error: err.message });
  }
};
var reopenComplaint = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) {
      res.status(400).json({ success: false, message: "Reopening reason is required." });
      return;
    }
    const updated = await db.reopenComplaint(id, user.id, reason);
    res.status(200).json({
      success: true,
      message: "Complaint reopened successfully.",
      data: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
var submitFeedback = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { rating, comments, isSatisfied } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: "Rating between 1 and 5 is required." });
      return;
    }
    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }
    if (complaint.studentId !== user.id) {
      res.status(403).json({ success: false, message: "Only the lodging student can provide resolution feedback." });
      return;
    }
    const feedback = await db.createFeedback({
      id: `fb-${Date.now()}`,
      complaintId: complaint.id,
      studentId: user.id,
      rating: Number(rating),
      comments: comments || null,
      isSatisfied: isSatisfied !== void 0 ? Boolean(isSatisfied) : true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    const refreshed = await db.findComplaintById(complaint.id);
    res.status(200).json({
      success: true,
      message: "Feedback submitted and complaint closed.",
      data: refreshed
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to submit feedback.", error: err.message });
  }
};
var getComplaintHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await db.listComplaintHistory(id);
    res.status(200).json({
      success: true,
      data: history
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve complaint history.", error: err.message });
  }
};
var getComplaintComments = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const includeInternal = user.role !== "STUDENT";
    const comments = await db.listComplaintComments(id, includeInternal);
    res.status(200).json({
      success: true,
      data: comments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve comments.", error: err.message });
  }
};
var addComplaintComment = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    const { message, isInternal, attachmentUrl, attachmentName } = req.body;
    if (!message || !message.trim()) {
      res.status(400).json({ success: false, message: "Comment message is required." });
      return;
    }
    const complaint = await db.findComplaintById(id);
    if (!complaint) {
      res.status(404).json({ success: false, message: "Complaint not found." });
      return;
    }
    const markInternal = user.role !== "STUDENT" ? Boolean(isInternal) : false;
    const comment = await db.createComplaintComment({
      id: `comm-${Date.now()}`,
      complaintId: complaint.id,
      authorId: user.id,
      message: message.trim(),
      isInternal: markInternal,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.status(201).json({
      success: true,
      message: "Comment posted successfully.",
      data: comment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to post comment.", error: err.message });
  }
};

// server/routes/complaint.routes.ts
var router2 = Router2();
router2.use(authenticateToken);
router2.get("/", listComplaints);
router2.post("/", createComplaint);
router2.get("/:id", getComplaintById);
router2.put("/:id/status", requireRole(["ADMIN", "DEPARTMENT_HEAD", "STAFF", "FACULTY"]), updateStatus);
router2.post("/:id/assign", requireRole(["ADMIN", "DEPARTMENT_HEAD"]), assignComplaint);
router2.post("/:id/request-information", requireRole(["ADMIN", "DEPARTMENT_HEAD", "STAFF", "FACULTY"]), requestInformation);
router2.post("/:id/escalate", requireRole(["ADMIN", "DEPARTMENT_HEAD", "STAFF", "FACULTY"]), escalateComplaint);
router2.post("/:id/resolve", requireRole(["ADMIN", "DEPARTMENT_HEAD", "STAFF", "FACULTY"]), resolveComplaint);
router2.post("/:id/reopen", reopenComplaint);
router2.post("/:id/feedback", submitFeedback);
router2.get("/:id/history", getComplaintHistory);
router2.get("/:id/comments", getComplaintComments);
router2.post("/:id/comments", addComplaintComment);
var complaint_routes_default = router2;

// server/routes/department.routes.ts
import { Router as Router3 } from "express";

// server/controllers/department.controller.ts
var listDepartments = async (req, res) => {
  try {
    const departments = await db.listDepartments();
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve departments.", error: err.message });
  }
};
var getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const department = await db.findDepartmentById(id);
    if (!department) {
      res.status(404).json({ success: false, message: "Department not found." });
      return;
    }
    res.status(200).json({ success: true, data: department });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve department.", error: err.message });
  }
};
var createDepartment = async (req, res) => {
  try {
    const { name, code, description, headUserId, contactEmail, contactPhone, officeLocation } = req.body;
    if (!name || !code) {
      res.status(400).json({ success: false, message: "Department name and code are required." });
      return;
    }
    const newDept = {
      id: `dept-${code.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || null,
      headUserId: headUserId || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      officeLocation: officeLocation || null,
      status: "ACTIVE",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = await db.createDepartment(newDept);
    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id,
      action: "CREATE_DEPARTMENT",
      targetEntity: "DEPARTMENT",
      targetId: saved.id,
      details: { name: saved.name, code: saved.code },
      ipAddress: req.ip,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.status(201).json({ success: true, message: "Department created successfully.", data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create department.", error: err.message });
  }
};
var updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await db.updateDepartment(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: "Department not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Department updated successfully.", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update department.", error: err.message });
  }
};
var deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteDepartment(id);
    res.status(200).json({ success: true, message: "Department deleted successfully." });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// server/routes/department.routes.ts
var router3 = Router3();
router3.get("/", listDepartments);
router3.get("/:id", getDepartmentById);
router3.post("/", authenticateToken, requireRole(["ADMIN"]), createDepartment);
router3.put("/:id", authenticateToken, requireRole(["ADMIN", "DEPARTMENT_HEAD"]), updateDepartment);
router3.delete("/:id", authenticateToken, requireRole(["ADMIN"]), deleteDepartment);
var department_routes_default = router3;

// server/routes/category.routes.ts
import { Router as Router4 } from "express";

// server/controllers/category.controller.ts
var listCategories = async (req, res) => {
  try {
    const categories = await db.listCategories();
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve categories.", error: err.message });
  }
};
var getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await db.findCategoryById(id);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found." });
      return;
    }
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve category.", error: err.message });
  }
};
var createCategory = async (req, res) => {
  try {
    const { name, description, defaultDepartmentId, defaultPriority } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: "Category name is required." });
      return;
    }
    const newCat = {
      id: `cat-${name.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now()}`,
      name: name.trim(),
      description: description || null,
      defaultDepartmentId: defaultDepartmentId || null,
      defaultPriority: defaultPriority || "MEDIUM",
      status: "ACTIVE",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = await db.createCategory(newCat);
    res.status(201).json({ success: true, message: "Category created successfully.", data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create category.", error: err.message });
  }
};
var updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await db.updateCategory(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: "Category not found." });
      return;
    }
    res.status(200).json({ success: true, message: "Category updated successfully.", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update category.", error: err.message });
  }
};
var deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteCategory(id);
    res.status(200).json({ success: true, message: "Category deleted successfully." });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// server/routes/category.routes.ts
var router4 = Router4();
router4.get("/", listCategories);
router4.get("/:id", getCategoryById);
router4.post("/", authenticateToken, requireRole(["ADMIN"]), createCategory);
router4.put("/:id", authenticateToken, requireRole(["ADMIN"]), updateCategory);
router4.delete("/:id", authenticateToken, requireRole(["ADMIN"]), deleteCategory);
var category_routes_default = router4;

// server/routes/user.routes.ts
import { Router as Router5 } from "express";

// server/controllers/user.controller.ts
import bcrypt2 from "bcryptjs";
var listUsers = async (req, res) => {
  try {
    const { role, departmentId, search } = req.query;
    const users = await db.listUsers(role, departmentId, search);
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve users.", error: err.message });
  }
};
var getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.findUserById(id);
    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    res.status(200).json({ success: true, data: db.toSafeUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve user.", error: err.message });
  }
};
var createUser = async (req, res) => {
  try {
    const { fullName, email, password, studentOrEmpId, role, departmentId, phone } = req.body;
    if (!fullName || !email || !password || !studentOrEmpId || !role) {
      res.status(400).json({ success: false, message: "All required fields must be supplied." });
      return;
    }
    const existing = await db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, message: "Email already registered." });
      return;
    }
    const passwordHash = await bcrypt2.hash(password, 10);
    const newUser = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      studentOrEmpId: studentOrEmpId.trim(),
      role,
      departmentId: departmentId || null,
      phone: phone || null,
      status: "ACTIVE",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const saved = await db.createUser(newUser);
    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id,
      action: "ADMIN_CREATE_USER",
      targetEntity: "USER",
      targetId: saved.id,
      details: { email: saved.email, role: saved.role },
      ipAddress: req.ip,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: db.toSafeUser(saved)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create user.", error: err.message });
  }
};
var updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, role, departmentId, phone, status } = req.body;
    if (req.user?.id === id && role && role !== req.user.role) {
      res.status(403).json({ success: false, message: "Administrators cannot alter their own role." });
      return;
    }
    const updated = await db.updateUser(id, {
      fullName,
      role,
      departmentId,
      phone,
      status
    });
    if (!updated) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }
    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id,
      action: "ADMIN_UPDATE_USER",
      targetEntity: "USER",
      targetId: id,
      details: { fullName, role, status },
      ipAddress: req.ip,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: db.toSafeUser(updated)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update user.", error: err.message });
  }
};
var getStaffMembers = async (req, res) => {
  try {
    const { departmentId } = req.query;
    let allUsers = await db.listUsers();
    let staff = allUsers.filter(
      (u) => u.role === "STAFF" || u.role === "FACULTY" || u.role === "DEPARTMENT_HEAD"
    );
    if (departmentId) {
      staff = staff.filter((u) => u.departmentId === departmentId);
    }
    res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load staff list.", error: err.message });
  }
};

// server/routes/user.routes.ts
var router5 = Router5();
router5.use(authenticateToken);
router5.get("/staff", getStaffMembers);
router5.get("/", requireRole(["ADMIN"]), listUsers);
router5.post("/", requireRole(["ADMIN"]), createUser);
router5.get("/:id", requireRole(["ADMIN"]), getUserById);
router5.put("/:id", requireRole(["ADMIN"]), updateUser);
var user_routes_default = router5;

// server/routes/dashboard.routes.ts
import { Router as Router6 } from "express";

// server/controllers/dashboard.controller.ts
var getPublicStats = async (req, res) => {
  try {
    const complaints = await db.listComplaints({});
    const departments = await db.listDepartments();
    const totalSubmitted = complaints.length;
    const resolvedCount = complaints.filter((c) => c.status === "RESOLVED" || c.status === "CLOSED").length;
    const activeDepartments = departments.filter((d) => d.status === "ACTIVE").length;
    const resolvedList = complaints.filter((c) => c.resolvedAt);
    let avgResolutionDays = 2.4;
    if (resolvedList.length > 0) {
      const totalDays = resolvedList.reduce((acc, c) => {
        const start = new Date(c.createdAt).getTime();
        const end = new Date(c.resolvedAt).getTime();
        return acc + Math.max(0, (end - start) / (1e3 * 60 * 60 * 24));
      }, 0);
      avgResolutionDays = Number((totalDays / resolvedList.length).toFixed(1));
    }
    res.status(200).json({
      success: true,
      data: {
        totalComplaints: totalSubmitted,
        resolvedComplaints: resolvedCount,
        resolutionRate: totalSubmitted > 0 ? Math.round(resolvedCount / totalSubmitted * 100) : 0,
        averageResolutionDays: avgResolutionDays,
        activeDepartments
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve stats.", error: err.message });
  }
};
var getStudentDashboard = async (req, res) => {
  try {
    const user = req.user;
    const { dateRange } = req.query;
    const stats = await db.getDashboardStatistics(user, dateRange);
    const complaints = await db.listComplaints({ studentId: user.id, dateRange });
    const recentComplaints = complaints.slice(0, 5);
    const awaitingStudent = complaints.filter((c) => c.status === "WAITING_FOR_STUDENT");
    const recentlyResolved = complaints.filter((c) => c.status === "RESOLVED").slice(0, 5);
    res.status(200).json({
      success: true,
      data: {
        stats,
        recentComplaints,
        awaitingStudent,
        recentlyResolved
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load student dashboard.", error: err.message });
  }
};
var getStaffDashboard = async (req, res) => {
  try {
    const user = req.user;
    const { dateRange } = req.query;
    const stats = await db.getDashboardStatistics(user, dateRange);
    const assignedComplaints = await db.listComplaints({
      assignedToUserId: user.id,
      dateRange
    });
    const departmentComplaints = await db.listComplaints({
      departmentId: user.departmentId || void 0,
      dateRange
    });
    const urgentComplaints = (user.role === "DEPARTMENT_HEAD" ? departmentComplaints : assignedComplaints).filter(
      (c) => c.priority === "URGENT" && c.status !== "RESOLVED" && c.status !== "CLOSED"
    );
    const now = Date.now();
    const overdueComplaints = (user.role === "DEPARTMENT_HEAD" ? departmentComplaints : assignedComplaints).filter(
      (c) => c.expectedResolutionDate && new Date(c.expectedResolutionDate).getTime() < now && c.status !== "RESOLVED" && c.status !== "CLOSED"
    );
    res.status(200).json({
      success: true,
      data: {
        stats,
        assignedComplaints: assignedComplaints.slice(0, 8),
        departmentComplaints: departmentComplaints.slice(0, 8),
        urgentComplaints,
        overdueComplaints
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load staff dashboard.", error: err.message });
  }
};
var getAdminDashboard = async (req, res) => {
  try {
    const user = req.user;
    const { dateRange } = req.query;
    const stats = await db.getDashboardStatistics(user, dateRange);
    const recentComplaints = (await db.listComplaints({ dateRange })).slice(0, 8);
    const auditLogs = await db.listAuditLogs(6);
    res.status(200).json({
      success: true,
      data: {
        stats,
        recentComplaints,
        recentAuditLogs: auditLogs
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to load admin dashboard.", error: err.message });
  }
};

// server/routes/dashboard.routes.ts
var router6 = Router6();
router6.get("/public", getPublicStats);
router6.get("/student", authenticateToken, getStudentDashboard);
router6.get(
  "/staff",
  authenticateToken,
  requireRole(["STAFF", "FACULTY", "DEPARTMENT_HEAD", "ADMIN"]),
  getStaffDashboard
);
router6.get("/admin", authenticateToken, requireRole(["ADMIN"]), getAdminDashboard);
var dashboard_routes_default = router6;

// server/routes/report.routes.ts
import { Router as Router7 } from "express";

// server/controllers/report.controller.ts
var getReportsOverview = async (req, res) => {
  try {
    const user = req.user;
    const { dateRange, departmentId, categoryId } = req.query;
    const stats = await db.getDashboardStatistics(user, dateRange);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to generate report overview.", error: err.message });
  }
};
var exportComplaintsCsv = async (req, res) => {
  try {
    const user = req.user;
    const { status, priority, departmentId, categoryId, dateRange } = req.query;
    const filters = {
      status,
      priority,
      departmentId,
      categoryId,
      dateRange
    };
    if (user.role === "STUDENT") {
      filters.studentId = user.id;
    } else if ((user.role === "STAFF" || user.role === "FACULTY" || user.role === "DEPARTMENT_HEAD") && user.departmentId) {
      filters.departmentId = user.departmentId;
    }
    const complaints = await db.listComplaints(filters);
    const headers = [
      "Reference Number",
      "Title",
      "Category",
      "Department",
      "Priority",
      "Status",
      "Student Name",
      "Student Email",
      "Assigned Staff",
      "Submitted Date",
      "Resolved Date",
      "Rating",
      "Resolution Notes"
    ];
    const escapeCsv = (val) => {
      if (val === null || val === void 0) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };
    const rows = complaints.map((c) => [
      escapeCsv(c.referenceNumber),
      escapeCsv(c.title),
      escapeCsv(c.category?.name || "General"),
      escapeCsv(c.department?.name || "General"),
      escapeCsv(c.priority),
      escapeCsv(c.status),
      escapeCsv(c.student?.fullName || "N/A"),
      escapeCsv(c.student?.email || "N/A"),
      escapeCsv(c.assignedTo?.fullName || "Unassigned"),
      escapeCsv(c.createdAt),
      escapeCsv(c.resolvedAt || "N/A"),
      escapeCsv(c.feedback?.rating ? `${c.feedback.rating}/5` : "N/A"),
      escapeCsv(c.resolution?.resolutionDescription || "N/A")
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="complaints_report_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to export CSV report.", error: err.message });
  }
};

// server/routes/report.routes.ts
var router7 = Router7();
router7.use(authenticateToken);
router7.get("/overview", getReportsOverview);
router7.get("/export/csv", exportComplaintsCsv);
var report_routes_default = router7;

// server/routes/notification.routes.ts
import { Router as Router8 } from "express";

// server/controllers/notification.controller.ts
var listNotifications = async (req, res) => {
  try {
    const user = req.user;
    const notifications = await db.listNotifications(user.id);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.status(200).json({
      success: true,
      unreadCount,
      data: notifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve notifications.", error: err.message });
  }
};
var markNotificationRead = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;
    await db.markNotificationRead(id, user.id);
    res.status(200).json({ success: true, message: "Notification marked as read." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to mark notification read.", error: err.message });
  }
};
var markAllNotificationsRead = async (req, res) => {
  try {
    const user = req.user;
    const count = await db.markAllNotificationsRead(user.id);
    res.status(200).json({ success: true, message: `${count} notifications marked as read.` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to mark all read.", error: err.message });
  }
};

// server/routes/notification.routes.ts
var router8 = Router8();
router8.use(authenticateToken);
router8.get("/", listNotifications);
router8.put("/:id/read", markNotificationRead);
router8.put("/read-all", markAllNotificationsRead);
var notification_routes_default = router8;

// server/routes/settings.routes.ts
import { Router as Router9 } from "express";

// server/controllers/settings.controller.ts
var getAuditLogs = async (req, res) => {
  try {
    const logs = await db.listAuditLogs(100);
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to retrieve audit logs.", error: err.message });
  }
};
var getSystemSettings = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      appName: "CampusResolve",
      reopenWindowDays: 7,
      defaultResolutionTargetDays: 3,
      urgentEscalationHours: 24,
      allowAnonymousSubmissions: false,
      emailNotificationsEnabled: true
    }
  });
};
var updateSystemSettings = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "System settings updated successfully.",
    data: req.body
  });
};

// server/routes/settings.routes.ts
var router9 = Router9();
router9.use(authenticateToken);
router9.get("/audit-logs", requireRole(["ADMIN"]), getAuditLogs);
router9.get("/system", requireRole(["ADMIN"]), getSystemSettings);
router9.put("/system", requireRole(["ADMIN"]), updateSystemSettings);
var settings_routes_default = router9;

// server/middleware/error.middleware.ts
var errorHandler = (err, req, res, next) => {
  console.error("API Error:", err);
  const status = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : void 0
  });
};

// server/app.ts
var app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use((req, res, next) => {
  if (req.url.startsWith("/api/index")) {
    req.url = req.url.replace("/api/index", "/api");
  } else if (req.url.startsWith("/index")) {
    req.url = req.url.replace("/index", "");
  }
  next();
});
var apiRouter = express.Router();
apiRouter.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    system: "CampusResolve Backend API",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});
apiRouter.use("/auth", auth_routes_default);
apiRouter.use("/complaints", complaint_routes_default);
apiRouter.use("/departments", department_routes_default);
apiRouter.use("/categories", category_routes_default);
apiRouter.use("/users", user_routes_default);
apiRouter.use("/dashboard", dashboard_routes_default);
apiRouter.use("/reports", report_routes_default);
apiRouter.use("/notifications", notification_routes_default);
apiRouter.use("/settings", settings_routes_default);
app.use("/api", apiRouter);
app.use("/", apiRouter);
app.use(errorHandler);
var app_default = app;
export {
  app_default as default
};

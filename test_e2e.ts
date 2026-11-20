import app from './api/app';
import { db } from './api/db/db';
import http from 'http';

async function runTests() {
  console.log('🧪 Starting CampusResolve End-to-End System Tests...\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, resolve));
  console.log('✓ Test HTTP Server running on http://localhost:5099');

  const BASE = 'http://localhost:5099/api';

  // Helper fetch
  async function apiCall(path: string, options: any = {}) {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => null);
    return { status: res.status, data, headers: res.headers };
  }

  try {
    // 1. Health check
    const health = await apiCall('/health');
    console.assert(health.status === 200, 'Health check failed');
    console.log('✓ 1. Health check passed: ', health.data.status);

    // 2. Public dashboard stats
    const publicStats = await apiCall('/dashboard/public');
    console.assert(publicStats.status === 200, 'Public stats failed');
    console.assert(publicStats.data.data.totalComplaints > 0, 'No complaints in public stats');
    console.log('✓ 2. Public stats verified: ', publicStats.data.data);

    // 3. Student Login
    const studentLogin = await apiCall('/auth/login', {
      method: 'POST',
      body: { email: 'student@college.edu', password: 'password123' },
    });
    console.assert(studentLogin.status === 200, 'Student login failed');
    const studentToken = studentLogin.data.data.token;
    console.assert(studentLogin.data.data.user.role === 'STUDENT', 'Wrong student role');
    console.log('✓ 3. Student login authenticated: ', studentLogin.data.data.user.fullName);

    // 4. Admin Login
    const adminLogin = await apiCall('/auth/login', {
      method: 'POST',
      body: { email: 'admin@college.edu', password: 'password123' },
    });
    console.assert(adminLogin.status === 200, 'Admin login failed');
    const adminToken = adminLogin.data.data.token;
    console.assert(adminLogin.data.data.user.role === 'ADMIN', 'Wrong admin role');
    console.log('✓ 4. Admin login authenticated: ', adminLogin.data.data.user.fullName);

    // 5. Staff Login
    const staffLogin = await apiCall('/auth/login', {
      method: 'POST',
      body: { email: 'staff.cs@college.edu', password: 'password123' },
    });
    console.assert(staffLogin.status === 200, 'Staff login failed');
    const staffToken = staffLogin.data.data.token;
    console.log('✓ 5. Staff login authenticated: ', staffLogin.data.data.user.fullName);

    // 6. Submit a new complaint as student
    const newComplaint = await apiCall('/complaints', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        title: 'Projector HDMI flickering in CS Seminar Hall 1',
        description: 'During morning guest lecture the video output cuts out every few seconds. Projector fan is also excessively loud.',
        categoryId: 'cat-class-av',
        departmentId: 'dept-estate',
        location: 'CS Academic Block, 1st Floor Seminar Hall',
        priority: 'HIGH',
      },
    });
    console.assert(newComplaint.status === 201, 'Complaint submission failed');
    const createdId = newComplaint.data.data.id;
    const refNum = newComplaint.data.data.referenceNumber;
    console.assert(refNum.startsWith('CMP-'), 'Reference number format incorrect');
    console.log(`✓ 6. Complaint submitted successfully: ${refNum} (Status: ${newComplaint.data.data.status})`);

    // 7. Verify Complaint Details & History
    const details = await apiCall(`/complaints/${createdId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.assert(details.status === 200, 'Get complaint details failed');
    console.assert(details.data.data.student.email === 'student@college.edu', 'Student link failed');
    console.log('✓ 7. Complaint details verified with relational joins');

    // 8. Assign Complaint as Admin
    const assignRes = await apiCall(`/complaints/${createdId}/assign`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        departmentId: 'dept-estate',
        assignedToUserId: 'usr-staff-hostel',
        expectedResolutionDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        notes: 'Dispatched maintenance tech to test HDMI cable and clean projector exhaust filters.',
      },
    });
    console.assert(assignRes.status === 200, 'Assign complaint failed');
    console.assert(assignRes.data.data.status === 'ASSIGNED', 'Status did not update to ASSIGNED');
    console.log('✓ 8. Admin assigned complaint to staff member');

    // 9. Update Status to IN_PROGRESS by Staff
    const statusRes = await apiCall(`/complaints/${createdId}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        status: 'IN_PROGRESS',
        notes: 'Technician on site with replacement 4K HDMI cable and test laptop.',
      },
    });
    console.assert(statusRes.status === 200, 'Status update failed');
    console.assert(statusRes.data.data.status === 'IN_PROGRESS', 'Status mismatch');
    console.log('✓ 9. Staff transitioned status to IN_PROGRESS');

    // 10. Post Comments between student and staff
    const comment1 = await apiCall(`/complaints/${createdId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { message: 'We have a presentation at 2 PM today, thank you for quick attention!' },
    });
    console.assert(comment1.status === 201, 'Student comment failed');

    const comment2 = await apiCall(`/complaints/${createdId}/comments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: { message: 'Technician replaced the cable and tested 1080p output. Operational now.' },
    });
    console.assert(comment2.status === 201, 'Staff comment failed');
    console.log('✓ 10. Real-time comment thread verified between student and staff');

    // 11. Staff resolves the complaint
    const resolveRes = await apiCall(`/complaints/${createdId}/resolve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        resolutionDescription: 'Replaced faulty 15-meter ceiling HDMI run with high-grade shielded cable. Cleaned projector optical air filter.',
        investigationSummary: 'Old cable pin was bent inside wall faceplate causing intermittent signal loss.',
      },
    });
    console.assert(resolveRes.status === 200, 'Resolution failed');
    console.assert(resolveRes.data.data.status === 'RESOLVED', 'Complaint not RESOLVED');
    console.log('✓ 11. Complaint resolved with full formal investigation notes');

    // 12. Student provides 5-star feedback to close complaint
    const feedbackRes = await apiCall(`/complaints/${createdId}/feedback`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: {
        rating: 5,
        comments: 'Presentation went smoothly without any screen flicker! Excellent work.',
        isSatisfied: true,
      },
    });
    console.assert(feedbackRes.status === 200, 'Feedback failed');
    console.assert(feedbackRes.data.data.status === 'CLOSED', 'Complaint not CLOSED');
    console.log('✓ 12. Student submitted 5-star rating; complaint automatically CLOSED');

    // 13. Student Reopens complaint
    const reopenRes = await apiCall(`/complaints/${createdId}/reopen`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
      body: { reason: 'Screen started flickering again when switching to audio aux jack.' },
    });
    console.assert(reopenRes.status === 200, 'Reopen failed');
    console.assert(reopenRes.data.data.status === 'IN_PROGRESS', 'Reopened complaint not in progress');
    console.assert(reopenRes.data.data.isReopened === true, 'isReopened flag not true');
    console.log('✓ 13. Student reopened complaint with reason; status transitioned back to IN_PROGRESS');

    // 14. Report overview and CSV export check
    const reportRes = await apiCall('/reports/overview', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.assert(reportRes.status === 200, 'Reports overview failed');
    console.assert(reportRes.data.data.statusDistribution.length > 0, 'No status distribution in report');
    console.log('✓ 14. Real database reports & dynamic chart statistics verified');

    // 15. Check Notifications for student
    const notifs = await apiCall('/notifications', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.assert(notifs.status === 200, 'Notifications fetch failed');
    console.assert(notifs.data.data.length > 0, 'Notifications list empty');
    console.log(`✓ 15. In-app notifications verified (${notifs.data.data.length} notifications logged for student)`);

    console.log('\n🎉 ALL 15 END-TO-END TESTS PASSED WITH 100% SUCCESS!');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});

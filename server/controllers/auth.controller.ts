import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/db';
import { AuthenticatedRequest, generateToken } from '../middleware/auth.middleware';
import { User } from '../types';

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, studentOrEmpId, departmentId, course, yearOfStudy, phone, role } = req.body;

    if (!fullName || !email || !password || !studentOrEmpId) {
      res.status(400).json({
        success: false,
        message: 'Please provide full name, college email, password, and Student/Roll ID.',
      });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid college email address.',
      });
      return;
    }

    if (String(password).length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    // Check duplicate email
    let existingEmail: User | null = null;
    try {
      existingEmail = await db.findUserByEmail(normalizedEmail);
    } catch (dbErr: any) {
      console.error('Database error in findUserByEmail:', dbErr);
      res.status(503).json({
        success: false,
        message: 'Database service is temporarily unavailable. Please try again in a few moments.',
      });
      return;
    }

    if (existingEmail) {
      res.status(409).json({
        success: false,
        message: 'An account with this college email already exists.',
      });
      return;
    }

    // Check duplicate student / employee ID
    let existingStudentId: User | null = null;
    try {
      existingStudentId = await db.findUserByStudentOrEmpId(String(studentOrEmpId).trim());
    } catch (dbErr: any) {
      console.error('Database error in findUserByStudentOrEmpId:', dbErr);
      res.status(503).json({
        success: false,
        message: 'Database service is temporarily unavailable. Please try again in a few moments.',
      });
      return;
    }

    if (existingStudentId) {
      res.status(409).json({
        success: false,
        message: 'An account with this Student ID / Roll No already exists.',
      });
      return;
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    const id = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newUser: User = {
      id,
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      passwordHash,
      studentOrEmpId: String(studentOrEmpId).trim(),
      role: role || 'STUDENT',
      departmentId: departmentId || null,
      course: course || null,
      yearOfStudy: yearOfStudy || null,
      phone: phone || null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.createUser(newUser);
    } catch (createErr: any) {
      console.error('Database error in createUser:', createErr);
      res.status(503).json({
        success: false,
        message: 'Database service is temporarily unavailable. Failed to persist account.',
      });
      return;
    }

    const safeUser = db.toSafeUser(newUser);
    const token = generateToken(safeUser);

    // Initial welcome notification
    try {
      await db.createNotification({
        id: `notif-${Date.now()}`,
        userId: id,
        title: 'Welcome to CampusResolve',
        message: 'Your student account has been created. You can now lodge, track, and manage grievances.',
        type: 'ACCOUNT_CREATED',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } catch (notifErr) {
      console.warn('Initial notification could not be created:', notifErr);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (err: any) {
    const errorMsg = typeof err?.message === 'string' ? err.message : 'Failed to register account.';
    res.status(500).json({ success: false, message: errorMsg });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    let user: User | null = null;
    try {
      user = await db.findUserByEmail(normalizedEmail);
    } catch (dbErr: any) {
      console.error('Database error in login:', dbErr);
      res.status(503).json({
        success: false,
        message: 'Database service is temporarily unavailable. Please try again shortly.',
      });
      return;
    }

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    if (user.status !== 'ACTIVE') {
      res.status(403).json({ success: false, message: 'Your account has been deactivated or suspended by administration.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const safeUser = db.toSafeUser(user);
    const token = generateToken(safeUser);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (err: any) {
    const errorMsg = typeof err?.message === 'string' ? err.message : 'Login failed.';
    res.status(500).json({ success: false, message: errorMsg });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const fullUser = await db.findUserById(req.user.id);
    if (!fullUser) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: db.toSafeUser(fullUser),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile.', error: err.message });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const forgotPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Email is required.' });
    return;
  }

  const user = await db.findUserByEmail(email);
  if (!user) {
    // Return standard message to prevent user enumeration
    res.status(200).json({
      success: true,
      message: 'If a matching college account was found, password reset instructions have been issued.',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'If a matching college account was found, password reset instructions have been issued.',
    demoResetToken: `reset-${user.id}-${Date.now()}`,
  });
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    res.status(400).json({ success: false, message: 'Email and new password are required.' });
    return;
  }

  const user = await db.findUserByEmail(email);
  if (!user) {
    res.status(404).json({ success: false, message: 'Account not found.' });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.updateUser(user.id, { passwordHash });

  res.status(200).json({
    success: true,
    message: 'Password has been successfully reset. You may now log in.',
  });
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { fullName, phone, course, yearOfStudy } = req.body;
    const updated = await db.updateUser(req.user.id, {
      fullName: fullName || req.user.fullName,
      phone: phone !== undefined ? phone : req.user.phone,
      course: course !== undefined ? course : req.user.course,
      yearOfStudy: yearOfStudy !== undefined ? yearOfStudy : req.user.yearOfStudy,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated ? db.toSafeUser(updated) : null,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile.', error: err.message });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current and new password are required.' });
      return;
    }

    const user = await db.findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Current password does not match.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.updateUser(user.id, { passwordHash });

    res.status(200).json({ success: true, message: 'Password changed successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to change password.', error: err.message });
  }
};

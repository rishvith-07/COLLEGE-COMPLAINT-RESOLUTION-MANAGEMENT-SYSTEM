import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { User, UserRole } from '../types';

export const listUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, departmentId, search } = req.query;
    const users = await db.listUsers(role as string, departmentId as string, search as string);
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve users.', error: err.message });
  }
};

export const getUserById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await db.findUserById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.status(200).json({ success: true, data: db.toSafeUser(user) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user.', error: err.message });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, studentOrEmpId, role, departmentId, phone } = req.body;

    if (!fullName || !email || !password || !studentOrEmpId || !role) {
      res.status(400).json({ success: false, message: 'All required fields must be supplied.' });
      return;
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      studentOrEmpId: studentOrEmpId.trim(),
      role: role as UserRole,
      departmentId: departmentId || null,
      phone: phone || null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await db.createUser(newUser);

    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id,
      action: 'ADMIN_CREATE_USER',
      targetEntity: 'USER',
      targetId: saved.id,
      details: { email: saved.email, role: saved.role },
      ipAddress: req.ip,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: db.toSafeUser(saved),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create user.', error: err.message });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, role, departmentId, phone, status } = req.body;

    // Prevent user from changing their own role
    if (req.user?.id === id && role && role !== req.user.role) {
      res.status(403).json({ success: false, message: 'Administrators cannot alter their own role.' });
      return;
    }

    const updated = await db.updateUser(id, {
      fullName,
      role,
      departmentId,
      phone,
      status,
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id,
      action: 'ADMIN_UPDATE_USER',
      targetEntity: 'USER',
      targetId: id,
      details: { fullName, role, status },
      ipAddress: req.ip,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: db.toSafeUser(updated),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update user.', error: err.message });
  }
};

export const getStaffMembers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { departmentId } = req.query;
    let allUsers = await db.listUsers();
    let staff = allUsers.filter(
      (u) => u.role === 'STAFF' || u.role === 'FACULTY' || u.role === 'DEPARTMENT_HEAD'
    );
    if (departmentId) {
      staff = staff.filter((u) => u.departmentId === departmentId);
    }
    res.status(200).json({ success: true, count: staff.length, data: staff });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to load staff list.', error: err.message });
  }
};

import { Response } from 'express';
import { db } from '../db/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { Department } from '../types';

export const listDepartments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const departments = await db.listDepartments();
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve departments.', error: err.message });
  }
};

export const getDepartmentById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const department = await db.findDepartmentById(id);
    if (!department) {
      res.status(404).json({ success: false, message: 'Department not found.' });
      return;
    }
    res.status(200).json({ success: true, data: department });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve department.', error: err.message });
  }
};

export const createDepartment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, code, description, headUserId, contactEmail, contactPhone, officeLocation } = req.body;

    if (!name || !code) {
      res.status(400).json({ success: false, message: 'Department name and code are required.' });
      return;
    }

    const newDept: Department = {
      id: `dept-${code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description || null,
      headUserId: headUserId || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      officeLocation: officeLocation || null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await db.createDepartment(newDept);

    await db.createAuditLog({
      id: `audit-${Date.now()}`,
      userId: req.user?.id,
      action: 'CREATE_DEPARTMENT',
      targetEntity: 'DEPARTMENT',
      targetId: saved.id,
      details: { name: saved.name, code: saved.code },
      ipAddress: req.ip,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, message: 'Department created successfully.', data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create department.', error: err.message });
  }
};

export const updateDepartment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await db.updateDepartment(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Department not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Department updated successfully.', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update department.', error: err.message });
  }
};

export const deleteDepartment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.deleteDepartment(id);
    res.status(200).json({ success: true, message: 'Department deleted successfully.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

import { Response } from 'express';
import { db } from '../db/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ComplaintCategory, ComplaintPriority } from '../types';

export const listCategories = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categories = await db.listCategories();
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve categories.', error: err.message });
  }
};

export const getCategoryById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await db.findCategoryById(id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }
    res.status(200).json({ success: true, data: category });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve category.', error: err.message });
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, defaultDepartmentId, defaultPriority } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required.' });
      return;
    }

    const newCat: ComplaintCategory = {
      id: `cat-${name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
      name: name.trim(),
      description: description || null,
      defaultDepartmentId: defaultDepartmentId || null,
      defaultPriority: (defaultPriority as ComplaintPriority) || 'MEDIUM',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await db.createCategory(newCat);

    res.status(201).json({ success: true, message: 'Category created successfully.', data: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to create category.', error: err.message });
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await db.updateCategory(id, updates);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Category updated successfully.', data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update category.', error: err.message });
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await db.deleteCategory(id);
    res.status(200).json({ success: true, message: 'Category deleted successfully.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

import { Request, Response } from 'express';
import { db } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { clearConfigCache } from '../utils/config';
import { sendSMS } from '../utils/sms';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1 AND is_admin = true LIMIT 1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid admin credentials or access denied.' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Admin account not fully configured (no password).' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: true },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.status(200).json({
      message: 'Admin login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Failed to authenticate admin.' });
  }
};

export const getAllNeedsAdmin = async (req: Request, res: Response) => {
  const { status, stateId, lgaId, categoryId, page = 1, limit = 50 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  try {
    let query = `
      SELECT n.*, 
             to_json(u.*) as users, 
             to_json(c.*) as categories
      FROM needs n
      INNER JOIN users u ON n.user_id = u.id
      LEFT JOIN categories c ON n.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND n.status = $${paramIndex++}`;
      params.push(status);
    }
    if (stateId) {
      query += ` AND u.state_id = $${paramIndex++}`;
      params.push(stateId);
    }
    if (lgaId) {
      query += ` AND u.lga_id = $${paramIndex++}`;
      params.push(lgaId);
    }
    if (categoryId) {
      query += ` AND n.category_id = $${paramIndex++}`;
      params.push(categoryId);
    }

    // Get count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as sub`;
    const countResult = await db.query(countQuery, params);
    const count = parseInt(countResult.rows[0].count);

    // Get data
    query += ` ORDER BY n.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return res.status(200).json({
      needs: result.rows,
      total: count,
      page: Number(page),
      totalPages: Math.ceil(count / Number(limit))
    });
  } catch (error) {
    console.error('Get all needs admin error:', error);
    return res.status(500).json({ error: 'Failed to fetch needs for admin.' });
  }
};

export const updateNeedStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, admin_notes, user_comments, assigned_partner_id } = req.body;

  try {
    const updateQuery = `
      UPDATE needs
      SET status = COALESCE($1, status),
          admin_notes = COALESCE($2, admin_notes),
          user_comments = COALESCE($3, user_comments),
          assigned_partner_id = COALESCE($4, assigned_partner_id),
          updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    const result = await db.query(updateQuery, [status, admin_notes, user_comments, assigned_partner_id, id]);
    const data = result.rows[0];

    if (!data) return res.status(404).json({ error: 'Need not found.' });

    // Phase 2: SMS Notification
    if (status) {
      const userResult = await db.query('SELECT phone, name FROM users WHERE id = $1 LIMIT 1', [data.user_id]);
      const user = userResult.rows[0];
      
      if (user && user.phone) {
        const message = `Halo ${user.name || 'Citizen'}, NaijaNeed here. Status your need updated go: ${status}. Check app for more.`;
        await sendSMS(user.phone, message);
      }
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Update need status error:', error);
    return res.status(500).json({ error: 'Failed to update need.' });
  }
};

export const getPartners = async (req: Request, res: Response) => {
  const { type, state } = req.query;
  try {
    let query = 'SELECT * FROM partners WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (type) {
      query += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    if (state) {
      query += ` AND states_covered @> ARRAY[$${paramIndex++}]::varchar[]`;
      params.push(state);
    }

    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get partners error:', error);
    return res.status(500).json({ error: 'Failed to fetch partners.' });
  }
};

export const createPartner = async (req: Request, res: Response) => {
  const partnerData = req.body;
  try {
    const keys = Object.keys(partnerData);
    const values = Object.values(partnerData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const query = `INSERT INTO partners (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
    
    const result = await db.query(query, values);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create partner error:', error);
    return res.status(500).json({ error: 'Failed to create partner.' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  const isSuperAdmin = req.user.is_super_admin;

  try {
    let fields = 'id, name, state_id, lga_id, last_active, created_at, is_admin, is_super_admin';
    if (isSuperAdmin) {
      fields += ', phone, email';
    }

    const query = `SELECT ${fields} FROM users ORDER BY created_at DESC`;
    const result = await db.query(query);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const totalSubmissionsResult = await db.query('SELECT COUNT(*) FROM needs');
    const totalSubmissions = parseInt(totalSubmissionsResult.rows[0].count);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const monthCountResult = await db.query('SELECT COUNT(*) FROM needs WHERE created_at >= $1', [startOfMonth.toISOString()]);
    const currentMonthCount = parseInt(monthCountResult.rows[0].count);

    return res.status(200).json({
      totalSubmissions,
      currentMonthCount,
      recentGrowth: 15 // Placeholder
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
};

export const exportNeedsCSV = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT n.id, u.name as user_name, u.state_id, u.lga_id, c.name as category_name, n.description, n.status, n.created_at
      FROM needs n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN categories c ON n.category_id = c.id
      ORDER BY n.created_at DESC
    `;
    const result = await db.query(query);
    const needs = result.rows;

    const headers = ['ID', 'User', 'State', 'LGA', 'Category', 'Description', 'Status', 'Date'];
    const rows = (needs || []).map(n => [
      n.id,
      n.user_name || 'Anon',
      n.state_id || 'N/A',
      n.lga_id || 'N/A',
      n.category_name,
      n.description.replace(/,/g, ' '),
      n.status,
      new Date(n.created_at).toISOString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=naijaneed_needs_report.csv');
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error('Export CSV error:', error);
    return res.status(500).json({ error: 'Failed to export report.' });
  }
};


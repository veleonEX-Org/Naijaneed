import { Request, Response } from 'express';
import { db } from '../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const partnerLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await db.query('SELECT * FROM partners WHERE contact_email = $1 LIMIT 1', [email]);
    const partner = result.rows[0];

    if (!partner) {
      return res.status(401).json({ error: 'Invalid partner credentials.' });
    }

    if (!partner.password) {
      return res.status(401).json({ error: 'Partner account not activated for portal access.' });
    }

    const isPasswordValid = await bcrypt.compare(password, partner.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: partner.id, email: partner.contact_email, is_partner: true },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.status(200).json({
      message: 'Partner login successful.',
      token,
      partner: {
        id: partner.id,
        name: partner.name,
        type: partner.type
      }
    });
  } catch (error) {
    console.error('Partner login error:', error);
    return res.status(500).json({ error: 'Failed to authenticate.' });
  }
};

export const getPartnerNeeds = async (req: Request, res: Response) => {
  const partnerId = req.user.id;

  try {
    const query = `
      SELECT n.*, 
             to_json(u.*) as users, 
             to_json(c.*) as categories
      FROM needs n
      LEFT JOIN users u ON n.user_id = u.id
      LEFT JOIN categories c ON n.category_id = c.id
      WHERE n.assigned_partner_id = $1
      ORDER BY n.created_at DESC
    `;
    const result = await db.query(query, [partnerId]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get partner needs error:', error);
    return res.status(500).json({ error: 'Failed to fetch assigned needs.' });
  }
};

export const updatePartnerNeedStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, partner_comment } = req.body;
  const partnerId = req.user.id;

  try {
    // First verify the need is assigned to this partner
    const checkResult = await db.query(
      'SELECT id FROM needs WHERE id = $1 AND assigned_partner_id = $2 LIMIT 1',
      [id, partnerId]
    );
    const currentNeed = checkResult.rows[0];

    if (!currentNeed) return res.status(403).json({ error: 'Access denied to this need.' });

    const updateQuery = `
      UPDATE needs
      SET status = $1, user_comments = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const result = await db.query(updateQuery, [status, partner_comment, id]);
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Update partner need status error:', error);
    return res.status(500).json({ error: 'Failed to update need status.' });
  }
};


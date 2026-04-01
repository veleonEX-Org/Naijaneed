import { Request, Response } from 'express';
import { db } from '../config/db';
import { getConfig } from '../utils/config';

export const submitNeed = async (req: Request, res: Response) => {
  const { category_id, description, name, email, stateId, lgaId, area } = req.body;
  const user_id = req.user.id;

  if (!description) {
    return res.status(400).json({ error: 'Please describe your need.' });
  }

  try {
    // 0. Update User Profile if provided
    if (name || stateId || lgaId) {
      await db.query(
        `UPDATE users 
         SET name = COALESCE($1, name), 
             email = COALESCE($2, email), 
             state_id = COALESCE($3, state_id), 
             lga_id = COALESCE($4, lga_id), 
             area = COALESCE($5, area),
             last_active = NOW()
         WHERE id = $6`,
        [name, email, stateId, lgaId, area, user_id]
      );
    }
    // 1. Weekly Lock Logic
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() || 7) + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyLimitStr = await getConfig('WEEKLY_LIMIT', '1');
    const weeklyLimit = parseInt(weeklyLimitStr) || 1;

    const checkResult = await db.query(
      'SELECT COUNT(*) FROM needs WHERE user_id = $1 AND created_at >= $2',
      [user_id, startOfWeek.toISOString()]
    );
    const count = parseInt(checkResult.rows[0].count);

    if (count >= weeklyLimit) {
      const nextMonday = new Date(startOfWeek);
      nextMonday.setDate(nextMonday.getDate() + 7);

      return res.status(403).json({
        locked: true,
        message: `You have reached your weekly limit of ${weeklyLimit} need(s).`,
        nextDate: nextMonday.toDateString()
      });
    }

    // 2. Submit need
    const insertQuery = `
      INSERT INTO needs (user_id, category_id, description, status)
      VALUES ($1, $2, $3, 'Submitted')
      RETURNING *
    `;
    const insertResult = await db.query(insertQuery, [user_id, category_id, description]);
    const newNeed = insertResult.rows[0];

    return res.status(201).json(newNeed);
  } catch (error) {
    console.error('Submit need error:', error);
    return res.status(500).json({ error: 'Failed to submit need.' });
  }
};

export const getMyNeeds = async (req: Request, res: Response) => {
  const user_id = req.user.id;

  try {
    const query = `
      SELECT n.*, to_json(c.*) as categories
      FROM needs n
      LEFT JOIN categories c ON n.category_id = c.id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
    `;
    const result = await db.query(query, [user_id]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Get needs error:', error);
    return res.status(500).json({ error: 'Failed to fetch your needs.' });
  }
};


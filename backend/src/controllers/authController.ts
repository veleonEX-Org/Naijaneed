import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const registerOrLoginCandidate = async (req: Request, res: Response) => {
  const { phone, name, email, stateId, lgaId, area } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  try {
    // 1. Check if user already exists
    const findResult = await db.query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phone]);
    const existingUser = findResult.rows[0];

    let user;
    let deviceToken;

    if (existingUser) {
      user = existingUser;
      deviceToken = user.device_token || uuidv4();

      // Update existing user profile if info exists
      const updateQuery = `
        UPDATE users 
        SET name = COALESCE($1, name), 
            email = COALESCE($2, email), 
            state_id = COALESCE($3, state_id), 
            lga_id = COALESCE($4, lga_id), 
            area = COALESCE($5, area),
            device_token = $6
        WHERE id = $7
        RETURNING *
      `;
      const updateResult = await db.query(updateQuery, [name, email, stateId, lgaId, area, deviceToken, user.id]);
      user = updateResult.rows[0];
    } else {
      // 2. Create new user
      deviceToken = uuidv4();
      const insertQuery = `
        INSERT INTO users (phone, name, email, state_id, lga_id, area, device_token)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const insertValues = [phone, name, email, stateId, lgaId, area, deviceToken];
      const insertResult = await db.query(insertQuery, insertValues);
      user = insertResult.rows[0];
    }

    // 3. Set standard cookie
    res.cookie('nn_device', deviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
    });

    return res.status(200).json({
      message: 'Authenticated successfully.',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        stateId: user.state_id,
        lgaId: user.lga_id,
        area: user.area
      }
    });
  } catch (error) {
    console.error('Registration/Login error:', error);
    return res.status(500).json({ error: 'Failed to authenticate.' });
  }
};


export const getCurrentUser = (req: Request, res: Response) => {
  return res.status(200).json(req.user);
};

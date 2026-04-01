import { Request, Response, NextFunction } from 'express';
import { db } from '../config/db';
import jwt from 'jsonwebtoken';

// Extend the Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.nn_device;
  console.log("token", token,req.cookies);

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Proceed to homepage.' });
  }

  try {
    // We join states and lgas here. PostgreSQL uses json_build_object for similar nested structures if needed, 
    // or we just flatten them for simplicity.
    const query = `
      SELECT *
      FROM users
      WHERE device_token = $1 
      LIMIT 1
    `;
    const result = await db.query(query, [token]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid device session.' });
    }

    // Update last active
    await db.query('UPDATE users SET last_active = NOW() WHERE id = $1', [user.id]);

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication failed.' });
  }
};

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Admin access required. No token provided.' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const result = await db.query('SELECT * FROM users WHERE id = $1 AND is_admin = true LIMIT 1', [decoded.id]);
    const user = result.rows[0];

    if (!user) {
      return res.status(403).json({ error: 'Access denied. You are not an authorized admin.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Admin Auth error:', err);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
};

export const authenticatePartner = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Partner access required. No token provided.' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const result = await db.query('SELECT * FROM partners WHERE id = $1 LIMIT 1', [decoded.id]);
    const partner = result.rows[0];

    if (!partner) {
      return res.status(403).json({ error: 'Access denied. You are not an authorized partner.' });
    }

    req.user = partner;
    next();
  } catch (err) {
    console.error('Partner Auth error:', err);
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
};


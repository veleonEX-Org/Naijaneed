import { Request, Response } from 'express';
import { db } from '../config/db';
import { clearConfigCache } from '../utils/config';

export const getPlatformConfig = async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT key, value FROM config');
    const configs = result.rows;

    const configMap = configs.reduce((acc: any, item: any) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    return res.status(200).json(configMap);
  } catch (error) {
    console.error('Fetch config error:', error);
    return res.status(500).json({ error: 'Failed to fetch platform configuration.' });
  }
};

export const updatePlatformConfig = async (req: Request, res: Response) => {
  const updates = req.body; // e.g. { PLATFORM_NAME: 'NaijaNeed V2' }
  const isAdmin = req.user.is_admin;

  if (!isAdmin) {
    return res.status(403).json({ error: 'Only admins can update configuration.' });
  }

  try {
    for (const [key, value] of Object.entries(updates)) {
      const upsertQuery = `
        INSERT INTO config (key, value)
        VALUES ($1, $2)
        ON CONFLICT (key) DO UPDATE SET value = $2
      `;
      await db.query(upsertQuery, [key, value]);
    }

    clearConfigCache();
    return res.status(200).json({ message: 'Configuration updated successfully.' });
  } catch (error) {
    console.error('Update config error:', error);
    return res.status(500).json({ error: 'Failed to update configuration.' });
  }
};


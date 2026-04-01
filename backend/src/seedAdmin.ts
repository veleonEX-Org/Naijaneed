import { db } from './config/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seedAdmin() {
  const name = 'Super Admin';
  const email = 'admin@naijaneed.com';
  const phone = '08000000000';
  const plainPassword = 'securepassword123'; // CHANGE THIS
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const deviceToken = uuidv4();

  try {
    const query = `
      INSERT INTO users (name, email, phone, password, is_admin, is_super_admin, device_token)
      VALUES ($1, $2, $3, $4, true, true, $5)
      ON CONFLICT (phone) DO UPDATE 
      SET is_admin = true, is_super_admin = true, password = $4
      RETURNING *;
    `;
    const result = await db.query(query, [name, email, phone, hashedPassword, deviceToken]);
    console.log('Admin created successfully:', result.rows[0].email);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();

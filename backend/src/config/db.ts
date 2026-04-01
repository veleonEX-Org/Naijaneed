import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
};

console.log(`Database connected to: ${dbConfig.host} as user: ${dbConfig.user}. Password type: ${typeof dbConfig.password}`);

const pool = new Pool(dbConfig);




pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const db = pool;

// Helper to simulate a similar query interface if possible, or just export the pool
export const query = (text: string, params?: any[]) => pool.query(text, params);

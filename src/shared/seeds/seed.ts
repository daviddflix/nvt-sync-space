import pool from '../database/connection';

export async function seed(): Promise<void> {
  // TODO: implement seed logic
  await pool.query('SELECT 1');
}

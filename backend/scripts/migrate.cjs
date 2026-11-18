require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL in backend/.env');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    const folder = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(folder).filter(x => x.endsWith('.sql')).sort();
    for (const file of files) {
      const result = await client.query('SELECT 1 FROM schema_migrations WHERE filename = $1', [file]);
      if (result.rowCount) { console.log('Already applied:', file); continue; }
      await client.query('BEGIN');
      try {
        await client.query(fs.readFileSync(path.join(folder, file), 'utf8'));
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log('Applied:', file);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch(error => { console.error('Migration failed:', error.message); process.exit(1); });

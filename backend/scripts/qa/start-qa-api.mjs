/** Manual QA API server for Playwright. Ctrl+C stops it. Never uses a production DB. */
import { randomBytes } from 'node:crypto';
import { assertQaDatabaseUrl } from './metrics.mjs';
const dbUrl='postgresql://expense_qa:qa_only_local_password_change_me@127.0.0.1:5434/expense_tracker_qa';
assertQaDatabaseUrl(dbUrl);
Object.assign(process.env,{
  DATABASE_URL:dbUrl, PORT:'4100', NODE_ENV:'test',
  FRONTEND_ORIGIN:'http://localhost:5173', ENABLE_API_DOCS:'false',
  JWT_SECRET:randomBytes(48).toString('base64'),
});
const {default:pg}=await import('pg');
const client=new pg.Client({connectionString:dbUrl,connectionTimeoutMillis:3500});
await client.connect();
try {
  const {rows}=await client.query('SELECT current_database() AS database, current_user AS username');
  if(rows[0].database!=='expense_tracker_qa'||rows[0].username!=='expense_qa') throw new Error('QA database identity mismatch');
} finally {await client.end();}
console.log('Starting isolated QA API on http://localhost:4100 (DB: expense_tracker_qa)');
await import('../../dist/main.js');

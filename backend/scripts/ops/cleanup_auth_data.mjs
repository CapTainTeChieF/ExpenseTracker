// Operational maintenance. Uses DATABASE_URL and only removes expired/revoked session rows and stale throttling buckets.
import pg from 'pg';
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL required');
const db = new pg.Client({connectionString:process.env.DATABASE_URL});
await db.connect();
try {
  const sessions = await db.query(`DELETE FROM auth_sessions
    WHERE expires_at < NOW()-INTERVAL '7 days' OR revoked_at < NOW()-INTERVAL '7 days'`);
  const limits = await db.query(`DELETE FROM auth_rate_limits
    WHERE window_start < NOW()-INTERVAL '2 days'`);
  console.log(JSON.stringify({expiredSessionsDeleted:sessions.rowCount, oldRateBucketsDeleted:limits.rowCount}));
} finally { await db.end(); }

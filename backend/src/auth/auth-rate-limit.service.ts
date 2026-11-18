import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AuthRateLimitService {
  constructor(private readonly db: DatabaseService) {}
  /** Atomic, multi-instance counters; bucket keys are SHA256, never plaintext emails/IPs. */
  async consume(kind: 'login'|'register', ip: string, email: string): Promise<void> {
    const normalizedEmail = email.trim().toLowerCase();
    const checks: Array<[string, number, number]> = kind === 'login'
      ? [[`login:ip:${ip}`, 20, 900], [`login:account:${normalizedEmail}`, 10, 900]]
      : [[`register:ip:${ip}`, 6, 3600]];
    for (const [value, maxHits, windowSeconds] of checks) {
      const key = createHash('sha256').update(value).digest('hex');
      const result = await this.db.pool.query<{hits: number}>(`
        INSERT INTO auth_rate_limits(bucket_key, hits, window_start)
        VALUES ($1, 1, NOW())
        ON CONFLICT (bucket_key) DO UPDATE SET
          hits = CASE WHEN auth_rate_limits.window_start < NOW() - ($2::integer * INTERVAL '1 second')
                      THEN 1 ELSE auth_rate_limits.hits + 1 END,
          window_start = CASE WHEN auth_rate_limits.window_start < NOW() - ($2::integer * INTERVAL '1 second')
                              THEN NOW() ELSE auth_rate_limits.window_start END
        RETURNING hits`, [key, windowSeconds]);
      if (result.rows[0].hits > maxHits) {
        throw new HttpException('Too many attempts. Please try again later.', HttpStatus.TOO_MANY_REQUESTS);
      }
    }
  }
}

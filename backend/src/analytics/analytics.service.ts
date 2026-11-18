import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: DatabaseService) {}

  async summary(userId: string) {
    const result = await this.db.pool.query(`SELECT
      COALESCE(SUM(amount) FILTER (WHERE kind='INCOME'),0)::text AS income,
      COALESCE(SUM(amount) FILTER (WHERE kind='EXPENSE'),0)::text AS expense,
      (COALESCE(SUM(amount) FILTER (WHERE kind='INCOME'),0)
       - COALESCE(SUM(amount) FILTER (WHERE kind='EXPENSE'),0))::text AS balance,
      COUNT(*)::int AS "transactionCount"
      FROM transactions WHERE user_id=$1`, [userId]);
    return {currency:'BDT', ...result.rows[0]};
  }

  async monthly(userId: string, month: string) {
    const start = `${month}-01`;
    const [totals, breakdown] = await Promise.all([
      this.db.pool.query(`SELECT
        COALESCE(SUM(amount) FILTER (WHERE kind='INCOME'),0)::text AS income,
        COALESCE(SUM(amount) FILTER (WHERE kind='EXPENSE'),0)::text AS expense,
        (COALESCE(SUM(amount) FILTER (WHERE kind='INCOME'),0)
         - COALESCE(SUM(amount) FILTER (WHERE kind='EXPENSE'),0))::text AS balance,
        COUNT(*)::int AS "transactionCount"
        FROM transactions
        WHERE user_id=$1 AND transaction_date >= $2::date
          AND transaction_date < ($2::date + INTERVAL '1 month')`, [userId,start]),
      this.db.pool.query(`SELECT t.kind AS kind,
        COALESCE(c.name,'Uncategorized') AS name,
        COALESCE(SUM(t.amount),0)::text AS total,
        COUNT(*)::int AS count
        FROM transactions t
        LEFT JOIN categories c ON c.id=t.category_id AND c.user_id=t.user_id
        WHERE t.user_id=$1 AND t.transaction_date >= $2::date
          AND t.transaction_date < ($2::date + INTERVAL '1 month')
        GROUP BY t.kind,c.id,c.name
        ORDER BY t.kind,SUM(t.amount) DESC, name`, [userId,start]),
    ]);
    return {month,currency:'BDT',...totals.rows[0],categories:breakdown.rows};
  }
  /** One query; scoped by t.user_id to avoid leaking another person's totals. */
  async trend(userId: string, months = 6, endMonth?: string) {
    // Validate in service too because tests and other modules can call it directly.
    if (!Number.isInteger(months) || months < 1 || months > 12) {
      throw new BadRequestException('months must be an integer between 1 and 12');
    }
    const finalMonth = endMonth ?? new Date().toISOString().slice(0,7);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(finalMonth)) {
      throw new BadRequestException('endMonth must be YYYY-MM');
    }
    const end = `${finalMonth}-01`;
    const result = await this.db.pool.query(`
      WITH periods AS (
        SELECT generate_series(
          ($2::date - (($3::int - 1) * INTERVAL '1 month'))::date,
          $2::date, INTERVAL '1 month'
        )::date AS month_start
      )
      SELECT to_char(p.month_start, 'YYYY-MM') AS month,
        COALESCE(SUM(t.amount) FILTER (WHERE t.kind='INCOME'),0)::text AS income,
        COALESCE(SUM(t.amount) FILTER (WHERE t.kind='EXPENSE'),0)::text AS expense
      FROM periods p
      LEFT JOIN transactions t ON t.user_id=$1
        AND t.transaction_date >= p.month_start
        AND t.transaction_date < (p.month_start + INTERVAL '1 month')
      GROUP BY p.month_start ORDER BY p.month_start ASC`, [userId, end, months]);
    return {currency: 'BDT', endMonth:finalMonth, months: result.rows};
  }
}

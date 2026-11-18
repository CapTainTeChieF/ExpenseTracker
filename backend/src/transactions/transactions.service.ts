import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';
import { PoolClient } from 'pg';
import { TransactionListQueryDto } from './transaction-query.dto';

const selection = `SELECT t.id,t.kind,t.amount::text AS amount,t.currency,
  to_char(t.transaction_date, 'YYYY-MM-DD') AS "transactionDate",
  t.description,t.category_id AS "categoryId",c.name AS "categoryName"
  FROM transactions t LEFT JOIN categories c ON c.id=t.category_id`;
@Injectable()
export class TransactionsService {
  constructor(private readonly db: DatabaseService) {}
  private async verifyCategory(client: PoolClient, userId: string, kind: string, categoryId?: string | null) {
    if (!categoryId) return;
    const category = await client.query('SELECT 1 FROM categories WHERE id=$1 AND user_id=$2 AND kind=$3', [categoryId,userId,kind]);
    if (!category.rowCount) throw new BadRequestException('Invalid category for this transaction type');
  }
  async list(userId: string, filters: TransactionListQueryDto = {}) {
    const conditions = ['t.user_id=$1'];
    const params: string[] = [userId];
    if (filters.month) {
      params.push(`${filters.month}-01`);
      const n = params.length;
      conditions.push(`t.transaction_date >= $${n}::date AND t.transaction_date < ($${n}::date + INTERVAL '1 month')`);
    }
    if (filters.kind) {
      params.push(filters.kind);
      conditions.push(`t.kind=$${params.length}`);
    }
    if (filters.categoryId) {
      params.push(filters.categoryId);
      conditions.push(`t.category_id=$${params.length}`);
    }
    const result = await this.db.pool.query(
      `${selection} WHERE ${conditions.join(' AND ')} ORDER BY t.transaction_date DESC,t.created_at DESC LIMIT 100`, params,
    );
    return result.rows;
  }
  async create(userId: string, dto: CreateTransactionDto) {
    if (Number(dto.amount) <= 0) throw new BadRequestException('Amount must be greater than zero');
    const client = await this.db.pool.connect();
    try {
      await client.query('BEGIN');
      await this.verifyCategory(client,userId,dto.kind,dto.categoryId);
      const inserted = await client.query<{id:string}>(`INSERT INTO transactions(user_id,category_id,kind,amount,transaction_date,description)
        VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [userId,dto.categoryId || null,dto.kind,dto.amount,dto.transactionDate,dto.description?.trim() || '']);
      const result = await client.query(`${selection} WHERE t.id=$1 AND t.user_id=$2`, [inserted.rows[0].id,userId]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
  async update(userId: string, id: string, dto: UpdateTransactionDto) {
    const client = await this.db.pool.connect();
    try {
      await client.query('BEGIN');
      const existing = await client.query<{kind:string;amount:string;transaction_date:Date;category_id:string|null;description:string}>(
        'SELECT kind,amount,transaction_date,category_id,description FROM transactions WHERE id=$1 AND user_id=$2 FOR UPDATE', [id,userId]);
      if (!existing.rowCount) throw new NotFoundException('Transaction not found');
      const current = existing.rows[0];
      const kind = dto.kind ?? current.kind;
      const categoryId = dto.categoryId === undefined ? current.category_id : dto.categoryId;
      await this.verifyCategory(client,userId,kind,categoryId ?? undefined);
      const amount = dto.amount ?? current.amount;
      if (Number(amount) <= 0) throw new BadRequestException('Amount must be greater than zero');
      await client.query(`UPDATE transactions SET kind=$1,amount=$2,transaction_date=$3,description=$4,category_id=$5,updated_at=NOW()
        WHERE id=$6 AND user_id=$7`, [kind,amount,dto.transactionDate ?? current.transaction_date,dto.description?.trim() ?? current.description,categoryId,id,userId]);
      const result = await client.query(`${selection} WHERE t.id=$1 AND t.user_id=$2`, [id,userId]);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
  async remove(userId: string, id: string) {
    const result = await this.db.pool.query('DELETE FROM transactions WHERE id=$1 AND user_id=$2 RETURNING id', [id,userId]);
    if (!result.rowCount) throw new NotFoundException('Transaction not found');
    return { deleted: true };
  }
}

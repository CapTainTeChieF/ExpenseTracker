import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly pool: Pool;
  constructor() {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing');
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
  }
  async onModuleDestroy(): Promise<void> { await this.pool.end(); }
}

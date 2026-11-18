import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}
  @ApiOperation({summary:'Check API and PostgreSQL connectivity'})
  @Get()
  async check() {
    try {
      await this.db.pool.query('SELECT 1');
      return { status: 'ok', service: 'expense-tracker-api', database: 'connected' };
    } catch { throw new ServiceUnavailableException('Database unavailable'); }
  }
}

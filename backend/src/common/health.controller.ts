import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly db: DatabaseService) {}

  @ApiOperation({ summary: 'Check API and PostgreSQL connectivity' })
  @Get()
  async check() {
    try {
      await this.db.pool.query('SELECT 1');

      return {
        status: 'ok',
        service: 'expense-tracker-api',
        database: 'connected',
      };
    } catch (error) {
      const err = error as { code?: string; message?: string };

      this.logger.error(
        `Database health check failed. Code: ${err?.code || 'UNKNOWN'}`
      );

      throw new ServiceUnavailableException('Database unavailable');
    }
  }
}
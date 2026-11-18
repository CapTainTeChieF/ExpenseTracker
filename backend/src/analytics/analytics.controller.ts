import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { MonthQueryDto } from './month.dto';
import { TrendQueryDto } from './trend.dto';
import { AnalyticsService } from './analytics.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { MonthlyView, SummaryView, TrendView } from '../api-docs/response.models';

@ApiTags('Analytics')
@ApiCookieAuth('expense_session')
@ApiUnauthorizedResponse({description:'Login required'})
@Controller('analytics')
@UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @ApiOperation({summary:'All-time income, expenses, balance and transaction count'})
  @ApiOkResponse({type:SummaryView})
  @Get('summary')
  summary(@Req() req: AuthenticatedRequest) {
    return this.analytics.summary(req.user.id);
  }

  @ApiOperation({summary:'Monthly totals and category breakdown'})
  @ApiQuery({name:'month',example:'2026-11',description:'Month as YYYY-MM'})
  @ApiOkResponse({type:MonthlyView})
  @Get('monthly')
  monthly(@Req() req: AuthenticatedRequest, @Query() query: MonthQueryDto) {
    return this.analytics.monthly(req.user.id, query.month);
  }
  @ApiOperation({summary:'Income and expense totals for a rolling sequence of months (1-12)'})
  @ApiQuery({name:'months',required:false,example:6,type:Number,description:'Number of months, 1-12 (default 6)'})
  @ApiQuery({name:'endMonth',required:false,example:'2026-11',description:'Last month YYYY-MM (defaults to current server month)'})
  @ApiOkResponse({type:TrendView})
  @Get('trend')
  trend(@Req() req: AuthenticatedRequest, @Query() query: TrendQueryDto) {
    return this.analytics.trend(req.user.id, query.months ?? 6, query.endMonth);
  }
}

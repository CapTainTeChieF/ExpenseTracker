import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, AuthenticatedRequest } from '../auth/auth.guard';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';
import { TransactionListQueryDto } from './transaction-query.dto';
import { TransactionsService } from './transactions.service';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { TransactionView } from '../api-docs/response.models';

@ApiTags('Transactions')
@ApiCookieAuth('expense_session')
@Controller('transactions') @UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactions: TransactionsService) {}
  @ApiOperation({summary:'List up to 100 recent transactions (optional month, kind and category filters)'})
  @ApiOkResponse({type:[TransactionView]})
  @Get() list(@Req() req: AuthenticatedRequest, @Query() query: TransactionListQueryDto) {
    return this.transactions.list(req.user.id, query);
  }
  @ApiOperation({summary:'Create income or expense transaction'})
  @ApiCreatedResponse({type:TransactionView})
  @Post() create(@Req() req: AuthenticatedRequest, @Body() body: CreateTransactionDto) {
    return this.transactions.create(req.user.id,body);
  }
  @ApiOperation({summary:'Edit transaction belonging to current user'})
  @ApiOkResponse({type:TransactionView})
  @Patch(':id') update(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateTransactionDto) {
    return this.transactions.update(req.user.id,id,body);
  }
  @ApiOperation({summary:'Delete transaction belonging to current user'})
  @Delete(':id') delete(@Req() req: AuthenticatedRequest, @Param('id', ParseUUIDPipe) id: string) {
    return this.transactions.remove(req.user.id,id);
  }
}

import { BadRequestException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DatabaseService } from '../database/database.service';
import { TransactionKind } from './transaction.dto';

describe('TransactionsService - isolation and validation', () => {
  test('query is explicitly scoped by authenticated user', async () => {
    const query = jest.fn().mockResolvedValue({ rows: [] });
    const service = new TransactionsService({ pool: { query } } as unknown as DatabaseService);
    await service.list('user-one');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE t.user_id=$1'), ['user-one']);
  });

  test('rejects zero amount before writing to database', async () => {
    const service = new TransactionsService({} as DatabaseService);
    await expect(service.create('user-one', {
      kind: TransactionKind.EXPENSE,
      amount: '0.00',
      transactionDate: '2026-11-09',
    })).rejects.toBeInstanceOf(BadRequestException);
  });
});

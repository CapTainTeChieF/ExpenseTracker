import { ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { TransactionKind } from '../transactions/transaction.dto';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  test('list is scoped to the current user', async () => {
    const query = jest.fn().mockResolvedValue({rows:[]});
    const service = new CategoriesService({pool:{query}} as unknown as DatabaseService);
    await service.list('user-a');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('WHERE user_id=$1'), ['user-a']);
  });

  test('create does not accept a caller-selected owner', async () => {
    const query = jest.fn().mockResolvedValue({rows:[{id:'c',name:'Books',kind:'EXPENSE'}]});
    const service = new CategoriesService({pool:{query}} as unknown as DatabaseService);
    await service.create('user-a', {name:'  Books  ', kind:TransactionKind.EXPENSE});
    expect(query.mock.calls[0][1]).toEqual(['user-a','Books','EXPENSE']);
  });

  test('rename denies an unknown category', async () => {
    const query = jest.fn().mockResolvedValue({rowCount:0, rows:[]});
    const service = new CategoriesService({pool:{query}} as unknown as DatabaseService);
    await expect(service.rename('user-a', 'missing', {name:'Travel'}))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  test('deletion rejects a category already in use', async () => {
    const query = jest.fn()
      .mockResolvedValueOnce({rowCount:0,rows:[]})
      .mockResolvedValueOnce({rowCount:1,rows:[{ '?column?':1 }]});
    const service = new CategoriesService({pool:{query}} as unknown as DatabaseService);
    await expect(service.remove('user-a', 'cat-1')).rejects.toBeInstanceOf(ConflictException);
  });
});

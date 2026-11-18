import { BadRequestException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { DatabaseService } from '../database/database.service';

describe('AnalyticsService - trend', () => {
  test('fills gaps through generate_series and scopes all joins by signed-in user', async () => {
    const query = jest.fn().mockResolvedValue({rows:[
      {month:'2026-09',income:'0',expense:'0'},
      {month:'2026-10',income:'1000',expense:'250'},
      {month:'2026-11',income:'2000',expense:'500'},
    ]});
    const service = new AnalyticsService({pool:{query}} as unknown as DatabaseService);
    const response = await service.trend('user-123',3,'2026-11');
    expect(response.months).toHaveLength(3);
    expect(response.endMonth).toBe('2026-11');
    expect(query.mock.calls[0][0]).toContain('t.user_id=$1');
    expect(query.mock.calls[0][0]).toContain('generate_series');
    expect(query.mock.calls[0][1]).toEqual(['user-123','2026-11-01',3]);
  });

  test('rejects trend size out of range before querying', async () => {
    const service = new AnalyticsService({} as DatabaseService);
    await expect(service.trend('abc',13,'2026-11')).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.trend('abc',3,'2026-13')).rejects.toBeInstanceOf(BadRequestException);
  });
});

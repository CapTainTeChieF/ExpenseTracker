import { AnalyticsService } from './analytics.service';
import { DatabaseService } from '../database/database.service';

describe('AnalyticsService', () => {
  test('monthly totals and groups are isolated to authenticated user', async () => {
    const query = jest.fn()
      .mockResolvedValueOnce({rows:[{income:'1000.00',expense:'250.00',balance:'750.00',transactionCount:2}]})
      .mockResolvedValueOnce({rows:[{kind:'EXPENSE',name:'Food',total:'250.00',count:1}]});
    const service = new AnalyticsService({pool:{query}} as unknown as DatabaseService);
    const result = await service.monthly('user-b','2026-11');
    expect(result.balance).toBe('750.00');
    expect(result.categories).toHaveLength(1);
    for (const args of query.mock.calls) {
      expect(args[0]).toContain('user_id=$1');
      expect(args[1]).toEqual(['user-b','2026-11-01']);
    }
  });
});

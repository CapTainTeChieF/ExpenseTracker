import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService - atomic signup', () => {
  test('rolls back if category creation fails after user insert', async () => {
    const query = jest.fn()
      .mockResolvedValueOnce({}) // BEGIN
      .mockResolvedValueOnce({ rows:[{id:'user-1',name:'Test',email:'test@example.com'}] }) // user insert
      .mockRejectedValueOnce(new Error('Simulated category failure')) // category insert
      .mockResolvedValueOnce({}); // ROLLBACK
    const release = jest.fn();
    const db = { pool: { connect: jest.fn().mockResolvedValue({query,release}) } } as unknown as DatabaseService;
    const jwt = { sign:jest.fn() } as unknown as JwtService;
    const service = new AuthService(db,jwt);
    await expect(service.register({name:'Test',email:'test@example.com',password:'correct-horse-battery-staple'}))
      .rejects.toThrow('Simulated category failure');
    expect(query).toHaveBeenLastCalledWith('ROLLBACK');
    expect(release).toHaveBeenCalled();
  });
});

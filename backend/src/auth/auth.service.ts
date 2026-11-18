import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';
import { LoginDto, RegisterDto } from './auth.dto';

export type PublicUser = { id: string; name: string; email: string };
const SESSION_HOURS = 12;
@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService, private readonly jwt: JwtService) {}
  private signSession(user: PublicUser, sid: string) {
    return this.jwt.sign({ sub: user.id, email: user.email, sid });
  }
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name.trim();
    if (!name) throw new ConflictException('Name required');
    const passwordHash = await hash(dto.password, 12);
    const client = await this.db.pool.connect();
    try {
      await client.query('BEGIN');
      const inserted = await client.query<PublicUser>(
        'INSERT INTO app_users(name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,name,email',
        [name, email, passwordHash],
      );
      const user = inserted.rows[0];
      for (const [kind, labels] of [
        ['INCOME', ['Salary', 'Freelance', 'Other Income']],
        ['EXPENSE', ['Food', 'Transport', 'Rent', 'Academics', 'Other Expense']],
      ] as const) {
        for (const label of labels) {
          await client.query('INSERT INTO categories (user_id,name,kind) VALUES ($1,$2,$3)', [user.id, label, kind]);
        }
      }
      const sid = randomUUID();
      await client.query(`INSERT INTO auth_sessions(id,user_id,expires_at)
        VALUES ($1,$2,NOW()+($3::integer * INTERVAL '1 hour'))`,[sid,user.id,SESSION_HOURS]);
      const token = this.signSession(user,sid);
      await client.query('COMMIT');
      return { user, token };
    } catch (error) {
      await client.query('ROLLBACK');
      if ((error as {code?:string}).code === '23505') throw new ConflictException('Email already registered');
      throw error;
    } finally { client.release(); }
  }
  async login(dto: LoginDto) {
    const result = await this.db.pool.query<PublicUser & {password_hash: string}>(
      'SELECT id,name,email,password_hash FROM app_users WHERE email = $1', [dto.email.trim().toLowerCase()],
    );
    const found = result.rows[0];
    if (!found || !(await compare(dto.password, found.password_hash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const user: PublicUser = { id: found.id, name: found.name, email: found.email };
    const sid = randomUUID();
    await this.db.pool.query(`INSERT INTO auth_sessions(id,user_id,expires_at)
      VALUES ($1,$2,NOW()+($3::integer * INTERVAL '1 hour'))`,[sid,user.id,SESSION_HOURS]);
    return { user, token: this.signSession(user,sid) };
  }
  async logout(userId: string, sessionId: string) {
    await this.db.pool.query(`UPDATE auth_sessions SET revoked_at=NOW()
      WHERE id=$1 AND user_id=$2 AND revoked_at IS NULL`,[sessionId,userId]);
  }
  async me(id: string) {
    const result = await this.db.pool.query<PublicUser>('SELECT id,name,email FROM app_users WHERE id=$1', [id]);
    if (!result.rows[0]) throw new UnauthorizedException('Unknown user');
    return result.rows[0];
  }
}

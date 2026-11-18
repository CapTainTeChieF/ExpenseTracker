import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { DatabaseService } from '../database/database.service';

export interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; sessionId: string }
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService, private readonly db: DatabaseService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = req.cookies?.expense_session;
    if (!token) throw new UnauthorizedException('Login required');
    try {
      const payload = await this.jwt.verifyAsync<{sub: string; email: string; sid: string}>(token);
      if (!payload.sub || !payload.email || !payload.sid) throw new Error('Invalid token');
      const match = await this.db.pool.query(`SELECT 1 FROM auth_sessions
        WHERE id=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at>NOW()`, [payload.sid,payload.sub]);
      if (!match.rowCount) throw new Error('Revoked or expired session');
      req.user = { id: payload.sub, email: payload.email, sessionId: payload.sid };
      return true;
    } catch { throw new UnauthorizedException('Invalid, expired or revoked session'); }
  }
}

import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard, AuthenticatedRequest } from './auth.guard';
import { AuthRateLimitService } from './auth-rate-limit.service';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './auth.dto';
const cookieOptions = () => ({
  httpOnly: true as const,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/v1',
  maxAge: 12 * 60 * 60 * 1000,
});
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly limiter: AuthRateLimitService) {}
  @ApiOperation({summary:'Register user and issue revocable HTTP-only session cookie'})
  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({passthrough:true}) res: Response) {
    await this.limiter.consume('register',req.ip || 'unknown',dto.email);
    const { user, token } = await this.auth.register(dto);
    res.cookie('expense_session', token, cookieOptions());
    return { user };
  }
  @ApiOperation({summary:'Log in and issue revocable HTTP-only session cookie'})
  @Post('login') @HttpCode(200)
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({passthrough:true}) res: Response) {
    await this.limiter.consume('login',req.ip || 'unknown',dto.email);
    const { user, token } = await this.auth.login(dto);
    res.cookie('expense_session', token, cookieOptions());
    return { user };
  }
  @ApiOperation({summary:'Revoke server session and clear cookie'})
  @Post('logout') @HttpCode(200) @UseGuards(AuthGuard)
  async logout(@Req() req: AuthenticatedRequest, @Res({passthrough:true}) res: Response) {
    await this.auth.logout(req.user.id,req.user.sessionId);
    res.clearCookie('expense_session', { path: '/api/v1', sameSite: 'lax', secure: process.env.NODE_ENV === 'production', httpOnly: true });
    return { message: 'Logged out' };
  }
  @ApiCookieAuth('expense_session')
  @ApiOperation({summary:'Return current signed-in user'})
  @Get('me') @UseGuards(AuthGuard)
  me(@Req() req: AuthenticatedRequest) { return this.auth.me(req.user.id); }
}

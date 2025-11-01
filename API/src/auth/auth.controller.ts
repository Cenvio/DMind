import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  HttpStatus,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = this.configService.get<boolean>('isProduction');
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    };

    res
      .cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      })
      .cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
  }

  private clearCookies(res: Response) {
    const isProduction = this.configService.get<boolean>('isProduction');
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
      path: '/',
    };

    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
  }

  @Get('github/callback')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async githubCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    if (!code) {
      throw new BadRequestException('Missing code parameter');
    }

    try {
      const { tokens } = await this.authService.handleGitHubCallback(code);

      this.setCookies(res, tokens.accessToken, tokens.refreshToken);

      return res.redirect(
        `${this.configService.get('frontend.url')}/auth/callback`,
      );
    } catch (error) {
      this.logger.error('Authentication error:', error);
      throw new UnauthorizedException({
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('refresh')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new BadRequestException('Missing refresh token');
    }

    try {
      const tokens = await this.authService.refreshTokens(refreshToken);

      this.setCookies(res, tokens.accessToken, tokens.refreshToken);

      return res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      this.logger.error('Token refresh error:', error);
      throw new UnauthorizedException({
        error: 'Token refresh failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('logout')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async logout(@Res() res: Response) {
    this.clearCookies(res);

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getCurrentUser(@CurrentUser() user: { userId: string; email: string; githubUsername: string }) {
    const userData = await this.authService.getCurrentUser(user.userId);

    return {
      success: true,
      user: userData,
    };
  }
}

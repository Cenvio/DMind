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
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

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
      const isProduction = this.configService.get('isProduction');

      res
        .cookie('accessToken', tokens.accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 15 * 60 * 1000,
          path: '/',
        })
        .cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        });

      return res.redirect(
        `${this.configService.get('frontend.url')}/auth/callback`,
      );
    } catch (error) {
      console.error('Authentication error:', error);
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
      const isProduction = this.configService.get('isProduction');

      res
        .cookie('accessToken', tokens.accessToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 15 * 60 * 1000,
          path: '/',
        })
        .cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: isProduction ? 'none' : 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        });

      return res.status(HttpStatus.OK).json({ success: true });
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new UnauthorizedException({
        error: 'Token refresh failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@CurrentUser() user: any) {
    const userData = await this.authService.getCurrentUser(user.userId);

    return {
      success: true,
      user: userData,
    };
  }
}

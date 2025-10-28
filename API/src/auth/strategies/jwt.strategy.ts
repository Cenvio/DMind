import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayloadDto } from '../dto/auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = request?.cookies?.accessToken;

          if (!token) {
            const authHeader = request?.headers?.authorization;
            if (authHeader) {
              token = authHeader.startsWith('Bearer ')
                ? authHeader.substring(7)
                : authHeader;
            }
          }

          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: JwtPayloadDto) {
    return {
      userId: payload.userId,
      email: payload.email,
      githubUsername: payload.githubUsername,
    };
  }
}

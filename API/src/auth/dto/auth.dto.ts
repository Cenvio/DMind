import { IsString, IsNotEmpty } from 'class-validator';

export class GithubCallbackDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class JwtPayloadDto {
  userId: string;
  email: string;
  githubUsername: string;
}

export class TokenResponseDto {
  accessToken: string;
  refreshToken: string;
}

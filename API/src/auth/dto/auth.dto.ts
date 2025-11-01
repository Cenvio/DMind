import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class GithubCallbackDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class JwtPayloadDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  githubUsername: string;
}

export class TokenResponseDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

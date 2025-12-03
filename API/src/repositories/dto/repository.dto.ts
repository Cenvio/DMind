import { IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class ConnectRepositoryDto {
  @IsString()
  githubRepoId: string;

  @IsString()
  fullName: string;

  @IsString()
  @IsOptional()
  defaultBranch?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsNumber()
  @IsOptional()
  sizeKb?: number;

  @IsBoolean()
  isPrivate: boolean;

  @IsString()
  cloneUrl: string;

  @IsOptional()
  githubMetadata?: any;
}

export class RepositoryResponseDto {
  id: string;
  githubRepoId: string;
  fullName: string;
  defaultBranch: string | null;
  language: string | null;
  sizeKb: number | null;
  isPrivate: boolean;
  cloneUrl: string;
  webhookUrl: string | null;
  lastAnalyzedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

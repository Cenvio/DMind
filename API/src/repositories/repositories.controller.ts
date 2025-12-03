import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RepositoriesService } from './repositories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConnectRepositoryDto } from './dto/repository.dto';

@Controller('repositories')
@UseGuards(JwtAuthGuard)
export class RepositoriesController {
  constructor(private repositoriesService: RepositoriesService) {}

  @Get('github')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getGitHubRepositories(
    @CurrentUser() user: { userId: string; email: string; githubUsername: string },
  ) {
    const repos = await this.repositoriesService.getGitHubRepositories(user.userId);

    return {
      success: true,
      repositories: repos,
    };
  }

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getConnectedRepositories(
    @CurrentUser() user: { userId: string; email: string; githubUsername: string },
  ) {
    const repos = await this.repositoriesService.getConnectedRepositories(user.userId);

    return {
      success: true,
      repositories: repos,
    };
  }

  @Get(':id')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async getRepository(
    @CurrentUser() user: { userId: string; email: string; githubUsername: string },
    @Param('id') id: string,
  ) {
    const repo = await this.repositoriesService.getRepositoryById(user.userId, id);

    return {
      success: true,
      repository: repo,
    };
  }

  @Post('connect')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async connectRepository(
    @CurrentUser() user: { userId: string; email: string; githubUsername: string },
    @Body() connectDto: ConnectRepositoryDto,
  ) {
    const repo = await this.repositoriesService.connectRepository(
      user.userId,
      connectDto,
    );

    return {
      success: true,
      message: 'Repository connected successfully',
      repository: repo,
    };
  }

  @Delete(':id/disconnect')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async disconnectRepository(
    @CurrentUser() user: { userId: string; email: string; githubUsername: string },
    @Param('id') id: string,
  ) {
    const result = await this.repositoriesService.disconnectRepository(
      user.userId,
      id,
    );

    return result;
  }
}

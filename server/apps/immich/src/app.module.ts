import { Module } from '@nestjs/common';
import { AssetModule } from './api-v1/asset/asset.module';
import { AlbumModule } from './api-v1/album/album.module';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { TagModule } from './api-v1/tag/tag.module';
import { DomainModule } from '@app/domain';
import { InfraModule } from '@app/infra';
import {
  AlbumController,
  APIKeyController,
  AssetController,
  AuthController,
  PersonController,
  JobController,
  OAuthController,
  PartnerController,
  SearchController,
  ServerInfoController,
  SharedLinkController,
  SystemConfigController,
  UserController,
} from './controllers';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './middlewares/auth.guard';
import { AppCronJobs } from './app.cron-jobs';

@Module({
  imports: [
    DomainModule.register({ imports: [InfraModule] }),
    AssetModule,
    AlbumModule,
    ScheduleModule.forRoot(),
    TagModule,
  ],
  controllers: [
    AppController,
    AlbumController,
    APIKeyController,
    AssetController,
    AuthController,
    JobController,
    OAuthController,
    PartnerController,
    SearchController,
    ServerInfoController,
    SharedLinkController,
    SystemConfigController,
    UserController,
    PersonController,
  ],
  providers: [
    //
    { provide: APP_GUARD, useExisting: AuthGuard },
    AuthGuard,
    AppCronJobs,
  ],
})
export class AppModule {}

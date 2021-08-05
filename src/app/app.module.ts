import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ConfigGlobalService from './services/config.service';
import GlobalModule from './module/global.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionFilter } from './interceptors/all-exception.filters';
import SongModule from './module/song.module';
import { AppGateway } from './app.gateway';
import UserModule from './module/user.module';
import RoomModule from "./module/room.module";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigGlobalService) => {
        return config.loadTypeormConnection();
      },
      inject: [ConfigGlobalService],
    }),
    GlobalModule,
    UserModule,
    RoomModule,
    SongModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
    AppGateway,
  ],
})
export class AppModule {}

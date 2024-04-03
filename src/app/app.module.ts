import { Module } from "@nestjs/common";
import ConfigGlobalService from "./services/config.service";
import GlobalModule from "./module/global.module";
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionFilter } from "./interceptors/all-exception.filters";
import SongModule from "./module/song.module";
import UserModule from "./module/user.module";
import RoomModule from "./module/room.module";
import ChatModule from "./module/chat.module";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigGlobalService) => ({
        uri: config.get("MONGODB_URI"),
        dbName: "musicroom",
      }),
      inject: [ConfigGlobalService],
    }),
    GlobalModule,
    UserModule,
    RoomModule,
    SongModule,
    ChatModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule {}

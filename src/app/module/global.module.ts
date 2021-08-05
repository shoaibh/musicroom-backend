import { Global, Module } from '@nestjs/common';
import ConfigGlobalService from '../services/config.service';
import AuthGlobalService from "../services/auth.service";

@Global()
@Module({
  providers: [
    AuthGlobalService,
    {
      provide: ConfigGlobalService,
      useValue: new ConfigGlobalService(`.env`),
    },
  ],
  exports: [AuthGlobalService, ConfigGlobalService],
})
export default class GlobalModule {}

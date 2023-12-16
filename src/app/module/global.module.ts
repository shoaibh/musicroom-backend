import { Global, Module } from '@nestjs/common';
import ConfigGlobalService from '../services/config.service';
import AuthGlobalService from '../services/auth.service';
import UserService from '../services/user.service';
import UserModule from './user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/db/schema/user.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // UserModule,
  ],
  providers: [
    AuthGlobalService,
    {
      provide: ConfigGlobalService,
      useValue: new ConfigGlobalService(`.env`),
    },
    // UserService,
  ],
  exports: [AuthGlobalService, ConfigGlobalService],
})
export default class GlobalModule {}

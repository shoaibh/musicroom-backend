import { Module } from '@nestjs/common';
import UserController from '../controllers/user.controller';
import UserService from '../services/user.service';
import AuthGlobalService from '../services/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../db/schema/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UserController],
  providers: [UserService],
})
export default class UserModule {}

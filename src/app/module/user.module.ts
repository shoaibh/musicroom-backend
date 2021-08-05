import { Module } from '@nestjs/common';
import UserController from '../controllers/user.controller';
import UserService from '../services/user.service';
import AuthGlobalService from '../services/auth.service';

@Module({
  imports: [AuthGlobalService],
  controllers: [UserController],
  providers: [UserService],
})
export default class UserModule {}

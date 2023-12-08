import { Module } from '@nestjs/common';
import AuthGlobalService from '../services/auth.service';
import RoomController from '../controllers/room.controller';
import RoomService from '../services/room.service';
import UserService from '../services/user.service';

@Module({
  imports: [],
  controllers: [RoomController],
  providers: [RoomService, UserService],
})
export default class RoomModule {}

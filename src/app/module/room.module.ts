import { Module } from '@nestjs/common';
import AuthGlobalService from '../services/auth.service';
import RoomController from '../controllers/room.controller';
import RoomService from '../services/room.service';
import UserService from '../services/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from '../../db/schema/room.schema';
import UserModule from './user.module';
import { User, UserSchema } from '../../db/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
  ],
  controllers: [RoomController],
  providers: [RoomService, UserService],
})
export default class RoomModule {}

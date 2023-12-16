import { Module } from '@nestjs/common';
import { ChatController } from '../controllers/chat.controller';
import { AppGateway } from '../app.gateway';
import RoomService from '../services/room.service';
import UserService from '../services/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from 'src/db/schema/room.schema';
import { User, UserSchema } from 'src/db/schema/user.schema';
import { Message, MessageSchema } from 'src/db/schema/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [AppGateway, RoomService, UserService],
})
export default class ChatModule {}

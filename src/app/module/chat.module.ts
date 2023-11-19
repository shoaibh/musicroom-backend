import { Module } from '@nestjs/common';
import { ChatController } from '../controllers/chat.controller';
import { AppGateway } from '../app.gateway';
import RoomService from '../services/room.service';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [AppGateway, RoomService],
})
export default class ChatModule {}

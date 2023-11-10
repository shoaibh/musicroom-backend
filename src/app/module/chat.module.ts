import { Module } from '@nestjs/common';
import { ChatController } from '../controllers/chat.controller';
import { AppGateway } from '../app.gateway';

@Module({
  imports: [],
  controllers: [ChatController],
  providers: [AppGateway],
})
export default class ChatModule {}

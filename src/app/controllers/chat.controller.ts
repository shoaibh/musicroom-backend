import { Controller, Get, Param } from '@nestjs/common';
import { AppGateway } from '../app.gateway';
import Vp from '../pipes/vp';
import { IdSchema } from '../joi-schema/user.schema';

@Controller()
export class ChatController {
  constructor(private readonly chatGateway: AppGateway) {}

  @Get('chat-messages/:id')
  async getChatMessages(
    @Param('id', Vp.for(IdSchema)) id: string,
  ): Promise<any[]> {
    return this.chatGateway.getChatMessages(id);
  }
}

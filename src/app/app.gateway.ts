import {MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer,} from '@nestjs/websockets';
import {Logger} from '@nestjs/common';
import {Server} from 'socket.io';

@WebSocketGateway()
export class AppGateway {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('change-song')
  handleSong(@MessageBody() message): void {
    console.log(message)
    this.server.emit('receive-change-song', message);
  }

}

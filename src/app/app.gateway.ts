import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class AppGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('get-room')
  async handleGetRoom(client: Socket, roomId: string): Promise<void> {
    client.join(roomId);
    client.emit('load-room', roomId);

    client.on('change-song', (delta: any) => {
      client.broadcast.to(roomId).emit('receive-change-song', delta);
    });
  }

  @SubscribeMessage('refresh-rooms')
  handleRefreshRooms(client: Socket): void {
    client.broadcast.emit('refresh');
  }
}

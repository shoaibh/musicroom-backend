import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import IORedis from 'ioredis';

const redis = new IORedis();
@WebSocketGateway({ cors: true })
export class AppGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('get-room')
  async handleGetRoom(client: Socket, roomId: string): Promise<void> {
    client.join(roomId);
    // client.on('change-song', (delta: any) => {
    //   client.broadcast.to(roomId).emit('receive-change-song', delta);
    // });

    client.on('send-message', async (payload: any) => {
      if (roomId !== payload.roomId) {
        client.leave(roomId);
        return;
      }
      client.broadcast.to(payload.roomId).emit('receive-message', payload);

      await redis.lpush(
        `chatMessages-${payload.roomId}`,
        JSON.stringify(payload),
      );
    });
  }

  @SubscribeMessage('refresh-rooms')
  handleRefreshRooms(client: Socket): void {
    this.server.emit('refresh');
  }

  async getChatMessages(roomId: string): Promise<any[]> {
    // Retrieve chat messages from Redis List
    const messages = await redis.lrange(`chatMessages-${roomId}`, 0, -1);
    const parsedMessages = messages.map((message) => {
      const parsedMessage = JSON.parse(message);
      parsedMessage.createdAt = new Date(parsedMessage.createdAt);
      return parsedMessage;
    });

    const sortedMessages = parsedMessages.sort((a, b) => {
      return a.createdAt - b.createdAt;
    });
    return sortedMessages;
  }
}

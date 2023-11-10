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
    client.emit('load-room', roomId);

    client.on('change-song', (delta: any) => {
      client.broadcast.to(roomId).emit('receive-change-song', delta);
    });
  }

  @SubscribeMessage('refresh-rooms')
  handleRefreshRooms(client: Socket): void {
    client.broadcast.emit('refresh');
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    client: any,
    payload: {
      roomId: string;
      sender: {
        id: Number;
        name: string;
        email: string;
        image: string;
      };
      message: string;
    },
  ): Promise<void> {
    // Broadcast the message to all clients
    this.server.emit('receive-message', payload);

    console.log('==', {
      payload,
    });
    // Store the message in Redis List
    await redis.lpush(
      `chatMessages-${payload.roomId}`,
      JSON.stringify(payload),
    );
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

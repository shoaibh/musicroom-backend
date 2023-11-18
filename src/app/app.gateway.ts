import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import IORedis from 'ioredis';

const redis = new IORedis();
@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private clients: Map<string, string[]> = new Map();

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
    this.leaveAllRooms(client);
  }

  private leaveAllRooms(client: Socket): void {
    const rooms = this.clients.get(client.id) || [];
    rooms.forEach((room) => {
      client.leave(room);
      console.log(`Client ${client.id} left room: ${room}`);
    });
    this.clients.delete(client.id);
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, roomId: string): void {
    this.leaveAllRooms(client); // Leave existing rooms before joining a new one

    client.join(roomId);
    console.log(`Client ${client.id} joined room: ${roomId}`);

    // Store the list of rooms the client is in
    const clientRooms = this.clients.get(client.id) || [];
    this.clients.set(client.id, [...clientRooms, roomId]);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, roomId: string): void {
    client.leave(roomId);
    console.log(`Client ${client.id} left room: ${roomId}`);

    // Update the list of rooms the client is in
    const clientRooms = this.clients.get(client.id) || [];
    const updatedRooms = clientRooms.filter((room) => room !== roomId);
    this.clients.set(client.id, updatedRooms);
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(client: Socket, payload: any) {
    const { roomId, message } = payload;
    console.log(
      `Received message in room ${roomId} from client ${client.id}: ${message}`,
    );

    // Broadcast the message to all clients in the room
    this.server.to(roomId).emit('receive-message', payload);
    await redis.lpush(
      `chatMessages-${payload.roomId}`,
      JSON.stringify(payload),
    );
  }

  @SubscribeMessage('change-song')
  async handleChangeSong(client: Socket, payload: any) {
    console.log(
      `Received song in room ${payload.roomId} from client ${client.id} `,
    );

    // Broadcast the message to all clients in the room
    this.server.to(payload.roomId).emit('receive-change-song', payload);
  }

  @SubscribeMessage('pause-song')
  async handlePauseSong(client: Socket, payload: any) {
    console.log(
      `pause song in room ${payload.roomId} from client ${client.id} `,
    );
    // Broadcast the message to all clients in the room
    this.server
      .to(payload.roomId)
      .except(client.id)
      .emit('song-paused', payload.clientId);
  }

  @SubscribeMessage('play-song')
  async handlePlaySong(client: Socket, payload: any) {
    console.log(
      `play song in room ${payload.roomId} from client ${client.id} `,
    );
    // Broadcast the message to all clients in the room
    this.server
      .to(payload.roomId)
      .except(client.id)
      .emit('song-played', payload.clientId);
  }

  @SubscribeMessage('seek-song')
  async handleSeekSong(client: Socket, payload: any) {
    console.log(
      `seek song in room ${payload.roomId} from client ${client.id} to ${payload.seekTime}`,
    );

    // Include a timestamp when emitting the "seek-song" event
    const timestamp = Date.now();

    // Broadcast the seek event to all clients in the room with the timestamp
    this.server
      .to(payload.roomId)
      .except(client.id)
      .emit('song-seeked', {
        clientId: payload.clientId,
        seekTime: payload.seekTime,
        timestamp,
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

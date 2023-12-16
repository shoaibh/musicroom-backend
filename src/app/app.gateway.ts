import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import RoomService from './services/room.service';
import HttpResponse from './libs/http-response';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from 'src/db/schema/room.schema';

@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly roomService: RoomService,
    @InjectModel('Room') private roomModel: Model<Room>,
  ) {}

  @WebSocketServer()
  server: Server;
  private clients: Map<string, string[]> = new Map();
  private userSocketIdMap: Map<number, string> = new Map();

  handleConnection(client: Socket): void {
    // console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    // console.log(`Client disconnected: ${client.id}`);
    // console.log('==left');

    this.leaveAllRooms(client);
  }

  private leaveAllRooms(client: Socket): void {
    const rooms = this.clients.get(client.id) || [];

    rooms.forEach((room) => {
      client.leave(room);
      // console.log(`Client ${client.id} left room: ${room}`);
    });

    // console.log('==', { rooms, l: this.joinedClientsInRoom });
    this.clients.delete(client.id);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(client: Socket, { roomId, userId }): Promise<void> {
    this.leaveAllRooms(client); // Leave existing rooms before joining a new one

    client.join(roomId);

    // console.log('==joined', { roomId, userId });
    // console.log(`Client ${client.id} joined room: ${roomId}`);

    try {
      await this.roomService.joinRoom(userId, roomId);
      const clientRooms = this.clients.get(client.id) || [];
      this.clients.set(client.id, [...clientRooms, roomId]);

      this.userSocketIdMap.set(userId, client.id);

      this.server.to(roomId).except(client.id).emit('user-joined', userId);
    } catch (e) {
      console.log(e);
    }
    // Store the list of rooms the client is in
  }

  @SubscribeMessage('leave-room')
  async handleLeaveRoom(client: Socket, { roomId, userId }): Promise<void> {
    client.leave(roomId);
    // console.log(`Client ${client.id} left room: ${roomId}`);
    // console.log('==left', { roomId, userId });
    // Update the list of rooms the client is in

    try {
      await this.roomService.leaveRoom(userId, roomId);

      const clientRooms = this.clients.get(client.id) || [];
      const updatedRooms = clientRooms.filter((room) => room !== roomId);
      this.clients.set(client.id, updatedRooms);

      this.server.to(roomId).except(client.id).emit('user-left', userId);
    } catch (e) {
      console.log(e);
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(client: Socket, payload: any) {
    const { roomId, message, sender } = payload;
    // console.log(
    //   `Received message in room ${roomId} from client ${client.id}: ${message}`,
    // );

    await this.roomModel.findOneAndUpdate(
      { _id: roomId },
      {
        $push: {
          messages: {
            $each: [
              {
                message,
                sender,
              },
            ],
          },
        },
      }, // Return the modified document
    );

    // Broadcast the message to all clients in the room
    this.server
      .to(roomId)
      .emit('receive-message', { ...payload, sender: { _id: sender } });
  }

  @SubscribeMessage('change-song')
  async handleChangeSong(client: Socket, payload: any) {
    // console.log(
    //   `Received song in room ${payload.roomId} from client ${client.id} `,
    // );

    // Broadcast the message to all clients in the room
    this.server.to(payload.roomId).emit('receive-change-song', payload);
  }

  @SubscribeMessage('pause-song')
  async handlePauseSong(client: Socket, payload: any) {
    // console.log(
    //   `pause song in room ${payload.roomId} from client ${client.id} `,
    // );
    // Broadcast the message to all clients in the room
    this.server
      .to(payload.roomId)
      .except(client.id)
      .emit('song-paused', payload.clientId);
  }

  @SubscribeMessage('play-song')
  async handlePlaySong(client: Socket, payload: any) {
    // console.log(
    //   `play song in room ${payload.roomId} from client ${client.id} `,
    // );

    // Broadcast the message to all clients in the room
    this.server
      .to(payload.roomId)
      .except(client.id)
      .emit('song-played', payload.clientId);
  }

  @SubscribeMessage('get-current-timestamp')
  async getCurrentTimeStamp(client: Socket, payload: any) {
    // console.log(
    //   `get cureent timestamp song in room ${payload.roomId} from client ${client.id} `,
    // );

    const response: HttpResponse<any> = await this.roomService.getSingleRoom(
      payload.roomId,
    );

    const ownerSocketId = this.userSocketIdMap.get(response.data.owner._id);

    // console.log('==', { response, ownerSocketId });
    //
    // Broadcast the message to all clients in the room
    this.server.to(ownerSocketId).emit('check-current-timestamp', {
      userId: payload.userId,
    });
  }

  @SubscribeMessage('send-current-timestamp')
  async sendCurrentTimeStamp(client: Socket, payload: any) {
    // console.log(
    //   `get send timestamp song in room ${payload.currentTimeStamp} from client ${client.id} `,
    // );

    // console.log('==', { payload });

    const memberSocketId = this.userSocketIdMap.get(payload.userId);

    // Broadcast the message to all clients in the room
    this.server.to(memberSocketId).emit('receive-current-timestamp', {
      currentTimeStamp: payload.currentTimeStamp,
      timeStamp: payload.timeStamp,
      isPlaying: payload.isPlaying,
    });
  }

  @SubscribeMessage('seek-song')
  async handleSeekSong(client: Socket, payload: any) {
    // console.log(
    //   `seek song in room ${payload.roomId} from client ${client.id} to ${payload.seekTime}`,
    // );

    // console.log('==set Room Owner', { payload });
    // Include a timestamp when emitting the "seek-song" event
    const timestamp = Date.now();

    // Broadcast the seek event to all clients in the room with the timestamp
    this.server.to(payload.roomId).except(client.id).emit('song-seeked', {
      clientId: payload.clientId,
      seekTime: payload.seekTime,
      timestamp,
      isPlaying: payload.isPlaying,
    });
  }

  @SubscribeMessage('refresh-rooms')
  handleRefreshRooms(client: Socket): void {
    this.server.emit('refresh');
  }

  async getChatMessages(roomId: string): Promise<any[]> {
    // Retrieve chat messages from Redis List
    const messages = (
      await this.roomModel
        .findById(roomId)
        .populate('messages.sender')
        .sort({ 'messages.createdAt': 'desc' })
        .exec()
    ).messages;
    // const parsedMessages = messages.map((message) => {
    //   const parsedMessage = JSON.parse(message);
    //   parsedMessage.createdAt = new Date(parsedMessage.createdAt);
    //   return parsedMessage;
    // });

    // const sortedMessages = parsedMessages.sort((a, b) => {
    //   return a.createdAt - b.createdAt;
    // });
    // return sortedMessages;
    return messages;
  }
}

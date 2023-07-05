import { Injectable } from '@nestjs/common';
import HttpResponse from '../libs/http-response';
// @ts-ignore
import MessagesConst from '../constants/messages.constants';
import ConfigGlobalService from './config.service';
import AuthGlobalService from './auth.service';
import RoomEntity from '../../db/entities/room.entity';

@Injectable()
export default class RoomService {
  constructor(
    private readonly configService: ConfigGlobalService,
    private readonly authService: AuthGlobalService,
  ) {}

  public async createRoom(
    roomData,
  ): Promise<HttpResponse<Partial<RoomEntity>>> {
    try {
      const { name } = roomData;
      const newRoom: RoomEntity = RoomEntity.create({
        name,
      });
      await newRoom.save();
      return HttpResponse.success(
        newRoom.toJSON({}),
        MessagesConst.SIGN_UP_SUCCESSFUL,
        201,
      );
    } catch (e) {
      console.log(e);
      return HttpResponse.error(MessagesConst.SIGN_UP_UNSUCCESSFUL);
    }
  }

  public async getAllRooms(): Promise<HttpResponse<Partial<RoomEntity>[]>> {
    try {
      const rooms: RoomEntity[] = await RoomEntity.find();
      const roomData = rooms.map((room) => room.toJSON({}));
      return HttpResponse.success<Partial<RoomEntity>[]>(roomData);
    } catch (e) {
      return HttpResponse.serverError();
    }
  }

  public async getSingleRoom(
    id: number,
  ): Promise<HttpResponse<Partial<RoomEntity>>> {
    const room: RoomEntity = await RoomEntity.findOne({ where: { id } });
    if (!room) {
      return HttpResponse.notFound(MessagesConst.NO_USER_FOR_THIS_ID);
    }
    return HttpResponse.success<Partial<RoomEntity>>(room.toJSON({}));
  }

  public async joinRoom(authDetails, roomId) {
    const room: RoomEntity = await RoomEntity.findOne({
      where: { id: roomId },
    });
    room.users = authDetails.currentUser;
    await room.save();
    return HttpResponse.success<Partial<RoomEntity>>(room.toJSON({}), 'joined');
  }

  public async leaveRoom(authDetails, roomId) {
    const room: RoomEntity = await RoomEntity.findOne({
      where: { id: roomId },
    });
    room.users = undefined;
    await room.save();
    return HttpResponse.success<Partial<RoomEntity>>(room.toJSON({}), 'joined');
  }

  public async updateSong(roomId, videoId) {
    const room: RoomEntity = await RoomEntity.findOne({
      where: { id: roomId },
    });
    room.videoId = videoId;
    await room.save();
    return HttpResponse.success<Partial<RoomEntity>>(room.toJSON({}), 'joined');
  }
}

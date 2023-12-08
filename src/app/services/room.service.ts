import { Injectable } from '@nestjs/common';
import HttpResponse from '../libs/http-response';
// @ts-ignore
import MessagesConst from '../constants/messages.constants';
import ConfigGlobalService from './config.service';
import AuthGlobalService from './auth.service';
import RoomEntity from '../../db/entities/room.entity';
import { AuthDetailsDto } from '../dtos/auth.dto';
import UserEntity from 'src/db/entities/user.entity';
import UserService from './user.service';

@Injectable()
export default class RoomService {
  constructor(
    private readonly configService: ConfigGlobalService,
    private readonly authService: AuthGlobalService,
    private readonly userService: UserService,
  ) {}

  public async createRoom(
    authDetails,
    roomData,
  ): Promise<HttpResponse<Partial<RoomEntity>>> {
    try {
      const { name } = roomData;
      const newRoom: RoomEntity = RoomEntity.create({
        name,
        ownerId: authDetails.currentUser.id,
      });
      await newRoom.save();
      return HttpResponse.success(
        newRoom.toJSON({}),
        MessagesConst.SIGN_UP_SUCCESSFUL,
        201,
      );
    } catch (e) {
      return HttpResponse.error(MessagesConst.SIGN_UP_UNSUCCESSFUL);
    }
  }

  public async getAllRooms(
    authDetails: AuthDetailsDto,
  ): Promise<HttpResponse<Partial<RoomEntity>[]>> {
    try {
      const rooms: RoomEntity[] = await RoomEntity.find({
        order: {
          createdAt: 'DESC',
        },
        relations: ['owner'],
      });
      const sortedRooms = rooms.sort((a, b) => {
        const isUserRoomA = a.ownerId === authDetails.currentUser.id;
        const isUserRoomB = b.ownerId === authDetails.currentUser.id;

        if (isUserRoomA && !isUserRoomB) {
          return -1; // Room A is owned by the user, should come first
        } else if (!isUserRoomA && isUserRoomB) {
          return 1; // Room B is owned by the user, should come first
        } else {
          return b.createdAt.getTime() - a.createdAt.getTime();
          // Sort by createdAt in descending order for other rooms
        }
      });
      const roomData = sortedRooms.map((room) =>
        room.toAsyncJSON({ userId: authDetails.currentUser.id }),
      );
      return HttpResponse.success<Partial<RoomEntity>[]>(
        await Promise.all(roomData),
      );
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

  public async getRoomUsers(
    id: number,
  ): Promise<HttpResponse<Partial<UserEntity>[]>> {
    const room: RoomEntity = await RoomEntity.findOne({ where: { id } });
    if (!room) {
      return HttpResponse.notFound(MessagesConst.NO_USER_FOR_THIS_ID);
    }
    return HttpResponse.success<Partial<UserEntity>[]>(
      room.toJSON({}).joinedUsers,
    );
  }

  public async joinRoom(userId, roomId) {
    try {
      const room: RoomEntity = await RoomEntity.findOne({
        where: { id: roomId },
      });
      if (!room) {
        return HttpResponse.notFound('no room found');
      }
      const user = await this.userService.getUser(userId);

      let makeUpdate = true;
      if (room?.joinedUsers?.length > 0) {
        if (!room.joinedUsers.some((user) => user.id === userId)) {
          room.joinedUsers = [...room.joinedUsers, user.data];
        } else {
          makeUpdate = false;
        }
      } else {
        room.joinedUsers = [user.data];
      }
      if (makeUpdate) {
        await room.save();
      }
      return HttpResponse.success<Partial<RoomEntity>>(
        room.toJSON({}),
        'joined',
      );
    } catch (e) {
      return HttpResponse.error(e);
    }
  }

  public async leaveRoom(userId, roomId) {
    try {
      const room: RoomEntity = await RoomEntity.findOne({
        where: { id: roomId },
      });
      if (!room) {
        return HttpResponse.notFound('no room found');
      }
      if (room?.joinedUsers?.length > 0) {
        const updatedUsers = room.joinedUsers.filter(
          (user) => user.id !== userId,
        );
        room.joinedUsers = updatedUsers;
        await room.save();
      }

      return HttpResponse.success<Partial<RoomEntity>>(room.toJSON({}), 'left');
    } catch (e) {
      return HttpResponse.error(e);
    }
  }

  public async updateQueue(roomId, song, authDetails) {
    try {
      const room: RoomEntity = await RoomEntity.findOne({
        where: { id: roomId },
      });
      if (!room) {
        return HttpResponse.notFound('no room found');
      }
      if (room?.songQueue?.length > 0) {
        room.songQueue = [...room.songQueue, song];
      } else {
        room.songQueue = [song];
      }

      room.ownerId = authDetails.currentUser.id;

      await room.save();

      return HttpResponse.success<Partial<RoomEntity>>(
        room.toJSON({}),
        'joined',
      );
    } catch (e) {
      return HttpResponse.error(e);
    }
  }

  public async updateSong(roomId, videoId, currentSong, authDetails) {
    try {
      const room: RoomEntity = await RoomEntity.findOne({
        where: { id: roomId },
      });
      if (!room) {
        return HttpResponse.notFound('no room found');
      }
      room.videoId = videoId;
      room.currentSong = currentSong;

      const updatedSongQueue = room?.songQueue?.map((q) => {
        if (q.video_id === videoId) {
          return { ...q, isPlaying: true };
        }
        return { ...q, isPlaying: false };
      });

      room.songQueue = updatedSongQueue;

      room.ownerId = authDetails.currentUser.id;

      await room.save();

      return HttpResponse.success<Partial<RoomEntity>>(
        room.toJSON({}),
        'joined',
      );
    } catch (e) {
      return HttpResponse.error(e);
    }
  }
}

// const ownerId = room.ownerId;

// console.log('==', { room, song, ownerId });
// await room.save();
// room.ownerId = ownerId;

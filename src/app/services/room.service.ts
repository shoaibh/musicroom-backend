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
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room } from 'src/db/schema/room.schema';

@Injectable()
export default class RoomService {
  constructor(
    private readonly configService: ConfigGlobalService,
    private readonly authService: AuthGlobalService,
    private readonly userService: UserService,
    @InjectModel('Room') private roomModel: Model<Room>,
  ) {}

  public async createRoom(authDetails, roomData) {
    try {
      const { name } = roomData;
      const room = new this.roomModel({
        name,
        owner: authDetails.currentUser.id,
      });
      await room.save();
      return HttpResponse.success(room, 'room created', 201);
    } catch (e) {
      return HttpResponse.error(MessagesConst.SIGN_UP_UNSUCCESSFUL);
    }
  }

  public async getAllRooms(authDetails: AuthDetailsDto) {
    try {
      const rooms = await this.roomModel
        .find()
        .sort({ createdAt: 'desc' })
        .populate('owner') // Assuming 'owner' is the field name representing the relationship
        .exec();

      const sortedRooms = rooms.sort((a, b) => {
        const isUserRoomA = a.owner._id === authDetails.currentUser._id;
        const isUserRoomB = b.owner._id === authDetails.currentUser.id;

        if (isUserRoomA && !isUserRoomB) {
          return -1; // Room A is owned by the user, should come first
        } else if (!isUserRoomA && isUserRoomB) {
          return 1; // Room B is owned by the user, should come first
        } else {
          return b.createdAt.getTime() - a.createdAt.getTime();
          // Sort by createdAt in descending order for other rooms
        }
      });
      // const roomData = sortedRooms.map((room) =>
      //   room.toAsyncJSON({ userId: authDetails.currentUser.id }),
      // );
      // return HttpResponse.success<Partial<RoomEntity>[]>(
      //   await Promise.all(roomData),
      // );
      return HttpResponse.success(sortedRooms);
    } catch (e) {
      console.log(e);
      return HttpResponse.serverError();
    }
  }

  public async getSingleRoom(id: string) {
    const room = await this.roomModel.findById(id).populate('owner').exec();
    if (!room) {
      return HttpResponse.notFound(MessagesConst.NO_USER_FOR_THIS_ID);
    }
    return HttpResponse.success(room);
  }

  public async getRoomUsers(id: string) {
    const room = await this.roomModel
      .findById(id)
      .populate('joinedUsers.user')
      .exec();
    if (!room) {
      return HttpResponse.notFound(MessagesConst.NO_USER_FOR_THIS_ID);
    }
    return HttpResponse.success(room.joinedUsers);
  }

  public async joinRoom(userId, roomId) {
    try {
      const room = await this.roomModel
        .findByIdAndUpdate(
          roomId,
          { $addToSet: { joinedUsers: { user: userId } } },
          { new: true },
        )
        .exec();
      if (!room) {
        return HttpResponse.notFound('no room found');
      }
      return HttpResponse.success(room, 'joined');
    } catch (e) {
      return HttpResponse.error(e);
    }
  }

  public async leaveRoom(userId, roomId) {
    try {
      const room = await this.roomModel
        .findByIdAndUpdate(
          roomId,
          { $pull: { joinedUsers: { user: userId } } },
          { new: true },
        )
        .exec();
      if (!room) {
        return HttpResponse.notFound('no room found');
      }

      return HttpResponse.success(room, 'left');
    } catch (e) {
      return HttpResponse.error(e);
    }
  }

  public async updateQueue(roomId, song, authDetails) {
    try {
      const room = await this.roomModel.findById(roomId).exec();

      if (!room) {
        return HttpResponse.notFound('no room found');
      }

      const isSongInQueue = room.songQueue.some(
        (queuedSong) => queuedSong.video_id === song.video_id,
      );

      if (!isSongInQueue) {
        // Push the new song to the songQueue if it doesn't exist
        room.songQueue.push({
          name: song.name,
          video_id: song.video_id,
          image_url: song.image_url,
          isPlaying: song.isPlaying,
        });
      }
      room.owner = authDetails.currentUser.id;

      // Save the updated room
      const updatedRoom = await room.save();

      return HttpResponse.success(updatedRoom, 'update queue');
    } catch (e) {
      return HttpResponse.error(e);
    }
  }

  public async updateSong(roomId, videoId, currentSong, authDetails) {
    try {
      const room = await this.roomModel.findById(roomId).exec();

      if (!room) {
        return HttpResponse.notFound('no room found');
      }

      if (String(room.owner) !== String(authDetails.currentUser._id)) {
        return HttpResponse.notFound('only owners can play song');
      }

      const son = Array.isArray(room?.songQueue)
        ? room?.songQueue?.map((q) => ({
            ...q,
            isPlaying: q?.video_id === videoId,
          }))
        : [];

      room.videoId = videoId;
      room.currentSong = {
        name: currentSong.name,
        video_id: currentSong.video_id,
        image_url: currentSong.image_url,
      };
      room.songQueue = son;
      room.owner = authDetails.currentUser.id;

      const updatedRoom = await room.save();

      return HttpResponse.success(updatedRoom, 'song update');
    } catch (e) {
      console.log(e);
      return HttpResponse.error(e);
    }
  }
}

// const ownerId = room.ownerId;

// console.log('==', { room, song, ownerId });
// await room.save();
// room.ownerId = ownerId;

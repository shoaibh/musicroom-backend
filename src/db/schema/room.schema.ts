import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { User } from './user.schema';

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Room {
  @Prop({ required: true })
  name: string;

  @Prop()
  videoId: string;

  @Prop(
    raw({
      name: { type: String },
      video_id: { type: String },
      image_url: { type: String },
    }),
  )
  currentSong: {
    name: string;
    video_id: string;
    image_url: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop([{ user: { type: Types.ObjectId, ref: 'User' } }])
  joinedUsers: Array<{
    user: Types.ObjectId;
  }>;

  @Prop([
    {
      name: { type: String },
      video_id: { type: String },
      image_url: { type: String },
      isPlaying: { type: Boolean },
    },
  ])
  songQueue: Array<{
    name: string;
    video_id: string;
    image_url: string;
    isPlaying: boolean;
  }>;

  @Prop([
    {
      sender: { type: Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
      message: String,
    },
  ])
  messages: Array<{
    _id?: Types.ObjectId;
    sender: Types.ObjectId;
    createdAt: Date;
    message: string;
  }>;
}

export const RoomSchema = SchemaFactory.createForClass(Room);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Message {
  @Prop({ required: true })
  messages: Array<{
    sender: Types.ObjectId;
    createdAt: Date;
  }>;

  @Prop({ type: Types.ObjectId, ref: 'Room' })
  room: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

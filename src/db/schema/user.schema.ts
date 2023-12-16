import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  image: string;

  @Prop()
  oAuthId: string;

  @Prop()
  passwordHash: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop(
    raw({
      name: { type: String },
      id: { type: String },
    }),
  )
  joinedRooms: Record<string, any>[];
}

export const UserSchema = SchemaFactory.createForClass(User).set('toJSON', {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

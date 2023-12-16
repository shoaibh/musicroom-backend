import UserEntity from '../entities/user.entity';
import { fakeUsernames, generateFakeImage } from './fake.seed.runner';
import * as Bcrypt from 'bcrypt';
import RoomEntity from '../entities/room.entity';
import { Model, model } from 'mongoose';
import { Room, RoomDocument, RoomSchema } from '../schema/room.schema';
import { User, UserDocument, UserSchema } from '../schema/user.schema';
import { InjectModel, getModelToken } from '@nestjs/mongoose';

export const userFakeSeed = async () => {
  console.log('reached');

  const UserMongoModel = model('User', UserSchema);
  // const RoomMongoModel = model('Room', UserSchema);

  // await UserMongoModel.deleteMany();
  // await RoomMongoModel.deleteMany();

  const passwordHash = Bcrypt.hashSync('1234', 10);

  // const users = fakeUsernames.map(
  //   ({ name, email }) =>
  //     new UserEntity({
  //       name: name,
  //       email,
  //       passwordHash,
  //     }),
  // );

  const check = await UserMongoModel.find({}).exec();

  console.log('==', { check });

  const user = new UserMongoModel({
    name: 'Client',
    email: 'client@example.com',
    passwordHash,
  });

  console.log('reached', user);

  await user.save().catch((e) => console.log(e));

  // // Create sample rooms
  // await RoomMongoModel.create({
  //   name: 'room1',
  //   videoId: 'AnhNHuc1xeE',
  // });

  // await RoomMongoModel.create({
  //   name: 'room2',
  //   videoId: 'kRnLpY7YbS4',
  // });

  // // Seed users
  // await UserMongoModel.create(users);
};

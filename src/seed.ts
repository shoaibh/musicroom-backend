import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import UserEntity from './db/entities/user.entity';
import * as Bcrypt from 'bcrypt';
import * as Lodash from 'lodash';
import { config } from 'dotenv';
import RoomEntity from './db/entities/room.entity';

const bootstrap = async () => {
  config();
  const app = await NestFactory.createApplicationContext(AppModule);

  await UserEntity.delete({});
  await RoomEntity.delete({})
  const passwordHash = Bcrypt.hashSync('1234', 10);
  const client = await UserEntity.create({
    name: 'Client',
    email: 'client@example.com',
    passwordHash,
  }).save();

  const room = await RoomEntity.create({
    name: 'room1',
    videoId: 'AnhNHuc1xeE',
  }).save();
  const room2 = await RoomEntity.create({
    name: 'room2',
    videoId: 'kRnLpY7YbS4',
  }).save();

  await app.close();
};

bootstrap();

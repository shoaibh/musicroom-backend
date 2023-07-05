import UserEntity from '../entities/user.entity';
import { fakeUsernames, generateFakeImage } from './fake.seed.runner';
import * as Bcrypt from 'bcrypt';
import RoomEntity from '../entities/room.entity';

export const userFakeSeed = async () => {
  await UserEntity.delete({});
  await RoomEntity.delete({});
  const passwordHash = Bcrypt.hashSync('1234', 10);

  const users = fakeUsernames.map(
    ({ name, email }) =>
      new UserEntity({
        name: name,
        email,
        passwordHash,
      }),
  );
  await UserEntity.create({
    name: 'Client',
    email: 'client@example.com',
    passwordHash,
  }).save();

  await RoomEntity.create({
    name: 'room1',
    videoId: 'AnhNHuc1xeE',
  }).save();
  await RoomEntity.create({
    name: 'room2',
    videoId: 'kRnLpY7YbS4',
  }).save();
  await UserEntity.save(users);
};

import { NestFactory } from "@nestjs/core";
import * as Bcrypt from "bcrypt";
import { config } from "dotenv";
import { AppModule } from "./app/app.module";
import RoomEntity from "./db/entities/room.entity";
import UserEntity from "./db/entities/user.entity";

const bootstrap = async () => {
  config();
  const app = await NestFactory.createApplicationContext(AppModule);

  await UserEntity.delete({});
  await RoomEntity.delete({});
  const passwordHash = Bcrypt.hashSync("1234", 10);
  const client = await UserEntity.create({
    name: "Client",
    email: "client@example.com",
    passwordHash,
  }).save();

  const room = await RoomEntity.create({
    name: "room1",
    videoId: "AnhNHuc1xeE",
  }).save();
  const room2 = await RoomEntity.create({
    name: "room2",
    videoId: "kRnLpY7YbS4",
  }).save();

  await app.close();
};

bootstrap();

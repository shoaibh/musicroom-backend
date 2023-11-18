import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { userFakeSeed } from './user.fake.seed';
import { AppModule } from '../../app/app.module';

export const fakeUsernames: Array<{ name: string; email: string }> = [
  { name: 'xyz_bitcs', email: 'anas@bitcs.in' },
  { name: 'shoiab_bitcs', email: 'shoaib@bitcs.in' },
  { name: 'test', email: 'test@gmail.com' },
];

export const generateFakeImage = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => `https://picsum.photos/${width}/${height}?q=${Math.random()}`;

const bootstrap = async () => {
  config();
  const app = await NestFactory.createApplicationContext(AppModule);
  await userFakeSeed();
  await app.close();
};

bootstrap().then();

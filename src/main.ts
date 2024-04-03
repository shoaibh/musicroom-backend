import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { config } from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { rateLimiterMiddleware } from './app/middleware/rate-limiting';

config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'static'));
  await app.listen(process.env.PORT || 5001);

  app.use(rateLimiterMiddleware);
}
bootstrap()
  .then(() => console.log('Server started'))
  .catch((e) => console.log(`Error occurred ${e}`));

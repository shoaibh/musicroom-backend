import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { config } from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
const osMonitor = require('os-monitor');

config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'static'));
  await app.listen(process.env.PORT || 5001);

  osMonitor.start({
    delay: 30000, // interval in milliseconds
    freemem: 0.1, // percentage of free memory required
    critical1: 0.7, // send alert if free memory drops below this threshold
  });

  // osMonitor.on('monitor', (event) => {
  //   console.log('Memory Usage:', event);
  // });
}
bootstrap()
  .then(() => console.log('Server started'))
  .catch((e) => console.log(`Error occurred ${e}`));

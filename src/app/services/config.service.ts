import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { ConnectionOptionsEnvReader } from 'typeorm/connection/options-reader/ConnectionOptionsEnvReader';
import * as path from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
class ConfigGlobalService {
  public readonly envConfig: { [key in string]: any };

  proxyIndex: number;

  constructor(filePath: string) {
    this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    this.proxyIndex = 0;
  }

  async loadTypeormConnection() {
    const envReader = new ConnectionOptionsEnvReader();
    const entitiesPath = path.join(
      __dirname,
      '../../',
      `${process.env.TYPEORM_ENTITIES}`,
    );
    const envReadArr = await envReader.read();
    const envRead = envReadArr[0];
    const options: TypeOrmModuleOptions = {
      ...envRead,
      entities: [entitiesPath],
      migrations: [],
    };
    return options;
  }

  get(key: string): string | undefined {
    return this.envConfig[key];
  }
}

export default ConfigGlobalService;

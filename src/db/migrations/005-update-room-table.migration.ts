import {
  MigrationInterface,
  QueryRunner,
  TableForeignKey,
  TableColumn,
} from 'typeorm';
import { ETable } from '../ETable';
import MigrationUtil from '../util/migration.util';

export class updateRoomTable1698779866369 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      ETable.Room,
      new TableColumn({
        name: 'song_queue',
        type: 'jsonb',
        isArray: true,
        isNullable: true,
        // default: '{}::jsonb[]',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(ETable.Room, 'song_queue');
  }
}

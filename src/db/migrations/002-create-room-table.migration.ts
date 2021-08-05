import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { ETable } from '../ETable';
import MigrationUtil from '../util/migration.util';

export class createRoomTable1614771681787 implements MigrationInterface {
  roomTable: Table = new Table({
    name: ETable.Room,
    columns: [
      ...MigrationUtil.getIDAndDatesColumns(),
      MigrationUtil.getVarCharColumn({ name: 'name' }),
      MigrationUtil.getVarCharColumn({ name: 'video_id' }),
    ],
  });

  public nameIndex = MigrationUtil.createTableIndex({
    tableName: ETable.Room,
    columnNames: ['name'],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.roomTable);
    await queryRunner.createIndex(this.roomTable, this.nameIndex);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(this.roomTable, this.nameIndex);
    await queryRunner.dropTable(this.roomTable);
  }
}

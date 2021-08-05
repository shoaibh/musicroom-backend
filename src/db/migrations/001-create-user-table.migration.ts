import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { ETable } from '../ETable';
import MigrationUtil from '../util/migration.util';

export class createUserTable1614771681787 implements MigrationInterface {
  userTable: Table = new Table({
    name: ETable.User,
    columns: [
      ...MigrationUtil.getIDAndDatesColumns(),
      MigrationUtil.getVarCharColumn({ name: 'name' }),
      MigrationUtil.getVarCharColumn({ name: 'email', isUnique: true }),
      MigrationUtil.getVarCharColumn({ name: 'password_hash' }),
      MigrationUtil.getIntegerColumn({ name: 'room_id', isNullable: true }),
    ],
  });

  public nameIndex = MigrationUtil.createTableIndex({
    tableName: ETable.User,
    columnNames: ['name'],
  });
  public emailIndex = MigrationUtil.createTableIndex({
    tableName: ETable.User,
    columnNames: ['email'],
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.userTable);
    await queryRunner.createIndex(this.userTable, this.nameIndex);
    await queryRunner.createIndex(this.userTable, this.emailIndex);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(this.userTable, this.emailIndex);
    await queryRunner.dropIndex(this.userTable, this.nameIndex);
    await queryRunner.dropTable(this.userTable);
  }
}

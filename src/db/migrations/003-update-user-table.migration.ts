import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';
import { ETable } from '../ETable';

export class updateUserTable1693080134939 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      ETable.User,
      new TableColumn({ name: 'image', type: 'varchar', isNullable: true }),
    );
    await queryRunner.addColumn(
      ETable.User,
      new TableColumn({ name: 'o_auth_id', type: 'varchar', isNullable: true }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(ETable.User, 'o_auth_id');
    await queryRunner.dropColumn(ETable.User, 'image');
  }
}

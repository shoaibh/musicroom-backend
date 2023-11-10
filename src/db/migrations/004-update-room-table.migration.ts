import { MigrationInterface, QueryRunner, TableForeignKey, TableColumn } from 'typeorm';
import { ETable } from '../ETable';
import MigrationUtil from '../util/migration.util';

export class updateRoomTable1698779866368 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.dropColumn(ETable.User, 'room_id');
 

    await queryRunner.addColumn(
      ETable.Room,
      new TableColumn({ name: 'current_song', type: 'varchar', isNullable: true }),
    );
      
    await queryRunner.addColumn(
        ETable.Room,
        new TableColumn({ name: 'owner_id', type: 'integer', isNullable: true }),
    );
      
    await queryRunner.addColumn(
        ETable.Room,
        new TableColumn({ name: 'user_ids', type: 'integer', isArray: true, default: 'ARRAY[]::integer[]'  }),
      );    
 
    await queryRunner.addColumn(
        ETable.User,
        new TableColumn({ name: 'room_ids', type: 'integer', isArray: true, default: 'ARRAY[]::integer[]'  }),
      );    
 
      // Create foreign key constraint between Room.owner_id and User.id
      await queryRunner.createForeignKey(
        ETable.Room,
        new TableForeignKey({
          columnNames: ['owner_id'],
          referencedColumnNames: ['id'],
          referencedTableName: ETable.User, // Name of the User table
          onDelete: 'SET NULL', // Specify the desired onDelete behavior if a referenced user is deleted
        }),
      );
  }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(ETable.Room, 'user_ids');
        await queryRunner.dropColumn(ETable.User, 'room_ids');
        await queryRunner.dropColumn(ETable.Room, 'owner_id');
      await queryRunner.dropColumn(ETable.Room, 'current_song');
      await queryRunner.addColumn(ETable.User, new TableColumn( MigrationUtil.getIntegerColumn({ name: 'room_id', isNullable: true })))
  }
}

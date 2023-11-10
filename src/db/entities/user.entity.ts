import { BeforeInsert, Column, Entity, OneToMany } from 'typeorm';
import { ETable } from '../ETable';
import ModelEntity from '../util/model.entity';
import { BeforeUpdate } from 'typeorm/index';
import RoomEntity from './room.entity';

@Entity({ name: ETable.User })
export default class UserEntity extends ModelEntity<UserEntity> {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'image' })
  image: string;

  @Column({ name: 'o_auth_id', unique: true })
  oAuthId: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'room_ids',type: 'integer', array: true, default: '{}' })
  roomIds: number[];

  @OneToMany(() => RoomEntity, room => room.owner)
  rooms: Promise<RoomEntity[]>;

  @BeforeInsert()
  @BeforeUpdate()
  public async beforeInsertHooks() {
    this.email = this.email.toLowerCase();
  }

  toJSON({
    includes = ['id', 'name', 'email'],
    skips = [],
  }: {
    includes?: (keyof UserEntity)[];
    skips?: (keyof UserEntity)[];
  }): Partial<UserEntity> {
    const d: any = super.toJSON({ includes, skips });
    return d;
  }
}

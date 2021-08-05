import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { ETable } from '../ETable';
import ModelEntity from '../util/model.entity';
import UserEntity from './user.entity';

@Entity({ name: ETable.Room })
export default class RoomEntity extends ModelEntity<RoomEntity> {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'video_id' })
  videoId: string;

  @OneToMany(() => UserEntity, (userEntity) => userEntity.roomId)
  @JoinColumn({ name: 'users' })
  public users: Promise<UserEntity[]>;

  toJSON({
    includes = ['id', 'name', 'videoId'],
    skips = [],
  }: {
    includes?: (keyof RoomEntity)[];
    skips?: (keyof RoomEntity)[];
  }): Partial<RoomEntity> {
    const d: any = super.toJSON({ includes, skips });
    return d;
  }
}

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ETable } from '../ETable';
import ModelEntity from '../util/model.entity';
import UserEntity from './user.entity';

@Entity({ name: ETable.Room })
export default class RoomEntity extends ModelEntity<RoomEntity> {
  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'video_id' })
  videoId: string;

  @Column({ name: 'current_song' })
  currentSong: string;

  @Column({ name: 'owner_id' })
  ownerId: number;

  @Column({ name: 'user_ids', type: 'integer', array: true, default: '{}' })
  userIds: number[];

  @ManyToOne(() => UserEntity, (user) => user.rooms)
  @JoinColumn({ name: 'owner_id' }) // This specifies the column used for the join
  owner: Promise<UserEntity>;

  toJSON({
    includes = ['id', 'name', 'videoId', 'currentSong', 'createdAt', 'ownerId'],
    skips = [],
  }: {
    includes?: (keyof RoomEntity)[];
    skips?: (keyof RoomEntity)[];
  }): Partial<RoomEntity> {
    const d: any = super.toJSON({ includes, skips });
    return d;
  }
}

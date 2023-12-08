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

  @Column({ name: 'joined_users', type: 'text', array: true, nullable: true })
  joinedUsers: Partial<UserEntity>[];

  @Column({
    name: 'song_queue',
    type: 'text',
    array: true,
    nullable: true,
    // default: "'[]'",
  })
  songQueue: {
    name: string;
    video_id: string;
    image_url: string;
    isPlaying: boolean;
  }[];

  @ManyToOne(() => UserEntity, (user) => user.rooms)
  @JoinColumn({ name: 'owner_id' }) // This specifies the column used for the join
  owner: Promise<UserEntity>;

  toJSON({
    includes = [
      'id',
      'name',
      'videoId',
      'currentSong',
      'createdAt',
      'ownerId',
      'owner',
      'songQueue',
      'joinedUsers',
    ],
    skips = [],
  }: {
    includes?: (keyof RoomEntity)[];
    skips?: (keyof RoomEntity)[];
  }): Partial<RoomEntity> {
    const d: any = super.toJSON({ includes, skips });

    return d;
  }

  async toAsyncJSON({
    includes = [
      'id',
      'name',
      'videoId',
      'currentSong',
      'createdAt',
      'ownerId',
      'owner',
    ],
    skips = [],
    userId = undefined,
  }: {
    includes?: (keyof RoomEntity)[];
    skips?: (keyof RoomEntity)[];
    userId?: Number;
  }): Promise<Partial<RoomEntity & UserEntity>> {
    const d: any = super.toJSON({ includes, skips });
    const resolvedOwner = await this.owner;
    const ownerDetails = resolvedOwner
      ? {
          id: resolvedOwner.id,
          name: resolvedOwner.name,
          email: resolvedOwner.email,
          image: resolvedOwner.image,
          roomIds: resolvedOwner.roomIds,
          roomOwned: resolvedOwner.id === userId,
        }
      : null;

    return {
      ...d,

      owner: {
        ...ownerDetails,
      },
    };
  }
}

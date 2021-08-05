import UserEntity from '../../db/entities/user.entity';

export interface AuthDetailsDto {
  currentUser: UserEntity;
  jwtToken: string;
}

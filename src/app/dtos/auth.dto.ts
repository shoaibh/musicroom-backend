import { User, UserDocument } from 'src/db/schema/user.schema';
import UserEntity from '../../db/entities/user.entity';
import { Model } from 'mongoose';

export interface AuthDetailsDto {
  currentUser: UserDocument;
  jwtToken: string;
}

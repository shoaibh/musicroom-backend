import { createParamDecorator, HttpException } from '@nestjs/common';
import UserEntity from '../../../db/entities/user.entity';
import { AuthDetailsDto } from '../../dtos/auth.dto';
import HttpResponse from '../../libs/http-response';

const AuthDetail = createParamDecorator(
  (data, req): AuthDetailsDto => {
    const user: UserEntity = req['args'][0]['user'];
    const jwtToken = req['args'][0]['jwtToken'];
    if (!user) {
      throw HttpResponse.unauthorized();
    } else {
      return { currentUser: user, jwtToken };
    }
  },
);

export default AuthDetail;

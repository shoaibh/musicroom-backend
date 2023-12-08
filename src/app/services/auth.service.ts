import { Injectable } from '@nestjs/common';
import UserEntity from '../../db/entities/user.entity';
import * as JWT from 'jsonwebtoken';
// @ts-ignore
import MessagesConst from '../constants/messages.constants';
import HttpResponse from '../libs/http-response';
import ConfigGlobalService from './config.service';

@Injectable()
export default class AuthGlobalService {
  constructor(private readonly configService: ConfigGlobalService) {}

  public async generateJWTToken(user: UserEntity) {
    const payload = {
      id: user.id,
    };
    return JWT.sign(payload, this.configService.get('JWT_SECRET'), {
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });
  }

  public async generateRefreshToken(user: UserEntity) {
    const payload = {
      id: user.id,
    };
    return JWT.sign(payload, this.configService.get('JWT_REFRESH_TOKEN'), {
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });
  }

  public async validateJWTToken(
    jwtToken: string,
  ): Promise<HttpResponse<UserEntity>> {
    try {
      const decoded: JWT.JwtPayload = JWT.verify(
        jwtToken,
        this.configService.get('JWT_SECRET'),
      ) as JWT.JwtPayload;
      const id = decoded.id;
      const user = await UserEntity.findOne({ where: { id } });
      if (!user) {
        return HttpResponse.error(MessagesConst.INVALID_AUTHENTICATION_TOKEN, {
          httpCode: 401,
        });
      }
      return HttpResponse.success(user, MessagesConst.USER_AUTHENTICATED, 200);
    } catch (e) {
      return HttpResponse.error(e.message, { httpCode: 401 });
    }
  }

  public async validateRefreshToken(
    refreshToken: string,
  ): Promise<HttpResponse<UserEntity>> {
    try {
      const decoded = JWT.verify(
        refreshToken,
        this.configService.get('JWT_REFRESH_TOKEN'),
      ) as JWT.JwtPayload;
      const id = decoded.id;
      const user = await UserEntity.findOne({ where: { id } });
      if (!user) {
        return HttpResponse.error(MessagesConst.INVALID_AUTHENTICATION_TOKEN, {
          httpCode: 401,
        });
      }
      return HttpResponse.success(user, MessagesConst.USER_AUTHENTICATED, 200);
    } catch (e) {
      return HttpResponse.error(e.message, { httpCode: 401 });
    }
  }
}

import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import AuthGlobalService from '../services/auth.service';
import UserEntity from '../../db/entities/user.entity';
import HttpResponse from '../libs/http-response';

@Injectable()
class RefreshGuard implements CanActivate {
  constructor(private readonly authService: AuthGlobalService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.headers['refreshtoken'];
    const user: UserEntity = await this.validateRefreshToken(refreshToken);
    if (user) {
      request.user = user;
      request.refreshToken = refreshToken;
      return true;
    }
    return false;
  }

  public async validateRefreshToken(token: string): Promise<UserEntity> {
    const vr: HttpResponse<UserEntity> =
      await this.authService.validateRefreshToken(token);
    if (vr.success) {
      return vr.data;
    } else {
      const r = HttpResponse.unauthorized();
      throw new HttpException(r, r.httpCode);
    }
  }
}

export default RefreshGuard;

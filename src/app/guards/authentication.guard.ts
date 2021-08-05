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
class AuthenticationGuard implements CanActivate {
  constructor(private readonly authService: AuthGlobalService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const jwtToken = request.headers['jwttoken'];
    const user: UserEntity = await this.validateJWTToken(jwtToken);
    if (user) {
      request.user = user;
      request.jwtToken = jwtToken;
      return true;
    }
    return false;
  }

  public async validateJWTToken(token: string): Promise<UserEntity> {
    const vr: HttpResponse<UserEntity> =
      await this.authService.validateJWTToken(token);
    if (vr.success) {
      return vr.data;
    } else {
      const r = HttpResponse.unauthorized();
      throw new HttpException(r, r.httpCode);
    }
  }
}

export default AuthenticationGuard;

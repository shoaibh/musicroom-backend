import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { body } = context.switchToHttp().getRequest();

    console.log('==', { body });
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?response=${body.recaptchaValue}&secret=6LeHwTMpAAAAALCOSkGxgdj06vSq-Tv_kZjyC3He`,
    );

    if (!data.success) {
      throw new ForbiddenException();
    }

    return true;
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import axios from 'axios';
import ConfigGlobalService from '../services/config.service';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(private readonly configService: ConfigGlobalService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { body } = context.switchToHttp().getRequest();

    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?response=${
        body.recaptchaValue
      }&secret=${this.configService.get('RECAPTCHA_SECRET')}`,
    );

    if (!data.success) {
      throw new ForbiddenException();
    }

    return true;
  }
}

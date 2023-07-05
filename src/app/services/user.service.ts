import { Injectable } from '@nestjs/common';
import UserEntity from '../../db/entities/user.entity';
import HttpResponse from '../libs/http-response';
// @ts-ignore
import MessagesConst from '../constants/messages.constants';
import {
  LoginCredentialDto,
  UserLoginDto,
  UserRegistrationDto,
  UserUpdateDto,
} from '../dtos/user.dto';
import ConfigGlobalService from './config.service';
import * as Bcrypt from 'bcrypt';
import AuthGlobalService from './auth.service';
import { AuthDetailsDto } from '../dtos/auth.dto';
import { isNil } from '@nestjs/common/utils/shared.utils';

@Injectable()
export default class UserService {
  constructor(
    private readonly configService: ConfigGlobalService,
    private readonly authService: AuthGlobalService,
  ) {}

  public async userSignUp(
    createUserSchema: UserRegistrationDto,
  ): Promise<HttpResponse<Partial<UserEntity>>> {
    try {
      console.log({ createUserSchema });
      const user: UserEntity = await UserEntity.findOne({
        where: { email: createUserSchema.email.toLowerCase() },
      });
      console.log(user);
      if (user)
        return HttpResponse.error(MessagesConst.EMAIL_ALREADY_REGISTERED, {
          httpCode: 400,
        });
      const { name, email, password } = createUserSchema;
      const newUser: UserEntity = UserEntity.create({
        name,
        email,
        passwordHash: Bcrypt.hashSync(password, 10),
      });
      console.log(newUser);
      await newUser.save();
      return HttpResponse.success(
        newUser.toJSON({}),
        MessagesConst.SIGN_UP_SUCCESSFUL,
        201,
      );
    } catch (e) {
      console.log(e);
      return HttpResponse.error(MessagesConst.SIGN_UP_UNSUCCESSFUL);
    }
  }

  public async userLogin(
    loginCredentialSchema: LoginCredentialDto,
  ): Promise<HttpResponse<Partial<UserLoginDto>>> {
    try {
      const user: UserEntity = await UserEntity.findOne({
        where: { email: loginCredentialSchema.email.toLowerCase() },
      });

      if (!user) return HttpResponse.error(MessagesConst.INVALID_CREDENTIALS);
      const isMatching = await Bcrypt.compare(
        loginCredentialSchema.password,
        user.passwordHash,
      );

      if (isMatching) {
        const token = await this.authService.generateJWTToken(user);
        console.log('==user login', { token });

        const res: Partial<UserLoginDto> = {
          ...user.toJSON({}),
          jwt: token,
        };
        return HttpResponse.success<Partial<UserLoginDto>>(
          res,
          MessagesConst.LOGGED_IN_SUCCESSFULLY,
        );
      }
      return HttpResponse.error(MessagesConst.INVALID_CREDENTIALS, {
        httpCode: 400,
      });
    } catch (e) {
      return HttpResponse.error(MessagesConst.LOGIN_UNSUCCESSFUL);
    }
  }

  public async getAllUsers({
    page,
    limit,
  }): Promise<HttpResponse<Partial<UserEntity>[]>> {
    try {
      const users: UserEntity[] = await UserEntity.find({
        skip: page * limit,
        take: limit,
      });
      const userData = users.map((user) => user.toJSON({}));
      return HttpResponse.success<Partial<UserEntity>[]>(userData);
    } catch (e) {
      return HttpResponse.serverError();
    }
  }

  public async getUser(id: number): Promise<HttpResponse<Partial<UserEntity>>> {
    const user: UserEntity = await UserEntity.findOne({ where: { id } });
    if (!user) {
      return HttpResponse.notFound(MessagesConst.NO_USER_FOR_THIS_ID);
    }
    return HttpResponse.success<Partial<UserEntity>>(user.toJSON({}));
  }

  public async updateUser(
    id: number,
    currentUser: UserEntity,
    updateUserSchema: UserUpdateDto,
  ): Promise<HttpResponse<Partial<UserEntity>>> {
    try {
      const user: UserEntity = await UserEntity.findOne({ where: { id } });
      if (!user) {
        return HttpResponse.notFound(MessagesConst.NO_USER_FOR_THIS_ID);
      }
      const userWithExistingEmail: UserEntity = await UserEntity.findOne({
        where: { email: updateUserSchema.email.toLowerCase() },
      });
      if (userWithExistingEmail && userWithExistingEmail.id !== id) {
        return HttpResponse.error(MessagesConst.EMAIL_ALREADY_REGISTERED, {
          httpCode: 400,
        });
      }
    } catch (e) {
      return HttpResponse.error(MessagesConst.USER_NOT_UPDATED);
    }
  }

  public async deleteUser(id: number): Promise<HttpResponse<string>> {
    try {
      const user: UserEntity = await UserEntity.findOne({ where: { id } });
      if (!user) {
        return HttpResponse.notFound(MessagesConst.NO_USER_FOR_THIS_ID);
      }
      await user.remove();
      return HttpResponse.success<string>(
        '',
        MessagesConst.USER_DELETED_SUCCESSFULLY,
      );
    } catch (e) {
      return HttpResponse.error(MessagesConst.USER_NOT_DELETED_SUCCESSFULLY);
    }
  }

  public async logout(
    authDetails: AuthDetailsDto,
  ): Promise<HttpResponse<string>> {
    return HttpResponse.success<string>(
      '',
      MessagesConst.LOGGED_OUT_SUCCESSFULLY,
    );
  }
}

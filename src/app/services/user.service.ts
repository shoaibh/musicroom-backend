import { Injectable } from '@nestjs/common';
import UserEntity from '../../db/entities/user.entity';
import HttpResponse from '../libs/http-response';
// @ts-ignore
import MessagesConst from '../constants/messages.constants';
import {
  LoginCredentialDto,
  UserLoginDto,
  UserOAuthDto,
  UserRegistrationDto,
  UserUpdateDto,
} from '../dtos/user.dto';
import ConfigGlobalService from './config.service';
import * as Bcrypt from 'bcrypt';
import AuthGlobalService from './auth.service';
import { AuthDetailsDto } from '../dtos/auth.dto';
import { isNil } from '@nestjs/common/utils/shared.utils';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/db/schema/user.schema';

const EXPIRE_TIME = 20 * 1000;

@Injectable()
export default class UserService {
  constructor(
    private readonly configService: ConfigGlobalService,
    private readonly authService: AuthGlobalService,
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  public async userSignUp(createUserSchema: UserRegistrationDto) {
    try {
      const userExist = await this.userModel
        .findOne({ email: createUserSchema.email })
        .exec();
      if (userExist)
        return HttpResponse.error(MessagesConst.EMAIL_ALREADY_REGISTERED, {
          httpCode: 400,
        });
      const { name, email, password } = createUserSchema;
      const user = new this.userModel({
        name,
        email,
        passwordHash: Bcrypt.hashSync(password, 10),
      });
      await user.save();
      return HttpResponse.success(user, MessagesConst.SIGN_UP_SUCCESSFUL, 201);
    } catch (e) {
      console.log(e);
      return HttpResponse.error(e);
    }
  }

  public async userOAuth(
    userOAuthDetail: UserOAuthDto,
  ): Promise<HttpResponse<Partial<UserEntity>>> {
    try {
      const user: UserEntity = await UserEntity.findOne({
        where: { email: userOAuthDetail.email.toLowerCase() },
      });
      if (user)
        return HttpResponse.success(
          user.toJSON({}),
          MessagesConst.LOGIN_SUCCESSFUL,
          200,
        );
      const { name, email, image, oAuthId } = userOAuthDetail;

      const newUser: UserEntity = UserEntity.create({
        name,
        email,
        image,
        oAuthId,
      });

      await newUser.save();
      return HttpResponse.success(
        newUser.toJSON({}),
        MessagesConst.SIGN_UP_SUCCESSFUL,
        201,
      );
    } catch (e) {
      return HttpResponse.error(MessagesConst.SIGN_UP_UNSUCCESSFUL);
    }
  }

  public async userLogin(
    loginCredentialSchema: LoginCredentialDto,
  ): Promise<HttpResponse<Partial<UserLoginDto>>> {
    try {
      const userExist = await this.userModel
        .findOne({ email: loginCredentialSchema.email.toLowerCase() })
        .exec();

      if (!userExist)
        return HttpResponse.error(MessagesConst.INVALID_CREDENTIALS);
      const isMatching = await Bcrypt.compare(
        loginCredentialSchema.password,
        userExist.passwordHash,
      );

      if (isMatching) {
        const token = await this.authService.generateJWTToken(userExist);
        const refreshToken =
          await this.authService.generateRefreshToken(userExist);

        const res: Partial<UserLoginDto> = {
          user: {
            id: userExist._id,
            name: userExist.name,
            email: userExist?.email,
            joinedRooms: userExist?.joinedRooms,
            image: userExist?.image,
          },
          backendTokens: {
            jwt: token,
            refreshToken,
            expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
          },
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

  public async refreshUser(user: UserEntity) {
    const token = await this.authService.generateJWTToken(user);
    const refreshToken = await this.authService.generateRefreshToken(user);

    const res = {
      jwt: token,
      refreshToken,
      expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
    };
    return HttpResponse.success<Partial<UserLoginDto>>(
      {
        backendTokens: {
          ...res,
        },
      },
      MessagesConst.REFRESH_TOKEN_GENERATED,
    );
  }

  public async getAllUsers({ page, limit }) {
    try {
      const users = await this.userModel
        .find({})
        .skip(page * limit)
        .limit(limit)
        .exec();
      return HttpResponse.success(users);
    } catch (e) {
      return HttpResponse.serverError();
    }
  }

  public async getUser(id: number) {
    const userExist = await this.userModel.findOne({ id }).exec();
    if (!userExist) {
      return HttpResponse.notFound(MessagesConst.NO_USER_FOR_THIS_ID);
    }
    return HttpResponse.success(userExist);
  }

  public async updateUser(
    id: number,
    currentUser,
    updateUserSchema: UserUpdateDto,
  ): Promise<HttpResponse<Partial<UserEntity>>> {
    try {
      const user = await this.userModel.findOne({ id }).exec();

      if (!user) {
        return HttpResponse.notFound(MessagesConst.NO_USER_FOR_THIS_ID);
      }
      if (updateUserSchema.email) {
        const userWithExistingEmail: UserEntity = await UserEntity.findOne({
          where: { email: updateUserSchema.email.toLowerCase() },
        });
        if (userWithExistingEmail && userWithExistingEmail.id !== id) {
          return HttpResponse.error(MessagesConst.EMAIL_ALREADY_REGISTERED, {
            httpCode: 400,
          });
        }
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

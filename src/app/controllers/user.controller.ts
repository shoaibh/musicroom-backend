import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import UserService from '../services/user.service';

import UserEntity from '../../db/entities/user.entity';
import HttpResponse, { handleHTTPResponse } from '../libs/http-response';
import {
  LoginCredentialDto,
  UserLoginDto,
  UserOAuthDto,
  UserRegistrationDto,
  UserUpdateDto,
} from '../dtos/user.dto';
import AuthenticationGuard from '../guards/authentication.guard';
import { AuthDetailsDto } from '../dtos/auth.dto';
import AuthDetail from '../utils/decorators/auth-detail.decorator';
import {
  IdSchema,
  UserLoginSchema,
  UserRegistrationSchema,
  UserUpdateSchema,
  UserWithRoleSchema,
} from '../joi-schema/user.schema';
import Vp from '../pipes/vp';
import RefreshGuard from '../guards/refresh.guard';
import { editFileName, imageFileFilter } from '../libs/file-upload';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';

// image.controller.ts

@Controller('user')
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @UseGuards(AuthenticationGuard)
  public async getUsers(
    @Query() { page = 0, limit = 10 },
  ): Promise<HttpResponse<Partial<UserEntity>[]>> {
    const data = await this.userService.getAllUsers({ page, limit });
    return handleHTTPResponse(data);
  }

  @Get('/details')
  @UseGuards(AuthenticationGuard)
  public async getAuthUserDetails(
    @AuthDetail() authDetails: AuthDetailsDto,
  ): Promise<HttpResponse<Partial<UserEntity>>> {
    const data = HttpResponse.success<Partial<UserEntity>>(
      authDetails.currentUser.toJSON({}),
    );
    return handleHTTPResponse(data);
  }

  @Post('/login')
  @HttpCode(200)
  public async login(
    @Body(Vp.for(UserLoginSchema))
    userCredentials: LoginCredentialDto,
  ): Promise<HttpResponse<Partial<UserLoginDto>>> {
    const data = await this.userService.userLogin(userCredentials);
    return handleHTTPResponse(data);
  }

  @Post('/refresh')
  @HttpCode(200)
  @UseGuards(RefreshGuard)
  public async refresh(@Request() req) {
    const data = await this.userService.refreshUser(req.user);
    return handleHTTPResponse(data);
  }

  @Post('/logout')
  @HttpCode(200)
  @UseGuards(AuthenticationGuard)
  public async logout(
    @AuthDetail() authDetails: AuthDetailsDto,
  ): Promise<HttpResponse<string>> {
    const data = await this.userService.logout(authDetails);
    return handleHTTPResponse(data);
  }

  @Post('/signup')
  @HttpCode(201)
  public async signup(
    @Body(Vp.for(UserRegistrationSchema)) user: UserRegistrationDto,
  ) {
    console.log('==', { user });
    const data = await this.userService.userSignUp(user);
    return handleHTTPResponse(data);
  }

  @Post('/oauth/signup')
  @HttpCode(201)
  public async oAuthSignUp(
    @Body() user: UserOAuthDto,
  ): Promise<HttpResponse<Partial<UserEntity>>> {
    const data = await this.userService.userOAuth(user);
    return handleHTTPResponse(data);
  }

  @Post('/')
  @UseGuards(AuthenticationGuard)
  public async createUserWithRole(
    @Body(Vp.for(UserWithRoleSchema)) userWithRole: UserRegistrationDto,
  ): Promise<HttpResponse<Partial<UserEntity>>> {
    const data = await this.userService.userSignUp(userWithRole);
    return handleHTTPResponse(data);
  }

  @Get('/:id')
  @UseGuards(AuthenticationGuard)
  public async getUser(
    @Param('id', Vp.for(IdSchema)) id: number,
  ): Promise<HttpResponse<Partial<UserEntity>>> {
    const data = await this.userService.getUser(id);
    return handleHTTPResponse(data);
  }

  @Put('/:id')
  @UseGuards(AuthenticationGuard)
  public async updateUser(
    @Param('id', Vp.for(IdSchema)) id: number,
    @AuthDetail() authDetails: AuthDetailsDto,
    @Body(Vp.for(UserUpdateSchema)) body: UserUpdateDto,
  ): Promise<HttpResponse<Partial<UserEntity>>> {
    const data = await this.userService.updateUser(
      id,
      authDetails.currentUser,
      body,
    );
    return handleHTTPResponse(data);
  }

  @Delete('/:id')
  @UseGuards(AuthenticationGuard)
  public async deleteUser(
    @Param('id', Vp.for(IdSchema)) id: number,
  ): Promise<HttpResponse<Partial<string>>> {
    const data = await this.userService.deleteUser(id);
    return handleHTTPResponse(data);
  }

  // @Post('/upload')
  // @UseInterceptors(
  //   FileInterceptor('image', {
  //     // storage: multer.memoryStorage(),
  //     fileFilter: imageFileFilter,
  //   }),
  // )
  // async uploadFile(@UploadedFile() file) {
  //   console.log(file);

  //   const fileName = editFileName(null, file);
  //   console.log('==', { fileName });

  //   // Create a writable stream and pipe the buffer to it
  //   const stream = fileUpload.createWriteStream({
  //     metadata: {
  //       contentType: file.mimetype,
  //     },
  //   });

  //   stream.on('error', (err) => {
  //     console.error(err);
  //   });

  //   return new Promise((resolve, reject) => {
  //     stream.on('finish', async () => {
  //       console.log('Upload finished successfully');

  //       // Generate a signed URL for the uploaded file
  //       const [url] = await fileUpload.getSignedUrl({
  //         action: 'read',
  //         expires: '01-01-2030', // Adjust the expiration date as needed
  //       });

  //       // Add your additional logic here, such as storing file metadata in your database

  //       resolve({ filename: fileName, url });
  //     });

  //     stream.end(file.buffer);
  //   });
  // }
}

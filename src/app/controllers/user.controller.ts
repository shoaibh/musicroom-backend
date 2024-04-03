import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, Request, UseGuards } from "@nestjs/common";
import UserService from "../services/user.service";

import UserEntity from "../../db/entities/user.entity";
import { AuthDetailsDto } from "../dtos/auth.dto";
import { LoginCredentialDto, UserLoginDto, UserOAuthDto, UserRegistrationDto, UserUpdateDto } from "../dtos/user.dto";
import AuthenticationGuard from "../guards/authentication.guard";
import { RecaptchaGuard } from "../guards/recaptch.guard";
import RefreshGuard from "../guards/refresh.guard";
import { IdSchema, UserLoginSchema, UserRegistrationSchema, UserUpdateSchema, UserWithRoleSchema } from "../joi-schema/user.schema";
import HttpResponse, { handleHTTPResponse } from "../libs/http-response";
import Vp from "../pipes/vp";
import AuthDetail from "../utils/decorators/auth-detail.decorator";

@Controller("user")
export default class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/")
  @UseGuards(AuthenticationGuard)
  public async getUsers(@Query() { page = 0, limit = 10 }): Promise<HttpResponse<Partial<UserEntity>[]>> {
    const data = await this.userService.getAllUsers({ page, limit });
    return handleHTTPResponse(data);
  }

  @Get("/details")
  @UseGuards(AuthenticationGuard)
  public async getAuthUserDetails(@AuthDetail() authDetails: AuthDetailsDto): Promise<HttpResponse<Partial<UserEntity>>> {
    const data = HttpResponse.success<Partial<UserEntity>>(authDetails.currentUser.toJSON({}));
    return handleHTTPResponse(data);
  }

  @Post("/login")
  @HttpCode(200)
  @UseGuards(RecaptchaGuard)
  public async login(
    @Body(Vp.for(UserLoginSchema))
    userCredentials: LoginCredentialDto,
  ): Promise<HttpResponse<Partial<UserLoginDto>>> {
    console.log("login");
    const data = await this.userService.userLogin(userCredentials);
    return handleHTTPResponse(data);
  }

  @Post("/refresh")
  @HttpCode(200)
  @UseGuards(RefreshGuard)
  public async refresh(@Request() req) {
    const data = await this.userService.refreshUser(req.user);
    return handleHTTPResponse(data);
  }

  @Post("/logout")
  @HttpCode(200)
  @UseGuards(AuthenticationGuard)
  public async logout(@AuthDetail() authDetails: AuthDetailsDto): Promise<HttpResponse<string>> {
    const data = await this.userService.logout(authDetails);
    return handleHTTPResponse(data);
  }

  @Post("/signup")
  @HttpCode(201)
  @UseGuards(RecaptchaGuard)
  public async signup(@Body(Vp.for(UserRegistrationSchema)) user: UserRegistrationDto) {
    console.log("==", { user });
    const data = await this.userService.userSignUp(user);
    return handleHTTPResponse(data);
  }

  @Post("/oauth/signup")
  @HttpCode(201)
  public async oAuthSignUp(@Body() user: UserOAuthDto): Promise<HttpResponse<Partial<UserEntity>>> {
    console.log("oauth");
    const data = await this.userService.userOAuth(user);
    return handleHTTPResponse(data);
  }

  @Post("/oauth/getJwt")
  @HttpCode(201)
  public async oAuthJwt(@Body() user: UserOAuthDto): Promise<HttpResponse<Partial<UserEntity>>> {
    console.log("getJWT");

    const data = await this.userService.userOAuth(user);
    return handleHTTPResponse(data);
  }

  @Post("/")
  @UseGuards(AuthenticationGuard)
  public async createUserWithRole(
    @Body(Vp.for(UserWithRoleSchema)) userWithRole: UserRegistrationDto,
  ): Promise<HttpResponse<Partial<UserEntity>>> {
    const data = await this.userService.userSignUp(userWithRole);
    return handleHTTPResponse(data);
  }

  @Get("/:id")
  @UseGuards(AuthenticationGuard)
  public async getUser(@Param("id", Vp.for(IdSchema)) id: number): Promise<HttpResponse<Partial<UserEntity>>> {
    const data = await this.userService.getUser(id);
    return handleHTTPResponse(data);
  }

  @Put("/:id")
  @UseGuards(AuthenticationGuard)
  public async updateUser(
    @Param("id", Vp.for(IdSchema)) id: number,
    @AuthDetail() authDetails: AuthDetailsDto,
    @Body(Vp.for(UserUpdateSchema)) body: UserUpdateDto,
  ): Promise<HttpResponse<Partial<UserEntity>>> {
    const data = await this.userService.updateUser(id, authDetails.currentUser, body);
    return handleHTTPResponse(data);
  }

  @Delete("/:id")
  @UseGuards(AuthenticationGuard)
  public async deleteUser(@Param("id", Vp.for(IdSchema)) id: number): Promise<HttpResponse<Partial<string>>> {
    const data = await this.userService.deleteUser(id);
    return handleHTTPResponse(data);
  }
}

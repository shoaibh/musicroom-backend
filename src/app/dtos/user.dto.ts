import UserEntity from 'src/db/entities/user.entity';

export interface UserUpdateDto {
  name: string;
  email: string;
  password: string;
  joinedRoom: any;
}

export interface LoginCredentialDto {
  email: string;
  password: string;
}

export interface UserDto {
  name: string;
  email: string;
}

export interface UserLoginDto {
  user: any;
  backendTokens: {
    jwt: string;
    refreshToken: string;
    expiresIn?: number;
  };
}
export interface UserRegistrationDto {
  name: string;
  email: string;
  password: string;
  image_url?: string;
}

export interface UserOAuthDto {
  name: string;
  email: string;
  image: string;
  oAuthId: string;
}

export interface UserUpdateDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentialDto {
  email: string;
  password: string;
}
export interface UserLoginDto {
  name: string;
  email: string;
  jwt: string;
}
export interface UserRegistrationDto {
  name: string;
  email: string;
  password: string;
}

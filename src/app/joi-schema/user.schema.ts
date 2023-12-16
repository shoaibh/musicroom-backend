import * as Joi from '@hapi/joi';
import {
  LoginCredentialDto,
  UserRegistrationDto,
  UserUpdateDto,
} from '../dtos/user.dto';

const UserUpdateSchema = Joi.object<UserUpdateDto>({
  name: Joi.string().trim().min(3).max(20),
  email: Joi.string().trim().email(),
  password: Joi.string().trim().min(3).allow(null),
});

const UserRegistrationSchema = Joi.object<UserRegistrationDto>({
  name: Joi.string().trim().min(3).max(20).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().min(3).required(),
  image_url: Joi.string(),
  recaptchaValue: Joi.string().required(),
});

const UserWithRoleSchema = Joi.object<UserRegistrationDto>({
  name: Joi.string().trim().min(3).max(20).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().min(3).required(),
});

const UserLoginSchema = Joi.object<LoginCredentialDto>({
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().required(),
  recaptchaValue: Joi.string().required(),
});

const IdSchema = Joi.string().required();

export {
  UserUpdateSchema,
  UserRegistrationSchema,
  UserWithRoleSchema,
  UserLoginSchema,
  IdSchema,
};

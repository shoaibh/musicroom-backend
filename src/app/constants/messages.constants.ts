export default class MessagesConst {
  static EMAIL_ALREADY_REGISTERED = 'This email is already registered';
  static SIGN_UP_SUCCESSFUL = 'sign up was successful';
  static LOGIN_SUCCESSFUL = 'login in was successful';
  static SIGN_UP_UNSUCCESSFUL = "sign up was unsuccessful and couldn't happen";
  static LOGIN_UNSUCCESSFUL = "login was unsuccessful and couldn't happen";
  static INVALID_AUTHENTICATION_TOKEN = 'the authentication token was invalid';
  static USER_AUTHENTICATED = 'user authenticated';
  static AUTHENTICATION_FAILED =
    'user authentication failed, check password again';
  static INVALID_CREDENTIALS = 'email or password was wrong';
  static PERMISSION_DENIED_ADMIN = 'only admin can make this request';
  static PERMISSION_DENIED_ADMIN_REALTOR =
    'only admin and realtors can make this request';
  static LOGGED_OUT_SUCCESSFULLY = 'logged out successfully';
  static NO_USER_FOR_THIS_ID = 'no user is present for this id';
  static USER_UPDATED_SUCCESSFULLY = 'user was successfully updated';
  static USER_NOT_UPDATED = 'user updating was unsuccessful';
  static USER_UPDATE_ITSELF = 'user can only update itself';
  static USER_DELETED_SUCCESSFULLY = 'user deleted';
  static USER_NOT_DELETED_SUCCESSFULLY = 'user could not be deleted';
  static LOGGED_IN_SUCCESSFULLY = 'log in was successful';
  static REFRESH_TOKEN_GENERATED = 'refresh token generated';
  static APARTMENT_CREATED_SUCCESSFULLY = 'apartment created successfully';
  static APARTMENT_CREATION_UNSUCCESSFUL = 'apartment could not be created';
  static APARTMENT_REALTOR_NOT_OWNED =
    'you are not an owner of this apartment. Only owner realtor or admin can update an apartment';
  static APARTMENT_UPDATED_SUCCESSFULLY = 'apartment updated successfully';
  static APARTMENT_NOT_UPDATED_SUCCESSFULLY = 'apartment updation unsuccessful';
  static APARTMENT_NOT_FOUND = 'no apartment for this id';
  static APARTMENT_DELETED = 'apartment deleted successfully';
  static APARTMENT_DELETION_UNSUCCESSFUL = 'apartment could not be deleted';
  static USER_CANT_UPDATE_HIS_ROLE = 'User cant update his role';
}

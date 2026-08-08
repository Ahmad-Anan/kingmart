export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role?: 'user' | 'admin';
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISignupRequest {
  name: string;
  email: string;
  password: string;
  rePassword: string;
  phone: string;
}

export interface ISigninRequest {
  email: string;
  password: string;
}

export interface IAuthResponse {
  message: string;
  user: IUser;
  token: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IStatusMessageResponse {
  statusMsg: string;
  message: string;
}

export interface IVerifyResetCodeRequest {
  resetCode: string;
}

export interface IVerifyResetCodeResponse {
  status: string;
}

export interface IResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface IResetPasswordResponse {
  token: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  password: string;
  rePassword: string;
}

export interface IUpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
}

export interface IUpdateUserResponse {
  message: string;
  user: IUser;
}

export interface IUsersResponse {
  results: number;
  data: IUser[];
}

export interface IVerifyTokenResponse {
  message: string;
  decoded: {
    userId: string;
    iat: number;
    exp: number;
  };
}

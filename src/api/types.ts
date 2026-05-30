export interface BaseResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export interface GetUserDto {
  id: number;
  userName: string;
  roleName: string;
  role?: any;
  personId: number;
  authorizationCode: string;
}

export interface UserLoginResponse {
  data: GetUserDto;
  token: string;
  success: boolean;
  message: string;
}

import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 128) /// 최소 8자, 최대 128자로 수정
  password: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  nickname: string;
}

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class TokenDto {
  accessToken: string;
  refreshToken: string;
}

export class PassDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}

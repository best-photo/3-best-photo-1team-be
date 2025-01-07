import { OmitType } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';

// 회원가입 요청 DTO
export class SignUpRequestDto extends OmitType(UserDto, ['id']) {}

// 회원가입 응답 DTO
export class SignupResponseDto extends OmitType(UserDto, ['password']) {}

// 로그인 요청 DTO (필요한 Email, Password만 받음)
export class SignInRequestDto extends OmitType(UserDto, ['id', 'nickname']) {}

// 로그인 응답 DTO
export class SigninResponseDto extends SignupResponseDto {}

// export class SignUpDto {
//   @IsEmail()
//   @IsNotEmpty()
//   email: string;

//   @IsString()
//   @IsNotEmpty()
//   @Length(8, 128) /// 최소 8자, 최대 128자로 수정
//   password: string;

//   @IsString()
//   @IsNotEmpty()
//   @Length(2, 50)
//   nickname: string;
// }

// export class SignInDto {
//   @IsEmail()
//   @IsNotEmpty()
//   email: string;

//   @IsString()
//   @IsNotEmpty()
//   password: string;
// }

// export class TokenDto {
//   accessToken: string;
//   refreshToken: string;
// }

// export class PassDto {
//   @IsString()
//   @IsNotEmpty()
//   password: string;
// }

// export class SignupResponseDto {
//   headers: Record<string, string>;
//   body: {
//     message: string;
//     user: {
//       id: number;
//       email: string;
//       nickname: string;
//       points: number;
//     };
//   };
// }

// export class SigninResponseDto {
//   headers: Record<string, string>;
//   body: {
//     message: string;
//     user: {
//       id: number;
//       email: string;
//       nickname: string;
//       points: number;
//     };
//   };
// }

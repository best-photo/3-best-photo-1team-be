import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Get,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInRequestDto, SignUpRequestDto } from './dto/auth.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입
  @Post('signup')
  @ApiResponse({
    status: 201,
    description: '회원가입이 완료되었습니다.',
  })
  @ApiResponse({
    status: 409,
    description: '이미 사용 중인 이메일입니다.',
  })
  @ApiResponse({
    status: 409,
    description: '이미 사용 중인 닉네임입니다.',
  })
  @ApiResponse({
    status: 500,
    description: '회원가입을 진행하는 중 오류가 발생했습니다.',
  })
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() signupRequestDto: SignUpRequestDto,
  ): Promise<{ message: string }> {
    // 회원가입 서비스 호출
    const result = await this.authService.signup(signupRequestDto);
    return result;
  }

  // 로그인
  @Post('login')
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() signInRequestDto: SignInRequestDto, @Res() res) {
    const { header, body } = await this.authService.signin(signInRequestDto);

    // 쿠기 기반 인증 설정
    await this.setAuthCookies(res, header);

    // 응답(Body) 전송
    return res.json(body);
  }

  // 로그아웃
  @UseGuards(AuthGuard)
  @Post('logout')
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
  })
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req, @Res() res) {
    const invalidateToken = req.cookies['refreshToken'];
    return await this.authService.logout(invalidateToken, res);
  }

  // 토큰 갱신
  @Post('refresh')
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
  })
  @ApiResponse({
    status: 401,
    description: '토큰 갱신 실패',
  })
  async refresh(@Req() req, @Res() res) {
    const refreshToken = req.cookies['refreshToken'];
    const { header, body } = await this.authService.refreshTokens(refreshToken);

    // 쿠기 기반 인증 설정
    await this.setAuthCookies(res, header);

    // 응답(Body) 전송
    return res.json(body);
  }

  // 쿠키 기반 인증 설정(accessToken, refreshToken 둘 다 설정)
  private async setAuthCookies(@Res() res, header) {
    res.cookie('accessToken', header.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 10, // 10분
    });
    res.cookie('refreshToken', header.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
    });
  }

  // 아래와 같이 사용하려는 API Endpoint위에 @UseGuards(AuthGuard) 데코레이터를 추가하면
  // 쿠키 기반 인증을 검사합니다. 권한이 없으면 에러를 반환합니다.
  @UseGuards(AuthGuard)
  @Get('guard')
  @ApiResponse({
    status: 200,
    description: '인증 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  findAll() {
    return 'guard';
  }
}

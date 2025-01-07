import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInRequestDto, SignUpRequestDto } from './dto/auth.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

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
  async signup(
    @Body() signupRequestDto: SignUpRequestDto,
  ): Promise<{ message: string }> {
    // 회원가입 서비스 호출
    const result = await this.authService
      .signup(signupRequestDto)
      .catch((e) => {
        // 에러 발생 시, 에러 메시지 전송
        return { message: e.message };
      });

    // 응답 메시지 전송
    return result;
  }

  // 로그인
  @Post('login')
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
  })
  async login(@Body() signInRequestDto: SignInRequestDto, @Res() res) {
    const { header, body } = await this.authService.signin(signInRequestDto);

    // 헤더(Header) 설정(사용안함)
    // res.setHeader('Authorization', `Bearer ${result.header.accessToken}`);
    // res.setHeader('Refresh-Token', result.header.refreshToken);
    // 쿠기 기반 인증 설정
    res.cookie('accessToken', header.accessToken, {
      httpOnly: true,
      // secure: true,
      sameSite: 'Lax',
    });
    res.cookie('refreshToken', header.refreshToken, {
      httpOnly: true,
      // secure: true,
      sameSite: 'Lax',
    });

    // 응답(Body) 전송
    return res.json(body);
    // return res.json(result.body);
  }

  // 로그아웃
  @Post('logout')
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
  })
  async logout(@Res() res) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.json({ message: '로그아웃 성공' });
  }

  // @Post('genPassword')
  // async genPassword(@Body() dto: PassDto) {
  //   return this.authService.generatePasswordHash(dto);
  // }

  // @Post()
  // create(@Body() createAuthDto: CreateAuthDto) {
  //   return this.authService.create(createAuthDto);
  // }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}

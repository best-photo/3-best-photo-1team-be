import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { SignUpDto, SignInDto, PassDto, TokenDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generatePasswordHash(dto: PassDto) {
    return argon2.hash(dto.password);
  }

  async signup(dto: SignUpDto) {
    // 이메일 중복 확인
    const exists = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await argon2.hash(dto.password);

    // 사용자 생성
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        nickname: dto.nickname,
        points: 0,
      },
    });

    // JWT 토큰 생성
    const tokens = await this.generateToken(user.id, user.nickname);

    return {
      message: '회원가입이 완료되었습니다.',
      ...tokens,
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
        points: user.points,
      },
    };
  }

  async signin(dto: SignInDto) {
    // 사용자 찾기
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('잘못된 인증 정보입니다.');
    }

    // 비밀번호 검증
    const isPasswordValid = await argon2.verify(user.password, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('잘못된 인증 정보입니다.');
    }

    // JWT 토큰 생성
    const tokens = await this.generateToken(user.id, user.nickname);

    return {
      message: '로그인이 완료되었습니다.',
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        points: user.points,
      },
    };
  }

  private async generateToken(
    userId: number,
    nickname: string,
  ): Promise<TokenDto> {
    const payload = { sub: userId, nickname };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }),
    ]).catch((e) => {
      throw new UnauthorizedException(`토큰 생성에 실패했습니다.`, e.message);
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  getCookieWithJwtAccessToken(userId: number, nickname: string) {
    const payload = { sub: userId, nickname };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return `Authentication=${accessToken}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRES_IN}`;
  }

  getCookieWithJwtRefreshToken(userId: number, nickname: string) {
    const payload = { sub: userId, nickname };

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    });

    return `Refresh=${refreshToken}; HttpOnly; Path=/; Max-Age=${process.env.JWT_REFRESH_EXPIRES_IN}`;
  }

  // create(createAuthDto: CreateAuthDto) {
  //   return 'This action adds a new auth';
  // }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}

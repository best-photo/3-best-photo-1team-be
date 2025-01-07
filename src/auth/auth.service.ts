import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import {
  SignInRequestDto,
  SignUpRequestDto,
  TokenRequestDto,
  TokenResponseDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 회원가입
  async signup(dto: SignUpRequestDto) {
    // 이메일 중복 확인
    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // 이메일이 이미 존재하면 예외 발생
    if (!!emailExists) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await argon2.hash(dto.password);

    // 사용자 생성
    // points는 create 시 defautltValue 0으로 설정되어 있어 생략
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        nickname: dto.nickname,
      },
    });

    // 만약 user가 제대로 생성되지 않았다면 예외 발생
    if (!user) {
      throw new ConflictException('사용자 생성에 실패했습니다.');
    }

    // 유저를 생성한 후, 유저와 연관된 테이블(Point, PointHistory)의 데이터도 같이 생성해야 함
    // 가입 시 포인트 추가(기본:0)를 위해 point 생성, 그 다음 포인트 이력을 추가하기 위해 pointHistory 생성

    const point = await this.prisma.point.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    if (!point) {
      throw new ConflictException('포인트 생성에 실패했습니다.');
    }

    const pointHistory = await this.prisma.pointHistory.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        points: point.balance || 0,
        pointType: 'join',
      },
    });

    if (!pointHistory) {
      throw new ConflictException('포인트 히스토리 생성에 실패했습니다.');
    }

    return {
      message: '회원가입이 완료되었습니다.',
    };
  }

  // 로그인
  async signin(dto: SignInRequestDto) {
    // 사용자 찾기(user과 point 테이블 join하여 포인트도 가저오기)
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        point: true,
      },
    });

    // users 테이블에 사용자 정보(이메일)가 없으면 예외 발생
    if (!user) {
      throw new UnauthorizedException('사용자 정보를 찾을 수 없습니다.');
    }

    console.log(user);

    // 비밀번호 검증(해시된 패스워드와 입력햔 패스워드를 비교)
    const isPasswordValid = await argon2.verify(user.password, dto.password);

    // 비밀번호가 일치하지 않으면 예외 발생
    if (!isPasswordValid) {
      throw new UnauthorizedException('회원정보가 일치하지 않습니다.');
    }

    // JWT 토큰 생성
    const tokens = await this.generateTokens(user.id);

    return {
      header: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      body: {
        message: '로그인 성공',
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          points: user.point.balance,
        },
      },
    };
  }

  // JWT 토큰 생성
  async generateTokens(userId: string): Promise<TokenResponseDto> {
    try {
      // accessToken, refreshToken 생성
      const [accessToken, refreshToken] = await Promise.all([
        this.generateAccessToken(userId),
        this.generateRefreshToken(userId),
      ]);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedException(
        '토큰 생성에 실패했습니다.',
        error.message,
      );
    }
  }

  // accessToken 생성
  private async generateAccessToken(userId: string): Promise<string> {
    const payload: TokenRequestDto = {
      sub: userId,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRES_IN'),
    });
  }

  // refreshToken 생성
  private async generateRefreshToken(userId: string): Promise<string> {
    const payload: TokenRequestDto = {
      sub: userId,
      type: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow<string>(
        'JWT_REFRESH_EXPIRES_IN',
      ),
    });
  }
}

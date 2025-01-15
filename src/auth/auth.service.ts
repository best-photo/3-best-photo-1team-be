import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Res,
  Req,
  BadRequestException,
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
import { PointType } from '@prisma/client';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  // 회원가입
  async signup(dto: SignUpRequestDto) {
    // 이메일 중복 확인
    const emailExists = await this.usersService.checkEmail({
      email: dto.email,
    });

    // 이메일이 이미 존재하면 예외 발생
    if (emailExists) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    // 닉네임 중복 확인
    const nicknameExists = await this.usersService.checkNickname({
      nickname: dto.nickname,
    });

    if (nicknameExists) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await argon2.hash(dto.password);

    return await this.prisma
      .$transaction(async (tx) => {
        // 사용자 생성
        // points는 create 시 defautltValue 0으로 설정되어 있어 생략
        const user = await tx.user.create({
          data: {
            email: dto.email,
            password: hashedPassword,
            nickname: dto.nickname,
          },
        });

        // 만약 user가 제대로 생성되지 않았다면 예외 발생
        // 유저를 생성한 후, 유저와 연관된 테이블(Point, PointHistory)의 데이터도 같이 생성해야 함
        // 가입 시 포인트 추가(기본:0)를 위해 point 생성, 그 다음 포인트 이력을 추가하기 위해 pointHistory 생성

        const point = await tx.point.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        });

        // 포인트 히스토리 테이블에 가입 포인트 이력 추가
        await tx.pointHistory.create({
          data: {
            user: {
              connect: {
                id: user.id,
              },
            },
            points: point.balance || 0,
            pointType: PointType.JOIN,
          },
        });

        return {
          message: '회원가입이 완료되었습니다.',
        };
      })
      .catch(() => {
        throw new ConflictException('회원가입에 실패했습니다.');
      });
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

    // 타이밍 공격 방지를 위해 users 테이블에 사용자 정보(이메일)가 없거나
    // 비밀번호 검증(해시된 패스워드와 입력햔 패스워드를 비교)에 실패하면 예외 발생
    if (!user || !(await argon2.verify(user.password, dto.password))) {
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

      // 토큰 생성 시점에 refreshToken을 DB에 저장
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: refreshToken }, // 새 토큰 저장
      });

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

  // 로그아웃
  async logout(refreshToken: string, @Res() res) {
    try {
      // refreshToken 검증
      const userId = (await this.verifyRefreshToken(refreshToken)).sub;
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null }, // 토큰 무효화
      });
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      return res.json({ message: '로그아웃 성공' });
    } catch (error) {
      throw new UnauthorizedException('로그아웃을 실패했습니다.');
    }
  }

  // 토큰 갱신
  async refreshTokens(refreshToken: string) {
    // refreshToken 검증
    const payload = await this.verifyRefreshToken(refreshToken);

    // payload에서 userId 추출
    const userId = payload.sub;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('재사용된 토큰입니다.');
    }

    // 기존 refreshToken 무효화
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    // accessToken, refreshToken 생성
    const tokens = await this.generateTokens(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: tokens.refreshToken }, // 새 토큰으로 갱신
    });

    return {
      header: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      body: {
        message: '토큰 갱신 성공',
      },
    };
  }

  // accessToken 검증
  async verifyAccessToken(accessToken: string) {
    try {
      return await this.jwtService.verifyAsync(accessToken, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException(
        '액세스 토큰 검증에 실패했습니다.',
        error.message,
      );
    }
  }

  // refreshToken 검증
  async verifyRefreshToken(refreshToken: string) {
    try {
      // DB에서 저장된 refreshToken을 검증하여 리프레시토큰이 없거나
      // 저장된 리프레시토큰이 비어있으면 예외 발생
      const storedRefreshToken = await this.prisma.user.findFirst({
        where: { refreshToken: refreshToken },
      });

      if (!refreshToken || !storedRefreshToken) {
        throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
      }

      return await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException(
        '리프레시 토큰 검증에 실패했습니다.',
        error.message,
      );
    }
  }

  // accessToken 디코딩
  async decodeAccessToken(accessToken: string) {
    try {
      const user = await this.verifyAccessToken(accessToken);
      // 디코딩된 토큰은 payload와 iat, exp, sub 등의 정보를 포함
      return {
        userId: user['sub'],
        expires: user['exp'],
      };
    } catch (error) {
      throw new UnauthorizedException(
        '액세스 토큰 디코딩에 실패했습니다.',
        error.message,
      );
    }
  }
  // 쿠키에서 사용자 정보 가져오기
  async getUserFromCookie(@Req() req) {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      throw new BadRequestException('로그인이 필요합니다.');
    }
    if (typeof accessToken !== 'string') {
      throw new BadRequestException('유효하지 않은 토큰 형식입니다.');
    }
    const decoded = await this.decodeAccessToken(accessToken);
    if (decoded.expires * 1000 < Date.now()) {
      throw new UnauthorizedException('토큰이 만료되었습니다.');
    }
    return decoded;
  }
}

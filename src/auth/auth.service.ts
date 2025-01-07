import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';
import { SignInRequestDto, SignUpRequestDto } from './dto/auth.dto';

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
    // const [accessToken, refreshToken] = await this.generateToken(user.id);

    // 응답 헤더 설정
    // const headers = {
    //   // Authorization: `Bearer ${tokens.accessToken}`,
    //   // 'Refresh-Token': `Bearer ${tokens.refreshToken}`,
    // };

    return {
      // headers,
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

  private async generateToken(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // accessToken: userId만 포함
    const accessTokenPayload = {
      sub: userId, // 사용자 식별자
      type: 'access', // 토큰 타입
    };

    // refreshToken: 동일하게 최소한의 정보만
    const refreshTokenPayload = {
      sub: userId, // 사용자 식별자
      type: 'refresh', // 토큰 타입
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }),
    ]).catch((e) => {
      throw new UnauthorizedException(`토큰 생성에 실패했습니다.`, e.message);
    });

    return { accessToken, refreshToken };
  }

  getCookieWithJwtAccessToken(userId: string, nickname: string) {
    const payload = { sub: userId, nickname };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return `Authentication=${accessToken}; HttpOnly; Path=/; Max-Age=${process.env.JWT_EXPIRES_IN}`;
  }

  getCookieWithJwtRefreshToken(userId: string, nickname: string) {
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

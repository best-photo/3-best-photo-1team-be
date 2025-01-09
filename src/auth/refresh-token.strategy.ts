import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req.cookies['refreshToken'],
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
  }

  // iat는 로그인 시간을 확인하기 위해 사용함
  async validate(payload: any) {
    return { userId: payload.sub, expires: payload.iat };
  }
}

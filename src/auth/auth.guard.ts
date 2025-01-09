import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    return await this.validateRequest(request);
  }

  private async validateRequest(request: any) {
    const { accessToken, refreshToken } = request.cookies;

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException('로그인이 필요합니다.(토큰 없음)');
    }
    try {
      await this.authService.verifyAccessToken(accessToken);
      await this.authService.verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new UnauthorizedException('로그인이 필요합니다.(권한 없음)');
    }
    return true;
  }
}

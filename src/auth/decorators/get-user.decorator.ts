import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export const GetUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    SetMetadata('get-user', data);
    const request = ctx.switchToHttp().getRequest();
    const accessToken = request.cookies?.accessToken;

    if (!accessToken) {
      throw new BadRequestException('로그인이 필요합니다.');
    }

    const jwtService = new JwtService();
    try {
      const user = jwtService.decode(accessToken);
      return {
        userId: user['sub'],
        expires: user['exp'],
      };
    } catch (error) {
      throw new BadRequestException('액세스 토큰 디코딩에 실패했습니다.');
    }
  },
);

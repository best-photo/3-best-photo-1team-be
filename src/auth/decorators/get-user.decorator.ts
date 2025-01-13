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

    try {
      const jwtService = new JwtService({
        secret: process.env.JWT_SECRET,
      });
      const user = jwtService.decode(accessToken);
      if (!user) {
        throw new BadRequestException('유효하지 않은 사용자입니다.');
      }
      return {
        userId: user['sub'],
        expires: user['exp'],
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('유효하지 않은 토큰입니다.');
      }
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('만료된 토큰입니다.');
      }
      throw new BadRequestException('액세스 토큰 검증에 실패했습니다.');
    }
  },
);

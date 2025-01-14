import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { PointsService } from './points.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@ApiTags('Points')
@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('box')
  @ApiResponse({
    status: 200,
    description: '랜덤포인트 상자 열기 성공',
  })
  @ApiResponse({
    status: 400,
    description: '랜덤포인트 상자 열기 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 정보가 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '랜덤포인트 상자 열기 중 오류가 발생했습니다.',
  })
  async openBox(@GetUser() user) {
    try {
      if (!user) {
        throw new BadRequestException('사용자 정보가 존재하지 않습니다.');
      }
      const { userId } = user;
      return await this.pointsService.openBox(userId);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          '데이터베이스 조회 중 오류가 발생했습니다.',
        );
      }
      throw new InternalServerErrorException(
        '랜덤포인트 상자 열기 중 오류가 발생했습니다.',
      );
    }
  }

  @Get('last-draw-time')
  @ApiResponse({
    status: 200,
    description: '마지막 포인트 상자 열기 시간 조회 성공',
  })
  @ApiResponse({
    status: 400,
    description: '마지막 포인트 상자 열기 시간 조회 실패',
  })
  @ApiResponse({
    status: 401,
    description: '인증 정보가 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 500,
    description: '마지막 포인트 상자 열기 시간 조회 중 오류가 발생했습니다.',
  })
  async getLastDrawTime(@GetUser() user) {
    try {
      if (!user) {
        throw new BadRequestException('사용자 정보가 존재하지 않습니다.');
      }
      const { userId } = user;
      return {
        lastDrawTime: await this.pointsService.getLastDrawTime(userId),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          '데이터베이스 조회 중 오류가 발생했습니다.',
        );
      }
      throw new InternalServerErrorException(
        '마지막 포인트 상자 열기 시간 조회 중 오류가 발생했습니다.',
      );
    }
  }
}

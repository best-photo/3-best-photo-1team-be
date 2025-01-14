import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PointType } from '@prisma/client';

@Injectable()
export class PointsService {
  constructor(private readonly prisma: PrismaService) {}
  async openBox(userId: string) {
    // 랜덤 포인트 상자 열기 로직
    // 1. 먼저 랜덤 포인트 값을 생성한다
    // 2. userId를 통해 포인트를 업데이트 할 사용자를 찾는다
    // 2-1. 사용자가 없다면 에러 발생
    // 2-2. 사용자가 있다면 포인트를 업데이트한다
    // 2. 트랜잭션(데이터베이스)을 통해 사용자 포인트를 업데이트한다
    // 3. 업데이트된 포인트를 반환한다
    const point = await this.generateRandomPoint();
    // 포인트가 생성되지 않았다면 에러 발생
    if (!point) {
      throw new BadRequestException('랜덤 포인트 상자 열기에 실패했습니다.');
    }
    if (!userId) {
      throw new BadRequestException('사용자 정보가 존재하지 않습니다.');
    }

    // 트랜잭션을 통해 사용자 포인트를 업데이트
    const result = await this.prisma.$transaction(async (tx) => {
      // 사용자 정보 조회
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { point: true },
      });
      if (!user) {
        throw new BadRequestException('사용자 정보가 존재하지 않습니다.');
      }
      if (!user.point) {
        throw new BadRequestException('포인트 정보가 존재하지 않습니다.');
      }

      // 사용자 pointHistory에 원장기록 추가
      await tx.pointHistory.create({
        data: {
          user: { connect: { id: userId } },
          pointType: PointType.DRAW,
          points: point,
        },
      });

      // 사용자 point에 사용자가 보유한 balance 갱신
      await tx.point.update({
        where: { id: user.point.id },
        data: {
          balance: user.point.balance + point,
        },
      });

      return point;
    });
    // 트랜잭션 실패 시 예외 발생
    if (!result) {
      throw new BadRequestException('랜덤 포인트 상자 열기에 실패했습니다.');
    }

    // pointHistory에서 pointType이 DRAW인 것만 조회한 뒤
    // 마지막으로 update된(가장 최근에 랜덤포인트를 획득한) 시간을 조회
    return {
      point: result,
      lastDrawTime: await this.getLastDrawTime(userId),
    };
  }

  async getLastDrawTime(userId: string) {
    const lastDrawPointHistory = await this.findLastDrawPointHistory(userId);
    console.log(lastDrawPointHistory);
    return new Date(lastDrawPointHistory?.createdAt);
  }

  // 랜덤 포인트 값을 생성
  private async generateRandomPoint(): Promise<number> {
    const pointArr = [10, 20, 40, 75, 100, 250, 500, 1000];
    const weightArr = [0.425, 0.2, 0.15, 0.1, 0.05, 0.0375, 0.025, 0.0125];

    const cumulateWeight = weightArr.reduce((acc, weight, i) => {
      acc.push((acc[i - 1] || 0) + weight);
      return acc;
    }, []);

    const random = Math.random();
    const index = cumulateWeight.findIndex((weight) => random < weight);
    return pointArr[index];
  }

  // 가장 최근에 랜덤포인트를 획득한 시간을 조회
  private async findLastDrawPointHistory(userId: string) {
    const result = await this.prisma.pointHistory.findFirst({
      where: { userId, pointType: PointType.DRAW },
      orderBy: { updatedAt: 'desc' },
    });
    console.log(result);
    return result;
  }
}

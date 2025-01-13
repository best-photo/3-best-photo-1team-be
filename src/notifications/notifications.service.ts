import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationFilterDto } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {} // 데이터베이스 연결을 위한 도구

  // 알림 목록 조회
  async findAll(userId: string, filterDto: NotificationFilterDto) {
    const { page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    // Promise.all을 사용해서 두 가지 작업을 동시에 실행
    // 1. 알림 목록 가져오기
    // 2. 전체 알림 개수 세기
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId }, // 현재 사용자의 알림만 조회
        skip, // skip 개수만큼 건너뛰기
        take: limit, // limit 개수만큼 가져오기
        orderBy: { createdAt: 'desc' }, // 최신순으로 정렬
      }),
      this.prisma.notification.count({
        where: { userId },
      }),
    ]);

    // 알림 목록과 함께 페이지 정보도 반환
    return {
      notifications,
      metadata: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // 알림 읽음 처리
  async update(notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    // 알림이 존재하지 않으면 에러 발생
    if (!notification) {
      throw new NotFoundException('알림이 존재하지 않습니다.');
    }

    // 알림 읽음 처리
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
      },
    });
  }
}
